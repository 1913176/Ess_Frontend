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

const AddHRManager = ({
  open,
  setOpen,
  fetchHrList,
  ShiftList,
  DepartmentList,
}) => {
  const [HRManagerData, setHRManagerData] = useState({
    hr_name: "",
    email: "",
    gender: "",
    dob: "",
    hr_image: null,
    username: "",
    password: "",
    department: "",
    shift: "",
    hired_date: "",
    streams: {},
    location: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    hr_name: "",
    username: "",
    dob: "",
    hired_date: "",
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
    "Process",
    "Onboarding",
    "Manager Management",
    "Employee Management",
    "Supervisor Management",
    "Leave Management",
    "Attendance",
    "Shift",
    "Offers",
    "Help Desk",
    "Tickets",
    "Manager Performance",
    "Employee Performance",
    "Manpower Planning",
    "Payroll",
    "Performance",
    "Recruitment",
    "Onboarding1",
  ];
  const subComponents = ["Admin", "Manager", "User", "Management"];

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    const today = new Date().toISOString().split("T")[0];

    if (!/^[A-Za-z\s]+$/.test(HRManagerData.hr_name)) {
      newErrors.hr_name = "Name should only contain alphabets and spaces";
      isValid = false;
    } else {
      newErrors.hr_name = "";
    }

    if (!/^[A-Za-z\s]+$/.test(HRManagerData.username)) {
      newErrors.username = "Username should only contain alphabets and spaces";
      isValid = false;
    } else {
      newErrors.username = "";
    }

    if (HRManagerData.dob > today) {
      newErrors.dob = "Future date is not allowed";
      isValid = false;
    } else {
      newErrors.dob = "";
    }

    if (HRManagerData.hired_date > today) {
      newErrors.hired_date = "Future date is not allowed";
      isValid = false;
    } else {
      newErrors.hired_date = "";
    }

    if (!HRManagerData.gender) {
      toast.error("Please select a gender");
      isValid = false;
    }

    if (!HRManagerData.department) {
      toast.error("Please select a department");
      isValid = false;
    }

    if (!HRManagerData.shift) {
      toast.error("Please select a shift");
      isValid = false;
    }

    if (!HRManagerData.location) {
      toast.error("Please select a location");
      isValid = false;
    }

    if (!HRManagerData.password || HRManagerData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      isValid = false;
    }

    if (Object.keys(HRManagerData.streams).length === 0) {
      toast.error("Please select at least one stream");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setHRManagerData({
      hr_name: "",
      email: "",
      gender: "",
      dob: "",
      hr_image: null,
      username: "",
      password: "",
      department: "",
      shift: "",
      hired_date: "",
      streams: {},
      location: "",
    });

    setErrors({
      hr_name: "",
      username: "",
      dob: "",
      hired_date: "",
      password: "",
    });
    setShowPassword(false);
  };

  const handleStreamChange = (stream) => {
    setHRManagerData((prev) => {
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
    setHRManagerData((prev) => {
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

  const HandleAddHr = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

    Object.entries(HRManagerData).forEach(([key, value]) => {
      if (key === "streams") {
        formData.append("streams", JSON.stringify(value));
      } else if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      await axios.post(`${apiBaseUrl}/admin/hrs/add/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("HR added successfully!");
      fetchHrList();
      setOpen(false);
    } catch (error) {
      console.error(error);
      const errData = error.response?.data;

      if (errData?.email) {
        toast.error(
          Array.isArray(errData.email) ? errData.email[0] : errData.email,
        );
      } else if (errData?.errors) {
        toast.error(
          Array.isArray(errData.errors) ? errData.errors[0] : errData.errors,
        );
      } else {
        const firstKey = Object.keys(errData || {})[0];
        const msg = errData?.[firstKey];
        toast.error(Array.isArray(msg) ? msg[0] : msg || "Failed to add HR");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[5000px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add HR Manager
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4 w-full p-4" onSubmit={HandleAddHr}>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={HRManagerData.hr_name}
                      required
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[A-Za-z\s]*$/.test(value)) {
                          setHRManagerData({
                            ...HRManagerData,
                            hr_name: value,
                          });
                          setErrors({ ...errors, hr_name: "" });
                        } else {
                          setErrors({
                            ...errors,
                            hr_name:
                              "Name should only contain alphabets and spaces",
                          });
                        }
                      }}
                    />
                    {errors.hr_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.hr_name}
                      </p>
                    )}
                  </div>
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
                    value={HRManagerData.email}
                    onChange={(e) =>
                      setHRManagerData({
                        ...HRManagerData,
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
                    value={HRManagerData.gender}
                    required
                    onChange={(e) =>
                      setHRManagerData({
                        ...HRManagerData,
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
                            checked={!!HRManagerData.streams[stream]}
                            onChange={() => handleStreamChange(stream)}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {stream}
                          </span>
                        </label>
                        {HRManagerData.streams[stream] && (
                          <div className="ml-6 mt-2 space-y-1">
                            {subComponents.map((subComponent) => (
                              <label
                                key={subComponent}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={HRManagerData.streams[
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
                      value={HRManagerData.dob}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            dob: "Future date is not allowed",
                          });
                        } else {
                          setHRManagerData({
                            ...HRManagerData,
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
                  <label className="text-sm font-medium text-gray-700">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setHRManagerData({
                          ...HRManagerData,
                          hr_image: file,
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
                      value={HRManagerData.username}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[A-Za-z\s]*$/.test(value)) {
                          setHRManagerData({
                            ...HRManagerData,
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
                      value={HRManagerData.password}
                      onChange={(e) =>
                        setHRManagerData({
                          ...HRManagerData,
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
                    value={HRManagerData.location}
                    onChange={(e) =>
                      setHRManagerData({
                        ...HRManagerData,
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={HRManagerData.department}
                    onChange={(e) =>
                      setHRManagerData({
                        ...HRManagerData,
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
                    value={HRManagerData.shift}
                    onChange={(e) =>
                      setHRManagerData({
                        ...HRManagerData,
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
                      value={HRManagerData.hired_date}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            hired_date: "Future date is not allowed",
                          });
                        } else {
                          setHRManagerData({
                            ...HRManagerData,
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

          <div className="flex justify-end gap-3 mt-6">
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

export default AddHRManager;
