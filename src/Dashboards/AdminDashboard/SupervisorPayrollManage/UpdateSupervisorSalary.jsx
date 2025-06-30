import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateSupervisorSalary = ({
  setUpdateSalaryPopup,
  salaryId,
  salaryDetails,
  SupervisorList,
}) => {
  // Ensure SupervisorList is always an array (use fallback to empty array if not provided)
  SupervisorList = Array.isArray(SupervisorList) ? SupervisorList : [];

  const [SalaryData, setSalaryData] = useState({
    user_id: salaryDetails?.user_id || "",
    annual_salary: salaryDetails?.annual_salary || "",
    bonus: salaryDetails?.bonus || "",
    effective_date: salaryDetails?.effective_date || "",
  });

  const HandleUpdateSalary = async (e) => {
    e.preventDefault();

    // Ensure effective_date is in YYYY-MM-DD format
    const formattedData = {
      ...SalaryData,
      effective_date: SalaryData.effective_date
        ? `${SalaryData.effective_date}-01` // Append "-01" to make it a valid YYYY-MM-DD format
        : "",
    };

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/update-supervisor-salary/${salaryId}/`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      setUpdateSalaryPopup(false);
      toast.success(response.data.message || "Salary updated successfully!");
    } catch (error) {
      console.error("Error updating salary:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to update salary. Please try again.",
      );
    }
  };

  return (
    <>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
          <h1 className="text-2xl font-semibold mb-6">
            Update Supervisor Salary
          </h1>
          <form className="space-y-6 w-full" onSubmit={HandleUpdateSalary}>
            <div className="grid gap-6 w-full">
              <div className="space-y-4">
                <h2 className="font-medium text-gray-700">Salary Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">
                      Supervisor Name
                    </label>
                    <select
                      id="user_id"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={SalaryData.user_id}
                      onChange={(e) =>
                        setSalaryData({
                          ...SalaryData,
                          user_id: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled>
                        Select Supervisor
                      </option>
                      {SupervisorList.map((supervisor) => (
                        <option
                          key={supervisor.supervisor_id}
                          value={supervisor.supervisor_id}
                        >
                          {supervisor.supervisor_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">Annual Salary</label>
                    <input
                      type="text"
                      placeholder="Enter Annual Salary"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={SalaryData.annual_salary}
                      onChange={(e) =>
                        setSalaryData({
                          ...SalaryData,
                          annual_salary: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">Bonus</label>
                    <input
                      type="text"
                      placeholder="Enter Bonus"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={SalaryData.bonus}
                      onChange={(e) =>
                        setSalaryData({ ...SalaryData, bonus: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">
                      Effective Date
                    </label>
                    <input
                      type="month"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={SalaryData.effective_date.slice(0, 7)} // Use YYYY-MM for input
                      onChange={(e) =>
                        setSalaryData({
                          ...SalaryData,
                          effective_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => setUpdateSalaryPopup(false)}
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

export default UpdateSupervisorSalary;
