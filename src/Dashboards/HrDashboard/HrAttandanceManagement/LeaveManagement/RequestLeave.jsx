import { X } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;
const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

const RequestLeave = ({ setIsOpenRequest }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  // const [leaveDocUpload, setLeaveDocUpload] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);
      formData.append("leave_type", leaveType);
      formData.append("reason", leaveReason);
      formData.append("user", userInfo.hr_name);
      formData.append("user_id", userInfo.hr_id);
      formData.append("email", userInfo.email);

      // if (leaveDocUpload) {
      //   formData.append("leaveDocUpload", leaveDocUpload);
      // }

      const res = await axios.post(
        `${apiBaseUrl}/hr-apply-leave/`,

        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log(res.data);
      toast.success("Leave applied successfully");
      setIsOpenRequest(false);
    } catch (error) {
      console.error(error);
      toast.error("Leave application failed");
    }
  };

  return (
    <div className="absolute bg-blue-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="flex flex-col p-4 border border-blue-200 rounded-lg gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Request Leave</h2>
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
                onChange={(e) => setStartDate(e.target.value)}
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
              />
            </div>

            <div className="form-group grid grid-cols-2 items-center">
              <label htmlFor="leave-type">Select Leave Type</label>
              <select
                id="leave-type"
                className="p-2"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
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
                onChange={(e) => setLeaveReason(e.target.value)}
              ></textarea>
            </div>

            {/* <div className="form-group grid grid-cols-2 items-center">
              <label htmlFor="leave-doc-upload">Upload Document</label>
              <input
                type="file"
                id="leave-doc-upload"
                className="p-2"
                onChange={(e) => setLeaveDocUpload(e.target.files[0])}
              />
            </div> */}

            <div className="footer-request flex justify-end items-center mt-8">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsOpenRequest(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-btn ml-2">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestLeave;
