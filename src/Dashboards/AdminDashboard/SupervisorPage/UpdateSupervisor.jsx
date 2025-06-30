import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react"; // For show/hide icons

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateSupervisor = ({
  open,
  setOpen,
  supervisorId,
  ShiftList,
  DepartmentList,
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
    plain_password: "", // Use plain_password
    department: "",
    shift: "",
    hired_date: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility

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
          plain_password: data.plain_password || "", // Pre-fill with plain_password
          department: data.department,
          shift: data.shift,
          hired_date: data.hired_date,
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
    if (!/^[A-Za-z\s]*$/.test(SupervisorData.supervisor_name))
      newErrors.supervisor_name = "Only letters allowed in name";

    if (!/^[A-Za-z\s]*$/.test(SupervisorData.username))
      newErrors.username = "Only letters allowed in username";

    const today = new Date().toISOString().split("T")[0];
    if (SupervisorData.dob > today)
      newErrors.dob = "Date of Birth cannot be a future date";

    if (SupervisorData.hired_date > today)
      newErrors.hired_date = "Hired Date cannot be a future date";

    if (SupervisorData.plain_password && SupervisorData.plain_password.length < 8)
      newErrors.plain_password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Supervisor</DialogTitle>
        </DialogHeader>
        <form className="space-y-2" onSubmit={handleSubmit}>
          {/* PERSONAL DETAILS */}
          <div className="grid gap-2">
            {/* Name */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Name</label>
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={SupervisorData.supervisor_name}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, supervisor_name: e.target.value })
                  }
                />
                {errors.supervisor_name && <p className="text-red-500 text-xs">{errors.supervisor_name}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-3 gap-2 items-start">
              <label>Email</label>
              <div className="col-span-2">
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded"
                  value={SupervisorData.email}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, email: e.target.value })
                  }
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Gender</label>
              <select
                className="col-span-2 border px-3 py-2 rounded"
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

            {/* DOB */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Date of Birth</label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={SupervisorData.dob}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, dob: e.target.value })
                  }
                />
                {errors.dob && <p className="text-red-500 text-xs">{errors.dob}</p>}
              </div>
            </div>

            {/* Profile image */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Profile Image</label>
              <input
                type="file"
                className="col-span-2 border px-3 py-2 rounded"
                onChange={(e) =>
                  setSupervisorData({
                    ...SupervisorData,
                    supervisor_image: e.target.files[0],
                  })
                }
              />
            </div>
          </div>

          {/* WORK DETAILS */}
          <div className="grid gap-2">
            {/* Department */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Department</label>
              <select
                className="col-span-2 border px-3 py-2 rounded"
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

            {/* Supervisor ID (read-only) */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>User ID</label>
              <input
                className="col-span-2 border px-3 py-2 rounded bg-gray-100"
                value={SupervisorData.supervisor_id}
                disabled
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Password</label>
              <div className="col-span-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border px-3 py-2 rounded"
                  value={SupervisorData.plain_password}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, plain_password: e.target.value })
                  }
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                {errors.plain_password && <p className="text-red-500 text-xs">{errors.plain_password}</p>}
              </div>
            </div>

            {/* Username */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Username</label>
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={SupervisorData.username}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, username: e.target.value })
                  }
                />
                {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
              </div>
            </div>

            {/* Hired Date */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Hired Date</label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={SupervisorData.hired_date}
                  onChange={(e) =>
                    setSupervisorData({ ...SupervisorData, hired_date: e.target.value })
                  }
                />
                {errors.hired_date && <p className="text-red-500 text-xs">{errors.hired_date}</p>}
              </div>
            </div>

            {/* Shift */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Shift</label>
              <select
                className="col-span-2 border px-3 py-2 rounded"
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

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded-lg"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Update
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSupervisor;