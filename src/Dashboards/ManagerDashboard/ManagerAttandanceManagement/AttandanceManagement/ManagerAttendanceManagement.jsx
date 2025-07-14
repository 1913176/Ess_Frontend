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
import { Calendar } from "lucide-react";
import ManagerAttendanceChart from "./ManagerAttendanceChart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

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

const fetchAttendanceData = async ({ queryKey }) => {
  const [, { managerId, fromDate, toDate, typeFilter }] = queryKey;
  const response = await axios.get(
    `${apiBaseUrl}/manager/manager-attendance-history/${managerId}/`,
    {
      params: {
        from_date: fromDate ? fromDate.toISOString().split("T")[0] : undefined,
        to_date: toDate ? toDate.toISOString().split("T")[0] : undefined,
        type: typeFilter || undefined,
      },
    }
  );
  return response.data.all_records || [];
};

const ManagerAttendanceManagement = () => {
  const queryClient = useQueryClient();
  const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: attendanceData = [], isError, isFetching } = useQuery({
    queryKey: [
      "managerAttendance",
      { managerId: userInfo.manager_id, fromDate, toDate, typeFilter },
    ],
    queryFn: fetchAttendanceData,
    placeholderData: [],
    staleTime: 1000,
  });

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    let filtered = [...attendanceData];
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.date?.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, sortConfig, attendanceData]);

  const calculateSummaryStats = () => {
    const totalRecords = attendanceData.length;
    const attendanceDays = attendanceData.filter(
      (record) => record.type === "attendance"
    ).length;
    const averageWorkHours = (
      attendanceData.reduce(
        (sum, record) => sum + (parseFloat(record.total_working_hours) || 0),
        0
      ) / (totalRecords || 1)
    ).toFixed(2);
    const leaveDays = attendanceData.filter(
      (record) => record.type !== "attendance"
    ).length;
    return { totalRecords, attendanceDays, averageWorkHours, leaveDays };
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
    setFromDate(null);
    setToDate(null);
    setTypeFilter("");
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["managerAttendance"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetching ? (
        <SkeletonLoading />
      ) : isError ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load attendance data. Please try again.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Attendance Summary</h5>
                <p className="text-gray-500 text-sm">
                  Overview of manager attendance
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div
                className="grid grid-cols-4 border-t min-w-full"
                style={{ minWidth: "600px" }}
              >
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Total Records</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalRecords}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      Records
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Attendance Days</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.attendanceDays}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round(
                        (stats.attendanceDays / (stats.totalRecords || 1)) * 100
                      )}
                      %
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Average Work Hours</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.averageWorkHours}
                    <span className="text-xs font-normal bg-orange-500 text-white px-2 py-1 rounded-full ml-1">
                      Hours
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">Leave Days</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.leaveDays}
                    <span className="text-xs font-normal bg-yellow-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round(
                        (stats.leaveDays / (stats.totalRecords || 1)) * 100
                      )}
                      %
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h5 className="font-semibold text-lg">Attendance Records</h5>
              </div>
              <div className="mt-2 md:mt-0">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>
            </div>
            {showFilters && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
                    <input
                      type="text"
                      className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
                      placeholder="Search by date"
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
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="form-select rounded-full border-gray-300 text-sm h-9 px-3"
                  >
                    <option value="">Select Type</option>
                    <option value="attendance">Attendance</option>
                    <option value="leave">Leave</option>
                  </select>
                  <DatePicker
                    selected={fromDate}
                    onChange={setFromDate}
                    className="form-input rounded-full border-gray-300 text-sm h-9 px-3"
                    placeholderText="From Date"
                  />
                  <DatePicker
                    selected={toDate}
                    onChange={setToDate}
                    className="form-input rounded-full border-gray-300 text-sm h-9 px-3"
                    placeholderText="To Date"
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
            {attendanceData.length === 0 ? (
              <p className="text-center text-gray-500 my-4">
                No attendance records available.
              </p>
            ) : filteredData.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                <p>No records found.</p>
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
                      <TableCell onClick={() => handleSort("date")} className="cursor-pointer">
                        Date {getSortIcon("date")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("time_in")} className="cursor-pointer">
                        Login Time {getSortIcon("time_in")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("time_out")} className="cursor-pointer">
                        Logout Time {getSortIcon("time_out")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("total_working_hours")} className="cursor-pointer">
                        Working Hours {getSortIcon("total_working_hours")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("type")} className="cursor-pointer">
                        Type {getSortIcon("type")}
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="h-full">
                    {filteredData.map((record, index) => (
                      <TableRow key={record.id || index}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.time_in || "N/A"}</TableCell>
                        <TableCell>{record.time_out || "N/A"}</TableCell>
                        <TableCell>
                          <span className="bg-gray-100 px-4 py-1 rounded-md">
                            {record.total_working_hours || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              record.type === "attendance"
                                ? "text-green-500"
                                : "text-yellow-500"
                            }
                          >
                            {record.type}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <ManagerAttendanceChart />
        </>
      )}
    </div>
  );
};

export default ManagerAttendanceManagement;