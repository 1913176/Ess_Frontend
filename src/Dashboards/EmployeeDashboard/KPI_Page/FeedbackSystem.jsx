import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgress, Button } from "@mui/material";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const apiBaseUrl = process.env.VITE_BASE_API;

const FeedbackSystem = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userdata") || "{}");
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/view_feedback_employee/${userInfo.employee_id}/`);
        setFeedbacks(response.data);
        setFilteredFeedbacks(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch feedback data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    let filtered = [...feedbacks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((fb) =>
        fb.from_manager?.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.to_employee?.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.feedback_date?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Predefined date filters
    const now = new Date();
    if (selectedFilter) {
      if (selectedFilter === "Last 7 days") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        filtered = filtered.filter((fb) => {
          const date = new Date(fb.feedback_date);
          return date >= sevenDaysAgo && date <= now;
        });
      } else if (selectedFilter === "This month") {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter((fb) => {
          const date = new Date(fb.feedback_date);
          return date >= firstDay && date <= now;
        });
      } else if (selectedFilter === "Last month") {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        filtered = filtered.filter((fb) => {
          const date = new Date(fb.feedback_date);
          return date >= start && date <= end;
        });
      } else if (selectedFilter === "This year") {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter((fb) => {
          const date = new Date(fb.feedback_date);
          return date >= yearStart && date <= now;
        });
      }
    }

    // Custom date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter((fb) => {
        const date = new Date(fb.feedback_date);
        return date >= start && date <= end;
      });
    }

    setFilteredFeedbacks(filtered);
  }, [searchTerm, selectedFilter, startDate, endDate, feedbacks]);

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    if (filter !== "Custom range") {
      setStartDate("");
      setEndDate("");
    }
    setIsDropdownOpen(false);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedFilter("");
    setStartDate("");
    setEndDate("");
    setFilteredFeedbacks(feedbacks);
  };

  const getAvatarData = (name) => {
    const colors = ["bg-cyan-500", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-pink-500"];
    return {
      initial: name?.charAt(0)?.toUpperCase() || "U",
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <h2 className="text-lg font-semibold">Feedback History</h2>

          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <div className="relative">
              <button
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <i className="fas fa-filter mr-2"></i> Filter by Date
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 right-0 bg-white rounded-lg shadow-xl p-4 w-72">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-purple-600">
                      <i className="far fa-calendar-alt mr-2"></i>Date Filter
                    </span>
                    <div className="flex items-center">
                      {selectedFilter && (
                        <button
                          onClick={resetFilters}
                          className="text-xs text-purple-600 mr-2 hover:underline"
                        >
                          Reset
                        </button>
                      )}
                      <i
                        className="fas fa-times text-gray-500 cursor-pointer"
                        onClick={() => setIsDropdownOpen(false)}
                      ></i>
                    </div>
                  </div>

                  {["Last 7 days", "This month", "Last month", "This year", "Custom range"].map((option) => (
                    <div
                      key={option}
                      className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                        selectedFilter === option ? "bg-gray-200 text-purple-600" : ""
                      }`}
                      onClick={() => {
                        if (option !== "Custom range") handleFilterSelect(option);
                        else setSelectedFilter(option);
                      }}
                    >
                      <i className={`far ${option === "Last 7 days" ? "fa-clock" :
                        option === "This month" ? "fa-calendar" :
                        option === "Last month" ? "fa-calendar-week" :
                        option === "This year" ? "fa-calendar-alt" : "fa-calendar-check"} mr-2`} />
                      {option}
                    </div>
                  ))}

                  {selectedFilter === "Custom range" && (
                    <div className="mt-3">
                      <div className="flex gap-2">
                        <div>
                          <label className="text-xs text-gray-500">From</label>
                          <input
                            type="date"
                            className="w-full border rounded p-1 text-sm"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">To</label>
                          <input
                            type="date"
                            className="w-full border rounded p-1 text-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex-grow max-w-xs mb-4">
          <input
            type="text"
            className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="border rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center my-4">
              <CircularProgress className="m-auto" />
              <p className="text-blue-500 mt-2">Loading feedback data...</p>
            </div>
          ) : error ? (
            <p className="text-center text-red-500 my-4">{error}</p>
          ) : filteredFeedbacks.length === 0 ? (
            <p className="text-center text-gray-500 my-4">No feedback data available.</p>
          ) : (
            <Table>
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead className="w-10"><input type="checkbox" className="rounded" /></TableHead>
                  <TableHead>Manager From</TableHead>
                  <TableHead>Employee To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.map((fb) => {
                  const from = getAvatarData(fb.from_manager?.manager_name);
                  const to = getAvatarData(fb.to_employee?.employee_name);
                  return (
                    <TableRow key={fb.id}>
                      <TableCell><input type="checkbox" className="rounded" /></TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full ${from.color} text-white flex items-center justify-center mr-2`}>
                            {from.initial}
                          </div>
                          <div className="font-medium">{fb.from_manager?.manager_name || "Unknown"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full ${to.color} text-white flex items-center justify-center mr-2`}>
                            {to.initial}
                          </div>
                          <div className="font-medium">{fb.to_employee?.employee_name || "Unknown"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{fb.feedback_date || "-"}</TableCell>
                      <TableCell>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {fb.comments || "No comments"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm">Rows Per Page</span>
            <Button variant="outlined" size="small" className="text-gray-700 border-gray-300">
              {filteredFeedbacks.length}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSystem;
