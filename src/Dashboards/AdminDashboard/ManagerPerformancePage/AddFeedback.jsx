import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const AddFeedback = ({
  setAddFeedbackPopup,
  ManagerList,
  fetchFeedbackList,
}) => {
  const [FeedbackData, setFeedbackData] = useState({
    to_manager: "",
    comments: "",
    feedback_date: "",
  });

  const HandleAddFeedback = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `http://127.0.0.1:8000/api/create_feedback_manager/`, // Replace with your API endpoint
        FeedbackData,
        {
          headers: {
            "Content-Type": "application/json", // Use application/json for JSON payloads
          },
        },
      );
      setAddFeedbackPopup(false);
      fetchFeedbackList(); // Refresh the list after adding a review
      toast.success("Feedback added successfully!");
    } catch (error) {
      console.error("Error adding Feedback:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to add Feedback";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
          <h1 className="text-2xl font-semibold mb-6">Add Manager Feedback</h1>
          <form className="space-y-6 w-full" onSubmit={HandleAddFeedback}>
            <div className="grid gap-6 w-full">
              <div className="space-y-4">
                <h2 className="font-medium text-gray-700">Feedback Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">Manager Name</label>
                    <select
                      id="manager"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={FeedbackData.to_manager}
                      onChange={(e) =>
                        setFeedbackData({
                          ...FeedbackData,
                          to_manager: e.target.value,
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
                    <label className="text-sm font-medium">Comments</label>
                    <input
                      type="text"
                      placeholder="Enter description"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={FeedbackData.comments}
                      onChange={(e) =>
                        setFeedbackData({
                          ...FeedbackData,
                          comments: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2 w-ful">
                    <label className="text-sm font-medium">Feedback Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={FeedbackData.feedback_date}
                      onChange={(e) =>
                        setFeedbackData({
                          ...FeedbackData,
                          feedback_date: e.target.value,
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
                onClick={() => setAddFeedbackPopup(false)}
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

export default AddFeedback;
