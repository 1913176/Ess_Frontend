import React, { useState } from "react";
import axios from "axios";
import ForgotPassword from "./ForgotPassword";

const userInfo = JSON.parse(localStorage.getItem("userdata")) || {};
const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateProfile = ({ setupdate, managerId }) => {
  // State to manage form data dynamically
  const [formData, setFormData] = useState({
    username: userInfo.username,
    name: userInfo.manager_name,
    id: managerId,
    email: userInfo.email,
    gender: userInfo.gender,
    managerImage: null,
    dob: userInfo.dob,
    phone_number: userInfo.phone_number,
    address: userInfo.address,
    city: userInfo.city,
    country: userInfo.country,
    pincode: userInfo.pincode,
    state: userInfo.state,
    linkedProfile: userInfo.linkedProfile,
  });

  // State for the forgot password popup
  const [isforgot, setforgot] = useState(false);

  // Function to handle changes in input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Email validation
    if (name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        alert("Please enter a valid email address");
        return;
      }
    }

    // Phone number validation - Only numbers allowed
    if (name === "phone_number") {
      const numericPattern = /^[0-9]*$/;
      if (!numericPattern.test(value)) {
        alert("Phone number must contain only numbers.");
        return;
      }
    }

    // City, Country, and State validation - Only letters allowed
    if (["city", "country", "state"].includes(name)) {
      const alphabeticPattern = /^[A-Za-z\s]+$/;
      if (!alphabeticPattern.test(value)) {
        alert(
          `${
            name.charAt(0).toUpperCase() + name.slice(1)
          } must only contain letters and spaces.`,
        );
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle file input change
  const handleFileChange = (e) => {
    setFormData({ ...formData, managerImage: e.target.files[0] });
  };

  // Function to handle profile update
  const handleUpdateProfile = async () => {
    const formDataToSend = new FormData();

    // Add form data
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await axios.put(
        `${apiBaseUrl}/api/managers/update/${managerId}/`, // Backend URL with managerId
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data", // For sending file data
          },
        },
      );

      // Success response handling
      console.log("Profile updated successfully:", response.data);
    } catch (error) {
      // Error handling
      console.error("Error updating profile:", error);
    }
  };

  // Function to close the update form
  const handleClose = () => {
    setupdate(false);
  };

  return (
    <div>
      {/* Content start */}
      <div className="bg-white p-2 rounded-lg shadow-md w-[420px]">
        <p className="p-2">Update profile</p>

        <p className="p-1">Name</p>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-1 w-[400px]"
        />

        <p className="p-1">UserName</p>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-1 w-[400px]"
        />

        <p className="p-1">ID</p>
        <input
          type="text"
          id="manager_id"
          value={formData.id}
          className="border border-gray-300 rounded-md p-1 w-[400px]"
          disabled // Prevent ID modification
        />

        <p className="p-1">Email</p>
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-1 w-[400px]"
        />

        <p className="p-1">Gender</p>
        <input
          type="text"
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-1 w-[400px]"
        />

        <p className="p-1">Manager Image</p>
        <input
          type="file"
          onChange={handleFileChange}
          className="rounded-md p-1"
        />

        <p className="p-1">Date of Birth</p>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-1 w-[400px]"
        />

        <p className="p-1">Phone Number</p>
        <input
          type="text"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-1 w-[400px]"
        />

        <p className="p-1">Address</p>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-1 w-[400px]"
        />

        <p className="p-1">City</p>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-1 w-[400px]"
        />

        <p className="p-1">Country</p>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className="p-1 rounded-md border border-gray-300 w-[400px]"
        />

        <p className="p-1">Pincode</p>
        <input
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleInputChange}
          className="p-1 rounded-md border border-gray-300 w-[400px]"
        />

        <p className="p-1">State</p>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          className="p-1 rounded-md border border-gray-300 w-[400px]"
        />

        <p className="p-1">Linked Profile Link</p>
        <input
          type="text"
          name="linkedProfile"
          value={formData.linkedProfile}
          onChange={handleInputChange}
          className="p-1 rounded-md border border-gray-300 w-[400px]"
        />

        <p
          onClick={handleUpdateProfile}
          className="bg-blue-400 rounded-md p-1 mt-2 text-center text-white w-[200px] cursor-pointer"
        >
          Update Profile
        </p>
      </div>
    </div>
  );
};

export default UpdateProfile;
