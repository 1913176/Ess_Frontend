import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;
const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

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
    <div className="absolute bg-blue-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="flex flex-col p-4 border border-blue-200 rounded-lg gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">{isEditMode ? "Edit Leave Request" : "Request Leave"}</h2>
          <button onClick={() => setIsOpenRequest(false)} className="p-2">
            <X />
          </button>
        </div>

        <div className="content bg-blue-50 p-4 rounded-md grid gap-2">
          <form onSubmit={handleSubmit} className="grid gap-2">
            <div className="form-group grid grid-cols-2 items-center">
              <label htmlFor="leave-start-date">Start Date</label>
              <input
                type="date"
                id="leave-start-date"
                className="p-2"
                value={startDate}
                min={minDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group grid grid-cols-2 items-center">
              <label htmlFor="leave-end-date">End Date</label>
              <input
                type="date"
                id="leave-end-date"
                className="p-2"
                value={endDate}
                min={startDate || minDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group grid grid-cols-2 items-center">
              <label htmlFor="leave-type">Select Leave Type</label>
              <select
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
              <label htmlFor="leave-Reason">Reason</label>
              <textarea
                id="leave-Reason"
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
                className="btn-secondary"
                onClick={() => setIsOpenRequest(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary ml-2">
                {isEditMode ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestLeave;