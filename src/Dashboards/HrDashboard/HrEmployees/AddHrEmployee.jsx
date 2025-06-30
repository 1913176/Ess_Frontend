import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;

const AddHrEmployee = ({ setAddEmployeePopup, ShiftList, DepartmentList }) => {
  const [EmployeeData, setEmployeeData] = useState({
    employee_name: "",
    email: "",
    gender: "",
    dob: "",
    employee_image: null,
    employee_id: "",
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

  const validateForm = () => {
    let isValid = true;
    let newErrors = {
      employee_name: "",
      username: "",
      dob: "",
      hired_date: "",
    };
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    if (!/^[A-Za-z\s]+$/.test(EmployeeData.employee_name)) {
      newErrors.employee_name = "Name should accept only alphabets";
      isValid = false;
    }

    if (!/^[A-Za-z\s]+$/.test(EmployeeData.username)) {
      newErrors.username = "Username should accept only alphabets";
      isValid = false;
    }

    if (EmployeeData.dob && EmployeeData.dob > today) {
      newErrors.dob = "Future date should not be accepted";
      isValid = false;
    }

    if (EmployeeData.hired_date && EmployeeData.hired_date > today) {
      newErrors.hired_date = "Future date should not be accepted";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const HandleAddEmployee = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${apiBaseUrl}/admin/employees/add/`,
        ManagerData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setAddEmployeePopup(false);
      toast.success(`${data}`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to add Employee`);
    }
  };
  return (
    <>
      <div
        className={
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50"
          // (AddEmployeePopup ? "" : " hidden")
        }
      >
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
          <h1 className="text-2xl font-semibold mb-6">Add Employee</h1>
          <form className="space-y-6 w-full" onSubmit={HandleAddEmployee}>
            <div className="grid gap-6 w-full">
              {/* Left Column */}
              <div className="space-y-4">
                <h2 className="font-medium text-gray-700">Personal Details</h2>
                <div className="space-y-4">
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
                              employee_name:
                                "Name should accept only alphabets",
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
                  <div className="grid grid-cols-3 items-center gap-2 w-ful">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      //   name="email"
                      placeholder="Enter Email Address"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={EmployeeData.email}
                      onChange={(e) =>
                        setEmployeeData({
                          ...EmployeeData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">Gender</label>
                    <select
                      //   id="gender"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
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
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-sm font-medium">DOB</label>
                    <div className="col-span-2">
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-md"
                        value={EmployeeData.dob}
                        onChange={(e) => {
                          const today = new Date().toISOString().split("T")[0];
                          if (e.target.value > today) {
                            setErrors({
                              ...errors,
                              dob: "Future date should not be accepted",
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
                        <p className="text-red-500 text-xs">{errors.dob}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2 w-ful">
                    <label className="text-sm font-medium">Profile image</label>
                    <input
                      type="file"
                      accept="image/*"
                      //   name="employee_image"
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
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h2 className="font-medium text-gray-700">Work Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-2 w-ful">
                  <label className="text-sm font-medium">User ID</label>
                  <input
                    type="text"
                    // name="employee_id"
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
                <div className="grid grid-cols-3 items-center gap-2 w-ful">
                  <label className="text-sm font-medium">Department</label>
                  <select
                    id="department"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={EmployeeData.department}
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
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Shift</label>
                  <select
                    id="shift"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={EmployeeData.shift}
                    onChange={(e) =>
                      setEmployeeData({
                        ...EmployeeData,
                        shift: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select Department
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
                      value={EmployeeData.hired_date}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            hired_date: "Future date should not be accepted",
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
                      <p className="text-red-500 text-xs">
                        {errors.hired_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* </div> */}

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => setAddEmployeePopup(false)}
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
        </div>
      </div>
    </>
  );
};

export default AddHrEmployee;
