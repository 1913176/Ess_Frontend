import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HrEnroll = ({ setisenrollpopup }) => {
  const [datecompletion, setisdatecompletion] = useState(null);
  const [program, setProgram] = useState("");
  const [employee, setEmployee] = useState("");
  const [manager, setManager] = useState("");
  const [status, setStatus] = useState("Not Started");

  const handleSubmit = async () => {
    if (!program || !employee || !manager) {
      toast.error("All fields are required");
      return;
    }

    const requestData = {
      program,
      employee,
      manager,
      completion_status: status,
      completion_date: datecompletion ? datecompletion.toISOString() : null,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API}/create_training_progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        },
      );

      if (response.ok) {
        toast.success("Enrollment successful!");
        setisenrollpopup(false);
      } else {
        toast.error("Failed to enroll participant");
      }
    } catch (error) {
      toast.error("An error occurred while enrolling");
    }
  };

  return (
    <div className="p-2 ms-2 rounded-lg mt-3">
      <p className="p-2 font-semibold text-lg leading-6">Enroll Participant</p>

      <div className="flex items-center p-2 gap-2">
        <p>Program:</p>
        <input
          type="text"
          placeholder="-----"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="p-1 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex gap-2 items-center p-2">
        <p>Employee:</p>
        <input
          type="text"
          placeholder="None"
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
          className="p-1 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex gap-2 items-center p-2">
        <p>Manager:</p>
        <input
          type="text"
          placeholder="None"
          value={manager}
          onChange={(e) => setManager(e.target.value)}
          className="p-1 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex gap-2 items-center p-2">
        <p>Completion Status:</p>
        <input
          type="text"
          placeholder="Not Started"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-1 border border-gray-300 rounded-md"
        />
      </div>

      <p className="p-2">Completion Date:</p>
      <DatePicker
        selected={datecompletion}
        onChange={(date) => setisdatecompletion(date)}
        className="p-1 rounded-md border border-gray-300"
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSubmit}
          className="border border-gray-300 bg-green-500 text-white font-medium text-base rounded-lg px-4 py-1"
        >
          Enroll
        </button>
        <button
          onClick={() => setisenrollpopup(false)}
          className="border border-gray-300 bg-blue-400 font-medium text-base rounded-lg px-4 py-1"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default HrEnroll;
