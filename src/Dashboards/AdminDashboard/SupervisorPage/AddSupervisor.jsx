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

const AddSupervisor = ({
  open,
  setOpen,
  fetchSupervisorList,
  ShiftList,
  DepartmentList,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [SupervisorData, setSupervisorData] = useState({
    supervisor_name: "",
    email: "",
    gender: "",
    dob: "",
    supervisor_image: null,
    username: "",
    password: "",
    department: "",
    shift: "",
    hired_date: "",
    streams: {},
    location: "",
  });

  const [errors, setErrors] = useState({
    supervisor_name: "",
    username: "",
    dob: "",
    hired_date: "",
  });
  const streamOptions = [
    "Attendance",
    "Leave Management",
    "Help Desk",
    "Todo",
    "Profile",
    "View Requests",
    "News",
  ];
  const subComponents = ["Admin", "Manager", "User", "Management"];

  const [LocationList, setLocationList] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/admin/overall-location/`,
        );
        setLocationList(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Failed to load locations");
      }
    };
    fetchLocations();
  }, []);

  const validateForm = () => {
    let isValid = true;
    let newErrors = {
      supervisor_name: "",
      username: "",
      dob: "",
      hired_date: "",
    };
    const today = new Date().toISOString().split("T")[0];

    if (!/^[A-Za-z\s]+$/.test(SupervisorData.supervisor_name)) {
      newErrors.supervisor_name = "Name should accept only alphabets";
      isValid = false;
    }

    if (!/^[A-Za-z\s]+$/.test(SupervisorData.username)) {
      newErrors.username = "Username should accept only alphabets";
      isValid = false;
    }

    if (SupervisorData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      isValid = false;
    }

    if (SupervisorData.dob && SupervisorData.dob > today) {
      newErrors.dob = "Future date should not be accepted";
      isValid = false;
    }

    if (SupervisorData.hired_date && SupervisorData.hired_date > today) {
      newErrors.hired_date = "Future date should not be accepted";
      isValid = false;
    }

    if (Object.keys(SupervisorData.streams).length === 0) {
          toast.error("Please select at least one stream");
          isValid = false;
        }

    if (!SupervisorData.location) {
      toast.error("Please select a location");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

   const handleStreamChange = (stream) => {
    setSupervisorData((prevData) => {
      const newStreams = { ...prevData.streams };
      if (newStreams[stream]) {
        // Uncheck stream
        delete newStreams[stream];
      } else {
        // Check stream with empty subcomponents
        newStreams[stream] = [];
      }
      return { ...prevData, streams: newStreams };
    });
  };

  const handleSubComponentChange = (stream, subComponent) => {
    setSupervisorData((prevData) => {
      const existing = prevData.streams[stream] || [];
      const isSelected = existing.includes(subComponent);
      const updatedSub = isSelected
        ? existing.filter((item) => item !== subComponent)
        : [...existing, subComponent];

      return {
        ...prevData,
        streams: {
          ...prevData.streams,
          [stream]: updatedSub,
        },
      };
    });
  };


  const HandleAddSupervisor = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
     Object.entries(SupervisorData).forEach(([key, value]) => {
    if (key === "streams") {
      formData.append("streams", JSON.stringify(value)); 
    } else if (value !== null && value !== "") {
      formData.append(key, value);
    }
  });

    try {
      await axios.post(`${apiBaseUrl}/admin/supervisor/add/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchSupervisorList();
      setOpen(false);
      toast.success("Supervisor Added Successfully");
    } catch (error) {
      console.error(error);

      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.email) {
          toast.error(
            Array.isArray(errorData.email)
              ? errorData.email[0]
              : errorData.email,
          );
        } else if (errorData.password) {
          toast.error(
            Array.isArray(errorData.password)
              ? errorData.password[0]
              : errorData.password,
          );
        } else if (errorData.errors) {
          toast.error(
            Array.isArray(errorData.errors)
              ? errorData.errors[0]
              : errorData.errors,
          );
        } else {
          const firstKey = Object.keys(errorData)[0];
          const message = errorData[firstKey];
          toast.error(
            Array.isArray(message)
              ? message[0]
              : message || "Something went wrong. Please try again.",
          );
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add Supervisor
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4 w-full p-4" onSubmit={HandleAddSupervisor}>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={SupervisorData.supervisor_name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      setSupervisorData({
                        ...SupervisorData,
                        supervisor_name: value,
                      });
                      setErrors({ ...errors, supervisor_name: "" });
                    } else {
                      setErrors({
                        ...errors,
                        supervisor_name: "Name should accept only alphabets",
                      });
                    }
                  }}
                  required
                />
                {errors.supervisor_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.supervisor_name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter Email Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={SupervisorData.email}
                onChange={(e) =>
                  setSupervisorData({
                    ...SupervisorData,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please select a gender")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={SupervisorData.gender}
                onChange={(e) =>
                  setSupervisorData({
                    ...SupervisorData,
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
              <label className="text-sm font-medium text-gray-700 mt-1">
                Stream
              </label>
              <div className="col-span-2 space-y-2">
                {streamOptions.map((stream) => (
                  <div key={stream}>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!!SupervisorData.streams[stream]}
                        onChange={() => handleStreamChange(stream)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{stream}</span>
                    </label>

                    {/* Subcomponents */}
                    {SupervisorData.streams[stream] && (
                      <div className="ml-6 mt-2 space-y-1">
                        {subComponents.map((subComponent) => (
                          <label key={subComponent} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={SupervisorData.streams[stream].includes(subComponent)}
                              onChange={() => handleSubComponentChange(stream, subComponent)}
                              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-600">{subComponent}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">DOB</label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={SupervisorData.dob}
                  onChange={(e) => {
                    const today = new Date().toISOString().split("T")[0];
                    if (e.target.value > today) {
                      setErrors({
                        ...errors,
                        dob: "Future date should not be accepted",
                      });
                    } else {
                      setSupervisorData({
                        ...SupervisorData,
                        dob: e.target.value,
                      });
                      setErrors({ ...errors, dob: "" });
                    }
                  }}
                  required
                />
                {errors.dob && (
                  <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Profile image
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSupervisorData({
                      ...SupervisorData,
                      supervisor_image: file,
                    });
                  }
                }}
                required
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={SupervisorData.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      setSupervisorData({ ...SupervisorData, username: value });
                      setErrors({ ...errors, username: "" });
                    } else {
                      setErrors({
                        ...errors,
                        username: "Username should accept only alphabets",
                      });
                    }
                  }}
                  required
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                User password
              </label>
              <div className="col-span-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter User password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                  value={SupervisorData.password}
                  onChange={(e) =>
                    setSupervisorData({
                      ...SupervisorData,
                      password: e.target.value,
                    })
                  }
                  required
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

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Location
              </label>
              <select
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please select a location")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={SupervisorData.location}
                onChange={(e) =>
                  setSupervisorData({
                    ...SupervisorData,
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

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please select a department")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={SupervisorData.department}
                onChange={(e) =>
                  setSupervisorData({
                    ...SupervisorData,
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

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Shift</label>
              <select
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please select a shift")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={SupervisorData.shift}
                onChange={(e) =>
                  setSupervisorData({
                    ...SupervisorData,
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

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Hired Date
              </label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={SupervisorData.hired_date}
                  onChange={(e) => {
                    const today = new Date().toISOString().split("T")[0];
                    if (e.target.value > today) {
                      setErrors({
                        ...errors,
                        hired_date: "Future date should not be accepted",
                      });
                    } else {
                      setSupervisorData({
                        ...SupervisorData,
                        hired_date: e.target.value,
                      });
                      setErrors({ ...errors, hired_date: "" });
                    }
                  }}
                  required
                />
                {errors.hired_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.hired_date}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-md hover:shadow-lg transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 bg-gradient-to-br from-purple-600 to-blue-500 hover:-translate-y-0.5"
            >
              Submit
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupervisor;
