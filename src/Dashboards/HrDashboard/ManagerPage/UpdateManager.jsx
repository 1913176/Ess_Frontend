import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateManager = ({
  setUpdateManagerPopup,
  managerId,
  ShiftList,
  DepartmentList,
  fetchManagerList,
}) => {
  const [ManagerData, setManagerData] = useState({
    manager_name: "",
    email: "",
    gender: "",
    dob: "",
    manager_image: null,
    username: "",
    password: "",
    department: "",
    shift: "",
    hired_date: "",
  });

  const [errors, setErrors] = useState({
    manager_name: "",
    username: "",
    dob: "",
    hired_date: "",
  });

  useEffect(() => {
    const fetchManagerData = async () => {
      if (!managerId) {
        console.error("Manager ID is undefined");
        toast.error("Manager ID is missing. Please try again.");
        return;
      }
      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/api/managers/get/${managerId}/`,
        );
        setManagerData({
          manager_name: data.manager_name,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          manager_image: null, // Image can't be fetched in preview
          manager_id: data.manager_id,
          username: data.username,
          password: "", // Do not prefill the password for security
          department: data.department,
          shift: data.shift,
          hired_date: data.hired_date,
        });
      } catch (error) {
        console.error("Error fetching manager data:", error);
        toast.error("Failed to fetch manager data.");
      }
    };

    fetchManagerData();
  }, [managerId]);

  const handleUpdateManager = async (e) => {
    e.preventDefault();

    // Check if there are any errors
    if (Object.values(errors).some((error) => error !== "")) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      for (const key in ManagerData) {
        formData.append(key, ManagerData[key]);
      }

      const { data } = await axios.put(
        `${apiBaseUrl}/admin/managers/${managerId}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Manager updated successfully.");
      fetchManagerList(); // Refresh the list
      setUpdateManagerPopup(false);
    } catch (error) {
      console.error("Error updating manager:", error);
      toast.error("Failed to update manager.");
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Update Manager</h1>
        <form className="space-y-6 w-full" onSubmit={handleUpdateManager}>
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
                    value={ManagerData.manager_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        setManagerData({ ...ManagerData, manager_name: value });
                        setErrors({ ...errors, manager_name: "" });
                      } else {
                        setErrors({
                          ...errors,
                          manager_name: "Name should accept only alphabets",
                        });
                      }
                    }}
                  />
                  {errors.manager_name && (
                    <p className="text-red-500 text-xs">
                      {errors.manager_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={ManagerData.email}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Gender</label>
                <select
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={ManagerData.gender}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, gender: e.target.value })
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
                    value={ManagerData.dob}
                    onChange={(e) => {
                      const value = e.target.value;
                      const today = new Date().toISOString().split("T")[0];
                      if (value > today) {
                        setErrors({
                          ...errors,
                          dob: "Date of Birth cannot be a future date",
                        });
                      } else {
                        setManagerData({ ...ManagerData, dob: value });
                        setErrors({ ...errors, dob: "" });
                      }
                    }}
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs">{errors.dob}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2 w-ful">
                <label className="text-sm font-medium">Profile image</label>
                <input
                  type="file"
                  accept="image/*"
                  //   name="manager_image"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setManagerData({
                        ...ManagerData,
                        manager_image: file,
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-medium text-gray-700">Work Details</h2>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Department</label>
                <select
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={ManagerData.department}
                  onChange={(e) =>
                    setManagerData({
                      ...ManagerData,
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
              <div className="grid grid-cols-3 items-center gap-2 w-ful">
                <label className="text-sm font-medium">User ID</label>
                <input
                  type="text"
                  // name="manager_id"
                  placeholder="Enter User Id"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  value={ManagerData.manager_id}
                  onChange={(e) =>
                    setManagerData({
                      ...ManagerData,
                      manager_id: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-ful">
                <label className="text-sm font-medium">User password</label>
                <input
                  type="password"
                  // name="password"
                  placeholder="Enter User_password"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  value={ManagerData.password}
                  onChange={(e) =>
                    setManagerData({
                      ...ManagerData,
                      password: e.target.value,
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
                    value={ManagerData.username}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        setManagerData({ ...ManagerData, username: value });
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

              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm font-medium">Hired Date</label>
                <div className="col-span-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md"
                    value={ManagerData.hired_date}
                    onChange={(e) => {
                      const value = e.target.value;
                      const today = new Date().toISOString().split("T")[0];
                      if (value > today) {
                        setErrors({
                          ...errors,
                          hired_date: "Hired Date cannot be a future date",
                        });
                      } else {
                        setManagerData({ ...ManagerData, hired_date: value });
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
                  value={ManagerData.shift}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, shift: e.target.value })
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
              onClick={() => setUpdateManagerPopup(false)}
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

export default UpdateManager;
