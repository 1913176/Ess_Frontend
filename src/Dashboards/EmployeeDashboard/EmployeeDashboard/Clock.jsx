import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sun, Calendar, LogIn, LogOut } from "lucide-react";

axios.defaults.withCredentials = true;
const apiBaseUrl = process.env.VITE_BASE_API;

const Clock = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [punchInTime, setPunchInTime] = useState("--.--"); // Default to --.--
  const [punchOutTime, setPunchOutTime] = useState("--.--"); // Default to --.--
  const [message, setMessage] = useState(""); // For success/error messages
  const [earlyLateMessage, setEarlyLateMessage] = useState(""); // For early/late message
  const [timeDifference, setTimeDifference] = useState(null);
  const [hasPunchedInToday, setHasPunchedInToday] = useState(false);
  const [hasPunchedOutToday, setHasPunchedOutToday] = useState(false);
  const WORK_START_TIME = 9; // 9:00 AM

  const userinfo = JSON.parse(localStorage.getItem("userdata"));

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

    const today = new Date().toLocaleDateString();
    const lastPunchInDate = localStorage.getItem("lastPunchInDate");
    const lastPunchOutDate = localStorage.getItem("lastPunchOutDate");

    if (lastPunchInDate === today) {
      setHasPunchedInToday(true);
      const savedPunchIn = localStorage.getItem("punchInTime");
      if (savedPunchIn) {
        setPunchInTime(savedPunchIn);
      }
      const savedTimeDifference = localStorage.getItem("timeDifference");
      if (savedTimeDifference) {
        const diff = JSON.parse(savedTimeDifference);
        setTimeDifference(diff);
        setEarlyLateMessage(getTimeDifferenceMessage(diff));
      }
    }

    if (lastPunchOutDate === today) {
      setHasPunchedOutToday(true);
      const savedPunchOut = localStorage.getItem("punchOutTime");
      if (savedPunchOut) {
        setPunchOutTime(savedPunchOut);
      }
    }

    return () => clearInterval(timer);
  }, []);

  const calculateTimeDifference = (punchTime) => {
    const now = new Date();
    const workStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      WORK_START_TIME,
      0,
      0
    );

    const diffMs = punchTime - workStart;
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.abs(Math.floor(diffMins / 60));
    const remainingMins = Math.abs(diffMins % 60);

    return {
      isEarly: diffMs < 0,
      hours: diffHours,
      minutes: remainingMins,
      totalMinutes: Math.abs(diffMins),
    };
  };

  const getTimeDifferenceMessage = (diff) => {
    if (!diff) return "";

    const { isEarly, hours, minutes, totalMinutes } = diff;

    if (totalMinutes === 0) return "You're right on time!";

    if (isEarly) {
      if (hours > 0) {
        return `You came ${hours} hour${hours !== 1 ? "s" : ""} and ${minutes} minute${minutes !== 1 ? "s" : ""} early today`;
      }
      return `You came ${minutes} minute${minutes !== 1 ? "s" : ""} early today`;
    } else {
      if (hours > 0) {
        return `You're ${hours} hour${hours !== 1 ? "s" : ""} and ${minutes} minute${minutes !== 1 ? "s" : ""} late`;
      }
      return `You're ${minutes} minute${minutes !== 1 ? "s" : ""} late`;
    }
  };

  const handlePunchIn = async () => {
    try {
      const now = new Date();
      const today = now.toLocaleDateString();

      if (hasPunchedInToday) {
        setMessage("You've already punched in today");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      const diff = calculateTimeDifference(now);
      setTimeDifference(diff);
      localStorage.setItem("timeDifference", JSON.stringify(diff));

      const earlyLateMsg = getTimeDifferenceMessage(diff);
      setEarlyLateMessage(earlyLateMsg);

      setHasPunchedInToday(true);
      localStorage.setItem("lastPunchInDate", today);

      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Use 24-hour format and remove AM/PM
      }).replace(/^0/, ""); // Remove leading zero for single-digit hours
      localStorage.setItem("punchInTime", formattedTime);
      setPunchInTime(formattedTime); // Update punch in time on click

      const response = await axios.post(
        `${apiBaseUrl}/employee/submit-attendance/`,
        {
          user_id: userinfo.employee_id,
          operation: "check_in",
          shift: userinfo.shift,
          location: "chennai",
          notes: "Attendance check-in via Clock.jsx",
        }
      );

      setMessage(response.data.message || "Punched in successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to submit attendance.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handlePunchOut = async () => {
    try {
      const now = new Date();
      const today = now.toLocaleDateString();

      if (!hasPunchedInToday) {
        setMessage("You need to punch in first");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      if (hasPunchedOutToday) {
        setMessage("You've already punched out today");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      setHasPunchedOutToday(true);
      localStorage.setItem("lastPunchOutDate", today);

      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Use 24-hour format and remove AM/PM
      }).replace(/^0/, ""); // Remove leading zero for single-digit hours
      localStorage.setItem("punchOutTime", formattedTime);
      setPunchOutTime(formattedTime); // Update punch out time on click

      const response = await axios.post(
        `${apiBaseUrl}/employee/submit-attendance/`,
        {
          user_id: userinfo.employee_id,
          operation: "check_out",
          shift: userinfo.shift,
          location: "chennai",
          notes: "Attendance check-out via Clock.jsx",
        }
      );

      setMessage(response.data.message || "Punched out successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to submit attendance.");
      setTimeout(() => setMessage(""), 3000);
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
        {message ? (
          <p className="text-gray-500 text-sm">{message}</p>
        ) : (
          earlyLateMessage && (
            <p className="text-gray-500 text-sm">{earlyLateMessage}</p>
          )
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
            className="flex items-center gap-2 cursor-pointer"
            onClick={handlePunchIn}
          >
            <LogIn className="text-gray-700 w-5 h-5" />
            <span className="text-gray-700 font-medium text-lg">Punch In</span>
          </div>
          <span className="text-xl font-bold text-gray-800 mt-2">{punchInTime}</span>
        </div>

        {/* Punch Out Box */}
        <div className="flex-1 flex flex-col items-center p-4 bg-red-100 rounded-lg">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handlePunchOut}
          >
            <LogOut className="text-gray-700 w-5 h-5" />
            <span className="text-gray-700 font-medium text-lg">Punch Out</span>
          </div>
          <span className="text-xl font-bold text-gray-800 mt-2">
            {punchOutTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Clock;