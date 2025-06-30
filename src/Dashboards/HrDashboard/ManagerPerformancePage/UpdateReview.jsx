import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
const apiBaseUrl = process.env.VITE_BASE_API;
const UpdateReview = ({
  setUpdateReviewPopup,
  reviewId,
  ManagerList,
  fetchReviewList,
}) => {
  const [ReviewData, setReviewData] = useState({
    manager: "",
    comments: "",
    review_date: "",
    score: "",
  });

  useEffect(() => {
    const fetchReviewData = async () => {
      if (!reviewId) {
        console.error("Review ID is undefined");
        toast.error("Review ID is missing. Please try again.");
        return;
      }
      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/get-reviews/${reviewId}/`,
        );
        setReviewData({
          id: data.id,
          manager: data.manager.manager_name,
          comments: data.comments,
          review_date: data.review_date,
          score: data.score,
        });
      } catch (error) {
        console.error("Error fetching review data:", error);
        toast.error("Failed to fetch review data.");
      }
    };

    fetchReviewData();
  }, [reviewId]);

  const handleUpdateReview = async (e) => {
    e.preventDefault();

    try {
      // Format dates to 'YYYY-MM-DD'
      const formattedData = {
        ...ReviewData,
        review_date: new Date(ReviewData.review_date)
          .toISOString()
          .split("T")[0],
      };

      const formData = new FormData();
      for (const key in formattedData) {
        formData.append(key, formattedData[key]);
      }

      const { data } = await axios.put(
        `${apiBaseUrl}/update-reviews/${reviewId}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Review updated successfully.");
      fetchReviewList(); // Refresh the list
      setUpdateReviewPopup(false);
    } catch (error) {
      console.error("Error updating Review:", error);
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
          <h1 className="text-2xl font-semibold mb-6">
            Update Manager Performance Review
          </h1>
          <form className="space-y-6 w-full" onSubmit={handleUpdateReview}>
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
                onClick={() => setUpdateReviewPopup(false)}
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

export default UpdateReview;
