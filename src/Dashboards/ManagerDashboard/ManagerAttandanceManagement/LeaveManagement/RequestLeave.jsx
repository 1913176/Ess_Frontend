import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const apiBaseUrl = process.env.VITE_BASE_API;

const RequestLeave = ({ setIsOpenRequest, fetchLeaveData }) => {
  const userdata = JSON.parse(localStorage.getItem("userdata") || "{}");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [error, setError] = useState(""); // To show validation error message

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const handleLeaveReasonChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9.,!? ]*$/; // Allows letters, numbers, spaces, and .,!? only

    if (regex.test(value)) {
      setLeaveReason(value);
      setError(""); // Clear error if valid
    } else {
      setError("Special characters are not allowed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!startDate || !endDate || !leaveType || !leaveReason) {
      toast.error("Please fill all required fields!");
      return;
    }

    // Ensure leave reason doesn't contain special characters
    if (error) {
      toast.error(error);
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("leave_type", leaveType);
    formData.append("reason", leaveReason);
    formData.append("user_id", userdata.manager_id);
    formData.append("user", userdata.username);
    formData.append("email", userdata.email);

    try {
      // Send POST request
      const response = await axios.post(
        `${apiBaseUrl}/manager-apply-leave/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      fetchLeaveData();

      // Handle success response
      if (response.status === 201) {
        toast.success(response.data.message || "Leave applied successfully!");
        setIsOpenRequest(false);
      }
    } catch (error) {
      // Handle error response
      if (error.response) {
        toast.error(error.response.data.error || "Failed to apply leave.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Request Leave</DialogTitle>
      </DialogHeader>
      {/* <div className="content bg-blue-50 p-4 rounded-md grid gap-2"> */}
      <div className="form-group grid grid-cols-2 items-center">
        <label htmlFor="leave-start-date">Start Date</label>
        <input
          type="date"
          id="leave-start-date"
          className="p-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={today} // Prevent past dates
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
          min={today} // Always today or future
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
          <option value="medical">Medical Leave</option>
          <option value="vacation">Vacation Leave</option>
          <option value="personal">Personal Leave</option>
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
        {error && <span className="text-red-500 text-sm">{error}</span>}
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
          disabled={!!error} // Disable button if there's an error
        >
          Submit
        </button>
      </div>
    </>
  );
};

export default RequestLeave;
