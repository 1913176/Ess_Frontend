import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const RequestLeave = ({ setIsOpenRequest, onNewLeave, leave }) => {
  const isEditMode = !!leave;
  const userdata = JSON.parse(sessionStorage.getItem("userdata") || "{}");
  const [startDate, setStartDate] = useState(leave ? leave.start_date : "");
  const [endDate, setEndDate] = useState(leave ? leave.end_date : "");
  const [leaveType, setLeaveType] = useState(leave ? leave.leave_type : "");
  const [leaveReason, setLeaveReason] = useState(leave ? leave.reason : "");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
  }, []);

  const handleLeaveReasonChange = (e) => {
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

    if (!startDate || !endDate || !leaveType || !leaveReason) {
      toast.error("Please fill all required fields!");
      return;
    }

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
      formData.append("user_id", userdata.manager_id);
      formData.append("user", userdata.username);
      formData.append("email", userdata.email);

      let res;
      if (isEditMode) {
        res = await axios.put(
          `${apiBaseUrl}/edit_manager_leave_request/${leave.id}/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Leave updated successfully");
      } else {
        res = await axios.post(
          `${apiBaseUrl}/manager-apply-leave/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
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
    <>
      <DialogHeader>
        <DialogTitle>{isEditMode ? "Edit Leave Request" : "Request Leave"}</DialogTitle>
      </DialogHeader>
      <div className="form-group grid grid-cols-2 items-center">
        <label htmlFor="leave-start-date">Start Date</label>
        <input
          type="date"
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
          id="leave-end-date"
          className="p-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate || minDate}
          required
        />
      </div>
      <div className="form-group grid grid-cols-2 items-center">
        <label htmlFor="leave-type">Leave Type</label>
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
        <label htmlFor="leave-reason">Reason</label>
        <textarea
          id="leave-reason"
          className="p-2"
          placeholder="Type your reason"
          value={leaveReason}
          onChange={handleLeaveReasonChange}
          required
        />
      </div>

      <div className="footer-request flex justify-end items-center mt-8 gap-2">
        <button
          type="button"
          className="btn-secondary px-4 py-2 border rounded-md"
          onClick={() => setIsOpenRequest(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={handleSubmit}
        >
          {isEditMode ? "Update" : "Submit"}
        </button>
      </div>
    </>
  );
};

export default RequestLeave;