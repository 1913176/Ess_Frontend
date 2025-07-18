import React, { useState, useEffect } from "react";
import axios from "axios";

const AttendanceForm = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [shift, setShift] = useState(null);
  const [location, setLocation] = useState(null);
  const [notes, setNotes] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [alreadyCheckedOut, setAlreadyCheckedOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const apiBaseUrl = process.env.VITE_BASE_API;

  useEffect(() => {
    const localUser = JSON.parse(sessionStorage.getItem("userdata"));
    setUserInfo(localUser);

    const fetchAttendanceData = async () => {
      if (!localUser?.supervisor_id) return;

      try {
        const response = await axios.post(
          `${apiBaseUrl}/supervisor/attendance/form/${localUser.supervisor_id}/`
        );

        setShift(response.data.shift || null);
        setLocation(response.data.locations?.[0] || null);
        setShowCheckout(response.data.show_checkout || false);
        setThankYouMessage(response.data.thank_you_message || "");

        setAlreadyCheckedOut(response.data.already_checked_out || false);
      } catch (error) {
        console.error("Error fetching attendance form data:", error);
        setErrorMessage("Failed to load attendance form data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleSubmit = async (operation) => {
    if (!userInfo || !shift?.id || !location?.location_name) {
      setErrorMessage("Shift or Location not found. Try again.");
      return;
    }

    try {
      const payload = {
        user_id: userInfo.supervisor_id,
        operation,
        shift: shift.id,
        location: location.location_name, // ✅ FIXED: use name instead of ID
        notes: notes,
      };

      const response = await axios.post(
        `${apiBaseUrl}/supervisor/submit-attendance/`,
        payload
      );

      if (operation === "check_in") {
        setSuccessMessage("Checked in successfully.");
        setShowCheckout(true);
        setAlreadyCheckedOut(false);
      } else if (operation === "check_out") {
        setSuccessMessage("Checked out successfully.");
        setShowCheckout(false);
        setAlreadyCheckedOut(true);
      }

      setErrorMessage("");
      setThankYouMessage(response.data.message || "");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Submission failed.";
      setErrorMessage(errorMsg);
      setSuccessMessage("");

      if (errorMsg.toLowerCase().includes("leave")) {
        setAlreadyCheckedOut(false);
      } else if (errorMsg.toLowerCase().includes("checked out")) {
        setAlreadyCheckedOut(true);
      }
    }
  };

  return (
    <div className="bg-white shadow-md p-4 w-[600px] rounded-lg">
      <h2 className="text-lg font-bold mb-4">Attendance Form</h2>

      {isLoading ? (
        <p>Loading form data...</p>
      ) : shift && location ? (
        <>
          <div className="mb-4">
            <label className="block mb-2">Assigned Shift:</label>
            <input
              type="text"
              value={`Shift ${shift.shift_number || shift.id} (${shift.shift_start_time} - ${shift.shift_end_time})`}
              readOnly
              className="border border-gray-300 rounded-md p-2 w-full bg-gray-100 text-gray-700"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Location:</label>
            <input
              type="text"
              value={location.location_name}
              readOnly
              className="border border-gray-300 rounded-md p-2 w-full bg-gray-100 text-gray-700"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => {
                const sanitizedValue = e.target.value.replace(
                  /[^a-zA-Z0-9\s.,]/g,
                  ""
                );
                setNotes(sanitizedValue);
              }}
              className="border border-gray-300 rounded-md p-2 w-full"
              rows="3"
              placeholder="Enter notes (No special characters allowed)"
            />
          </div>

          <div className="mb-4">
            {alreadyCheckedOut ? (
              <button
                disabled
                className="bg-gray-400 text-white py-2 px-4 rounded-md w-full cursor-not-allowed"
              >
                 Checked Out
              </button>
            ) : !showCheckout ? (
              <button
                onClick={() => handleSubmit("check_in")}
                className="bg-blue-500 text-white py-2 px-4 rounded-md w-full"
              >
                Check In
              </button>
            ) : (
              <button
                onClick={() => handleSubmit("check_out")}
                className="bg-red-500 text-white py-2 px-4 rounded-md w-full"
              >
                Check Out
              </button>
            )}
          </div>

          {(thankYouMessage || successMessage) && (
  <p className="text-green-600 mt-4">
    {thankYouMessage || successMessage}
  </p>
)}

          {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
        </>
      ) : (
        <p className="text-red-500">Could not load shift or location data.</p>
      )}
    </div>
  );
};

export default AttendanceForm;
