import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;

const AddEmpHrSalary = ({
  setAddSalaryPopup,
  EmployeeList,
  fetchSalaryList,
}) => {
  const [SalaryData, setSalaryData] = useState({
    user_id: "",
    annual_salary: "",
    bonus: "",
    effective_date: "",
  });

  const [errors, setErrors] = useState({
    annual_salary: "",
    bonus: "",
    effective_date: "",
  });

  const validateForm = () => {
    let valid = true;
    let newErrors = { annual_salary: "", bonus: "", effective_date: "" };

    // Validate Annual Salary
    if (!/^\d+$/.test(SalaryData.annual_salary)) {
      newErrors.annual_salary = "Annual salary must be a number.";
      valid = false;
    }

    // Validate Bonus
    if (!/^\d+$/.test(SalaryData.bonus)) {
      newErrors.bonus = "Bonus must be a number.";
      valid = false;
    }

    // Validate Effective Date (Future only)
    const currentDate = new Date();
    const selectedDate = new Date(SalaryData.effective_date);
    if (selectedDate <= currentDate) {
      newErrors.effective_date = "Effective date must be in the future.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const HandleAddSalary = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop form submission if validation fails
    }

    try {
      const { data } = await axios.post(
        `${apiBaseUrl}/salary/create/`,
        SalaryData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setAddSalaryPopup(false);
      fetchSalaryList();
      toast.success(`${data}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add Salary");
    }
  };

  return (
    <>
      <div
        className={
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50"
          // (AddManagerPopup ? "" : " hidden")
        }
      >
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
          <h1 className="text-2xl font-semibold mb-6">Add Salary</h1>
          <form className="space-y-6 w-full" onSubmit={HandleAddSalary}>
            <div className="grid gap-6 w-full">
              {/* Left Column */}
              <div className="space-y-4">
                <h2 className="font-medium text-gray-700">Salary Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-2 w-ful">
                    <label className="text-sm font-medium">Employee Name</label>
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
                        Select Employee
                      </option>
                      {EmployeeList.map((employee) => (
                        <option
                          key={employee.employee_id}
                          value={employee.employee_id}
                        >
                          {employee.employee_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Annual Salary (Only Numbers) */}
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">Annual Salary</label>
                    <input
                      type="number"
                      placeholder="Enter Annual Salary"
                      className={`w-full px-3 py-2 rounded-md border ${
                        errors.annual_salary
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2`}
                      value={SalaryData.annual_salary}
                      onChange={(e) =>
                        setSalaryData({
                          ...SalaryData,
                          annual_salary: e.target.value,
                        })
                      }
                    />
                    {errors.annual_salary && (
                      <span className="text-red-500 text-sm col-span-3">
                        {errors.annual_salary}
                      </span>
                    )}
                  </div>

                  {/* Bonus (Only Numbers) */}
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">Bonus</label>
                    <input
                      type="number"
                      placeholder="Enter Bonus"
                      className={`w-full px-3 py-2 rounded-md border ${
                        errors.bonus ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2`}
                      value={SalaryData.bonus}
                      onChange={(e) =>
                        setSalaryData({ ...SalaryData, bonus: e.target.value })
                      }
                    />
                    {errors.bonus && (
                      <span className="text-red-500 text-sm col-span-3">
                        {errors.bonus}
                      </span>
                    )}
                  </div>

                  {/* Effective Date (Only Future Dates) */}
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">
                      Effective Date
                    </label>
                    <input
                      type="month"
                      className={`w-full px-3 py-2 rounded-md border ${
                        errors.effective_date
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2`}
                      value={SalaryData.effective_date}
                      onChange={(e) =>
                        setSalaryData({
                          ...SalaryData,
                          effective_date: e.target.value,
                        })
                      }
                    />
                    {errors.effective_date && (
                      <span className="text-red-500 text-sm col-span-3">
                        {errors.effective_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => setAddSalaryPopup(false)}
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

export default AddEmpHrSalary;
