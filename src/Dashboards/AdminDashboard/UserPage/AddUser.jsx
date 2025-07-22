import axios from "axios";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const apiBaseUrl = process.env.VITE_BASE_API;

const AddUser = ({
  open,
  setOpen,
  fetchUserList,
  ShiftList,
  DepartmentList,
}) => {
  const [userData, setUserData] = useState({
    user_name: "",
    email: "",
    gender: "",
    dob: "",
    user_image: null,
    username: "",
    password: "",
    department: "",
    shift: "",
    hired_date: "",
    streams: {},
    location: "",
    designation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    user_name: "",
    username: "",
    dob: "",
    hired_date: "",
    password: "",
  });
  const [LocationList, setLocationList] = useState([]); // State for location list

  // Fetch locations when component mounts
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/admin/overall-location/`,
        );
        setLocationList(response.data); // Assuming the endpoint returns a list of locations
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Failed to load locations");
      }
    };
    fetchLocations();
  }, []);

  const streamOptions = [
    "Task",
    "Todo",
    "Attendance",
    "Leave",
    "Salary",
    "KPI",
    "Training Certification",
    "Help Desk",
    "Billing",
    "Account Management",
  ];
  const subComponents = ["Admin", "Manager", "User", "Management"];

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      user_name: "",
      username: "",
      dob: "",
      hired_date: "",
      password: "",
    };
    const today = new Date().toISOString().split("T")[0];

    if (!/^[A-Za-z\s]+$/.test(userData.user_name)) {
      newErrors.user_name = "Name should only contain alphabets and spaces";
      isValid = false;
    }

    if (!/^[A-Za-z\s]+$/.test(userData.username)) {
      newErrors.username = "Username should only contain alphabets and spaces";
      isValid = false;
    }

    if (!userData.password || userData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    if (userData.dob && userData.dob > today) {
      newErrors.dob = "Future date is not allowed";
      isValid = false;
    }

    if (userData.hired_date && userData.hired_date > today) {
      newErrors.hired_date = "Future date is not allowed";
      isValid = false;
    }

    if (!userData.gender) {
      toast.error("Please select a gender");
      isValid = false;
    }

    if (!userData.department) {
      toast.error("Please select a department");
      isValid = false;
    }

    if (!userData.shift) {
      toast.error("Please select a shift");
      isValid = false;
    }

    if (!userData.designation) {
      toast.error("Please select a designation");
      isValid = false;
    }

    if (Object.keys(userData.streams).length === 0) {
      toast.error("Please select at least one stream");
      isValid = false;
    }

    if (!userData.location) {
      toast.error("Please select a location");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setUserData({
      user_name: "",
      email: "",
      gender: "",
      dob: "",
      user_image: null,
      username: "",
      password: "",
      department: "",
      shift: "",
      hired_date: "",
      streams: {},
      location: "",
      designation: "",
    });

    setErrors({
      user_name: "",
      username: "",
      dob: "",
      hired_date: "",
      password: "",
    });
    setShowPassword(false);
  };

  const handleStreamChange = (stream) => {
    setUserData((prev) => {
      const newStreams = { ...prev.streams };
      if (newStreams[stream]) {
        delete newStreams[stream];
      } else {
        newStreams[stream] = [];
      }
      return { ...prev, streams: newStreams };
    });
  };

  const handleSubComponentChange = (stream, subComponent) => {
    setUserData((prev) => {
      const newStreams = { ...prev.streams };
      const currentSubComponents = newStreams[stream] || [];
      if (currentSubComponents.includes(subComponent)) {
        newStreams[stream] = currentSubComponents.filter(
          (sc) => sc !== subComponent,
        );
      } else {
        newStreams[stream] = [...currentSubComponents, subComponent];
      }
      return { ...prev, streams: newStreams };
    });
  };
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

    Object.entries(userData).forEach(([key, value]) => {
      if (key === "streams") {
        formData.append("streams", JSON.stringify(value));
      } else if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      const response = await axios.post(
        `${apiBaseUrl}/admin/add_user/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("User added successfully!");
        resetForm();
        fetchUserList?.();
        setOpen(false);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      const errData = error.response?.data;
      const errorMessages = [];

      // Check for specific error fields and display the first error message
      if (errData) {
        if (errData.username) errorMessages.push(errData.username[0]);
        if (errData.email) errorMessages.push(errData.email[0]);
        if (errData.password || errData.plain_password)
          errorMessages.push((errData.password || errData.plain_password)[0]);
        if (errData.streams) errorMessages.push(errData.streams[0]);
        if (errData.location) errorMessages.push(errData.location[0]);
        if (errData.message && !errData.message.includes("successfully"))
          errorMessages.push(errData.message);
        if (errData.non_field_errors)
          errorMessages.push(errData.non_field_errors[0]);

        if (errorMessages.length > 0) toast.error(errorMessages[0]);
        else toast.error("Failed to add user");
      } else {
        toast.error(error.message || "Failed to add user");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[5000px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 py-4 border-b border-gray-200">
            Add User
          </DialogTitle>
        </DialogHeader>
        <form className="w-full p-8 flex flex-col" onSubmit={handleAddUser}>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name */}
                <div
                  className="grid grid-cols-3 items-center gap-3"
                  style={{ marginTop: "4px" }}
                >
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={userData.user_name}
                      required
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[A-Za-z\s]*$/.test(value)) {
                          setUserData({
                            ...userData,
                            user_name: value,
                          });
                          setErrors({ ...errors, user_name: "" });
                        } else {
                          setErrors({
                            ...errors,
                            user_name:
                              "Name should only contain alphabets and spaces",
                          });
                        }
                      }}
                    />
                    {errors.user_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.user_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Designation */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={userData.designation}
                    onChange={(e) =>
                      setUserData({ ...userData, designation: e.target.value })
                    }
                  >
                    <option value="">Select Designation</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Employee">Employee</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>

                {/* Email */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    required
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Gender */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={userData.gender}
                    required
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        gender: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Stream */}
                <div className="grid grid-cols-3 items-start gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Stream
                  </label>
                  <div className="col-span-2 space-y-2">
                    {streamOptions.map((stream) => (
                      <div key={stream}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!!userData.streams[stream]}
                            onChange={() => handleStreamChange(stream)}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {stream}
                          </span>
                        </label>
                        {userData.streams[stream] && (
                          <div className="ml-6 mt-2 space-y-1">
                            {subComponents.map((subComponent) => (
                              <label
                                key={subComponent}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={userData.streams[
                                    stream
                                  ]?.includes(subComponent)}
                                  onChange={() =>
                                    handleSubComponentChange(
                                      stream,
                                      subComponent,
                                    )
                                  }
                                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-600">
                                  {subComponent}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* DOB */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    DOB
                  </label>
                  <div className="col-span-2">
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={userData.dob}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            dob: "Future date is not allowed",
                          });
                        } else {
                          setUserData({
                            ...userData,
                            dob: e.target.value,
                          });
                          setErrors({ ...errors, dob: "" });
                        }
                      }}
                    />
                    {errors.dob && (
                      <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-7site00">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUserData({
                          ...userData,
                          user_image: file,
                        });
                      }
                    }}
                    required
                  />
                </div>

                {/* Username */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Enter username"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={userData.username}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[A-Za-z\s]*$/.test(value)) {
                          setUserData({
                            ...userData,
                            username: value,
                          });
                          setErrors({ ...errors, username: "" });
                        } else {
                          setErrors({
                            ...errors,
                            username:
                              "Username should only contain alphabets and spaces",
                          });
                        }
                      }}
                    />
                    {errors.username && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="col-span-2 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                      value={userData.password}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={userData.location}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        location: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select Location
                    </option>
                    {LocationList.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.location_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2 "
                    value={userData.department}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        department: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    {DepartmentList.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shift */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Shift
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={userData.shift}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        shift: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select Shift
                    </option>
                    {ShiftList.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.shift_number}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hired Date */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Hired Date
                  </label>
                  <div className="col-span-2">
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={userData.hired_date}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            hired_date: "Future date is not allowed",
                          });
                        } else {
                          setUserData({
                            ...userData,
                            hired_date: e.target.value,
                          });
                          setErrors({ ...errors, hired_date: "" });
                        }
                      }}
                    />
                    {errors.hired_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.hired_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-purple-600 to-blue-500 hover:-translate-y-0.5"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUser;
