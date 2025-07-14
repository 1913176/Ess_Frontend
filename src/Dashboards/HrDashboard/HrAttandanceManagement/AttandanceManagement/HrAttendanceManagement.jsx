import React, { useState, useEffect } from "react";
import axios from "axios";
import ManagerAttendanceChart from "./HrAttendanceChart";
// import vectorIcon from "./../../../assets/Images/Vector (5).png";
// import upDownArrow from "./../../../assets/Images/arrows-up-down.png";

// Ensure axios uses credentials for session authentication
const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;
const HrAttendanceManagement = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/manager/manager-attendance-history/${userInfo.manager_id}/`,
        );

        // Check if the response is successful
        if (response.status === 200) {
          setAttendanceData(response.data.all_records || []);
        } else {
          setError("Failed to fetch attendance data.");
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Failed to fetch attendance data. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  return (
    <div className="attendance-container p-5">
      <p className="mt-3 ms-2 p-2 font-medium text-2xl">Attendance</p>

      <div className="attendance-table p-3">
        <div className="border border-gray-300 rounded-xl p-4 bg-white shadow-md">
          {/* Header */}
          <div className="bg-gray-100 p-3 rounded-md">
            <div className="flex items-center justify-around">
              <div className="flex gap-2 items-center">
                {/* <img src={vectorIcon} alt="Date Icon" className="h-5" /> */}
                <p className="font-semibold text-sm">Date</p>
              </div>
              <div className="flex gap-2 items-center">
                {/* <img src={upDownArrow} alt="Sort Icon" className="h-4" /> */}
                <p className="font-semibold text-sm">Login Time</p>
              </div>
              <div className="flex gap-2 items-center">
                {/* <img src={upDownArrow} alt="Sort Icon" className="h-4" /> */}
                <p className="font-semibold text-sm">Logout Time</p>
              </div>
              <div className="flex gap-2 items-center">
                {/* <img src={upDownArrow} alt="Sort Icon" className="h-4" /> */}
                <p className="font-semibold text-sm">Working Hours</p>
              </div>
              <div className="flex gap-2 items-center">
                {/* <img src={upDownArrow} alt="Sort Icon" className="h-4" /> */}
                <p className="font-semibold text-sm">Type</p>
              </div>
            </div>
          </div>

          {/* Loader */}
          {loading && (
            <p className="text-center text-blue-500 mt-4">
              Loading attendance data...
            </p>
          )}

          {/* Error Message */}
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}

          {/* Attendance Records */}
          {!loading && !error && attendanceData.length === 0 && (
            <p className="text-center mt-4 text-gray-500">
              No attendance data available.
            </p>
          )}

          {!loading &&
            !error &&
            attendanceData.map((record, index) => (
              <div
                key={index}
                className="bg-white p-3 border-b border-gray-200 last:border-0"
              >
                <div className="flex justify-around items-center text-sm">
                  <div className="flex gap-3 items-center">
                    {/* <img src={vectorIcon} alt="Date Icon" className="h-5" /> */}
                    <p>{record.date}</p>
                  </div>
                  <p>{record.time_in || "N/A"}</p>
                  <p>{record.time_out || "N/A"}</p>
                  <p className="bg-gray-100 px-4 py-1 rounded-md">
                    {record.total_working_hours || "N/A"}
                  </p>
                  <p
                    className={
                      record.type === "attendance"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }
                  >
                    {record.type}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <ManagerAttendanceChart />
    </div>
  );
};

export default HrAttendanceManagement;
