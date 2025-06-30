import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;
const AddGoal = ({ setAddGoalPopup, ManagerList, fetchGoalList }) => {
  const [GoalData, setGoalData] = useState({
    manager: "",
    goal_text: "",
    start_date: "",
    end_date: "",
    is_completed: false,
  });

  const [error, setError] = useState(""); // State to store validation error

  const HandleAddGoal = async (e) => {
    e.preventDefault();

    // ✅ Validation: Check if End Date is before Start Date
    if (
      GoalData.start_date &&
      GoalData.end_date &&
      GoalData.start_date > GoalData.end_date
    ) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${apiBaseUrl}/api/create_goal_manager/`,
        GoalData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      setAddGoalPopup(false);
      fetchGoalList();
      toast.success("Goal added successfully!");
    } catch (error) {
      console.error("Error adding Goal:", error);
      const errorMessage = error.response?.data?.error || "Failed to add Goal";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Add Manager Goal</h1>
        <form className="space-y-6 w-full" onSubmit={HandleAddGoal}>
          <div className="grid gap-6 w-full">
            <div className="space-y-4">
              <h2 className="font-medium text-gray-700">Goal Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Manager Name</label>
                  <select
                    id="manager"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={GoalData.manager}
                    onChange={(e) =>
                      setGoalData({ ...GoalData, manager: e.target.value })
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
                  <label className="text-sm font-medium">Goal Text</label>
                  <input
                    type="text"
                    placeholder="Enter description"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={GoalData.goal_text}
                    onChange={(e) =>
                      setGoalData({ ...GoalData, goal_text: e.target.value })
                    }
                  />
                </div>

                {/* ✅ Start Date Input */}
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={GoalData.start_date}
                    onChange={(e) => {
                      setGoalData({ ...GoalData, start_date: e.target.value });
                      setError(""); // Reset error when date changes
                    }}
                  />
                </div>

                {/* ✅ End Date Input with Validation */}
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={GoalData.end_date}
                    onChange={(e) => {
                      setGoalData({ ...GoalData, end_date: e.target.value });
                      setError(""); // Reset error when date changes
                    }}
                  />
                </div>

                {/* ❌ Show Error Message if Date is Invalid */}
                {error && (
                  <p className="text-red-500 text-sm col-span-2">{error}</p>
                )}

                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label htmlFor="is_completed" className="text-sm font-medium">
                    Is Completed
                  </label>
                  <div className="col-span-2 flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="is_completed"
                      className="hidden"
                      checked={GoalData.is_completed}
                      onChange={(e) =>
                        setGoalData({
                          ...GoalData,
                          is_completed: e.target.checked,
                        })
                      }
                    />
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        GoalData.is_completed
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                      onClick={() =>
                        setGoalData({
                          ...GoalData,
                          is_completed: !GoalData.is_completed,
                        })
                      }
                    >
                      {GoalData.is_completed ? "Yes" : "No"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setAddGoalPopup(false)}
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

export default AddGoal;
