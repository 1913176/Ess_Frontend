import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;

const AddProgram = ({ setAddProgramPopup, ManagerList, fetchProgramList }) => {
  const [ProgramData, setProgramData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    for_managers: false,
    for_employees: false,
    training_incharge: "",
  });

  const [errors, setErrors] = useState({
    start_date: "",
    end_date: "",
    checkboxes: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { start_date: "", end_date: "", checkboxes: "" };

    // Date Validation
    if (!ProgramData.start_date) {
      newErrors.start_date = "Start date is required.";
      isValid = false;
    }

    if (!ProgramData.end_date) {
      newErrors.end_date = "End date is required.";
      isValid = false;
    }

    if (ProgramData.start_date && ProgramData.end_date) {
      const startDate = new Date(ProgramData.start_date);
      const endDate = new Date(ProgramData.end_date);

      if (startDate > endDate) {
        newErrors.end_date = "End date must be later than Start date.";
        isValid = false;
      }
    }

    // Checkbox Validation (At least one must be selected)
    if (!ProgramData.for_managers && !ProgramData.for_employees) {
      newErrors.checkboxes =
        "Select at least one option: For Managers or For Employees.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const HandleAddProgram = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors before submitting.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${apiBaseUrl}/create_training_program/`,
        {
          ...ProgramData,
          for_managers: ProgramData.for_managers === true,
          for_employees: ProgramData.for_employees === true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      setAddProgramPopup(false);
      fetchProgramList();
      toast.success("Program added successfully!");
    } catch (error) {
      console.error("Error adding Program:", error);
      const errorMessage =
        error.response?.data?.errors ||
        error.response?.data?.message ||
        "Failed to add program.";
      toast.error(JSON.stringify(errorMessage));
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Add Program</h1>
        <form className="space-y-6 w-full" onSubmit={HandleAddProgram}>
          <div className="grid gap-6 w-full">
            <div className="space-y-4">
              <h2 className="font-medium text-gray-700">Program Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Program Name</label>
                  <input
                    type="text"
                    placeholder="Enter Program Name"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProgramData.name}
                    onChange={(e) =>
                      setProgramData({ ...ProgramData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    placeholder="Enter Description"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProgramData.description}
                    onChange={(e) =>
                      setProgramData({
                        ...ProgramData,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 rounded-md border ${
                      errors.start_date ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2`}
                    value={ProgramData.start_date}
                    onChange={(e) =>
                      setProgramData({
                        ...ProgramData,
                        start_date: e.target.value,
                      })
                    }
                    required
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm col-span-3">
                      {errors.start_date}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 rounded-md border ${
                      errors.end_date ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2`}
                    value={ProgramData.end_date}
                    onChange={(e) =>
                      setProgramData({
                        ...ProgramData,
                        end_date: e.target.value,
                      })
                    }
                    required
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm col-span-3">
                      {errors.end_date}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">For Managers</label>
                  <input
                    type="checkbox"
                    checked={ProgramData.for_managers}
                    onChange={(e) =>
                      setProgramData({
                        ...ProgramData,
                        for_managers: e.target.checked,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">For Employees</label>
                  <input
                    type="checkbox"
                    checked={ProgramData.for_employees}
                    onChange={(e) =>
                      setProgramData({
                        ...ProgramData,
                        for_employees: e.target.checked,
                      })
                    }
                  />
                </div>
                {errors.checkboxes && (
                  <p className="text-red-500 text-sm">{errors.checkboxes}</p>
                )}
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">
                    Training Incharge
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProgramData.training_incharge}
                    onChange={(e) =>
                      setProgramData({
                        ...ProgramData,
                        training_incharge: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select Incharge
                    </option>
                    {ManagerList.map((manager) => (
                      <option key={manager.manager_id} value={manager.id}>
                        {manager.manager_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setAddProgramPopup(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProgram;
