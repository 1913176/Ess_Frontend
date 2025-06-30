import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const RequestLeave = ({ setIsOpenRequest, fetchLeaveData }) => {
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

  console.log("API Base URL:", apiBaseUrl);
  console.log("User Data:", userdata);

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
      console.log("Leave Balance Response:", response.data);
      if (!response.data || typeof response.data.vacation_leave === "undefined") {
        throw new Error("Invalid leave balance response: Missing required fields");
      }
      setLeaveBalance(response.data);
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      if (error.response) {
        console.error("Response Data:", error.response.data);
        console.error("Response Status:", error.response.status);
      }
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

      console.log("Leave Type:", leaveType);
      console.log("Leave Field:", leaveField);
      console.log("Available Balance:", availableBalance);
      console.log("Requested Leave Days:", leaveDays);
      console.log("Is Balance Insufficient:", availableBalance < leaveDays);
    } else {
      setIsBalanceInsufficient(false);
      console.log("Waiting for leave balance or leave type:", { leaveBalance, leaveType });
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
      const response = await axios.post(
        `${apiBaseUrl}/api/apply-leave/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchLeaveData();
      toast.success("Leave applied successfully!");
      console.log(response.data);

      // Re-fetch the leave balance after applying
      await fetchLeaveBalance();

      setIsOpenRequest(false);
    } catch (error) {
      console.error(error);
      if (error.response) {
        toast.error(error.response.data.error || "Failed to apply leave.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="absolute bg-blue-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="flex flex-col p-4 border border-blue-200 rounded-lg gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Request Leave</h2>
          <div className="" onClick={() => setIsOpenRequest(false)}>
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
              className="btn-secondary"
              onClick={() => setIsOpenRequest(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isBalanceInsufficient || !leaveBalance}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestLeave;
