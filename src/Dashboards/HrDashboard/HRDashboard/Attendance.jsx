import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const userInfo = JSON.parse(localStorage.getItem("userdata"));
const apiBaseUrl = process.env.VITE_BASE_API;

const Attendance = () => {
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
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.post(
          `${apiBaseUrl}/hr/attendance/form/${userInfo.hr_id}/`,
        );

        setShifts([response.data.shift || []]);
        setLocations(response.data.locations || []);
        setShowCheckout(response.data.show_checkout || false);
        setThankYouMessage(
          response.data.thank_you_message || response.data.message || "",
        );
      } catch (error) {
        console.error("Error fetching attendance form data:", error);
        setErrorMessage("Failed to load attendance form data.");
      }
    };

    fetchAttendanceData();
  }, []);

  // Function to validate Notes field (only allows letters, numbers, and spaces)
  const handleNotesChange = (e) => {
    const value = e.target.value;
    const validPattern = /^[A-Za-z0-9\s]*$/; // Allows only letters, numbers, and spaces

    if (!validPattern.test(value)) {
      alert("Notes should only contain letters, numbers, and spaces.");
      return;
    }

    setNotes(value);
  };

  const handleSubmit = async (operation) => {
    try {
      const payload = {
        user_id: userInfo.hr_id,
        operation,
        shift: shift,
        location: location,
        notes: notes,
      };

      const response = await axios.post(
        `${apiBaseUrl}/hr/submit-attendance/`,
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
    <>
      {/* <div className="bg-white shadow-md p-4 h-full rounded-lg">
      <h2 className="text-lg font-bold mb-4">Attendance Form</h2>

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
            onChange={handleNotesChange}
            className="border border-gray-300 rounded-md p-2 w-full"
            rows="3"
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
        {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
      </>
    </div> */}

      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            placeholder="Select Shift"
            value={shift}
            onValueChange={(e) => setShift(e)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a Shift" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="qwe">i</SelectItem> */}
              {shifts.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.shift_name} ({s.shift_start_time} - {s.shift_end_time})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            placeholder="Select Location"
            value={location}
            onValueChange={(e) => setLocation(e)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="qwe">i</SelectItem> */}
              {locations.map((loc) => (
                <SelectItem key={loc.location_id} value={loc.location_name}>
                  {loc.location_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Write notes"
          />
          {!showCheckout ? (
            <Button
              onClick={() => handleSubmit("check_in")}
              className="bg-blue-500 text-white py-2 px-4 rounded-md w-full"
            >
              Check In
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmit("check_out")}
              className="bg-red-500 text-white py-2 px-4 rounded-md w-full"
            >
              Check Out
            </Button>
          )}

          {/* {thankYouMessage && (
            <p className="text-green-600 mt-4">{thankYouMessage}</p>
          )} */}
          {/* {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>} */}
        </CardContent>
      </Card>
    </>
  );
};

export default Attendance;
