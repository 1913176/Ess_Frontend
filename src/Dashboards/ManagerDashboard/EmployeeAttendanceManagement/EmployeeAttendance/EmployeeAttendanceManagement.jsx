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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Users } from "lucide-react";

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

const fetchEmployeeAttendanceHistory = async () => {
  const res = await axios.get(
    `${apiBaseUrl}/employee/all-employee-attendance-history/`
  );
  return res.data.records;
};

const EmployeeAttendanceManagement = () => {
  const queryClient = useQueryClient();
  const { data: leaveData = [], isError, isFetching } = useQuery({
    queryKey: ["attendance"],
    queryFn: fetchEmployeeAttendanceHistory,
    placeholderData: [],
    staleTime: 1000,
  });

  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewAttendanceDetails, setViewAttendanceDetails] = useState(false);

  useEffect(() => {
    setFilteredData(leaveData);
  }, [leaveData]);

  useEffect(() => {
    let filtered = [...leaveData];
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const totalRecords = leaveData.length;
    const present = leaveData.filter(
      (record) => record.in_status === "Present"
    ).length;
    const absent = leaveData.filter(
      (record) => record.in_status === "Absent"
    ).length;
    const totalOvertime = leaveData
      .reduce((sum, record) => sum + (parseFloat(record.overtime) || 0), 0)
      .toFixed(2);
    return { totalRecords, present, absent, totalOvertime };
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
    setFilteredData(leaveData);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["attendance"]);
  };

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setViewAttendanceDetails(true);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetching ? (
        <SkeletonLoading />
      ) : isError ? (
        <p className="text-center text-red-500 my-4 text-xs sm:text-sm">
          Failed to load attendance data. Please try again.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-base sm:text-lg mb-1">Attendance Summary</h5>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Overview of employee attendance
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-t">
                <div className="p-4 text-center border-r sm:border-b-0">
                  <p className="text-gray-500 text-xs sm:text-sm">Total Records</p>
                  <p className="text-lg sm:text-2xl font-semibold">
                    {stats.totalRecords}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      Records
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r sm:border-b-0">
                  <p className="text-gray-500 text-xs sm:text-sm">Present</p>
                  <p className="text-lg sm:text-2xl font-semibold">
                    {stats.present}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round(
                        (stats.present / (stats.totalRecords || 1)) * 100
                      )}
                      %
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r sm:border-b-0">
                  <p className="text-gray-500 text-xs sm:text-sm">Absent</p>
                  <p className="text-lg sm:text-2xl font-semibold">
                    {stats.absent}
                    <span className="text-xs font-normal bg-red-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round(
                        (stats.absent / (stats.totalRecords || 1)) * 100
                      )}
                      %
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-xs sm:text-sm">Total Overtime</p>
                  <p className="text-lg sm:text-2xl font-semibold">
                    {stats.totalOvertime}
                    <span className="text-xs font-normal bg-orange-500 text-white px-2 py-1 rounded-full ml-1">
                      Hours
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h5 className="font-semibold text-base sm:text-lg">Attendance Records</h5>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row gap-3"></div>
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
                  <input
                    type="text"
                    className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-xs sm:text-sm h-9"
                    placeholder="Search by employee name or ID"
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
            {leaveData.length === 0 ? (
              <p className="text-center text-gray-500 my-4 text-xs sm:text-sm">
                No attendance records available.
              </p>
            ) : filteredData.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                <p className="text-xs sm:text-sm">No records found.</p>
                <Button
                  onClick={handleResetFilter}
                  className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs sm:text-sm"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="table-auto w-full">
                  <TableHeader>
                    <TableRow>
                      <TableCell onClick={() => handleSort("employee_id")} className="cursor-pointer text-xs sm:text-sm">
                        Employee ID {getSortIcon("employee_id")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("employee_name")} className="cursor-pointer text-xs sm:text-sm">
                        Name {getSortIcon("employee_name")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("date")} className="cursor-pointer text-xs sm:text-sm">
                        Date {getSortIcon("date")}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">Check In</TableCell>
                      <TableCell className="text-xs sm:text-sm">Check Out</TableCell>
                      <TableCell className="text-xs sm:text-sm">In Status</TableCell>
                      <TableCell className="text-xs sm:text-sm">Out Status</TableCell>
                      <TableCell className="text-xs sm:text-sm">Overtime</TableCell>
                      <TableCell className="text-xs sm:text-sm">Work Hours</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="h-full">
                    {filteredData.map((row) => (
                      <TableRow key={row.id} onClick={() => handleRowClick(row)}>
                        <TableCell className="text-xs sm:text-sm">{row.employee_id}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.employee_name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.date}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.time_in}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.time_out}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.in_status}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.out_status}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.overtime}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{row.total_working_hours}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <Dialog
            open={viewAttendanceDetails}
            onOpenChange={setViewAttendanceDetails}
          >
            <DialogContent className="max-w-full sm:max-w-md mx-4">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Attendance Details</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 text-xs sm:text-sm">
                {selectedEmployee && (
                  <>
                    <div>
                      <strong>Employee ID:</strong> {selectedEmployee.employee_id}
                    </div>
                    <div>
                      <strong>Name:</strong> {selectedEmployee.employee_name}
                    </div>
                    <div>
                      <strong>Date:</strong> {selectedEmployee.date}
                    </div>
                    <div>
                      <strong>Check In:</strong> {selectedEmployee.time_in}
                    </div>
                    <div>
                      <strong>Check Out:</strong> {selectedEmployee.time_out}
                    </div>
                    <div>
                      <strong>In Status:</strong> {selectedEmployee.in_status}
                    </div>
                    <div>
                      <strong>Out Status:</strong> {selectedEmployee.out_status}
                    </div>
                    <div>
                      <strong>Overtime:</strong> {selectedEmployee.overtime}
                    </div>
                    <div>
                      <strong>Work Hours:</strong>{" "}
                      {selectedEmployee.total_working_hours}
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button onClick={() => setViewAttendanceDetails(false)} className="text-xs sm:text-sm">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default EmployeeAttendanceManagement;