import React, { useState, useMemo } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const fetchEmployees = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`);
  return data || [];
};

const fetchAllAttendanceRecords = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/employee/all-employee-attendance-history/`);
  return data.all_records?.map((record, index) => ({
    id: `${record.employee_id || 'all'}-${record.date}-${index}`,
    ...record,
  })) || [];
};

const AttendanceCard = ({ record, index }) => {
  const getStatusText = (record) => {
    if (record.type === "leave") return "Leave";
    if (record.time_in && record.shift_start_time) {
      const [checkInHours, checkInMinutes] = record.time_in.split(':').map(Number);
      const [shiftHours, shiftMinutes] = record.shift_start_time.split(':').map(Number);
      const checkInTime = new Date();
      checkInTime.setHours(checkInHours, checkInMinutes, 0, 0);
      const shiftStart = new Date();
      shiftStart.setHours(shiftHours, shiftMinutes, 0, 0);
      const oneHourAfterShift = new Date(shiftStart.getTime() + 60 * 60 * 1000);
      return checkInTime > oneHourAfterShift ? "Late" : "Present";
    }
    return "Present";
  };

  const getStatusColor = (record) => {
    if (record.type === "leave") return "border-2 rounded-xl border-red-600 text-red-600";
    if (record.time_in && record.shift_start_time) {
      const [checkInHours, checkInMinutes] = record.time_in.split(':').map(Number);
      const [shiftHours, shiftMinutes] = record.shift_start_time.split(':').map(Number);
      const checkInTime = new Date();
      checkInTime.setHours(checkInHours, checkInMinutes, 0, 0);
      const shiftStart = new Date();
      shiftStart.setHours(shiftHours, shiftMinutes, 0, 0);
      const oneHourAfterShift = new Date(shiftStart.getTime() + 60 * 60 * 1000);
      return checkInTime > oneHourAfterShift
        ? "border-2 rounded-xl border-amber-600 text-amber-600"
        : "border-2 rounded-xl border-blue-600 text-blue-600";
    }
    return "border-2 rounded-xl border-blue-600 text-blue-600";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Record #{index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Employee:</strong> {record.employee_name}</p>
        <p><strong>Date:</strong> {record.date}</p>
        <p>
          <strong>Status:</strong>{" "}
          <Badge variant="outline" className={getStatusColor(record)}>
            {getStatusText(record)}
          </Badge>
        </p>
        <p><strong>Check In:</strong> {record.time_in || "-"}</p>
        <p><strong>Check Out:</strong> {record.time_out || "-"}</p>
        <p><strong>Working Hours:</strong> {record.total_working_hours || "-"}</p>
        <p><strong>Over Time:</strong> {record.overtime || "-"}</p>
      </CardContent>
    </Card>
  );
};

const EmployeeAttendanceRecords = ({ allRecords, selectedEmployeeId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  const filteredData = useMemo(() => {
    let filtered = [...allRecords];

    // Group records by employee_id and date, keeping the earliest check-in
    const groupedRecords = {};
    filtered.forEach((record) => {
      const key = `${record.employee_id}-${record.date}`;
      if (
        !groupedRecords[key] ||
        (record.time_in &&
          (!groupedRecords[key].time_in ||
            record.time_in < groupedRecords[key].time_in))
      ) {
        groupedRecords[key] = record;
      }
    });
    filtered = Object.values(groupedRecords);

    // Filter by selected employee if not "all"
    if (selectedEmployeeId !== "all") {
      filtered = filtered.filter(
        (record) => record.employee_id === selectedEmployeeId
      );
    }

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.date?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";
        if (sortConfig.key === "date") {
          return sortConfig.direction === "asc"
            ? new Date(valueA) - new Date(valueB)
            : new Date(valueB) - new Date(valueA);
        }
        if (sortConfig.key === "total_working_hours" || sortConfig.key === "overtime") {
          const numA = parseFloat(valueA) || 0;
          const numB = parseFloat(valueB) || 0;
          return sortConfig.direction === "asc" ? numA - numB : numB - numA;
        }
        return sortConfig.direction === "asc"
          ? valueA.toString().localeCompare(valueB.toString())
          : valueB.toString().localeCompare(valueA.toString());
      });
    }
    return filtered;
  }, [searchTerm, sortConfig, allRecords, selectedEmployeeId]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentAttendance = filteredData.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(filteredData.length / postsPerPage);

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
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
  };

  const calculateSummaryStats = () => {
  const totalRecords = filteredData.length;

  const presentRecords = filteredData.filter((r) => {
    if (r.type === "leave" || !r.time_in || !r.shift_start_time) return false;

    const [inHour, inMinute] = r.time_in.split(':').map(Number);
    const [shiftHour, shiftMinute] = r.shift_start_time.split(':').map(Number);

    const checkIn = new Date();
    checkIn.setHours(inHour, inMinute, 0, 0);

    const shiftStart = new Date();
    shiftStart.setHours(shiftHour, shiftMinute, 0, 0);

    const oneHourAfterShift = new Date(shiftStart.getTime() + 60 * 60 * 1000);

    return checkIn <= oneHourAfterShift;
  }).length;

  const leaveRecords = filteredData.filter((r) => r.type === "leave").length;

  const lateRecords = filteredData.filter((r) => {
    if (r.type === "leave" || !r.time_in || !r.shift_start_time) return false;

    const [inHour, inMinute] = r.time_in.split(':').map(Number);
    const [shiftHour, shiftMinute] = r.shift_start_time.split(':').map(Number);

    const checkIn = new Date();
    checkIn.setHours(inHour, inMinute, 0, 0);

    const shiftStart = new Date();
    shiftStart.setHours(shiftHour, shiftMinute, 0, 0);

    const oneHourAfterShift = new Date(shiftStart.getTime() + 60 * 60 * 1000);

    return checkIn > oneHourAfterShift;
  }).length;

  // Convert HH:MM:SS to hours (decimal) for summation
  const totalWorkHours = filteredData.reduce((sum, r) => {
    if (r.total_working_hours && r.total_working_hours !== "00:00:00") {
      const [hours, minutes, seconds] = r.total_working_hours.split(':').map(Number);
      const hoursInDecimal = hours + minutes / 60 + seconds / 3600;
      return sum + hoursInDecimal;
    }
    return sum;
  }, 0);

  return { totalRecords, presentRecords, leaveRecords, lateRecords, totalWorkHours };
};


  const stats = calculateSummaryStats();

  const getWorkingHoursColor = (hours) => {
    const numericHours = parseFloat(hours) || 0;
    return numericHours < 8 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white";
  };

  const getStatusColor = (record) => {
    if (record.type === "leave") return "bg-rose-600 text-white";
    if (record.time_in && record.shift_start_time) {
      const [checkInHours, checkInMinutes] = record.time_in.split(':').map(Number);
      const [shiftHours, shiftMinutes] = record.shift_start_time.split(':').map(Number);
      const checkInTime = new Date();
      checkInTime.setHours(checkInHours, checkInMinutes, 0, 0);
      const shiftStart = new Date();
      shiftStart.setHours(shiftHours, shiftMinutes, 0, 0);
      const oneHourAfterShift = new Date(shiftStart.getTime() + 60 * 60 * 1000);
      return checkInTime > oneHourAfterShift ? "bg-amber-600 text-white" : "bg-emerald-600 text-white";
    }
    return "bg-emerald-600 text-white";
  };

  const getStatusText = (record) => {
    if (record.type === "leave") return "Leave";
    if (record.time_in && record.shift_start_time) {
      const [checkInHours, checkInMinutes] = record.time_in.split(':').map(Number);
      const [shiftHours, shiftMinutes] = record.shift_start_time.split(':').map(Number);
      const checkInTime = new Date();
      checkInTime.setHours(checkInHours, checkInMinutes, 0, 0);
      const shiftStart = new Date();
      shiftStart.setHours(shiftHours, shiftMinutes, 0, 0);
      const oneHourAfterShift = new Date(shiftStart.getTime() + 60 * 60 * 1000);
      return checkInTime > oneHourAfterShift ? "Late" : "Present";
    }
    return "Present";
  };

  return (
    <div className="p-2 sm:p-4">
      {allRecords.length === 0 ? (
        <Alert variant="destructive" className="text-center my-4">
          No attendance records available.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Attendance Summary</h5>
                <p className="text-gray-500 text-sm">Overview of employee attendance records</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-5 border-t min-w-full" style={{ minWidth: "750px" }}>
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
                  <p className="text-gray-500 text-sm">Present</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.presentRecords}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round((stats.presentRecords / (stats.totalRecords || 1)) * 100)}%
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Late</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.lateRecords}
                    <span className="text-xs font-normal bg-amber-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round((stats.lateRecords / (stats.totalRecords || 1)) * 100)}%
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Leave</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.leaveRecords}
                    <span className="text-xs font-normal bg-red-500 text-white px-2 py-1 rounded-full ml-1">
                      {Math.round((stats.leaveRecords / (stats.totalRecords || 1)) * 100)}%
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">Total Hours</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalWorkHours.toFixed(2)}
                    <span className="text-xs font-normal bg-gray-500 text-white px-2 py-1 rounded-full ml-1">
                      Hrs
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
              <div className="mt-2 md:mt-0 flex gap-3">
                <div className="relative max-w-xs">
                  <input
                    type="text"
                    className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
                    placeholder="Search by name or date"
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
                <Button
                  onClick={handleResetFilter}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded"
                >
                  Reset
                </Button>
              </div>
            </div>
            {filteredData.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                <p>No attendance records found.</p>
                <Button
                  onClick={handleResetFilter}
                  className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="list" className="min-h-full">
                <div className="flex justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="list"><List /></TabsTrigger>
                    <TabsTrigger value="card"><Grid /></TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="list">
                  <div className="border rounded-lg overflow-hidden">
                    <Table className="table-auto">
                      <TableHeader>
                        <TableRow className="bg-gray-200">
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("id")}
                          >
                            S.No {getSortIcon("id")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("employee_name")}
                          >
                            Employee Name {getSortIcon("employee_name")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("date")}
                          >
                            Date {getSortIcon("date")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("type")}
                          >
                            Status {getSortIcon("type")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("time_in")}
                          >
                            Check In {getSortIcon("time_in")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("time_out")}
                          >
                            Check Out {getSortIcon("time_out")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("total_working_hours")}
                          >
                            Working Hours {getSortIcon("total_working_hours")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("overtime")}
                          >
                            Over Time {getSortIcon("overtime")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentAttendance.map((record, index) => {
                          const statusText = getStatusText(record);
                          const statusColor = getStatusColor(record);
                          const workingHoursColor = getWorkingHoursColor(record.total_working_hours);
                          return (
                            <TableRow key={record.id} className="text-base">
                              <TableCell>{indexOfFirstPost + index + 1}</TableCell>
                              <TableCell>{record.employee_name}</TableCell>
                              <TableCell>{record.date || new Date().toLocaleDateString()}</TableCell>
                              <TableCell>
                                <span
                                  className={`${statusColor} px-3 py-1 rounded-md text-xs inline-block w-20 text-center`}
                                >
                                  {statusText}
                                </span>
                              </TableCell>
                              <TableCell>{record.time_in || "N/A"}</TableCell>
                              <TableCell>{record.time_out || "N/A"}</TableCell>
                              <TableCell>
                                <span
                                  className={`${workingHoursColor} px-3 py-1 rounded-md text-xs inline-block w-20 text-center`}
                                >
                                  {record.total_working_hours || "0"}
                                </span>
                              </TableCell>
                              <TableCell>{record.overtime || "N/A"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="card">
                  <ScrollArea className="h-[calc(100vh-14rem)] w-full">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {currentAttendance.map((record, index) => (
                        <AttendanceCard key={record.id} record={record} index={indexOfFirstPost + index} />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
            {filteredData.length > 0 && (
              <div className="flex justify-end items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <ChevronLeft />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <ChevronRight />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const EmployeeAttendance = () => {
  const queryClient = useQueryClient();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("all");

  const { data: employees = [], isFetching: isFetchingEmployees, isError: isErrorEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    placeholderData: [],
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const { data: allRecords = [], isFetching: isFetchingRecords, isError: isErrorRecords } = useQuery({
    queryKey: ["all_employee_attendance"],
    queryFn: fetchAllAttendanceRecords,
    placeholderData: [],
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries(["employees"]);
    queryClient.invalidateQueries(["all_employee_attendance"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {(isFetchingEmployees || isFetchingRecords) ? (
        <SkeletonLoading />
      ) : isErrorEmployees || isErrorRecords ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load data. Please try again.
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">Employee Attendance</h5>
              <p className="text-gray-500 text-sm">Select an employee to view attendance records</p>
            </div>
            <div className="mt-2 md:mt-0 flex gap-3">
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger className="w-full md:w-[200px] rounded-full border-gray-300 focus:ring-2 focus:ring-purple-500">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.length === 0 ? (
                    <div className="text-center text-gray-500 py-2">
                      No employees available
                    </div>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.employee_id} value={employee.employee_id}>
                        {employee.employee_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleRefresh}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh
              </Button>
            </div>
          </div>
          <EmployeeAttendanceRecords allRecords={allRecords} selectedEmployeeId={selectedEmployeeId} />
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;