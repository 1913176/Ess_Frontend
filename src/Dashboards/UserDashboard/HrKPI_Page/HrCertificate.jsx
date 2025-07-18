import React, { useState } from "react"; // calendar
import DatePicker from "react-datepicker"; // calendar
import "react-datepicker/dist/react-datepicker.css"; // calendar
import axios from "axios"; // API request
import { toast } from "react-toastify"; // React toast
import "react-toastify/dist/ReactToastify.css"; // React toast styles

const HrCertificate = ({ setiscertificatepopup }) => {
  const [certificatedate, setcertificatedate] = useState(null); // calendar
  const [participation, setParticipation] = useState(""); // Participation input
  const [certificateName, setCertificateName] = useState(""); // Certificate name
  const [file, setFile] = useState(null); // File input

  // Function to handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!participation || !certificateName || !file || !certificatedate) {
      toast.error("Please fill in all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("participation", participation);
    formData.append("certificateName", certificateName);
    formData.append("certificationDate", certificatedate);
    formData.append("certificationFile", file);

    try {
      // POST request to the upload API
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API}/upload_certificate/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Required for file upload
          },
        },
      );

      if (response.status === 200) {
        toast.success("Certificate uploaded successfully!");
        setiscertificatepopup(false); // Close the popup
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      {/* content start */}
      <div className="ms-2 p-2 rounded-lg">
        <p className="p-2 font-semibold text-lg leading-6">
          Upload Certificate
        </p>

        <div className="flex gap-2 p-2">
          <p>Participation:</p>
          <div className="flex justify-between border border-gray-300 p-1 rounded-md">
            <input
              type="text"
              placeholder="-----"
              value={participation}
              onChange={(e) => setParticipation(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 p-2">
          <p>Certificate name:</p>
          <input
            type="text"
            className="border border-gray-300 p-1 rounded-md"
            value={certificateName}
            onChange={(e) => setCertificateName(e.target.value)}
          />
        </div>

        <div className="flex items-center p-2 rounded-md gap-2">
          <p>Certification file:</p>
          <input
            type="file"
            className=" w-[100px] text-center rounded-md p-1"
            onChange={handleFileChange}
          />
          <p>{file ? file.name : "No file chosen"}</p>
        </div>

        <p className="p-2">Certification date:</p>
        {/* Calendar */}
        <DatePicker
          selected={certificatedate}
          onChange={(date) => setcertificatedate(date)}
          className="border border-gray-300 p-1 rounded-md"
        />
        {/* End calendar */}

        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-400 text-white rounded-lg"
          >
            Upload
          </button>
        </div>

        <p
          onClick={() => setiscertificatepopup((prev) => !prev)}
          className="px-2 py-1 mt-2 bg-blue-400 border border-gray-300 font-medium text-base rounded-lg w-[80px] text-center"
        >
          Close
        </p>
      </div>
      {/* content end */}
    </div>
  );
};

export default HrCertificate;
