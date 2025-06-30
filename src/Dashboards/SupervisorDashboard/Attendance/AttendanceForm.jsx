import React, { useState, useEffect } from "react";
import axios from "axios";

const userInfo = JSON.parse(localStorage.getItem("userdata"));
const apiBaseUrl = process.env.VITE_BASE_API;

const AttendanceForm = () => {
  const [shift, setShift] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [shifts, setShifts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Fetch attendance form data
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.post(
          `${apiBaseUrl}/supervisor/attendance/form/${userInfo.supervisor_id}/`,
        );

        setShifts([response.data.shift]); // Assuming a single shift is assigned
        setLocations(response.data.locations || []);
        setShowCheckout(response.data.show_checkout || false);
        setThankYouMessage(response.data.thank_you_message || "");
      } catch (error) {
        console.error("Error fetching attendance form data:", error);
        setErrorMessage("Failed to load attendance form data.");
      }
    };

    fetchAttendanceData();
  }, []);

  const handleSubmit = async (operation) => {
    try {
      const payload = {
        user_id: userInfo.supervisor_id,
        operation,
        shift: shift,
        location: location,
        notes: notes,
      };

      const response = await axios.post(
        `${apiBaseUrl}/supervisor/submit-attendance/`,
        payload,
      );

      if (operation === "check_in") {
        setSuccessMessage("Checked in successfully.");
        setErrorMessage("");
        setShowCheckout(true);
      } else if (operation === "check_out") {
        setSuccessMessage("Checked out successfully.");
        setErrorMessage("");
        setShowCheckout(false);
      }

      setThankYouMessage(response.data.message || "");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setErrorMessage(error.response?.data?.error || "Submission failed.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="bg-white shadow-md p-4 w-[600px] rounded-lg">
      <h2 className="text-lg font-bold mb-4">Attendance Form</h2>
      {shifts.length > 0 && locations.length > 0 ? (
        <>
          <div className="mb-4">
            <label className="block mb-2">Assigned Shift:</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Select Shift</option>
              {shifts.map((s) => (
                <option key={s.shift_number} value={s.id}>
                  {s.shift_name} ({s.shift_start_time} - {s.shift_end_time})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Location:</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.location_id} value={loc.location_name}>
                  {loc.location_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => {
                const sanitizedValue = e.target.value.replace(
                  /[^a-zA-Z0-9\s.,]/g,
                  "",
                ); // Restrict special characters
                setNotes(sanitizedValue);
              }}
              className="border border-gray-300 rounded-md p-2 w-full"
              rows="3"
              placeholder="Enter notes (No special characters allowed)"
            />
          </div>

          {!showCheckout ? (
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

          {thankYouMessage && (
            <p className="text-green-600 mt-4">{thankYouMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-600 mt-4">{successMessage}</p>
          )}
          {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
        </>
      ) : (
        <p>Loading form data...</p>
      )}
    </div>
  );
};

export default AttendanceForm;
