import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateEmployee = ({
  open,
  setOpen,
  employeeId,
  ShiftList,
  DepartmentList,
  fetchEmployeeList,
}) => {
  const [EmployeeData, setEmployeeData] = useState({
    employee_name: "",
    email: "",
    gender: "",
    dob: "",
    employee_image: null,
    employee_id: "",
    username: "",
    plain_password: "",
    department: "",
    shift: "",
    hired_date: "",
    streams: {},
    location: "", // Location field included
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [LocationList, setLocationList] = useState([]); // State for location list

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

  // Fetch locations when component mounts
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

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) return;

      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/api/employees/get/${employeeId}/`,
        );
        setEmployeeData({
          employee_name: data.employee_name,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          employee_image: null,
          employee_id: data.employee_id,
          username: data.username,
          plain_password: data.plain_password || "",
          department: data.department,
          shift: data.shift,
          hired_date: data.hired_date,
          streams: data.streams || {}, // Assuming API returns streams as an object
          location: data.location || "", // Initialize location
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load employee data.");
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  const validateForm = () => {
    const newErrors = {};
    if (!/^[A-Za-z\s]*$/.test(EmployeeData.employee_name))
      newErrors.employee_name = "Only letters and spaces allowed in name";

    if (!/^[A-Za-z\s]*$/.test(EmployeeData.username))
      newErrors.username = "Only letters and spaces allowed in username";

    const today = new Date().toISOString().split("T")[0];
    if (EmployeeData.dob > today)
      newErrors.dob = "Date of Birth cannot be a future date";

    if (EmployeeData.hired_date > today)
      newErrors.hired_date = "Hired Date cannot be a future date";

    if (EmployeeData.plain_password && EmployeeData.plain_password.length < 8)
      newErrors.plain_password = "Password must be at least 8 characters";

    if (Object.keys(EmployeeData.streams).length === 0)
      newErrors.streams = "Please select at least one stream";

    if (!EmployeeData.location) newErrors.location = "Please select a location";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        newStreams[stream] = currentSubComponents.filter(
          (sc) => sc !== subComponent,
        );
      } else {
        newStreams[stream] = [...currentSubComponents, subComponent];
      }
      return { ...prev, streams: newStreams };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      if (errors.streams) toast.error(errors.streams);
      if (errors.location) toast.error(errors.location);
      return;
    }

    const formData = new FormData();
    Object.entries(EmployeeData).forEach(([key, value]) => {
      if (key === "employee_image" && !value) return;
      if (key === "employee_id") return;
      if (key === "streams") {
        formData.append("streams", JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    try {
      const res = await axios.put(
        `${apiBaseUrl}/admin/employees/${employeeId}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("Employee updated successfully");
      fetchEmployeeList();
      setOpen(false);
    } catch (error) {
      const err = error?.response?.data;
      if (err?.username) {
        setErrors({
          username: Array.isArray(err.username)
            ? err.username[0]
            : err.username,
        });
      } else if (err?.email) {
        setErrors({
          email: Array.isArray(err.email) ? err.email[0] : err.email,
        });
      } else if (err?.plain_password) {
        setErrors({
          plain_password: Array.isArray(err.plain_password)
            ? err.plain_password[0]
            : err.plain_password,
        });
      } else if (err?.streams) {
        setErrors({
          streams: Array.isArray(err.streams) ? err.streams[0] : err.streams,
        });
      } else if (err?.location) {
        setErrors({
          location: Array.isArray(err.location)
            ? err.location[0]
            : err.location,
        });
      } else {
        toast.error("Failed to update employee.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[5000px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 py-4 border-b border-gray-200">
            Update Employee
          </DialogTitle>
        </DialogHeader>
        <form className="w-full p-8 flex flex-col" onSubmit={handleSubmit}>
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
                    <div style={{ marginTop: "4px" }}>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={EmployeeData.employee_name}
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
                              employee_name:
                                "Only letters and spaces allowed in name",
                            });
                          }
                        }}
                      />
                    </div>
                    {errors.employee_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.employee_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="col-span-2">
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={EmployeeData.email}
                      onChange={(e) =>
                        setEmployeeData({
                          ...EmployeeData,
                          email: e.target.value,
                        })
                      }
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Gender */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={EmployeeData.gender}
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
                  <label className="text-sm font-medium text-gray-700">
                    Stream
                  </label>
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
                          <span className="text-sm text-gray-700">
                            {stream}
                          </span>
                        </label>
                        {EmployeeData.streams[stream] && (
                          <div className="ml-6 mt-2 space-y-1">
                            {subComponents.map((subComponent) => (
                              <label
                                key={subComponent}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={EmployeeData.streams[
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
                    {errors.streams && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.streams}
                      </p>
                    )}
                  </div>
                </div>

                {/* DOB */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <div className="col-span-2">
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={EmployeeData.dob}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            dob: "Date of Birth cannot be a future date",
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
                  <label className="text-sm font-medium text-gray-700">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    onChange={(e) =>
                      setEmployeeData({
                        ...EmployeeData,
                        employee_image: e.target.files[0],
                      })
                    }
                  />
                </div>

                {/* Employee ID */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    User ID
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm bg-gray-100 col-span-2"
                    value={EmployeeData.employee_id}
                    disabled
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={EmployeeData.username}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[A-Za-z\s]*$/.test(value)) {
                          setEmployeeData({ ...EmployeeData, username: value });
                          setErrors({ ...errors, username: "" });
                        } else {
                          setErrors({
                            ...errors,
                            username:
                              "Only letters and spaces allowed in username",
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                      value={EmployeeData.plain_password}
                      onChange={(e) =>
                        setEmployeeData({
                          ...EmployeeData,
                          plain_password: e.target.value,
                        })
                      }
                      placeholder="Enter new password (optional)"
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
                    {errors.plain_password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.plain_password}
                      </p>
                    )}
                  </div>
                </div>

                {/* Department */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={EmployeeData.department}
                    onChange={(e) =>
                      setEmployeeData({
                        ...EmployeeData,
                        department: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Department</option>
                    {DepartmentList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={EmployeeData.location}
                    onChange={(e) =>
                      setEmployeeData({
                        ...EmployeeData,
                        location: e.target.value,
                      })
                    }
                    required
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
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Shift */}
                <div className="grid grid-cols-3 items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Shift
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                    value={EmployeeData.shift}
                    onChange={(e) =>
                      setEmployeeData({
                        ...EmployeeData,
                        shift: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Shift</option>
                    {ShiftList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shift_number}
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
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={EmployeeData.hired_date}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            hired_date: "Hired Date cannot be a future date",
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
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 bg-gradient-to-br from-purple-600 to-blue-500 hover:-translate-y-0.5"
            >
              Update
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateEmployee;
