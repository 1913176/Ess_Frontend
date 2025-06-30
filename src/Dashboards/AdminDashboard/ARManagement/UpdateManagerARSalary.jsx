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

const UpdateManagerARSalary = ({ open, setOpen, salaryId, ArList, fetchSalaryList }) => {
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

  // Initialize form with salary details when the dialog opens
  useEffect(() => {
    if (open && salaryId) {
      setSalaryData({
        user_id: salaryId.user_id || "",
        annual_salary: salaryId.annual_salary || "",
        bonus: salaryId.bonus || "",
        effective_date: salaryId.effective_date?.slice(0, 7) || "", // Ensure YYYY-MM format
      });
      setErrors({ user_id: "", annual_salary: "", bonus: "", effective_date: "" });
    }
  }, [open, salaryId]);

  const validateForm = () => {
    let valid = true;
    let newErrors = { user_id: "", annual_salary: "", bonus: "", effective_date: "" };

    // Validate AR Selection
    if (!SalaryData.user_id) {
      newErrors.user_id = "Please select an AR personnel.";
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
      const selectedDate = new Date(SalaryData.effective_date + "-01"); // Append day for Date parsing
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
      return; // Stop form submission if validation fails
    }

    setIsSubmitting(true);
    try {
      await axios.put(`${apiBaseUrl}/update-ar-salary/${salaryId.id}/`, SalaryData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Salary updated successfully.");
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
          <DialogTitle className="text-xl font-semibold">Update AR Salary</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={HandleUpdateSalary}>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">AR Name</label>
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
                  Select AR
                </option>
                {ArList.map((ar) => (
                  <option key={ar.ar_id} value={ar.ar_id}>
                    {ar.ar_name}
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

export default UpdateManagerARSalary;