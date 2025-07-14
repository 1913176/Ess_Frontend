import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgress, Button, Checkbox, Stack  } from "@mui/material";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-toastify";



const apiBaseUrl = process.env.VITE_BASE_API;
const userInfo = JSON.parse(sessionStorage.getItem("userdata") || "{}");

const GoalSetting = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchGoals = async () => {
      if (!userInfo.employee_name) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${apiBaseUrl}/view_goal_employee/${userInfo.employee_name}`
        );
        setGoals(response.data);
        setFilteredGoals(response.data); // Initialize filteredGoals with all data
      } catch (err) {
        setError("Failed to fetch goals.");
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  useEffect(() => {
    let filtered = [...goals];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((goal) =>
        goal.employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.goal_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.start_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.end_date.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter if selected
    if (selectedFilter) {
      const now = new Date();
      if (selectedFilter === "Last 7 days") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        filtered = filtered.filter((goal) => {
          const goalDate = new Date(goal.start_date);
          return goalDate >= sevenDaysAgo && goalDate <= now;
        });
      } else if (selectedFilter === "This month") {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter((goal) => {
          const goalDate = new Date(goal.start_date);
          return goalDate >= firstDay && goalDate <= now;
        });
      } else if (selectedFilter === "Last month") {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        filtered = filtered.filter((goal) => {
          const goalDate = new Date(goal.start_date);
          return goalDate >= lastMonthStart && goalDate <= lastMonthEnd;
        });
      } else if (selectedFilter === "This year") {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter((goal) => {
          const goalDate = new Date(goal.start_date);
          return goalDate >= yearStart && goalDate <= now;
        });
      }
    }

    // Apply custom date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter((goal) => {
        const goalDate = new Date(goal.start_date);
        return goalDate >= start && goalDate <= end;
      });
    }

    setFilteredGoals(filtered);
  }, [searchTerm, selectedFilter, startDate, endDate, goals]);

  const handleMarkAsCompleted = async (goalId) => {
    try {
      await axios.post(`${apiBaseUrl}/mark_goal_completed/${goalId}/`);
      setGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal.id === goalId ? { ...goal, status: "Completed" } : goal
        )
      );
      toast.success("Goal marked as completed!");
    } catch (err) {
      toast.error("Error updating goal status.");
      console.error(err);
    }
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    if (filter !== "Custom range") {
      setStartDate("");
      setEndDate("");
    }
    setIsDropdownOpen(false);
  };

  const resetFilters = () => {
    setSelectedFilter("");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setFilteredGoals(goals);
  };

  if (loading) return <CircularProgress className="m-auto" />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 min-h-dvh">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <h2 className="text-lg font-semibold">Goal Setting</h2>
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
                        if (option !== "Custom range") {
                          handleFilterSelect(option);
                        } else {
                          setSelectedFilter(option);
                        }
                      }}
                    >
                      <i
                        className={`far ${
                          option === "Last 7 days" ? "fa-clock" :
                          option === "This month" ? "fa-calendar" :
                          option === "Last month" ? "fa-calendar-week" :
                          option === "This year" ? "fa-calendar-alt" : "fa-calendar-check"
                        } mr-2`}
                      ></i>
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
            placeholder="Search goals..."
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
          <Table>
            <TableHeader className="bg-gray-200">
              <TableRow>
                <TableHead className="w-10">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGoals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No goals found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGoals.map((goal) => {
                  const avatar = goal.employee.employee_name.charAt(0).toUpperCase();
                  const colors = [
                    "bg-cyan-500",
                    "bg-blue-500",
                    "bg-orange-500",
                    "bg-purple-500",
                    "bg-pink-500",
                  ];
                  const color = colors[goal.id % colors.length];

                  return (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <input type="checkbox" className="rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full ${color} text-white flex items-center justify-center mr-2`}>
                            {avatar}
                          </div>
                          <div>
                            <div className="font-medium">{goal.employee.employee_name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{goal.start_date}</TableCell>
                      <TableCell>{goal.end_date}</TableCell>
                      <TableCell>{goal.goal_text}</TableCell>
                      <TableCell>
                         <Button
                           variant="contained"
                           size="small"
                           sx={{
                             borderRadius: "16px",
                             textTransform: "none",
                             fontSize: "0.75rem",
                             color: "white",
                             backgroundColor: goal.status === "Pending" ? "#F59E0B" : "#10B981",
                             "&:hover": {
                               backgroundColor: goal.status === "Pending" ? "#D97706" : "#059669",
                             },
                           }}
                           onClick={() => handleMarkAsCompleted(goal.id)}
                         >
                           completed
                           {goal.status}
                         </Button>
                       </TableCell>
                       <TableCell>
                       <Stack direction="row" spacing={1} alignItems="center">
      <Button variant="contained" size="small">Click</Button>
      
    </Stack>
                        
                       </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm">Rows Per Page</span>
            <Button
              variant="outlined"
              size="small"
              className="text-gray-700 border-gray-300"
            >
              {filteredGoals.length}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSetting;