import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateSupervisorSalary = ({
  setOpen,
  open,
  salaryId,
  SupervisorList,
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

  // ✅ Fetch salary details when salaryId is available
  useEffect(() => {
    const fetchSalaryDetails = async () => {
      if (!salaryId) return;

      try {
        const response = await axios.get(`${apiBaseUrl}/get-supervisor-salary/${salaryId}/`);
        if (response.data && !response.data.detail) { // Check if data exists and no error
          const salaryDetails = response.data;
          setSalaryData({
            user_id: salaryDetails.user_id || "",
            annual_salary: salaryDetails.annual_salary || "",
            bonus: salaryDetails.bonus || "",
            effective_date: salaryDetails.effective_date ? salaryDetails.effective_date.slice(0, 7) : "", // Format to YYYY-MM
          });
        } else {
          toast.error("Failed to fetch salary details.");
        }
      } catch (error) {
        console.error("Error fetching salary details:", error);
        toast.error("Failed to fetch salary details.");
      }
    };

    fetchSalaryDetails();
  }, [salaryId]);

  // 🔹 Form Validation Function
  const validateForm = () => {
    let valid = true;
    let newErrors = { annual_salary: "", bonus: "", effective_date: "" };

    // Validate Annual Salary (Only Numbers)
    if (!/^\d+$/.test(SalaryData.annual_salary)) {
      newErrors.annual_salary = "Annual salary must be a number.";
      valid = false;
    }

    // Validate Bonus (Only Numbers)
    if (!/^\d+$/.test(SalaryData.bonus)) {
      newErrors.bonus = "Bonus must be a number.";
      valid = false;
    }

    // Validate Effective Date (Must be in the Future)
    const currentDate = new Date();
    const selectedDate = new Date(SalaryData.effective_date + "-01");
    if (selectedDate <= currentDate) {
      newErrors.effective_date = "Effective date must be in the future.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // 🔹 Handle Salary Update with Validation
  const HandleUpdateSalary = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Stop submission if validation fails

    // Ensure effective_date is properly formatted
    const formattedData = {
      ...SalaryData,
      effective_date: SalaryData.effective_date
        ? new Date(SalaryData.effective_date + "-01")
            .toISOString()
            .split("T")[0]
        : "",
    };

    try {
      const response = await axios.put(
        `${apiBaseUrl}/update-supervisor-salary/${salaryId}/`,
        formattedData,
        { headers: { "Content-Type": "application/json" } },
      );

      toast.success(response.data.message || "Salary updated successfully!");
      fetchSalaryList();
      setOpen(false);
    } catch (error) {
      console.error("Error updating salary:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to update salary. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} asChild>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Supervisor Salary</DialogTitle>
        </DialogHeader>
        <form className="space-y-6 w-full" onSubmit={HandleUpdateSalary}>
          <div className="grid gap-6 w-full">
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Supervisor Name</label>
                <select
                  id="user_id"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  value={SalaryData.user_id}
                  onChange={(e) =>
                    setSalaryData({ ...SalaryData, user_id: e.target.value })
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
                {errors.annual_salary && (
                  <p className="text-red-500 text-xs col-span-3">
                    {errors.annual_salary}
                  </p>
                )}
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
                {errors.bonus && (
                  <p className="text-red-500 text-xs col-span-3">
                    {errors.bonus}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium">Effective Date</label>
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
                {errors.effective_date && (
                  <p className="text-red-500 text-xs col-span-3">
                    {errors.effective_date}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
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
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSupervisorSalary;