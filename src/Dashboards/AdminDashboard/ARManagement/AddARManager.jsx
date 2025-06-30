import axios from "axios";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const apiBaseUrl = process.env.VITE_BASE_API;

const AddARManager = ({
  open,
  setOpen,
  fetchArList,
  ShiftList,
  DepartmentList,
}) => {
  const [ManagerData, setManagerData] = useState({
    ar_name: "",
    email: "",
    gender: "",
    dob: "",
    ar_image: null,
    username: "",
    password: "",
    department: "",
    shift: "",
    hired_date: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    ar_name: "",
    username: "",
    dob: "",
    hired_date: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ar_name: "", username: "", dob: "", hired_date: "" };
    const today = new Date().toISOString().split("T")[0];

    if (!/^[A-Za-z\s]+$/.test(ManagerData.ar_name)) {
      newErrors.ar_name = "Name should only contain alphabets and spaces";
      isValid = false;
    }

    if (!/^[A-Za-z\s]+$/.test(ManagerData.username)) {
      newErrors.username = "Username should only contain alphabets and spaces";
      isValid = false;
    }

    if (!ManagerData.password || ManagerData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      isValid = false;
    }

    if (ManagerData.dob && ManagerData.dob > today) {
      newErrors.dob = "Future date is not allowed";
      isValid = false;
    }

    if (ManagerData.hired_date && ManagerData.hired_date > today) {
      newErrors.hired_date = "Future date is not allowed";
      isValid = false;
    }

    if (!ManagerData.gender) {
      toast.error("Please select a gender");
      isValid = false;
    }

    if (!ManagerData.department) {
      toast.error("Please select a department");
      isValid = false;
    }

    if (!ManagerData.shift) {
      toast.error("Please select a shift");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setManagerData({
      ar_name: "",
      email: "",
      gender: "",
      dob: "",
      ar_image: null,
      username: "",
      password: "",
      department: "",
      shift: "",
      hired_date: "",
    });
    setErrors({ ar_name: "", username: "", dob: "", hired_date: "" });
    setShowPassword(false);
  };

  const HandleAddHr = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(ManagerData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      const response = await axios.post(`${apiBaseUrl}/admin/ars/add/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("AR Manager added successfully!");
        resetForm();
        fetchArList();
        setOpen(false);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error adding AR Manager:", error);
      const errData = error.response?.data;

      if (errData?.email) {
        toast.error(Array.isArray(errData.email) ? errData.email[0] : errData.email);
      } else if (errData?.errors) {
        toast.error(Array.isArray(errData.errors) ? errData.errors[0] : errData.errors);
      } else if (errData?.message && !errData.message.includes("successfully")) {
        toast.error(errData.message);
      } else {
        toast.error(error.message || "Failed to add AR Manager");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Add AR Manager</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 w-full p-4" onSubmit={HandleAddHr}>
          <div className="grid gap-4">
            {/* Name */}
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={ManagerData.ar_name}
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      setManagerData({
                        ...ManagerData,
                        ar_name: value,
                      });
                      setErrors({ ...errors, ar_name: "" });
                    } else {
                      setErrors({
                        ...errors,
                        ar_name: "Name should only contain alphabets and spaces",
                      });
                    }
                  }}
                />
                {errors.ar_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.ar_name}</p>
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
                value={ManagerData.email}
                onChange={(e) =>
                  setManagerData({
                    ...ManagerData,
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
                value={ManagerData.gender}
                required
                onChange={(e) =>
                  setManagerData({
                    ...ManagerData,
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

            {/* DOB */}
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">DOB</label>
              <div className="col-span-2">
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={ManagerData.dob}
                  onChange={(e) => {
                    const today = new Date().toISOString().split("T")[0];
                    if (e.target.value > today) {
                      setErrors({
                        ...errors,
                        dob: "Future date is not allowed",
                      });
                    } else {
                      setManagerData({
                        ...ManagerData,
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

            {/* Profile Image */}
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setManagerData({
                      ...ManagerData,
                      ar_image: file,
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus.segments[0].content
                  focus:ring-2 focus:ring-purple-500"
                  value={ManagerData.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      setManagerData({
                        ...ManagerData,
                        username: value,
                      });
                      setErrors({ ...errors, username: "" });
                    } else {
                      setErrors({
                        ...errors,
                        username: "Name should only contain alphabets and spaces",
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
                  value={ManagerData.password}
                  onChange={(e) =>
                    setManagerData({
                      ...ManagerData,
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
              </div>
            </div>

            {/* Department */}
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={ManagerData.department}
                onChange={(e) =>
                  setManagerData({
                    ...ManagerData,
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
                value={ManagerData.shift}
                onChange={(e) =>
                  setManagerData({
                    ...ManagerData,
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
                  value={ManagerData.hired_date}
                  onChange={(e) => {
                    const today = new Date().toISOString().split("T")[0];
                    if (e.target.value > today) {
                      setErrors({
                        ...errors,
                        hired_date: "Future date is not allowed",
                      });
                    } else {
                      setManagerData({
                        ...ManagerData,
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

export default AddARManager;