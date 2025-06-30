import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Enroll from "./HrEnroll";
import Certificate from "./HrCertificate";

const HrTraining = () => {
  const [isenrollpopup, setisenrollpopup] = useState(false);
  const [iscertificatepopup, setiscertificatepopup] = useState(false);
  const [startdate, setstartdate] = useState(null);
  const [enddate, setenddate] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trainingIncharge, setTrainingIncharge] = useState("");
  const baseApiUrl = import.meta.env.VITE_BASE_API;

  const handleSubmit = async () => {
    const requestData = {
      name,
      description,
      start_date: startdate ? startdate.toISOString().split("T")[0] : null,
      end_date: enddate ? enddate.toISOString().split("T")[0] : null,
      training_incharge: trainingIncharge,
    };

    try {
      const response = await fetch(`${baseApiUrl}/create_training_program/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success("Training Program Created Successfully");
      } else {
        const errorData = await response.json();
        toast.error(
          `Error: ${errorData.message || "Failed to create training program"}`,
        );
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div>
      <div className="w-[600px] shadow-md bg-white p-2 ms-2 rounded-lg">
        <p className="font-semibold text-lg leading-6 p-2">
          Create Training Program
        </p>

        <div className="flex gap-2 p-2">
          <p>Name:</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded-md p-1"
          />
        </div>

        <div className="flex gap-2 p-2">
          <p>Description:</p>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-24 border border-gray-300 rounded-md"
          />
        </div>

        <p className="p-2">Start Date:</p>
        <DatePicker
          selected={startdate}
          onChange={(date) => setstartdate(date)}
          className="px-2 rounded-md py-1 border border-gray-300"
        />

        <p className="p-2">End Date:</p>
        <DatePicker
          selected={enddate}
          onChange={(date) => setenddate(date)}
          className="px-2 py-1 border border-gray-300 rounded-md"
        />

        <div className="flex gap-2 items-center p-2">
          <p>Training Incharge:</p>
          <select
            value={trainingIncharge}
            onChange={(e) => setTrainingIncharge(e.target.value)}
            className="border border-gray-300 p-1 w-[300px] rounded-md"
          >
            <option value="" disabled selected></option>
            <option value="Sudhakar">Sudhakar</option>
            <option value="Vinoth">Vinoth</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 p-2">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 font-medium text-white rounded-lg text-center p-2 mt-2 w-full"
          >
            Submit
          </button>
          <button
            onClick={() => setisenrollpopup(true)}
            className="bg-gray-400 font-medium text-base rounded-lg text-center p-1"
          >
            Enroll
          </button>
          <button
            onClick={() => setiscertificatepopup(true)}
            className="bg-yellow-300 font-medium rounded-lg text-base text-center p-1"
          >
            View Certificate
          </button>
        </div>
      </div>

      {/* Enroll Popup */}
      {isenrollpopup && (
        <div className="absolute left-0 top-0 w-full h-full bg-white">
          <Enroll setisenrollpopup={setisenrollpopup} />
        </div>
      )}

      {/* Certificate Popup */}
      {iscertificatepopup && (
        <div className="absolute left-0 top-0 w-full h-full bg-white">
          <Certificate setiscertificatepopup={setiscertificatepopup} />
        </div>
      )}
    </div>
  );
};

export default HrTraining;
