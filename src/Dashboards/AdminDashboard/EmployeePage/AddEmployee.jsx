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

const AddEmployee = ({
  open,
  setOpen,
  fetchEmployeeList,
  ShiftList,
  DepartmentList,
}) => {
  const [EmployeeData, setEmployeeData] = useState({
    employee_name: "",
    email: "",
    gender: "",
    dob: "",
    employee_image: null,
    username: "",
    password: "",
    department: "",
    shift: "",
    hired_date: "",
    streams: {},
    location: "", // Added location field
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    employee_name: "",
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
        const response = await axios.get(`${apiBaseUrl}/admin/overall-location/`);
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
    "Account Management"
  ];
  const subComponents = ["Admin", "Manager", "User", "Management"];

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      employee_name: "",
      username: "",
      dob: "",
      hired_date: "",
      password: "",
    };
    const today = new Date().toISOString().split("T")[0];

    if (!/^[A-Za-z\s]+$/.test(EmployeeData.employee_name)) {
      newErrors.employee_name = "Name should only contain alphabets and spaces";
      isValid = false;
    }

    if (!/^[A-Za-z\s]+$/.test(EmployeeData.username)) {
      newErrors.username = "Username should only contain alphabets and spaces";
      isValid = false;
    }

    if (!EmployeeData.password || EmployeeData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    if (EmployeeData.dob && EmployeeData.dob > today) {
      newErrors.dob = "Future date is not allowed";
      isValid = false;
    }

    if (EmployeeData.hired_date && EmployeeData.hired_date > today) {
      newErrors.hired_date = "Future date is not allowed";
      isValid = false;
    }

    if (!EmployeeData.gender) {
      toast.error("Please select a gender");
      isValid = false;
    }

    if (!EmployeeData.department) {
      toast.error("Please select a department");
      isValid = false;
    }

    if (!EmployeeData.shift) {
      toast.error("Please select a shift");
      isValid = false;
    }

    if (Object.keys(EmployeeData.streams).length === 0) {
      toast.error("Please select at least one stream");
      isValid = false;
    }

    if (!EmployeeData.location) {
      toast.error("Please select a location");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setEmployeeData({
      employee_name: "",
      email: "",
      gender: "",
      dob: "",
      employee_image: null,
      username: "",
      password: "",
      department: "",
      shift: "",
      hired_date: "",
      streams: {},
      location: "", 
    });
    
    setErrors({
      employee_name: "",
      username: "",
      dob: "",
      hired_date: "",
      password: "",
    });
    setShowPassword(false);
  };

  const handleStreamChange = (stream) => {
    setEmployeeData((prev) => {
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
    setEmployeeData((prev) => {
      const newStreams = { ...prev.streams };
      const currentSubComponents = newStreams[stream] || [];
      if (currentSubComponents.includes(subComponent)) {
        newStreams[stream] = currentSubComponents.filter((sc) => sc !== subComponent);
      } else {
        newStreams[stream] = [...currentSubComponents, subComponent];
      }
      return { ...prev, streams: newStreams };
    });
  };
const HandleAddEmployee = async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  const formData = new FormData();

  Object.entries(EmployeeData).forEach(([key, value]) => {
    if (key === "streams") {
      formData.append("streams", JSON.stringify(value)); 
    } else if (value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  try {
    const response = await axios.post(`${apiBaseUrl}/admin/employees/add/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      toast.success("Employee added successfully!");
      resetForm();
      if (typeof fetchEmployeeList === "function") {
        fetchEmployeeList();
      } else {
        console.warn("fetchEmployeeList is not a function");
      }
      setOpen(false);
    } else {
      throw new Error("Unexpected response status");
    }
  } catch (error) {
    console.error("Error adding employee:", error);
    const errData = error.response?.data;

    if (errData) {
      // Check for specific error fields and display the first error message
      const errorMessages = [];
      if (errData.username) errorMessages.push(Array.isArray(errData.username) ? errData.username[0] : errData.username);
      if (errData.email) errorMessages.push(Array.isArray(errData.email) ? errData.email[0] : errData.email);
      if (errData.password || errData.plain_password) errorMessages.push(Array.isArray(errData.password || errData.plain_password) ? (errData.password || errData.plain_password)[0] : (errData.password || errData.plain_password));
      if (errData.streams) errorMessages.push(Array.isArray(errData.streams) ? errData.streams[0] : errData.streams);
      if (errData.location) errorMessages.push(Array.isArray(errData.location) ? errData.location[0] : errData.location);
      if (errData.message && !errData.message.includes("successfully")) errorMessages.push(errData.message);
      if (errData.non_field_errors) errorMessages.push(Array.isArray(errData.non_field_errors) ? errData.non_field_errors[0] : errData.non_field_errors);

      if (errorMessages.length > 0) {
        toast.error(errorMessages[0]); // Display the first specific error
      } else {
        toast.error("Failed to add employee"); // Generic fallback
      }
    } else {
      toast.error(error.message || "Failed to add employee"); // Handle network errors
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
            Add Employee
          </DialogTitle>
        </DialogHeader>
        <form className="w-full p-8 flex flex-col" onSubmit={HandleAddEmployee}>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name */}
             <div className="grid grid-cols-3 items-center gap-3" style={{ marginTop: '4px' }}>
  <label className="text-sm font-medium text-gray-700">Name</label>
  <div className="col-span-2">
    <input
      type="text"
      placeholder="Enter name"
      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      value={EmployeeData.employee_name}
      required
      onChange={(e) => {
        const value = e.target.value;
        if (/^[A-Za-z\s]*$/.test(value)) {
          setEmployeeData({
            ...EmployeeData,
            employee_name: value,
          });
          setErrors({ ...errors, employee_name: "" });
        } else {
          setErrors({
            ...errors,
            employee_name: "Name should only contain alphabets and spaces",
          });
        }
      }}
    />
    {errors.employee_name && (
      <p className="text-red-500 text-xs mt-1">{errors.employee_name}</p>
    )}
  </div>
</div>

                {/* Email */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    inputMode="email"
                    required
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={EmployeeData.email}
                    onChange={(e) =>
                      setEmployeeData({
                        ...EmployeeData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Gender */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={EmployeeData.gender}
                    required
                    onChange={(e) =>
                      setEmployeeData({
                        ...EmployeeData,
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
                  <label className="text-sm font-medium text-gray-700">Stream</label>
                  <div className="col-span-2 space-y-2">
                    {streamOptions.map((stream) => (
                      <div key={stream}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!!EmployeeData.streams[stream]}
                            onChange={() => handleStreamChange(stream)}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{stream}</span>
                        </label>
                        {EmployeeData.streams[stream] && (
                          <div className="ml-6 mt-2 space-y-1">
                            {subComponents.map((subComponent) => (
                              <label key={subComponent} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={EmployeeData.streams[stream]?.includes(subComponent)}
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

                {/* DOB */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">DOB</label>
                  <div className="col-span-2">
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={EmployeeData.dob}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            dob: "Future date is not allowed",
                          });
                        } else {
                          setEmployeeData({
                            ...EmployeeData,
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
                  <label className="text-sm font-medium text-gray-7site00">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEmployeeData({
                          ...EmployeeData,
                          employee_image: file,
                        });
                      }
                    }}
                    required
                  />
                </div>

                {/* Username */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Enter username"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={EmployeeData.username}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[A-Za-z\s]*$/.test(value)) {
                          setEmployeeData({
                            ...EmployeeData,
                            username: value,
                          });
                          setErrors({ ...errors, username: "" });
                        } else {
                          setErrors({
                            ...errors,
                            username: "Username should only contain alphabets and spaces",
                          });
                        }
                      }}
                    />
                    {errors.username && (
                      <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="col-span-2 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                      value={EmployeeData.password}
                      onChange={(e) =>
                        setEmployeeData({
                          ...EmployeeData,
                          password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={EmployeeData.location}
                    onChange={(e) =>
                      setEmployeeData({ ...EmployeeData, location: e.target.value })
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
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2 "                    value={EmployeeData.department}
                    onChange={(e) =>
                      setEmployeeData({
                        ...EmployeeData,
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
                  <label className="text-sm font-medium text-gray-700">Shift</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={EmployeeData.shift}
                    onChange={(e) =>
                      setEmployeeData({
                        ...EmployeeData,
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
                  <label className="text-sm font-medium text-gray-700">Hired Date</label>
                  <div className="col-span-2">
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={EmployeeData.hired_date}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            hired_date: "Future date is not allowed",
                          });
                        } else {
                          setEmployeeData({
                            ...EmployeeData,
                            hired_date: e.target.value,
                          });
                          setErrors({ ...errors, hired_date: "" });
                        }
                      }}
                    />
                    {errors.hired_date && (
                      <p className="text-red-500 text-xs mt-1">{errors.hired_date}</p>
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

export default AddEmployee;