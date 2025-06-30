import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";
// import arrowIcon from "./../../../assets/Images/arrow-right (1).png";
const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;
const Clock = () => {
  const [currentTime, setCurrentTime] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userdata"));
  const [attendance, setAttendance] = useState({
    firstInTime: "--:--",
    lastOutTime: "--:--",
    duration: "0h 0m 0s",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        `${now.toLocaleTimeString()} - ${now.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        })}`,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClockInOut = async () => {
    try {
      const userId = userInfo.supervisor_id; // Replace with actual user ID
      const operation =
        attendance.firstInTime === "--:--" ? "check_in" : "check_out";

      const payload = {
        user_id: userId,
        operation,
        shift: userInfo.shift, // Dynamic shift number
        location: "Chennai", // Dynamic location
        notes: "Attendance check-in via Clock.jsx",
        // latitude: "12.9716", // Replace with actual coordinates
        // longitude: "77.5946",
      };

      const response = await axios.post(
        `${apiBaseUrl}/supervisor/submit-attendance/`,
        payload,
      );

      const now = new Date();
      const time = now.toLocaleTimeString();

      if (operation === "check_in") {
        setAttendance((prev) => ({
          ...prev,
          firstInTime: time,
          lastOutTime: time,
        }));
      } else {
        setAttendance((prev) => ({ ...prev, lastOutTime: time }));
      }

      setMessage({ type: "success", text: response.data.message });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to submit attendance.",
      });
    }
  };

  return (
    <div className="bg-white lg:w-[450px] shadow-md p-4 sm:flex flex-col w-full">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between gap-5 text-xl text-black">
          <p className="font-semibold text-base">Clock IN/Out</p>
          <p className="font-semibold text-sm">{currentTime}</p>
        </div>

        {message.text && (
          <div
            className={`text-center ${
              message.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col gap-5">
          <span className="bg-gray-200 p-2 font-normal text-base">
            First in {attendance.firstInTime}
          </span>
          <span className="bg-gray-200 p-2 font-normal text-base">
            Last Out {attendance.lastOutTime}
          </span>
          <span
            className="bg-blue-800 flex items-center p-2 gap-3 cursor-pointer"
            onClick={handleClockInOut}
          >
            {/* <img src={arrowIcon} alt="Arrow icon" /> */}
            <ArrowRight />
            <p className="font-semibold text-base text-white">
              Clock {attendance.firstInTime === "--:--" ? "In" : "Out"}
            </p>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Clock;
