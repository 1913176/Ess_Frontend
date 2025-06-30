import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;
const UpdateHrEmployee = ({
  setUpdateEmployeePopup,
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
    username: "",
    password: "",
    department: "",
    shift: "",
    hired_date: "",
  });

  const [errors, setErrors] = useState({
    employee_name: "",
    username: "",
    dob: "",
    hired_date: "",
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) {
        console.error("Employee ID is undefined");
        toast.error("Employee ID is missing. Please try again.");
        return;
      }
      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/api/employees/get/${employeeId}/`,
        );
        setEmployeeData({
          employee_name: data.employee_name,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          employee_image: null, // Image can't be fetched in preview
          employee_id: data.employee_id,
          username: data.username,
          password: "", // Do not prefill the password for security
          department: data.department,
          shift: data.shift,
          hired_date: data.hired_date,
        });
      } catch (error) {
        console.error("Error fetching Employee data:", error);
        toast.error("Failed to fetch Employee data.");
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();

    // Check if there are any errors
    if (Object.values(errors).some((error) => error !== "")) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      for (const key in EmployeeData) {
        formData.append(key, EmployeeData[key]);
      }

      const { data } = await axios.put(
        `${apiBaseUrl}/admin/employees/${employeeId}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Employee updated successfully.");
      fetchEmployeeList(); // Refresh the list
      setUpdateEmployeePopup(false);
    } catch (error) {
      console.error("Error updating Employee:", error);
      toast.error("Failed to update Employee.");
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Update Employee</h1>
        <form className="space-y-6 w-full" onSubmit={handleUpdateEmployee}>
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
                          employee_name: "Name should accept only alphabets",
                        });
                      }
                    }}
                  />
                  {errors.employee_name && (
                    <p className="text-red-500 text-xs">
                      {errors.employee_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={EmployeeData.email}
                  onChange={(e) =>
                    setEmployeeData({ ...EmployeeData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Gender</label>
                <select
                  className="col-span-2 px-3 py-2 rounded-md border"
                  value={EmployeeData.gender}
                  onChange={(e) =>
                    setEmployeeData({ ...EmployeeData, gender: e.target.value })
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
                    value={EmployeeData.dob}
                    onChange={(e) => {
                      const value = e.target.value;
                      const today = new Date().toISOString().split("T")[0];
                      if (value > today) {
                        setErrors({
                          ...errors,
                          dob: "Date of Birth cannot be a future date",
                        });
                      } else {
                        setEmployeeData({ ...EmployeeData, dob: value });
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
                      setEmployeeData({
                        ...EmployeeData,
                        employee_image: file,
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
                  value={EmployeeData.department}
                  onChange={(e) =>
                    setEmployeeData({
                      ...EmployeeData,
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
                  value={EmployeeData.employee_id}
                  onChange={(e) =>
                    setEmployeeData({
                      ...EmployeeData,
                      employee_id: e.target.value,
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
                  value={EmployeeData.password}
                  onChange={(e) =>
                    setEmployeeData({
                      ...EmployeeData,
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
                    value={EmployeeData.username}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        setEmployeeData({ ...EmployeeData, username: value });
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
                    value={EmployeeData.hired_date}
                    onChange={(e) => {
                      const value = e.target.value;
                      const today = new Date().toISOString().split("T")[0];
                      if (value > today) {
                        setErrors({
                          ...errors,
                          hired_date: "Hired Date cannot be a future date",
                        });
                      } else {
                        setEmployeeData({ ...EmployeeData, hired_date: value });
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
                  value={EmployeeData.shift}
                  onChange={(e) =>
                    setEmployeeData({ ...EmployeeData, shift: e.target.value })
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
              onClick={() => setUpdateEmployeePopup(false)}
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

export default UpdateHrEmployee;
