import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;

const AddManager = ({ setAddManagerPopup, ShiftList, DepartmentList }) => {
  const [ManagerData, setManagerData] = useState({
    manager_name: "",
    email: "",
    gender: "",
    dob: "",
    manager_image: null,
    manager_id: "",
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

  const validateForm = () => {
    let isValid = true;
    let newErrors = { manager_name: "", username: "", dob: "", hired_date: "" };
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    if (!/^[A-Za-z\s]+$/.test(ManagerData.manager_name)) {
      newErrors.manager_name = "Name should accept only alphabets";
      isValid = false;
    }

    if (!/^[A-Za-z\s]+$/.test(ManagerData.username)) {
      newErrors.username = "Username should accept only alphabets";
      isValid = false;
    }

    if (ManagerData.dob && ManagerData.dob > today) {
      newErrors.dob = "Future date should not be accepted";
      isValid = false;
    }

    if (ManagerData.hired_date && ManagerData.hired_date > today) {
      newErrors.hired_date = "Future date should not be accepted";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const HandleAddManager = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${apiBaseUrl}/admin/managers/add/`,
        ManagerData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setAddManagerPopup(false);
      toast.success(`${data}`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to add Manager`);
    }
  };
  return (
    <>
      <div
        className={
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50 h-2/3 lg:h-auto overflow-y-scroll"
          // (AddManagerPopup ? "" : " hidden")
        }
      >
        <div className="bg-white rounded-lg p-8 w-full shadow-xl">
          <h1 className="text-2xl font-semibold mb-6">Add Manager</h1>
          <form
            className="space-y-6 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
            onSubmit={HandleAddManager}
          >
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
                        value={ManagerData.manager_name}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[A-Za-z\s]*$/.test(value)) {
                            setManagerData({
                              ...ManagerData,
                              manager_name: value,
                            });
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

                  <div className="grid grid-cols-3 items-center gap-2 w-ful">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      //   name="email"
                      placeholder="Enter Email Address"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={ManagerData.email}
                      onChange={(e) =>
                        setManagerData({
                          ...ManagerData,
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
                      value={ManagerData.gender}
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
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-sm font-medium">DOB</label>
                    <div className="col-span-2">
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-md"
                        value={ManagerData.dob}
                        onChange={(e) => {
                          const today = new Date().toISOString().split("T")[0];
                          if (e.target.value > today) {
                            setErrors({
                              ...errors,
                              dob: "Future date should not be accepted",
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
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 lg:space-y-0">
              <h2 className="font-medium text-gray-700">Work Details</h2>
              <div className="space-y-4">
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
                <div className="grid grid-cols-3 items-center gap-2 w-ful">
                  <label className="text-sm font-medium">Department</label>
                  <select
                    id="department"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
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
                      <option
                        key={department.department_id}
                        value={department.id}
                      >
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
                    value={ManagerData.shift}
                    onChange={(e) =>
                      setManagerData({
                        ...ManagerData,
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
                      value={ManagerData.hired_date}
                      onChange={(e) => {
                        const today = new Date().toISOString().split("T")[0];
                        if (e.target.value > today) {
                          setErrors({
                            ...errors,
                            hired_date: "Future date should not be accepted",
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
                onClick={() => setAddManagerPopup(false)}
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

export default AddManager;
