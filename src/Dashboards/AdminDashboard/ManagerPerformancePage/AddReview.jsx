import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;
const AddReview = ({ setAddReviewPopup, ManagerList, fetchReviewList }) => {
  const [ReviewData, setReviewData] = useState({
    manager: "",
    comments: "",
    review_date: "",
    score: "",
  });

  const HandleAddReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${apiBaseUrl}/reviews/`, // Replace with your API endpoint
        ReviewData,
        {
          headers: {
            "Content-Type": "application/json", // Use application/json for JSON payloads
          },
        },
      );
      setAddReviewPopup(false);
      fetchReviewList(); // Refresh the list after adding a review
      toast.success("Review added successfully!");
    } catch (error) {
      console.error("Error adding review:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to add review";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 shadow-xl">
          <h1 className="text-2xl font-semibold mb-6">
            Add Manager Performance Review
          </h1>
          <form className="space-y-6 w-full" onSubmit={HandleAddReview}>
            <div className="grid gap-6 w-full">
              <div className="space-y-4">
                <h2 className="font-medium text-gray-700">Review Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">Manager Name</label>
                    <select
                      id="manager"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={ReviewData.manager}
                      onChange={(e) =>
                        setReviewData({
                          ...ReviewData,
                          manager: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled>
                        Select Manager
                      </option>
                      {ManagerList.map((manager) => (
                        <option
                          key={manager.manager_id}
                          value={manager.manager_id}
                        >
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
                      value={ReviewData.comments}
                      onChange={(e) =>
                        setReviewData({
                          ...ReviewData,
                          comments: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2 w-ful">
                    <label className="text-sm font-medium">Review Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={ReviewData.review_date}
                      onChange={(e) =>
                        setReviewData({
                          ...ReviewData,
                          review_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    <label className="text-sm font-medium">
                      Score (Out of 10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                      value={ReviewData.score}
                      onChange={(e) =>
                        setReviewData({
                          ...ReviewData,
                          score: e.target.value,
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
                onClick={() => setAddReviewPopup(false)}
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

export default AddReview;
