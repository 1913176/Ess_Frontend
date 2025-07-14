import { Plus, Edit, Trash2 } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import HrLeaveRequest from "./HrLeaveRequest";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const HrLeaveHistory = () => {
  const [isOpenRequest, setIsOpenRequest] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [isOpenReasonModal, setIsOpenReasonModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [detailsLeave, setDetailsLeave] = useState(null);
  const [reasonInput, setReasonInput] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userInfo = JSON.parse(sessionStorage.getItem("userdata")) || {};
  const hrId = userInfo?.hr_id;

  const fetchLeaveData = useCallback(async () => {
    if (!hrId) {
      setError("User information is missing. Please log in again.");
      setLoading(false);
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${apiBaseUrl}/hr-leave-history-id/${hrId}/`,
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

      if (errorMessage === "No HrLeaveRequest matches the given query.") {
        setLeaveData([]);
        setError(null);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);

        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("userdata");
          navigate("/login");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [hrId, navigate]);

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
      !filters.startDate || leave.start_date >= filters.startDate;
    const isEndDateMatch =
      !filters.endDate || leave.end_date <= filters.endDate;
    const isStatusMatch =
      !filters.status ||
      leave.status.toLowerCase() === filters.status.toLowerCase();
    return isStartDateMatch && isEndDateMatch && isStatusMatch;
  });

  const columns = [
    { field: "no", headerName: "No", width: 100 },
    { field: "start_date", headerName: "Start Date", width: 150 },
    { field: "end_date", headerName: "End Date", width: 150 },
    { 
      field: "leave_type", 
      headerName: "Leave Type", 
      width: 150,
      renderCell: (params) => (
        <span>
          {params.row.leave_type?.charAt(0).toUpperCase() + 
           params.row.leave_type?.slice(1) || "N/A"}
        </span>
      )
    },
    { field: "reason", headerName: "Reason", width: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <p
          className={`p-2 text-center text-sm rounded-lg ${
            params.row.status === "Pending"
              ? "text-orange-700 bg-orange-100"
              : params.row.status === "Approved"
              ? "text-green-700 bg-green-100"
              : "text-red-700 bg-red-100"
          }`}
        >
          {params.row.status}
        </p>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="p-2 rounded-full hover:bg-gray-200 text-gray-600 font-bold">
              ...
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleEdit(params.row)}>
              <Edit className="mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(params.row.id, params.row.status)}
            >
              <Trash2 className="mr-2" /> Delete
            </DropdownMenuItem>
            {(params.row.reason === "Auto Leave: Late or No Login" ||
              params.row.is_auto_leave) && (
              <DropdownMenuItem onClick={() => handleRequest(params.row)}>
                <Plus className="mr-2" /> Submit Reason
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const rows = filteredData.map((leave, index) => ({
    id: leave.id,
    no: index + 1,
    start_date: leave.start_date,
    end_date: leave.end_date,
    leave_type: leave.leave_type,
    reason: leave.reason,
    status: leave.status,
  }));

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
      await axios.delete(`${apiBaseUrl}/delete_hr_leave/${leaveId}/`, {
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
    <div className="relative p-4 flex flex-col gap-4 min-h-dvh h-full">
      <h2 className="text-header">Leave Management</h2>
      <div className="h-full flex flex-col w-full border rounded-md gap-4">
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
                    className="secondary-btn"
                    onClick={() => setIsOpenFilter((prev) => !prev)}
                  >
                    Filter
                  </button>
                  <button
                    className="primary-btn flex items-center"
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
              <div className="w-full h-full min-h-dvh">
                <DataGrid
                  className="min-h-dvh"
                  rows={rows}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                />
              </div>
            )}

            {isOpenRequest && (
              <HrLeaveRequest
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
        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
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
    const trimmedReason = reasonInput.trim();
    if (!trimmedReason) {
      toast.error("Please provide a valid reason (whitespace-only input is not allowed).");
      return;
    }

    try {
      await axios.post(
        `${apiBaseUrl}/submit_hr_late_login_reason/`, // Changed to HR-specific endpoint
        {
          leave_id: leave.id,
          reason: trimmedReason,
        },
        { withCredentials: true }
      );
      toast.success("Reason submitted successfully.");
      setReasonInput("");
      setIsOpenReasonModal(false);
      fetchLeaveData();
    } catch (error) {
      console.error("Error submitting reason:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || "Failed to submit reason.";
      toast.error(errorMessage);
    }
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9\s]*$/;
    if (regex.test(value)) {
      setReasonInput(value);
    } else {
      toast.error("Special characters are not allowed in the reason field");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Submit Reason for Late Login</h3>
        <div className="mb-4">
          <p><strong>Leave Date:</strong> {leave.start_date}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Reason</label>
          <textarea
            value={reasonInput}
            onChange={handleReasonChange}
            className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
            rows="4"
            placeholder="Enter your reason for the late login..."
          />
        </div>
        <div className="flex gap-4">
          <button className="btn btn-primary w-full" onClick={handleSubmitReason}>
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

export default HrLeaveHistory;