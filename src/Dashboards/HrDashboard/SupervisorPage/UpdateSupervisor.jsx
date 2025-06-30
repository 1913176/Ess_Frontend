import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;
const UpdateSupervisor = ({
  setUpdateSupervisorPopup,
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
    // supervisor_id: "",
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

  useEffect(() => {
    const fetchSupervisorData = async () => {
      if (!supervisorId) {
        console.error("Supervisor ID is undefined");
        toast.error("Supervisor ID is missing. Please try again.");
        return;
      }
      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/api/supervisor/get/${supervisorId}/`,
        );
        setSupervisorData({
          supervisor_name: data.supervisor_name,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          supervisor_image: null,
          supervisor_id: data.supervisor_id,
          username: data.username,
          password: "", // Do not prefill password for security
          department: data.department,
          shift: data.shift,
          hired_date: data.hired_date,
        });
      } catch (error) {
        console.error("Error fetching supervisor data:", error);
        toast.error("Failed to fetch supervisor data.");
      }
    };

    fetchSupervisorData();
  }, [supervisorId]);

  const handleUpdateSupervisor = async (e) => {
    e.preventDefault();

    if (Object.values(errors).some((error) => error !== "")) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      for (const key in SupervisorData) {
        formData.append(key, SupervisorData[key]);
      }

      await axios.put(
        `${apiBaseUrl}/admin/supervisor/${supervisorId}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Supervisor updated successfully.");
      fetchSupervisorList();
      setUpdateSupervisorPopup(false);
    } catch (error) {
      console.error("Error updating supervisor:", error);
      toast.error("Failed to update supervisor.");
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Update Supervisor</h1>
        <form className="space-y-6 w-full" onSubmit={handleUpdateSupervisor}>
          <div className="grid gap-6 w-full">
            <div className="space-y-4">
              <h2 className="font-medium text-gray-700">Personal Details</h2>
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
                  />
                  {errors.supervisor_name && (
                    <p className="text-red-500 text-xs">
                      {errors.supervisor_name}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={SupervisorData.email}
                  onChange={(e) =>
                    setSupervisorData({
                      ...SupervisorData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Gender</label>
                <select
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={SupervisorData.gender}
                  onChange={(e) =>
                    setSupervisorData({
                      ...SupervisorData,
                      gender: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <div className="col-span-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md"
                    value={SupervisorData.dob}
                    onChange={(e) => {
                      const value = e.target.value;
                      const today = new Date().toISOString().split("T")[0];
                      if (value > today) {
                        setErrors({
                          ...errors,
                          dob: "Date of Birth cannot be a future date",
                        });
                      } else {
                        setSupervisorData({ ...SupervisorData, dob: value });
                        setErrors({ ...errors, dob: "" });
                      }
                    }}
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs">{errors.dob}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="col-span-2 px-3 py-2 rounded-md border"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSupervisorData({
                        ...SupervisorData,
                        supervisor_image: file,
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-medium text-gray-700">Work Details</h2>
              <div className="grid grid-cols-3 items-center gap-2 w-ful">
                <label className="text-sm font-medium">User ID</label>
                <input
                  type="text"
                  // name="manager_id"
                  placeholder="Enter User Id"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  value={SupervisorData.supervisor_id}
                  onChange={(e) =>
                    setSupervisorData({
                      ...SupervisorData,
                      supervisor_id: e.target.value,
                    })
                  }
                />
              </div>
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
                        setSupervisorData({
                          ...SupervisorData,
                          username: value,
                        });
                        setErrors({ ...errors, username: "" });
                      } else {
                        setErrors({
                          ...errors,
                          username: "Username should accept only alphabets",
                        });
                      }
                    }}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs">{errors.username}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Department</label>
                <select
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={SupervisorData.department}
                  onChange={(e) =>
                    setSupervisorData({
                      ...SupervisorData,
                      department: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Department</option>
                  {DepartmentList.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={SupervisorData.password}
                  onChange={(e) =>
                    setSupervisorData({
                      ...SupervisorData,
                      password: e.target.value,
                    })
                  }
                />
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
                        setSupervisorData({
                          ...SupervisorData,
                          hired_date: e.target.value,
                        });
                        setErrors({ ...errors, hired_date: "" });
                      }
                    }}
                  />
                  {errors.hired_date && (
                    <p className="text-red-500 text-xs">{errors.hired_date}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Shift</label>
                <select
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={SupervisorData.shift}
                  onChange={(e) =>
                    setSupervisorData({
                      ...SupervisorData,
                      shift: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Shift</option>
                  {ShiftList.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.shift_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded-lg"
              onClick={() => setUpdateSupervisorPopup(false)}
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
      </div>
    </div>
  );
};

export default UpdateSupervisor;
