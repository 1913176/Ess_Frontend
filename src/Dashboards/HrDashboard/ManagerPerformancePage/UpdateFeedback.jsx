import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;
const UpdateFeedback = ({
  setUpdateFeedbackPopup,
  feedbackId,
  ManagerList,
  fetchFeedbackList,
}) => {
  const [FeedbackData, setFeedbackData] = useState({
    to_manager: "",
    comments: "",
    feedback_date: "",
  });

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!feedbackId) {
        console.error("Feedback ID is undefined");
        toast.error("Feedback ID is missing. Please try again.");
        return;
      }
      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/feedbacks/manager/${feedbackId}/`,
        );
        setFeedbackData({
          id: data.id,
          to_manager: data.to_manager.manager_name,
          comments: data.comments,
          feedback_date: data.feedback_date,
        });
      } catch (error) {
        console.error("Error fetching feedback data:", error);
        toast.error("Failed to fetch feedback data.");
      }
    };

    fetchFeedbackData();
  }, [feedbackId]);

  const handleUpdateFeedback = async (e) => {
    e.preventDefault();

    try {
      // Format dates to 'YYYY-MM-DD'
      const formattedData = {
        ...FeedbackData,
        feedback_date: new Date(FeedbackData.feedback_date)
          .toISOString()
          .split("T")[0],
      };

      const formData = new FormData();
      for (const key in formattedData) {
        formData.append(key, formattedData[key]);
      }

      const { data } = await axios.put(
        `${apiBaseUrl}/update_manager_feedback/${feedbackId}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Feedback updated successfully.");
      fetchFeedbackList(); // Refresh the list
      setUpdateFeedbackPopup(false);
    } catch (error) {
      console.error("Error updating Feedback:", error);
      toast
        .error
        // error.response?.data?.errors
        //   ? Object.values(error.response.data.errors).flat().join(", ")
        //   : "Failed to update Project."
        ();
    }
  };

  return (
    <>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
          <h1 className="text-2xl font-semibold mb-6">Add Manager Feedback</h1>
          <form className="space-y-6 w-full" onSubmit={handleUpdateFeedback}>
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
                onClick={() => setUpdateFeedbackPopup(false)}
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

export default UpdateFeedback;
