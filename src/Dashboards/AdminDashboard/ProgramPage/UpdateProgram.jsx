import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateReview = ({
  setUpdateProgramPopup,
  programId,
  ManagerList,
  fetchProgramList,
}) => {
  const [ProgramData, setProgramData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    for_managers: false, // Updated default value to boolean
    for_employees: false, // Updated default value to boolean
    training_incharge: "", // Holds the selected manager's ID
  });

  useEffect(() => {
    const fetchProgramData = async () => {
      if (!programId) {
        console.error("Program ID is undefined");
        toast.error("Program ID is missing. Please try again.");
        return;
      }
      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/training/programs/name/${programId}/`,
        );
        setProgramData({
          program_id: data.program_id,
          name: data.name,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
          for_managers: data.for_managers ? "Yes" : "No",
          for_employees: data.for_employees ? "Yes" : "No",
          training_incharge: data.training_incharge,
        });
      } catch (error) {
        console.error("Error fetching review data:", error);
        toast.error("Failed to fetch review data.");
      }
    };

    fetchProgramData();
  }, [programId]);

  const handleUpdateProgram = async (e) => {
    e.preventDefault();

    try {
      // Format dates to 'YYYY-MM-DD'
      const formattedData = {
        ...ProgramData,
        start_date: new Date(ProgramData.start_date)
          .toISOString()
          .split("T")[0],
        end_date: new Date(ProgramData.end_date).toISOString().split("T")[0],
      };

      const formData = new FormData();
      for (const key in formattedData) {
        formData.append(key, formattedData[key]);
      }

      const { data } = await axios.put(
        `${apiBaseUrl}/update_program/${programId}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Program updated successfully.");
      fetchProgramList(); // Refresh the list
      setUpdateProgramPopup(false);
    } catch (error) {
      console.error("Error updating Program:", error);
      toast
        .error
        // error.response?.data?.errors
        //   ? Object.values(error.response.data.errors).flat().join(", ")
        //   : "Failed to update Project."
        ();
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Update Program</h1>
        <form className="space-y-6 w-full" onSubmit={handleUpdateProgram}>
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
                      setProgramData({
                        ...ProgramData,
                        name: e.target.value,
                      })
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
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProgramData.start_date}
                    onChange={(e) =>
                      setProgramData({
                        ...ProgramData,
                        start_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProgramData.end_date}
                    onChange={(e) =>
                      setProgramData({
                        ...ProgramData,
                        end_date: e.target.value,
                      })
                    }
                    required
                  />
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
              onClick={() => setUpdateProgramPopup(false)}
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

export default UpdateReview;
