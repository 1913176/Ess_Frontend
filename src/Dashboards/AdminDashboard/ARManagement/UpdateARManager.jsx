import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateARManager = ({
  open,
  setOpen,
  arId,
  ShiftList,
  DepartmentList,
  fetchHrList,
}) => {
  const [HrData, setHrData] = useState({
    ar_name: "",
    email: "",
    gender: "",
    dob: "",
    ar_image: null,
    ar_id: "",
    username: "",
    password: "",
    department: "",
    shift: "",
    hired_date: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchHrData = async () => {
      if (!arId) return;

      try {
        const { data } = await axios.get(`${apiBaseUrl}/api/get-ars/${arId}/`);
        setHrData({
          ar_name: data.ar_name,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          ar_image: null, // Reset image field for updates
          ar_id: data.ar_id,
          username: data.username,
          password: "", // Leave password blank initially
          department: data.department,
          shift: data.shift,
          hired_date: data.hired_date,
        });
      } catch (error) {
        console.error("Error fetching AR data:", error);
        toast.error("Failed to load AR data.");
      }
    };

    fetchHrData();
  }, [arId]);

  const validateForm = () => {
    const newErrors = {};
    if (!/^[A-Za-z\s]*$/.test(HrData.ar_name))
      newErrors.ar_name = "Only letters allowed in name";

    if (!/^[A-Za-z\s]*$/.test(HrData.username))
      newErrors.username = "Only letters allowed in username";

    const today = new Date().toISOString().split("T")[0];
    if (HrData.dob > today)
      newErrors.dob = "Date of Birth cannot be a future date";

    if (HrData.hired_date > today)
      newErrors.hired_date = "Hired Date cannot be a future date";

    if (!HrData.password)
      newErrors.password = "Password is required to update AR";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    Object.entries(HrData).forEach(([key, value]) => {
      if (key === "ar_image" && !value) return; // Skip null image
      if (key === "ar_id") return; // Skip ar_id
      if (key === "password" && value === "") return; // Skip empty password
      formData.append(key, value);
    });

    try {
      const res = await axios.put(
        `${apiBaseUrl}/admin/ars/${arId}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      // Updated success message to include arId
      toast.success(`AR with ID ${HrData.ar_id} updated successfully`);
      fetchHrList();
      setOpen(false);
    } catch (error) {
      const err = error?.response?.data;
      if (err?.username) {
        setErrors({ username: err.username });
      } else if (err?.email) {
        setErrors({ email: err.email });
      } else if (err?.password) {
        setErrors({ password: err.password });
      } else {
        toast.error("Failed to update AR.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update AR</DialogTitle>
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
                  value={HrData.ar_name}
                  onChange={(e) =>
                    setHrData({ ...HrData, ar_name: e.target.value })
                  }
                />
                {errors.ar_name && (
                  <p className="text-red-500 text-xs">{errors.ar_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-3 gap-2 items-start">
              <label>Email</label>
              <div className="col-span-2">
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded"
                  value={HrData.email}
                  onChange={(e) =>
                    setHrData({ ...HrData, email: e.target.value })
                  }
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Gender</label>
              <select
                className="col-span-2 border px-3 py-2 rounded"
                value={HrData.gender}
                onChange={(e) =>
                  setHrData({ ...HrData, gender: e.target.value })
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
                  value={HrData.dob}
                  onChange={(e) =>
                    setHrData({ ...HrData, dob: e.target.value })
                  }
                />
                {errors.dob && (
                  <p className="text-red-500 text-xs">{errors.dob}</p>
                )}
              </div>
            </div>

            {/* Profile image */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Profile Image</label>
              <input
                type="file"
                className="col-span-2 border px-3 py-2 rounded"
                onChange={(e) =>
                  setHrData({ ...HrData, ar_image: e.target.files[0] })
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
                value={HrData.department}
                onChange={(e) =>
                  setHrData({ ...HrData, department: e.target.value })
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

            {/* AR ID (read-only) */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>User ID</label>
              <input
                className="col-span-2 border px-3 py-2 rounded bg-gray-100"
                value={HrData.ar_id}
                disabled
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Password</label>
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={HrData.password}
                  onChange={(e) =>
                    setHrData({ ...HrData, password: e.target.value })
                  }
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Username</label>
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={HrData.username}
                  onChange={(e) =>
                    setHrData({ ...HrData, username: e.target.value })
                  }
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Hired Date */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Hired Date</label>
              <div className="col-span-2">
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={HrData.hired_date}
                  onChange={(e) =>
                    setHrData({ ...HrData, hired_date: e.target.value })
                  }
                />
                {errors.hired_date && (
                  <p className="text-red-500 text-xs">{errors.hired_date}</p>
                )}
              </div>
            </div>

            {/* Shift */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Shift</label>
              <select
                className="col-span-2 border px-3 py-2 rounded"
                value={HrData.shift}
                onChange={(e) =>
                  setHrData({ ...HrData, shift: e.target.value })
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

export default UpdateARManager;
