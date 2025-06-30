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
import { Alert } from "@/components/ui/alert";
import { Plus, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import RequestLeave from "../LeaveManagement/RequestLeave";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiBaseUrl = process.env.VITE_BASE_API;

const SkeletonLoading = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

const fetchLeaveData = async ({ queryKey }) => {
  const [, { managerId, startDate, endDate, statusFilter }] = queryKey;
  const response = await axios.get(
    `${apiBaseUrl}/manager-leave-history-id/${managerId}/`,
    {
      params: {
        start_date: startDate ? startDate.toISOString().split("T")[0] : undefined,
        end_date: endDate ? endDate.toISOString().split("T")[0] : undefined,
        status: statusFilter || undefined,
      },
    }
  );
  return response.data || [];
};

const ManagerLeaveManagement = () => {
  const queryClient = useQueryClient();
  const userdata = JSON.parse(localStorage.getItem("userdata") || "{}");
  const managerId = userdata.manager_id;
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);
  const [isOpenRequest, setIsOpenRequest] = useState(false);

  const { data: leaveData = [], isError, isFetching } = useQuery({
    queryKey: [
      "managerLeave",
      { managerId, startDate, endDate, statusFilter },
    ],
    queryFn: fetchLeaveData,
    placeholderData: [],
    staleTime: 1000,
  });

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    let filtered = [...leaveData];
    if (searchTerm) {
      filtered = filtered.filter(
        (leave) =>
          leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.id?.toString().includes(searchTerm)
      );
    }
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
  }, [searchTerm, sortConfig, leaveData]);
  const calculateSummaryStats = () => {
    const totalRequests = leaveData.length;
    const approved = leaveData.filter((req) => req.status.toLowerCase() === "approved").length;
    const rejected = leaveData.filter((req) => req.status.toLowerCase() === "rejected").length;
    const pending = leaveData.filter((req) => req.status.toLowerCase() === "pending").length;
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
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    setStatusFilter("");
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["managerLeave"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetching ? (
        <SkeletonLoading />
      ) : isError ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load leave requests. Please try again.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Leave Requests Summary</h5>
                <p className="text-gray-500 text-sm">
                  Overview of manager leave requests
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div
                className="grid grid-cols-4 border-t min-w-full"
                style={{ minWidth: "600px" }}
              >
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Total Requests</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalRequests}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      Requests
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Approved</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.approved}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round((stats.approved / (stats.totalRequests || 1)) * 100)}%
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Rejected</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.rejected}
                    <span className="text-xs font-normal bg-red-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round((stats.rejected / (stats.totalRequests || 1)) * 100)}%
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-xl sm:text-2xl font-semibold">
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
                <h5 className="font-semibold text-lg">Leave Requests</h5>
              </div>
              <div className="mt-2 md:mt-0 flex gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                      onClick={() => setIsOpenRequest(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <RequestLeave
                      setIsOpenRequest={setIsOpenRequest}
                      leaveData={leaveData}
                      fetchLeaveData={() => queryClient.invalidateQueries(["managerLeave"])}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {showFilters && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
                    <input
                      type="text"
                      className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
                      placeholder="Search by reason or ID"
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
                    className="form-select rounded-full border-gray-300 text-sm h-9 px-3"
                  >
                    <option value="">Select Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    className="form-input rounded-full border-gray-300 text-sm h-9 px-3"
                    placeholderText="Start Date"
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    className="form-input rounded-full border-gray-300 text-sm h-9 px-3"
                    placeholderText="End Date"
                  />
                  <Button
                    onClick={handleRefresh}
                    className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
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
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                >
                  <i className="fas fa-sync-alt mr-2"></i> Refresh
                </button>
                <button
                  onClick={handleResetFilter}
                  className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
            {leaveData.length === 0 ? (
              <p className="text-center text-gray-500 my-4">
                No leave requests available.
              </p>
            ) : filteredData.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                <p>No leave requests found.</p>
                <Button
                  onClick={handleResetFilter}
                  className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="border rounded-md bg-white h-full">
                <Table className="table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableCell onClick={() => handleSort("id")} className="cursor-pointer">
                        ID {getSortIcon("id")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("start_date")} className="cursor-pointer">
                        Start Date {getSortIcon("start_date")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("end_date")} className="cursor-pointer">
                        End Date {getSortIcon("end_date")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("reason")} className="cursor-pointer">
                        Reason {getSortIcon("reason")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("status")} className="cursor-pointer">
                        Status {getSortIcon("status")}
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="h-full">
                    {filteredData.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{leave.id}</TableCell>
                        <TableCell>{leave.start_date}</TableCell>
                        <TableCell>{leave.end_date}</TableCell>
                        <TableCell>{leave.reason}</TableCell>
                        <TableCell>
                          <div
                            className="px-2 py-1 rounded text-center text-sm"
                            style={{
                              color:
                                leave.status.toLowerCase() === "pending"
                                  ? "#FFA500"
                                  : leave.status.toLowerCase() === "approved"
                                  ? "#008000"
                                  : "#FF0000",
                              backgroundColor:
                                leave.status.toLowerCase() === "pending"
                                  ? "rgba(255, 165, 0, 0.2)"
                                  : leave.status.toLowerCase() === "approved"
                                  ? "rgba(0, 128, 0, 0.2)"
                                  : "rgba(255, 0, 0, 0.2)",
                            }}
                          >
                            {leave.status}
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

export default ManagerLeaveManagement;