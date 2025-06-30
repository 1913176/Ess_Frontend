import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiBaseUrl = process.env.VITE_BASE_API;

const SkeletonLoading = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="bg-gray-200 rounded-lg animate-pulse p-4">
        <div className="h-8 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, j) => (
            <div key={j} className="h-12 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const fetchLeaveRequests = async ({ queryKey }) => {
  const [, { searchUser, statusFilter, fromDate1, fromDate2 }] = queryKey;
  const response = await axios.get(`${apiBaseUrl}/employee-leave-status/`, {
    params: {
      search_user_id: searchUser || undefined,
      search_status: statusFilter || undefined,
      from_date: fromDate1 ? fromDate1.toISOString().split("T")[0] : undefined,
      to_date: fromDate2 ? fromDate2.toISOString().split("T")[0] : undefined,
    },
  });
  return response.data;
};

const MEmployeeLeaveManagement = () => {
  const queryClient = useQueryClient();
  const [searchUser, setSearchUser] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate1, setFromDate1] = useState(null);
  const [fromDate2, setFromDate2] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: leaveRequests = [], isError, isFetching } = useQuery({
    queryKey: ["leaveRequests", { searchUser, statusFilter, fromDate1, fromDate2 }],
    queryFn: fetchLeaveRequests,
    placeholderData: [],
    staleTime: 1000,
  });

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    let filtered = [...leaveRequests];
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
    }
    setFilteredData(filtered);
  }, [sortConfig, leaveRequests]);

  const calculateSummaryStats = () => {
    const totalRequests = leaveRequests.length;
    const approved = leaveRequests.filter((req) => req.status === "approved").length;
    const rejected = leaveRequests.filter((req) => req.status === "rejected").length;
    const pending = leaveRequests.filter((req) => req.status === "Pending").length;
    return { totalRequests, approved, rejected, pending };
  };

  const stats = calculateSummaryStats();

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const handleResetFilter = () => {
    setSearchUser("");
    setStatusFilter("");
    setFromDate1(null);
    setFromDate2(null);
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["leaveRequests"]);
  };

  const approveRequest = async (id) => {
    try {
      await axios.post(`${apiBaseUrl}/approve-leave-request/${id}/`, { action: "approve" });
      toast.success("Leave request approved");
      queryClient.invalidateQueries(["leaveRequests"]);
    } catch (error) {
      toast.error("Failed to approve leave request");
      console.error(error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.post(`${apiBaseUrl}/approve-leave-request/${id}/`, { action: "reject" });
      toast.success("Leave request rejected");
      queryClient.invalidateQueries(["leaveRequests"]);
    } catch (error) {
      toast.error("Failed to reject leave request");
      console.error(error);
    }
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetching ? (
        <SkeletonLoading />
      ) : isError ? (
        <p className="text-center text-red-500 my-4">
          Failed to load leave requests. Please try again.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-base sm:text-lg mb-1">Leave Requests Summary</h5>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Overview of employee leave requests
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-t">
                <div className="p-4 text-center border-r sm:border-b-0">
                  <p className="text-gray-500 text-xs sm:text-sm">Total Requests</p>
                  <p className="text-lg sm:text-2xl font-semibold">
                    {stats.totalRequests}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      Requests
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r sm:border-b-0">
                  <p className="text-gray-500 text-xs sm:text-sm">Approved</p>
                  <p className="text-lg sm:text-2xl font-semibold">
                    {stats.approved}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round((stats.approved / (stats.totalRequests || 1)) * 100)}%
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r sm:border-b-0">
                  <p className="text-gray-500 text-xs sm:text-sm">Rejected</p>
                  <p className="text-lg sm:text-2xl font-semibold">
                    {stats.rejected}
                    <span className="text-xs font-normal bg-red-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round((stats.rejected / (stats.totalRequests || 1)) * 100)}%
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-xs sm:text-sm">Pending</p>
                  <p className="text-lg sm:text-2xl font-semibold">
                    {stats.pending}
                    <span className="text-xs font-normal bg-orange-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round((stats.pending / (stats.totalRequests || 1)) * 100)}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h5 className="font-semibold text-base sm:text-lg">Leave Requests</h5>
              </div>
              <div className="mt-2 md:mt-0">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text12 sm:text-sm px-3 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>
            </div>
            {showFilters && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-xs sm:text-sm h-9"
                      placeholder="Search by user ID or name"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select rounded-full border-gray-300 text-xs sm:text-sm h-9 px-3"
                  >
                    <option value="">Select Status</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="pending">Pending</option>
                  </select>
                  <DatePicker
                    selected={fromDate1}
                    onChange={setFromDate1}
                    className="form-input rounded-full border-gray-300 text-xs sm:text-sm h-9 px-3 w-full"
                    placeholderText="From Date"
                  />
                  <DatePicker
                    selected={fromDate2}
                    onChange={setFromDate2}
                    className="form-input rounded-full border-gray-300 text-xs sm:text-sm h-9 px-3 w-full"
                    placeholderText="To Date"
                  />
                  <Button
                    onClick={handleRefresh}
                    className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-xs sm:text-sm px-3 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Search
                  </Button>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row gap-3"></div>
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                <button
                  onClick={handleRefresh}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-xs sm:text-sm px-3 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                >
                  <i className="fas fa-sync-alt mr-2"></i> Refresh
                </button>
                <button
                  onClick={handleResetFilter}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs sm:text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
            {leaveRequests.length === 0 ? (
              <p className="text-center text-gray-500 my-4 text-xs sm:text-sm">
                No leave requests available.
              </p>
            ) : filteredData.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                <p className="text-xs sm:text-sm">No leave requests found.</p>
                <Button
                  onClick={handleResetFilter}
                  className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs sm:text-sm"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="table-auto w-full">
                  <TableHeader>
                    <TableRow>
                      <TableCell onClick={() => handleSort("user")} className="cursor-pointer text-xs sm:text-sm">
                        User {getSortIcon("user")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("leave_type")} className="cursor-pointer text-xs sm:text-sm">
                        Leave Type {getSortIcon("leave_type")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("start_date")} className="cursor-pointer text-xs sm:text-sm">
                        Start Date {getSortIcon("start_date")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("end_date")} className="cursor-pointer text-xs sm:text-sm">
                        End Date {getSortIcon("end_date")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("status")} className="cursor-pointer text-xs sm:text-sm">
                        Status {getSortIcon("status")}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="h-full">
                    {filteredData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-xs sm:text-sm">{row.user}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.leave_type}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.start_date}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.end_date}</TableCell>
                        <TableCell>
                          <div
                            className="px-2 py-1 rounded text-center text-xs sm:text-sm"
                            style={{
                              color:
                                row.status === "Pending"
                                  ? "orange"
                                  : row.status === "approved"
                                  ? "green"
                                  : "red",
                                  backgroundColor:
                                  row.status === "Pending"
                                    ? "rgba(255,165,0,0.2)"
                                    : row.status === "approved"
                                    ? "rgba(0,128,0,0.2)"
                                    : "rgba(255,0,0,0.2)",
                              }}
                          >
                            {row.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              onClick={() => approveRequest(row.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => rejectRequest(row.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm"
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MEmployeeLeaveManagement;