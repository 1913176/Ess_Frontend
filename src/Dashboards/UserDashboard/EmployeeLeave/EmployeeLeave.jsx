import { Plus, X } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const StatusProgressBar = ({ status }) => {
  const isApproved = status.toLowerCase() === "approved";
  const isRejected = status.toLowerCase() === "rejected";
  const isPending = status.toLowerCase() === "pending";

  return (
    <div className="relative w-[140px]">
      <div className="absolute top-3 left-6 right-6 h-[3px] bg-gray-200 z-0">
        <div 
          className={`h-full ${isApproved || isRejected ? 'bg-green-500' : isPending ? 'bg-orange-500' : 'bg-gray-300'}`}
          style={{ width: isPending ? '50%' : isApproved || isRejected ? '100%' : '0%' }}
        ></div>
      </div>

      <div className="flex justify-between relative z-10">
        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center 
            ${isPending || isApproved || isRejected ? "bg-green-500" : "bg-gray-300"}`}>
            <span className="text-white text-xs">1</span>
          </div>
          <span className="text-[10px] mt-1 text-gray-600">Request</span>
        </div>

        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center 
            ${isApproved || isRejected ? "bg-green-500" : isPending ? "bg-orange-500" : "bg-gray-300"}`}>
            <span className="text-white text-xs">
              {isApproved || isRejected ? "✓" : "2"}
            </span>
          </div>
          <span className="text-[10px] mt-1 text-gray-600">Pending</span>
        </div>

        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center 
            ${isApproved ? "bg-green-500" : isRejected ? "bg-red-500" : "bg-gray-300"}`}>
            <span className="text-white text-xs">
              {isApproved ? "✓" : isRejected ? "✗" : "3"}
            </span>
          </div>
          <span className="text-[10px] mt-1 text-gray-600">
            {isRejected ? "Rejected" : "Approved"}
          </span>
        </div>
      </div>
    </div>
  );
};

const EmployeeLeave = () => {
  const [isOpenRequest, setIsOpenRequest] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [isOpenReasonModal, setIsOpenReasonModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [detailsLeave, setDetailsLeave] = useState(null);
  const [reasonInput, setReasonInput] = useState("");
  const [leaveData, setLeaveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userInfo = JSON.parse(sessionStorage.getItem("userdata") || "{}");
  const employeeId = userInfo.employee_id;

  const fetchLeaveData = useCallback(async () => {
    if (!employeeId) {
      setError("User information is missing. Please log in again.");
      setLoading(false);
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${apiBaseUrl}/leave-history-id/${employeeId}/`,
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

      if (errorMessage === "No LeaveRequest matches the given query.") {
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
  }, [employeeId, navigate]);

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
    const isSearchMatch =
      !searchTerm ||
      leave.start_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.end_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.status?.toLowerCase().includes(searchTerm.toLowerCase());

    return isStartDateMatch && isEndDateMatch && isStatusMatch && isSearchMatch;
  });

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row justify-between p-4 gap-4">
          <div>
            <h5 className="font-semibold text-lg mb-1">Leave Management</h5>
            <p className="text-gray-500 text-sm">Track and manage your leave requests</p>
          </div>
          <div className="flex items-center justify-start sm:justify-end">
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex mr-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white">A</div>
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white -ml-2">P</div>
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white -ml-2">R</div>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap">Leave Status</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-t">
          <div className="p-4 text-center border-b sm:border-b-0 sm:border-r">
            <p className="text-gray-500 text-sm">Requested</p>
            <p className="text-xl sm:text-2xl font-semibold">
              {filteredData.length}
              <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">Requests</span>
            </p>
          </div>
          <div className="p-4 text-center border-b sm:border-b-0 sm:border-r">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-xl sm:text-2xl font-semibold">
              {filteredData.filter(leave => leave.status.toLowerCase() === "pending").length}
              <span className="text-xs font-normal bg-orange-500 text-white px-2 py-1 rounded-full ml-1">Waiting</span>
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-gray-500 text-sm">Taken</p>
            <p className="text-xl sm:text-2xl font-semibold">
              {filteredData.filter(leave => leave.status.toLowerCase() === "approved").length}
              <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">Approved</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <h5 className="font-semibold text-lg">Leave History</h5>
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => setIsOpenFilter((prev) => !prev)}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                setSelectedLeave(null);
                setIsOpenRequest(true);
              }}
            >
              <Plus height={15} width={15} className="mr-1" /> Add Leave
            </Button>
          </div>
        </div>

        {isOpenFilter && (
          <FilterLeave filters={filters} setFilters={setFilters} />
        )}

        <div className="relative flex-grow max-w-xs mb-4">
          <input
            type="text"
            className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-500 my-4">Loading...</p>
          ) : filteredData.length === 0 ? (
            <p className="text-center text-gray-500 my-4">No leave data available.</p>
          ) : (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-200">
                  <TableHead className="w-10 px-2 sm:px-4">
                    <input type="checkbox" className="rounded" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap px-2 sm:px-4">S.No</TableHead>
                  <TableHead className="whitespace-nowrap px-2 sm:px-4">Status</TableHead>
                  <TableHead className="whitespace-nowrap px-2 sm:px-4">Start Date</TableHead>
                  <TableHead className="whitespace-nowrap px-2 sm:px-4">End Date</TableHead>
                  <TableHead className="whitespace-nowrap px-2 sm:px-4">Leave Type</TableHead>
                  <TableHead className="px-2 sm:px-4">Reason</TableHead>
                  <TableHead className="px-2 sm:px-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((leave) => (
                  <TableRow key={leave.id} className="hover:bg-gray-50">
                    <TableCell className="px-2 sm:px-4">
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">{leave.id}</TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <StatusProgressBar status={leave.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-2 sm:px-4">{leave.start_date}</TableCell>
                    <TableCell className="whitespace-nowrap px-2 sm:px-4">{leave.end_date}</TableCell>
                    <TableCell className="whitespace-nowrap px-2 sm:px-4">
                      {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1) || "N/A"}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 truncate max-w-[120px] sm:max-w-none">{leave.reason}</TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            if (leave.status !== "Pending") {
                              toast.error("Only pending leave requests can be edited.");
                              return;
                            }
                            setSelectedLeave(leave);
                            setIsOpenRequest(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => {
                            if (leave.status !== "Pending") {
                              toast.error("Only pending leave requests can be deleted.");
                              return;
                            }
                            if (window.confirm(`Are you sure you want to delete Leave ID ${leave.id}?`)) {
                              axios.delete(`${apiBaseUrl}/delete_employee_leave/${leave.id}/`, {
                                withCredentials: true,
                              })
                                .then(() => {
                                  toast.success(`Leave ID ${leave.id} deleted successfully.`);
                                  setLeaveData((prev) => prev.filter((l) => l.id !== leave.id));
                                })
                                .catch((error) => {
                                  console.error("Error deleting leave:", error);
                                  toast.error(
                                    error.response?.data?.detail || "Failed to delete leave record."
                                  );
                                });
                            }
                          }}
                        >
                          Delete
                        </Button>
                        {(leave.reason === "Auto Leave: Late or No Login" || leave.is_auto_leave) && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => {
                              setDetailsLeave(leave);
                              setIsOpenReasonModal(true);
                            }}
                          >
                            Submit Reason
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

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
    <div className="w-full flex flex-wrap gap-4 items-center shadow-sm p-4 bg-white rounded-md mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="border rounded p-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="border rounded p-2 text-sm"
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
          className="border rounded p-2 text-sm"
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
    if (!reasonInput.trim()) {
      toast.error("Please provide a valid reason.");
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/submit_employee_late_login_reason/`,
        {
          leave_id: leave.id,
          reason: reasonInput.trim(),
        },
        { withCredentials: true }
      );
      toast.success("Reason submitted successfully.");
      setReasonInput("");
      setIsOpenReasonModal(false);
      fetchLeaveData();
    } catch (error) {
      console.error("Error submitting reason:", error);
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
            className="border rounded w-full p-2 text-sm"
            rows="4"
            placeholder="Enter your reason for the late login..."
          />
        </div>
        <div className="flex gap-4">
          <Button
            variant="contained"
            color="primary"
            className="w-full"
            onClick={handleSubmitReason}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className="w-full"
            onClick={() => {
              setReasonInput("");
              setIsOpenReasonModal(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const RequestLeave = ({ setIsOpenRequest, onNewLeave, leave }) => {
  const isEditMode = !!leave;
  const [startDate, setStartDate] = useState(leave ? leave.start_date : "");
  const [endDate, setEndDate] = useState(leave ? leave.end_date : "");
  const [leaveType, setLeaveType] = useState(leave ? leave.leave_type : "");
  const [leaveReason, setLeaveReason] = useState(leave ? leave.reason : "");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
  }, []);

  const handleReasonChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9\s]*$/;
    if (regex.test(value)) {
      setLeaveReason(value);
    } else {
      toast.error("Special characters are not allowed in the reason field");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const leaveTypeMap = {
        Medical: "medical",
        Vacation: "vacation",
        Personal: "personal",
        medical: "medical",
        vacation: "vacation",
        personal: "personal",
      };
      const backendLeaveType = leaveTypeMap[leaveType] || leaveType;

      const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
      const formData = new FormData();
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);
      formData.append("leave_type", backendLeaveType);
      formData.append("reason", leaveReason);
      formData.append("user", userInfo.employee_name);
      formData.append("user_id", userInfo.employee_id);
      formData.append("email", userInfo.email);

      let res;
      if (isEditMode) {
        res = await axios.put(
          `${apiBaseUrl}/edit_employee_leave_request/${leave.id}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        toast.success("Leave updated successfully");
      } else {
        res = await axios.post(
          `${apiBaseUrl}/api/apply-leave/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        toast.success("Leave applied successfully");
      }

      onNewLeave({
        id: isEditMode ? leave.id : res.data.leave_id,
        start_date: startDate,
        end_date: endDate,
        leave_type: leaveType,
        reason: leaveReason,
        status: "Pending",
      });

      setIsOpenRequest(false);
    } catch (error) {
      console.error("Error applying/updating leave:", error.response?.data);
      const errorMessage =
        error.response?.data?.error || 
        (isEditMode ? "Leave update failed. Please try again." : "Leave application failed. Please try again.");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="absolute bg-blue-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col p-4 border border-blue-200 rounded-lg gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">{isEditMode ? "Edit Leave" : "Request Leave"}</h2>
          <div className="cursor-pointer" onClick={() => setIsOpenRequest(false)}>
            <X />
          </div>
        </div>
        <div className="content bg-blue-50 p-4 rounded-md grid gap-2">
          <form onSubmit={handleSubmit} className="grid gap-2">
            <div className="form-group grid grid-cols-2 items-center">
              <label htmlFor="leave-start-date">Start Date</label>
              <input
                type="date"
                name="leave-start-date"
                id="leave-start-date"
                className="p-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={minDate}
                required
              />
            </div>
            <div className="form-group grid grid-cols-2 items-center">
              <label htmlFor="leave-end-date">End Date</label>
              <input
                type="date"
                name="leave-end-date"
                id="leave-end-date"
                className="p-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || minDate}
                required
              />
            </div>
            <div className="form-group grid grid-cols-2 items-center">
              <label htmlFor="leave-type">Select Leave Type</label>
              <select
                name="leave-type"
                id="leave-type"
                className="p-2"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select Leave Type
                </option>
                <option value="Medical">Medical Leave</option>
                <option value="Vacation">Vacation Leave</option>
                <option value="Personal">Personal Leave</option>
              </select>
            </div>
            <div className="form-group grid grid-cols-2 items-center">
              <label htmlFor="leave-reason">Reason</label>
              <textarea
                name="leave-reason"
                id="leave-reason"
                className="p-2"
                placeholder="Type Reason"
                value={leaveReason}
                onChange={handleReasonChange}
                required
              ></textarea>
            </div>
            <div className="footer-request flex justify-end items-center mt-8">
              <button
                type="button"
                className="btn-secondary mr-2 px-4 py-2 rounded"
                onClick={() => setIsOpenRequest(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                {isEditMode ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeave;