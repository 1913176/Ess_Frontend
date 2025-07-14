

import { Plus, Edit, Trash2 } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import RequestLeave from "./RequestLeave";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const SpSupervisorLeave = () => {
  const [isOpenRequest, setIsOpenRequest] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [isOpenReasonModal, setIsOpenReasonModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [detailsLeave, setDetailsLeave] = useState(null);
  const [reasonInput, setReasonInput] = useState("");
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    status: "",
  });
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userInfo = JSON.parse(sessionStorage.getItem("userdata")) || {};
  const supervisorId = userInfo?.supervisor_id;

  const fetchLeaveData = useCallback(async () => {
    if (!supervisorId) {
      setError("User information is missing. Please log in again.");
      setLoading(false);
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${apiBaseUrl}/supervisor-leave-history-id/${supervisorId}/`,
        { withCredentials: true }
      );
      const normalizedData = response.data.map((leave) => ({
        ...leave,
        status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
      }));
      setLeaveData(normalizedData || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching leave data:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to fetch leave data.";

      if (errorMessage === "No SupervisorLeaveRequest matches the given query.") {
        setLeaveData([]);
        setError(null);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);

        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          sessionStorage.removeItem("userdata");
          navigate("/login");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [supervisorId, navigate]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const handleNewLeave = (updatedLeave) => {
    setLeaveData((prevLeaveData) => {
      const normalizedNewLeave = {
        ...updatedLeave,
        status: updatedLeave.status.charAt(0).toUpperCase() + updatedLeave.status.slice(1),
      };
      if (selectedLeave) {
        return prevLeaveData.map((leave) =>
          leave.id === updatedLeave.id ? normalizedNewLeave : leave
        );
      }
      return [...prevLeaveData, normalizedNewLeave];
    });
    setSelectedLeave(null);
    fetchLeaveData();
  };

  const filteredData = leaveData.filter((leave) => {
    const isStartDateMatch =
      !filters.start_date || leave.start_date >= filters.start_date;
    const isEndDateMatch =
      !filters.end_date || leave.end_date <= filters.end_date;
    const isStatusMatch =
      !filters.status ||
      leave.status.toLowerCase() === filters.status.toLowerCase();
    return isStartDateMatch && isEndDateMatch && isStatusMatch;
  });

  return (
    <div className="relative p-4 flex flex-col gap-4 min-h-dvh h-full">
      <h2 className="text-header">Leave Management</h2>
      <div className="h-full flex flex-col w-full border border-slate-400 p-4 rounded-md gap-4">
        {error ? (
          <div className="text-center text-red-600 py-4">{error}</div>
        ) : (
          <>
            <div className="w-full flex items-center justify-between">
              <p>
                Total Leave:{" "}
                {leaveData.reduce(
                  (sum, leave) =>
                    sum + (leave.status === "Approved" ? leave.total_days : 0),
                  0
                )}{" "}
                days
              </p>
              <div className="flex flex-col items-end gap-4">
                <div className="btn-group flex items-center gap-2">
                  <button
                    className="btn"
                    onClick={() => setIsOpenFilter((prev) => !prev)}
                  >
                    Filter
                  </button>
                  <button
                    className="btn btn-primary flex items-center"
                    onClick={() => {
                      setSelectedLeave(null);
                      setIsOpenRequest(true);
                    }}
                  >
                    <Plus height={15} width={15} /> Add Leave
                  </button>
                </div>
                {isOpenFilter && (
                  <FilterLeave filters={filters} setFilters={setFilters} />
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <SupervisorTable
                leaveData={filteredData}
                setLeaveData={setLeaveData}
                setSelectedLeave={setSelectedLeave}
                setIsOpenRequest={setIsOpenRequest}
                setDetailsLeave={setDetailsLeave}
                setIsOpenReasonModal={setIsOpenReasonModal}
              />
            )}

            {isOpenRequest && (
              <RequestLeave
                setIsOpenRequest={setIsOpenRequest}
                onNewLeave={handleNewLeave}
                leave={selectedLeave}
              />
            )}

            {isOpenReasonModal && (
              <SubmitReasonModal
                leave={detailsLeave}
                setIsOpenReasonModal={setIsOpenReasonModal}
                reasonInput={reasonInput}
                setReasonInput={setReasonInput}
                fetchLeaveData={fetchLeaveData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const FilterLeave = ({ filters, setFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="w-full flex flex-wrap gap-4 items-center">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleFilterChange}
          className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleFilterChange}
          className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
};

const SubmitReasonModal = ({ leave, setIsOpenReasonModal, reasonInput, setReasonInput, fetchLeaveData }) => {
  const handleSubmitReason = async () => {
    // Validate input
    if (!reasonInput.trim()) {
      toast.error("Please provide a valid reason.");
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/submit-late-login-reason/`,
        {
          leave_id: leave.id,
          reason: reasonInput.trim(),
        },
        { withCredentials: true }
      );
      toast.success("Reason submitted successfully.");
      setReasonInput(""); // Clear input after success
      setIsOpenReasonModal(false); // Close modal
      fetchLeaveData(); // Refresh leave data
    } catch (error) {
      console.error("Error submitting reason:", error);
      // Extract specific error message from response
      const errorMessage =
        error.response?.data?.error || "Failed to submit reason.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Submit Reason for Late Login</h3>
        <div className="mb-4">
          <p>
            <strong>Leave Date:</strong> {leave.start_date}
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Reason
          </label>
          <textarea
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
            rows="4"
            placeholder="Enter your reason for the late login..."
          />
        </div>
        <div className="flex gap-4">
          <button
            className="btn btn-primary w-full"
            onClick={handleSubmitReason}
          >
            Submit
          </button>
          <button
            className="btn w-full"
            onClick={() => {
              setReasonInput("");
              setIsOpenReasonModal(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const SupervisorTable = ({
  leaveData,
  setLeaveData,
  setSelectedLeave,
  setIsOpenRequest,
  setDetailsLeave,
  setIsOpenReasonModal,
}) => {
  const handleEdit = (leave) => {
    if (leave.status !== "Pending") {
      toast.error("Only pending leave requests can be edited.");
      return;
    }
    setSelectedLeave(leave);
    setIsOpenRequest(true);
  };

  const handleDelete = async (leaveId, leaveStatus) => {
    if (leaveStatus !== "Pending") {
      toast.error("Only pending leave requests can be deleted.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Leave ID ${leaveId}?`)) {
      return;
    }

    try {
      await axios.delete(`${apiBaseUrl}/delete_supervisor_leave/${leaveId}/`, {
        withCredentials: true,
      });
      toast.success(`Leave ID ${leaveId} deleted successfully.`);

      setLeaveData((prevLeaveData) =>
        prevLeaveData.filter((leave) => leave.id !== leaveId)
      );
    } catch (error) {
      console.error("Error deleting leave:", error);
      toast.error(
        error.response?.data?.detail || "Failed to delete leave record."
      );
    }
  };

  const handleRequest = (leave) => {
    setDetailsLeave(leave);
    setIsOpenReasonModal(true);
  };

  return (
    <div className="h-full">
      <table
        className="min-w-full table-auto border-collapse"
        aria-label="Supervisor Leave Table"
      >
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Leave Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 overflow-y-scroll h-full">
          {leaveData.length > 0 ? (
            leaveData.map((leave, index) => (
              <tr key={leave.id}>
                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {leave.start_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.end_date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {leave.leave_type.charAt(0).toUpperCase() +
                    leave.leave_type.slice(1) || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p
                    className={`p-2 text-center text-sm rounded-lg ${
                      leave.status === "Pending"
                        ? "text-orange-700 bg-orange-100"
                        : leave.status === "Approved"
                        ? "text-green-700 bg-green-100"
                        : "text-red-700 bg-red-100"
                    }`}
                  >
                    {leave.status}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <span className="p-2 rounded-full hover:bg-gray-200 text-gray-600 font-bold">
                        ...
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(leave)}>
                        <Edit className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(leave.id, leave.status)}
                      >
                        <Trash2 className="mr-2" /> Delete
                      </DropdownMenuItem>
                      {(leave.reason === "Auto Leave: Late or No Login" ||
                        leave.is_auto_leave) && (
                        <DropdownMenuItem onClick={() => handleRequest(leave)}>
                          <Plus className="mr-2" /> Submit Reason
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-4">
                No leaves found matching the criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SpSupervisorLeave;