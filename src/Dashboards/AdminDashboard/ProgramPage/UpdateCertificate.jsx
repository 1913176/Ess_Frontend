import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateCertificate = ({
  setUpdateCertificatePopup,
  certificateId,
  EnrollList,
  fetchCertificateList,
}) => {
  const [certificateData, setCertificateData] = useState({
    certification_name: "",
    participation: "",
    certification_file: null,
    certification_date: "",
  });

  // Fetch the certificate data for the given ID
  const fetchCertificateDetails = async () => {
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/certificates/${certificateId}/`,
      );
      setCertificateData({
        certification_name: data.certification_name,
        participation: data.participation,
        certification_date: data.certification_date,
        certification_file: null, // File is not fetched; users can upload a new one
      });
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      toast.error("Failed to fetch certificate details.");
    }
  };

  useEffect(() => {
    fetchCertificateDetails();
  }, [certificateId]);

  // Handle updating the certificate
  const handleUpdateCertificate = async (e) => {
    e.preventDefault();

    // Create a FormData object to handle file uploads
    const formData = new FormData();
    formData.append("certification_name", certificateData.certification_name);
    formData.append("participation", certificateData.participation);
    formData.append("certification_file", certificateData.certification_file);
    formData.append("certification_date", certificateData.certification_date);

    try {
      const { data } = await axios.put(
        `${apiBaseUrl}/update_certificate/${certificateId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setUpdateCertificatePopup(false);
      fetchCertificateList();
      toast.success(data.message || "Certificate updated successfully.");
    } catch (error) {
      console.error("Error updating certificate:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to update certificate.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Update Certificate</h1>
        <form className="space-y-6 w-full" onSubmit={handleUpdateCertificate}>
          <div className="grid gap-6 w-full">
            <div className="space-y-4">
              <h2 className="font-medium text-gray-700">Certificate Details</h2>
              <div className="space-y-4">
                {/* Certification Name */}
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">
                    Certificate Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Certification name"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={certificateData.certification_name}
                    onChange={(e) =>
                      setCertificateData({
                        ...certificateData,
                        certification_name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Participation */}
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">
                    Participation Name
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={certificateData.participation}
                    onChange={(e) =>
                      setCertificateData({
                        ...certificateData,
                        participation: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select Participation
                    </option>
                    {EnrollList.map((enroll) => (
                      <option key={enroll.id} value={enroll.id}>
                        {enroll.id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Certificate File */}
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">
                    Certificate File
                  </label>
                  <input
                    type="file"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setCertificateData({
                        ...certificateData,
                        certification_file: file,
                      });
                    }}
                  />
                </div>

                {/* Certificate Date */}
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">
                    Certificate Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={certificateData.certification_date}
                    onChange={(e) =>
                      setCertificateData({
                        ...certificateData,
                        certification_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setUpdateCertificatePopup(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCertificate;
