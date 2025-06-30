import axios from "axios";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"
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
  });

  const [errors, setErrors] = useState({
    supervisor_name: "",
    username: "",
    dob: "",
    hired_date: "",
  });

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

    setErrors(newErrors);
    return isValid;
  };

  const HandleAddSupervisor = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    Object.entries(SupervisorData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      const { data } = await axios.post(
        `${apiBaseUrl}/admin/supervisor/add/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchSupervisorList();
      setOpen(false);
      toast.success("Supervisor Added Successfully");
    } catch (error) {
      console.error(error);

      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.email) {
          toast.error(
            Array.isArray(errorData.email) ? errorData.email[0] : errorData.email
          );
        } else if (errorData.password) {
          toast.error(
            Array.isArray(errorData.password)
              ? errorData.password[0]
              : errorData.password
          );
        } else if (errorData.errors) {
          toast.error(
            Array.isArray(errorData.errors) ? errorData.errors[0] : errorData.errors
          );
        } else {
          const firstKey = Object.keys(errorData)[0];
          const message = errorData[firstKey];
          toast.error(
            Array.isArray(message) ? message[0] : message || "Something went wrong. Please try again."
          );
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add SUPERVISOR</DialogTitle>
        </DialogHeader>
        <form className="space-y-2 w-full grid gap-6" onSubmit={HandleAddSupervisor}>
          <div className="grid gap-2 w-full">
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm font-medium">Name</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="w-full px-3 py-2 border rounded-md"
                    value={SupervisorData.supervisor_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        setSupervisorData({ ...SupervisorData, supervisor_name: value });
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
                    <p className="text-red-500 text-xs">{errors.supervisor_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  value={SupervisorData.email}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, email: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Gender</label>
                <select
                  required
                  onInvalid={(e) =>
                    e.target.setCustomValidity("Please select a gender")
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  value={SupervisorData.gender}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm font-medium">DOB</label>
                <div className="col-span-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md"
                    value={SupervisorData.dob}
                    onChange={(e) => {
                      const today = new Date().toISOString().split("T")[0];
                      if (e.target.value > today) {
                        setErrors({
                          ...errors,
                          dob: "Future date should not be accepted",
                        });
                      } else {
                        setSupervisorData({ ...SupervisorData, dob: e.target.value });
                        setErrors({ ...errors, dob: "" });
                      }
                    }}
                    required
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs">{errors.dob}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Profile image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSupervisorData({ ...SupervisorData, supervisor_image: file });
                    }
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-sm font-medium">Username</label>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full px-3 py-2 border rounded-md"
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
                  <p className="text-red-500 text-xs">{errors.username}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-2 w-full">
      <label className="text-sm font-medium">User password</label>
      <div className="col-span-2 relative w-full">
        <input
          type={showPassword ? "text" : "password"} // Dynamically switch between password and text
          placeholder="Enter User password"
          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          value={SupervisorData.password}
          onChange={(e) =>
            setSupervisorData({ ...SupervisorData, password: e.target.value })
          }
          required
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
          onClick={() => setShowPassword(!showPassword)} // Toggle visibility
        >
          {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </div>
    </div>

            <div className="grid grid-cols-3 items-center gap-2 w-full">
              <label className="text-sm font-medium">Department</label>
              <select
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please select a department")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                value={SupervisorData.department}
                onChange={(e) =>
                  setSupervisorData({ ...SupervisorData, department: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Department
                </option>
                {DepartmentList.map((department) => (
                  <option key={department.department_id} value={department.id}>
                    {department.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 items-center gap-2 w-full">
              <label className="text-sm font-medium">Shift</label>
              <select
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please select a shift")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                value={SupervisorData.shift}
                onChange={(e) =>
                  setSupervisorData({ ...SupervisorData, shift: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Shift
                </option>
                {ShiftList.map((shift) => (
                  <option key={shift.shift_number} value={shift.id}>
                    {shift.shift_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-sm font-medium">Hired Date</label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-md"
                  value={SupervisorData.hired_date}
                  onChange={(e) => {
                    const today = new Date().toISOString().split("T")[0];
                    if (e.target.value > today) {
                      setErrors({
                        ...errors,
                        hired_date: "Future date should not be accepted",
                      });
                    } else {
                      setSupervisorData({ ...SupervisorData, hired_date: e.target.value });
                      setErrors({ ...errors, hired_date: "" });
                    }
                  }}
                  required
                />
                {errors.hired_date && (
                  <p className="text-red-500 text-xs">{errors.hired_date}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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