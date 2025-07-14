import React, { useState, useEffect } from "react";
import axios from "axios";
import ForgotPassword from "./ForgotPassword";

const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerUpdateProfile = ({ setUpdate, managerId, setProfile, profile }) => {
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    manager_name: profile?.manager_name || "",
    manager_id: profile?.manager_id || "",
    email: profile?.email || "",
    gender: profile?.gender || "",
    manager_image: null,
    dob: profile?.dob || "",
    phone_number: profile?.phone_number || "",
    address: profile?.address || "",
    city: profile?.city || "",
    country: profile?.country || "",
    pincode: profile?.pincode || "",
    state: profile?.state || "",
    linkedin_profile_link: profile?.linkedin_profile_link || "",
  });

  const [isForgot, setForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Sync formData with the latest profile data whenever the profile prop changes
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        manager_name: profile.manager_name || "",
        manager_id: profile.manager_id || "",
        email: profile.email || "",
        gender: profile.gender || "",
        manager_image: null, // File input should remain null
        dob: profile.dob || "",
        phone_number: profile.phone_number || "",
        address: profile.address || "",
        city: profile.city || "",
        country: profile.country || "",
        pincode: profile.pincode || "",
        state: profile.state || "",
        linkedin_profile_link: profile.linkedin_profile_link || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!setUpdate) {
      console.error("setUpdate prop is not provided to ManagerUpdateProfile");
    }
    if (!setProfile) {
      console.error("setProfile prop is not provided to ManagerUpdateProfile");
    }
  }, [setUpdate, setProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (value && !emailPattern.test(value)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    if (["city", "country", "state"].includes(name)) {
      const alphabetPattern = /^[A-Za-z\s]+$/;
      if (value && !alphabetPattern.test(value)) {
        setError(`${name.charAt(0).toUpperCase() + name.slice(1)} should only contain letters.`);
        return;
      }
    }

    if (name === "phone_number") {
      const numberPattern = /^[0-9]*$/;
      if (value && !numberPattern.test(value)) {
        setError("Phone number should only contain numbers.");
        return;
      }
    }

    setError(null);
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please upload a JPEG or PNG image.");
      return;
    }
    setError(null);
    setFormData({ ...formData, manager_image: file });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== "manager_id") {
        formDataToSend.append(key, value);
      }
    });

    try {
      const response = await axios.put(
        `${apiBaseUrl}/api/managers/${managerId}/update`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      console.log("Update Profile API Response:", response.data);

      setSuccess("Profile updated successfully!");

      // Update sessionStorage
      const userInfo = JSON.parse(sessionStorage.getItem("userdata")) || {};
      const updatedUserData = {
        ...userInfo,
        ...response.data.data,
      };
      sessionStorage.setItem("userdata", JSON.stringify(updatedUserData));

      // Normalize the API response to match the structure expected by ManagerProfile
      const updatedProfile = response.data.data || response.data;
      if (!updatedProfile) {
        throw new Error("Updated profile data is missing in the API response.");
      }

      // Update profile state
      setProfile(updatedProfile);

      // Close the update form immediately after updating the profile state
      setUpdate(false);
    } catch (error) {
      console.error("Update Profile Error:", error.response?.data || error.message);
      setError(error.response?.data?.detail || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    setForgot(false);
    setUpdate(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {[
              { label: "Name", name: "manager_name", type: "text", disabled: true },
              { label: "Username", name: "username", type: "text", disabled: true },
              { label: "ID", name: "manager_id", type: "text", disabled: true },
              { label: "Email", name: "email", type: "email" },
              { label: "Gender", name: "gender", type: "text" },
              { label: "Date of Birth", name: "dob", type: "date" },
              { label: "Phone Number", name: "phone_number", type: "tel" },
              { label: "Address", name: "address", type: "text" },
              { label: "City", name: "city", type: "text" },
              { label: "Country", name: "country", type: "text" },
              { label: "Pincode", name: "pincode", type: "text" },
              { label: "State", name: "state", type: "text" },
              { label: "LinkedIn Profile", name: "linkedin_profile_link", type: "url" },
            ].map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  disabled={field.disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            ))}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Manager Image
              </label>
              <input
                type="file"
                name="manager_image"
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="text-center">
              <button
                onClick={() => setForgot(true)}
                className="text-blue-600 hover:underline text-sm"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isForgot && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <ForgotPassword />
        </div>
      )}
    </div>
  );
};

export default ManagerUpdateProfile;