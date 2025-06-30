import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateEnroll = ({
  setUpdateEnrollPopup,
  enrollId,
  ProgramList,
  ManagerList,
  EmployeeList,
  fetchEnrollList,
}) => {
  const [EnrollData, setEnrollData] = useState({
    program: "",
    manager: "",
    employee: "",
    completion_status: "",
    completion_date: "",
  });

  // Fetch data for the specific enrollment by ID
  const fetchEnrollData = async (id) => {
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/get-training/progress/program/${id}/`,
      );
      setEnrollData({
        program: data.program || "",
        manager: data.manager || "",
        employee: data.employee || "",
        completion_status: data.completion_status || "",
        completion_date: data.completion_date || "",
      });
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
      toast.error("Failed to fetch enrollment details.");
    }
  };

  // Load the specific enrollment data when the component mounts
  useEffect(() => {
    if (enrollId) {
      fetchEnrollData(enrollId);
    }
  }, [enrollId]);

  // Handle form submission for updating the enrollment
  const handleUpdateEnroll = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${apiBaseUrl}/update_progress/${enrollId}/`,
        {
          program: EnrollData.program,
          manager: EnrollData.manager,
          employee: EnrollData.employee,
          completion_status: EnrollData.completion_status,
          completion_date: EnrollData.completion_date,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      setUpdateEnrollPopup(false);
      fetchEnrollList(); // Refresh the enroll list
      toast.success("Enrollment updated successfully!");
    } catch (error) {
      console.error("Error updating enrollment:", error);
      const errorMessage =
        error.response?.data?.errors ||
        error.response?.data?.message ||
        "Failed to update enrollment.";
      toast.error(JSON.stringify(errorMessage));
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Update Enroll</h1>
        <form className="space-y-6 w-full" onSubmit={handleUpdateEnroll}>
          <div className="grid gap-6 w-full">
            <div className="space-y-4">
              <h2 className="font-medium text-gray-700">Enrollment Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Program Name</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={EnrollData.program}
                    onChange={(e) =>
                      setEnrollData({
                        ...EnrollData,
                        program: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select Program
                    </option>
                    {ProgramList.map((program) => (
                      <option
                        key={program.program_id}
                        value={program.program_id}
                      >
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Manager Name</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={EnrollData.manager}
                    onChange={(e) =>
                      setEnrollData({
                        ...EnrollData,
                        manager: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select Manager
                    </option>
                    {ManagerList.map((manager) => (
                      <option key={manager.manager_id} value={manager.id}>
                        {manager.manager_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Employee Name</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={EnrollData.employee}
                    onChange={(e) =>
                      setEnrollData({
                        ...EnrollData,
                        employee: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select Employee
                    </option>
                    {EmployeeList.map((employee) => (
                      <option key={employee.employee_id} value={employee.id}>
                        {employee.employee_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={EnrollData.completion_status}
                    onChange={(e) =>
                      setEnrollData({
                        ...EnrollData,
                        completion_status: e.target.value.toLowerCase(),
                      })
                    }
                  >
                    <option value="">Select Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Completion Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={EnrollData.completion_date}
                    onChange={(e) =>
                      setEnrollData({
                        ...EnrollData,
                        completion_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setUpdateEnrollPopup(false)}
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
  );
};

export default UpdateEnroll;
