import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sun, Calendar, LogIn, LogOut } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const Clock = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
  const [attendance, setAttendance] = useState({
    firstInTime: "--:--",
    lastOutTime: "--:--",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [alreadyCheckedOut, setAlreadyCheckedOut] = useState(false);
  const [onLeave, setOnLeave] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [shift, setShift] = useState(null);
  const [location, setLocation] = useState(null);

  // Update current time and date every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance status and shift/location info
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.post(
          `${apiBaseUrl}/supervisor/attendance/form/${userInfo.supervisor_id}/`
        );

        setAlreadyCheckedOut(response.data.already_checked_out || false);
        setOnLeave(response.data.on_leave || false);
        setShift(response.data.shift || null);
        setLocation(response.data.locations?.[0]?.location_name || null);

        setAttendance({
          firstInTime: response.data.first_in_time || "--:--",
          lastOutTime: response.data.last_out_time || "--:--",
        });

        if (response.data.on_leave) {
          setMessage({
            type: "error",
            text: "You are on leave today. Punch-in is not allowed.",
          });
        } else if (response.data.already_checked_out) {
          setMessage({
            type: "error",
            text: "You have already punched out for today.",
          });
        } else {
          setMessage({ type: "", text: "" });
        }

        setIsLoading(false);
        setInitialLoad(false);
      } catch (error) {
        console.error("Error fetching clock status:", error);
        setMessage({ type: "error", text: "Failed to fetch attendance status." });
        setIsLoading(false);
        setInitialLoad(false);
      }
    };

    if (userInfo?.supervisor_id) {
      fetchStatus();
    } else {
      setMessage({ type: "error", text: "User information not found." });
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, [userInfo?.supervisor_id]);

  // Adjust message reactively
  useEffect(() => {
    if (initialLoad) return;

    if (onLeave) {
      setMessage({
        type: "error",
        text: "You are on leave today. Punch-in is not allowed.",
      });
    } else if (alreadyCheckedOut) {
      setMessage({
        type: "error",
        text: "You have already punched out for today.",
      });
    } else {
      setMessage({ type: "", text: "" });
    }
  }, [onLeave, alreadyCheckedOut, initialLoad]);

  // Handle punch in/out
  const handleClockInOut = async () => {
    if (isLoading) return;

    if (onLeave) {
      setMessage({
        type: "error",
        text: "You are on leave today. Punch-in is not allowed.",
      });
      return;
    }

    if (alreadyCheckedOut) {
      setMessage({
        type: "error",
        text: "You have already punched out for today.",
      });
      return;
    }

    if (!shift?.id || !location) {
      setMessage({
        type: "error",
        text: "Shift or Location not found. Try again.",
      });
      return;
    }

    try {
      const operation = attendance.firstInTime === "--:--" ? "check_in" : "check_out";
      const payload = {
        user_id: userInfo.supervisor_id,
        operation,
        shift: shift.id,
        location: location,
        notes: "Attendance via dashboard clock",
      };

      const response = await axios.post(`${apiBaseUrl}/supervisor/submit-attendance/`, payload);
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).replace(/^0/, "");

      if (operation === "check_in") {
        setAttendance((prev) => ({ ...prev, firstInTime: time }));
        setMessage({ type: "success", text: "Punched in successfully." });
      } else {
        setAttendance((prev) => ({ ...prev, lastOutTime: time }));
        setMessage({ type: "success", text: "Punched out successfully." });
        setAlreadyCheckedOut(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to submit attendance.";
      setMessage({ type: "error", text: errorMsg });

      if (errorMsg.toLowerCase().includes("already checked out")) {
        setAlreadyCheckedOut(true);
      }
      if (errorMsg.toLowerCase().includes("leave")) {
        setOnLeave(true);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
      {/* Header Section with Time and Message */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="text-blue-600 w-7 h-7" />
          <span className="text-4xl font-bold text-black">{currentTime}</span>
        </div>
        {message.text && (
          <p className={`text-sm ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* Date Section */}
      <div className="flex items-center justify-center gap-2 mb-8 text-gray-600">
        <Calendar className="w-5 h-5" />
        <span className="text-lg">
          Today: {currentDate.replace(/(\d+)(?:st|nd|rd|th)/, "$1th")}
        </span>
      </div>

      {/* Punch In/Out Section */}
      <div className="flex gap-4">
        {/* Punch In Box */}
        <div className="flex-1 flex flex-col items-center p-4 bg-green-100 rounded-lg">
          <div
            className={`flex items-center gap-2 ${
              onLeave || isLoading || !shift?.id || !location
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
            onClick={
              !onLeave && !isLoading && shift?.id && location && attendance.firstInTime === "--:--"
                ? handleClockInOut
                : undefined
            }
          >
            <LogIn className="text-gray-700 w-5 h-5" />
            <span className="text-gray-700 font-medium text-lg">Punch In</span>
          </div>
          <span className="text-xl font-bold text-gray-800 mt-2">{attendance.firstInTime}</span>
        </div>

        {/* Punch Out Box */}
        <div className="flex-1 flex flex-col items-center p-4 bg-red-100 rounded-lg">
          <div
            className={`flex items-center gap-2 ${
              alreadyCheckedOut || onLeave || isLoading || !shift?.id || !location || attendance.firstInTime === "--:--"
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
            onClick={
              !alreadyCheckedOut && !onLeave && !isLoading && shift?.id && location && attendance.firstInTime !== "--:--"
                ? handleClockInOut
                : undefined
            }
          >
            <LogOut className="text-gray-700 w-5 h-5" />
            <span className="text-gray-700 font-medium text-lg">Punch Out</span>
          </div>
          <span className="text-xl font-bold text-gray-800 mt-2">{attendance.lastOutTime}</span>
        </div>
      </div>
    </div>
  );
};

export default Clock;

