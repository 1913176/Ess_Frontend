import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateSalary = ({ setOpen, open, salaryId, EmployeeList, fetchSalaryList }) => {
  const [SalaryData, setSalaryData] = useState({
    user_id: "",
    annual_salary: "",
    bonus: "",
    effective_date: "",
  });

  const [errors, setErrors] = useState({
    user_id: "",
    annual_salary: "",
    bonus: "",
    effective_date: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSalaryDetails = async () => {
      if (!salaryId || !salaryId.id) return;

      try {
        const response = await axios.get(
          `${apiBaseUrl}/get-employee-salary/${salaryId.id}/`,
        );
        if (response.data.length > 0) {
          const salaryDetails = response.data[0];
          setSalaryData({
            user_id: salaryDetails.user_id || "",
            annual_salary: salaryDetails.annual_salary || "",
            bonus: salaryDetails.bonus || "",
            effective_date: salaryDetails.effective_date?.slice(0, 7) || "", // YYYY-MM for input
          });
        }
      } catch (error) {
        toast.error("Failed to fetch salary details.");
      }
    };

    fetchSalaryDetails();
  }, [salaryId]);

  const validateForm = () => {
    let valid = true;
    let newErrors = { user_id: "", annual_salary: "", bonus: "", effective_date: "" };

    // Validate Employee Selection
    if (!SalaryData.user_id) {
      newErrors.user_id = "Please select an employee.";
      valid = false;
    }

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

    // Validate Effective Date (Future only, YYYY-MM format)
    if (!SalaryData.effective_date) {
      newErrors.effective_date = "Effective date is required.";
      valid = false;
    } else {
      const currentDate = new Date();
      const selectedDate = new Date(SalaryData.effective_date + "-01");
      if (selectedDate <= currentDate) {
        newErrors.effective_date = "Effective date must be in the future.";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const HandleUpdateSalary = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedData = {
        ...SalaryData,
        effective_date: SalaryData.effective_date
          ? new Date(SalaryData.effective_date + "-01").toISOString().split("T")[0]
          : "",
      };

      const response = await axios.put(
        `${apiBaseUrl}/update-salary/${salaryId.id}/`,
        formattedData,
        { headers: { "Content-Type": "application/json" } },
      );

      toast.success(response.data.message || "Salary updated successfully.");
      fetchSalaryList();
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update salary.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Update Employee Salary</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={HandleUpdateSalary}>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Employee Name</label>
              <select
                id="user_id"
                value={SalaryData.user_id}
                onChange={(e) =>
                  setSalaryData({ ...SalaryData, user_id: e.target.value })
                }
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.user_id
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
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
              {errors.user_id && (
                <span className="text-red-500 text-sm">{errors.user_id}</span>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Annual Salary</label>
              <input
                type="number"
                placeholder="Enter Annual Salary"
                value={SalaryData.annual_salary}
                onChange={(e) =>
                  setSalaryData({ ...SalaryData, annual_salary: e.target.value })
                }
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.annual_salary
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
              />
              {errors.annual_salary && (
                <span className="text-red-500 text-sm">{errors.annual_salary}</span>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Bonus</label>
              <input
                type="number"
                placeholder="Enter Bonus"
                value={SalaryData.bonus}
                onChange={(e) =>
                  setSalaryData({ ...SalaryData, bonus: e.target.value })
                }
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.bonus
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
              />
              {errors.bonus && (
                <span className="text-red-500 text-sm">{errors.bonus}</span>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Effective Date</label>
              <input
                type="month"
                value={SalaryData.effective_date}
                onChange={(e) =>
                  setSalaryData({ ...SalaryData, effective_date: e.target.value })
                }
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.effective_date
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
              />
              {errors.effective_date && (
                <span className="text-red-500 text-sm">{errors.effective_date}</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSalary;