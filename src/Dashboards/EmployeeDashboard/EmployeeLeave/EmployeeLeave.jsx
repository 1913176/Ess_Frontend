import { Plus, X } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [leaveData, setLeaveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });

  const userdata = JSON.parse(localStorage.getItem("userdata") || "{}");
  const employeeId = userdata.employee_id;

  const fetchLeaveData = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/leave-history-id/${employeeId}/`);
      setLeaveData(response.data);
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, [employeeId]);

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

  const handleDelete = async (leaveId) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        await axios.delete(`${apiBaseUrl}/leave/${leaveId}/`);
        fetchLeaveData();
        toast.success("Leave deleted successfully!");
      } catch (error) {
        console.error("Error deleting leave:", error);
        toast.error("Failed to delete leave.");
      }
    }
  };

  const handleEdit = (leave) => {
    setSelectedLeave(leave);
    setIsOpenRequest(true);
  };

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
          {filteredData.length === 0 ? (
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
                    <TableCell className="px-2 sm:px-4 truncate max-w-[120px] sm:max-w-none">{leave.reason}</TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleEdit(leave)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(leave.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {isOpenRequest && (
        <RequestLeave
          setIsOpenRequest={setIsOpenRequest}
          fetchLeaveData={fetchLeaveData}
          selectedLeave={selectedLeave}
        />
      )}
    </div>
  );
};

// Filter Component
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

// Request Leave Component
const RequestLeave = ({ setIsOpenRequest, fetchLeaveData, selectedLeave }) => {
  const userdata = useMemo(() => JSON.parse(localStorage.getItem("userdata")), []);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDocUpload, setLeaveDocUpload] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveDaysRequested, setLeaveDaysRequested] = useState(0);
  const [isBalanceInsufficient, setIsBalanceInsufficient] = useState(false);

  const apiBaseUrl = process.env.VITE_BASE_API;
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (selectedLeave) {
      setStartDate(selectedLeave.start_date);
      setEndDate(selectedLeave.end_date);
      setLeaveType(selectedLeave.leave_type);
      setLeaveReason(selectedLeave.reason);
    } else {
      setStartDate("");
      setEndDate("");
      setLeaveType("");
      setLeaveReason("");
      setLeaveDocUpload(null);
    }
  }, [selectedLeave]);

  const fetchLeaveBalance = async () => {
    if (!userdata || !userdata.employee_id) {
      toast.error("User data not found. Please log in again.");
      return;
    }

    try {
      const response = await axios.get(`${apiBaseUrl}/api/leave-balance/`, {
        params: {
          user_id: userdata.employee_id,
        },
      });
      if (!response.data || typeof response.data.vacation_leave === "undefined") {
        throw new Error("Invalid leave balance response: Missing required fields");
      }
      setLeaveBalance(response.data);
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      toast.error(error.message || "Failed to fetch leave balance.");
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchLeaveBalance();
    }

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl, userdata.employee_id]);

  useEffect(() => {
    if (startDate && endDate && leaveBalance && leaveType) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const sundays = Array.from({ length: totalDays }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date.getDay() === 0 ? 1 : 0;
      }).reduce((sum, day) => sum + day, 0);
      const leaveDays = totalDays - sundays;
      setLeaveDaysRequested(leaveDays);

      const leaveTypeMap = {
        medical: "medical_leave",
        vacation: "vacation_leave",
        personal: "personal_leave",
      };
      const leaveField = leaveTypeMap[leaveType];
      const availableBalance = leaveBalance[leaveField] || 0;
      setIsBalanceInsufficient(availableBalance < leaveDays);
    } else {
      setIsBalanceInsufficient(false);
    }
  }, [startDate, endDate, leaveType, leaveBalance]);

  const handleReasonChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9\s]+$/;
    if (value === "" || regex.test(value)) {
      setLeaveReason(value);
    } else {
      toast.error("Special characters are not allowed in the reason field.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBalanceInsufficient) {
      toast.error("Insufficient leave balance for the selected leave type!");
      return;
    }

    const formData = new FormData();
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("leave_type", leaveType);
    formData.append("reason", leaveReason);
    if (leaveDocUpload) {
      formData.append("leave_proof", leaveDocUpload);
    }
    formData.append("user_id", userdata.employee_id);
    formData.append("user", userdata.username);
    formData.append("email", userdata.email);

    try {
      if (selectedLeave) {
        await axios.put(`${apiBaseUrl}/api/leave/${selectedLeave.id}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Leave updated successfully!");
      } else {
        await axios.post(`${apiBaseUrl}/api/apply-leave/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Leave applied successfully!");
      }
      fetchLeaveData();
      await fetchLeaveBalance();
      setIsOpenRequest(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to save leave.");
    }
  };

  return (
    <div className="absolute bg-blue-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col p-4 border border-blue-200 rounded-lg gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">{selectedLeave ? "Edit Leave" : "Request Leave"}</h2>
          <div className="cursor-pointer" onClick={() => setIsOpenRequest(false)}>
            <X />
          </div>
        </div>
        <div className="content bg-blue-50 p-4 rounded-md grid gap-2">
          {leaveBalance ? (
            <div className="leave-balance mb-4">
              <p>
                Leave Balance (Remaining | Applied):
                <span className="ml-2 font-semibold">
                  Vacation: {leaveBalance.vacation_leave || 0} days ({leaveBalance.vacation_leave_applied || 0}) | 
                  Medical: {leaveBalance.medical_leave || 0} days ({leaveBalance.medical_leave_applied || 0}) | 
                  Personal: {leaveBalance.personal_leave || 0} days ({leaveBalance.personal_leave_applied || 0})
                </span>
              </p>
              {startDate && endDate && (
                <p>
                  Requested Leave Days: <span className="font-semibold">{leaveDaysRequested}</span>
                </p>
              )}
              {isBalanceInsufficient && (
                <p className="text-red-500">
                  Insufficient balance for {leaveType} leave!
                </p>
              )}
            </div>
          ) : (
            <p>Loading leave balance...</p>
          )}
          <div className="form-group grid grid-cols-2 items-center">
            <label htmlFor="leave-start-date">Start Date</label>
            <input
              type="date"
              name="leave-start-date"
              id="leave-start-date"
              className="p-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={todayDate}
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
              min={startDate || todayDate}
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
              <option value="medical">Medical Leave</option>
              <option value="vacation">Vacation Leave</option>
              <option value="personal">Personal Leave</option>
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
          <div className="form-group grid grid-cols-2 items-center">
            <label htmlFor="leave-doc-upload">Upload Document (Optional)</label>
            <input
              type="file"
              name="leave-doc-upload"
              id="leave-doc-upload"
              className="p-2"
              onChange={(e) => setLeaveDocUpload(e.target.files[0])}
            />
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
              disabled={isBalanceInsufficient || !leaveBalance}
            >
              {selectedLeave ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeave;