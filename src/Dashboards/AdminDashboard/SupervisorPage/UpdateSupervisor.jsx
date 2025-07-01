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

const UpdateSupervisor = ({
  open,
  setOpen,
  supervisorId,
  ShiftList,
  DepartmentList,
  LocationList,
  fetchSupervisorList,
}) => {
  const [SupervisorData, setSupervisorData] = useState({
    supervisor_name: "",
    email: "",
    gender: "",
    dob: "",
    supervisor_image: null,
    supervisor_id: "",
    username: "",
    plain_password: "",
    department: "",
    shift: "",
    hired_date: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSupervisorData = async () => {
      if (!supervisorId) return;

      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/api/supervisor/get/${supervisorId}/`
        );
        setSupervisorData({
          supervisor_name: data.supervisor_name,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          supervisor_image: null,
          supervisor_id: data.supervisor_id,
          username: data.username,
          plain_password: data.plain_password || "",
          department: data.department,
          shift: data.shift,
          hired_date: data.hired_date,
          location: data.location || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load supervisor data.");
      }
    };

    fetchSupervisorData();
  }, [supervisorId]);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!/^[A-Za-z\s]*$/.test(SupervisorData.supervisor_name)) {
      newErrors.supervisor_name = "Only letters allowed in name";
      isValid = false;
    }

    if (!/^[A-Za-z\s]*$/.test(SupervisorData.username)) {
      newErrors.username = "Only letters allowed in username";
      isValid = false;
    }

    const today = new Date().toISOString().split("T")[0];
    if (SupervisorData.dob > today) {
      newErrors.dob = "Date of Birth cannot be a future date";
      isValid = false;
    }

    if (SupervisorData.hired_date > today) {
      newErrors.hired_date = "Hired Date cannot be a future date";
      isValid = false;
    }

    if (!SupervisorData.plain_password) {
      newErrors.plain_password = "Password is required";
      isValid = false;
    } else if (SupervisorData.plain_password.length < 8) {
      newErrors.plain_password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!SupervisorData.location) {
      newErrors.location = "Please select a location";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(SupervisorData).forEach(([key, value]) => {
      if (key === "supervisor_image" && !value) return;
      if (key === "supervisor_id") return;
      formData.append(key, value);
    });

    try {
      const res = await axios.put(
        `${apiBaseUrl}/admin/supervisor/${supervisorId}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Supervisor updated successfully");
      fetchSupervisorList();
      setOpen(false);
    } catch (error) {
      const err = error?.response?.data;
      if (err?.username) {
        setErrors({ username: err.username });
      } else if (err?.email) {
        setErrors({ email: err.email });
      } else if (err?.plain_password) {
        setErrors({ plain_password: err.plain_password });
      } else {
        toast.error("Failed to update supervisor.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Update Supervisor</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 w-full p-4" onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={SupervisorData.supervisor_name}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, supervisor_name: e.target.value })
                  }
                />
                {errors.supervisor_name && <p className="text-red-500 text-xs mt-1">{errors.supervisor_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="col-span-2">
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={SupervisorData.email}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, email: e.target.value })
                  }
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={SupervisorData.gender}
                onChange={(e) =>
                  setSupervisorData({ ...SupervisorData, gender: e.target.value })
                }
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={SupervisorData.dob}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, dob: e.target.value })
                  }
                />
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Profile Image</label>
              <input
                type="file"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                onChange={(e) =>
                  setSupervisorData({
                    ...SupervisorData,
                    supervisor_image: e.target.files[0],
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={SupervisorData.department}
                onChange={(e) =>
                  setSupervisorData({ ...SupervisorData, department: e.target.value })
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

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm bg-gray-100 col-span-2"
                value={SupervisorData.supervisor_id}
                disabled
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="col-span-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                  value={SupervisorData.plain_password}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, plain_password: e.target.value })
                  }
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                {errors.plain_password && <p className="text-red-500 text-xs mt-1">{errors.plain_password}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={SupervisorData.location}
                onChange={(e) =>
                  setSupervisorData({ ...SupervisorData, location: e.target.value })
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
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={SupervisorData.username}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, username: e.target.value })
                  }
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Hired Date</label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={SupervisorData.hired_date}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, hired_date: e.target.value })
                  }
                />
                {errors.hired_date && <p className="text-red-500 text-xs mt-1">{errors.hired_date}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Shift</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                value={SupervisorData.shift}
                onChange={(e) =>
                  setSupervisorData({ ...SupervisorData, shift: e.target.value })
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
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => setOpen(false)}
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
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSupervisor;