import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
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

const fetchManagers = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
  return data || [];
};

const fetchAttendanceRecords = async (managerId) => {
  if (!managerId) return [];
  const { data } = await axios.get(`${apiBaseUrl}/admin/manager-attendance-history/`, {
    params: { manager_id: managerId },
  });
  return data.all_records.map((record, index) => ({
    id: `${managerId}-${record.date}-${index}`,
    ...record,
  })) || [];
};

const fetchAllAttendanceRecords = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/admin_all_managers_attendance_history`);
  return data.all_records || [];
};

const AttendanceCard = ({ record, index }) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle className="text-base">Record #{index + 1}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <p><strong>Manager:</strong> {record.manager_name}</p>
      <p><strong>Date:</strong> {record.date}</p>
      <p>
        <strong>Type:</strong>{" "}
        {record.type === "on leave" ? (
          <Badge variant="outline" className="border-2 rounded-xl border-red-600 text-red-600">
            Leave
          </Badge>
        ) : (
          <Badge variant="outline" className="border-2 rounded-xl border-blue-600 text-blue-600">
            Present
          </Badge>
        )}
      </p>
      <p><strong>Time In:</strong> {record.time_in}</p>
      <p><strong>Time Out:</strong> {record.time_out || "-"}</p>
      <p><strong>Work Time:</strong> {record.total_working_hours || "-"}</p>
      <p><strong>Over Time:</strong> {record.overtime || "-"}</p>
    </CardContent>
  </Card>
);

const ManagerAttendanceRecords = ({ managerId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  const { data: attendanceRecords = [], isFetching: isFetchingAttendance, isError: isErrorAttendance } = useQuery({
    queryKey: ["attendance", managerId],
    queryFn: () => fetchAttendanceRecords(managerId),
    placeholderData: [],
    staleTime: 5000,
    enabled: !!managerId,
    refetchOnWindowFocus: false,
  });

  const { data: allAttendanceRecords = [], isFetching: isFetchingAllAttendance } = useQuery({
    queryKey: ["all_manager_attendance"],
    queryFn: fetchAllAttendanceRecords,
    placeholderData: [],
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const attendanceData = managerId ? attendanceRecords : allAttendanceRecords;

  const filteredData = useMemo(() => {
    let filtered = [...attendanceData];
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.date?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
          ? valueA.toString().localeCompare(valueB.toString())
          : valueB.toString().localeCompare(valueA.toString());
      });
    }
    return filtered;
  }, [searchTerm, sortConfig, attendanceData]);

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
    const presentRecords = filteredData.filter((r) => r.type !== "on leave").length;
    const leaveRecords = filteredData.filter((r) => r.type === "on leave").length;
    const totalWorkHours = filteredData.reduce((sum, r) => sum + (parseFloat(r.total_working_hours) || 0), 0);
    return { totalRecords, presentRecords, leaveRecords, totalWorkHours };
  };

  const stats = calculateSummaryStats();

  return (
    <div className="p-2 sm:p-4">
      {(isFetchingAttendance || isFetchingAllAttendance) ? (
        <SkeletonLoading />
      ) : isErrorAttendance ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load attendance records. Please try again.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Attendance Summary</h5>
                <p className="text-gray-500 text-sm">Overview of attendance records</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 border-t min-w-full" style={{ minWidth: "600px" }}>
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
                      Present
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Leave</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.leaveRecords}
                    <span className="text-xs font-normal bg-red-500 text-white px-2 py-1 rounded-full ml-1">
                      Leave
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">Total Work Hours</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalWorkHours.toFixed(2)}
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
            <Tabs defaultValue="list" className="min-h-full">
              <div className="flex justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="list"><List /></TabsTrigger>
                  <TabsTrigger value="card"><Grid /></TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="list">
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
                  <div className="border rounded-md bg-white">
                    <Table className="table-auto">
                      <TableHeader>
                        <TableRow className="text-base bg-slate-100">
                          <TableCell onClick={() => handleSort("id")} className="cursor-pointer">
                            S.No {getSortIcon("id")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("manager_name")} className="cursor-pointer">
                            Manager Name {getSortIcon("manager_name")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("date")} className="cursor-pointer">
                            Date {getSortIcon("date")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("type")} className="cursor-pointer">
                            Type {getSortIcon("type")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("time_in")} className="cursor-pointer">
                            Time In {getSortIcon("time_in")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("time_out")} className="cursor-pointer">
                            Time Out {getSortIcon("time_out")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("total_working_hours")} className="cursor-pointer">
                            Work Time {getSortIcon("total_working_hours")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("overtime")} className="cursor-pointer">
                            Over Time {getSortIcon("overtime")}
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentAttendance.map((record, index) => (
                          <TableRow key={record.id} className="text-base">
                            <TableCell>{indexOfFirstPost + index + 1}</TableCell>
                            <TableCell>{record.manager_name}</TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>
                              {record.type === "on leave" ? (
                                <Badge
                                  variant="outline"
                                  className="border-2 rounded-xl border-red-600 text-red-600"
                                >
                                  Leave
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-2 rounded-xl border-blue-600 text-blue-600"
                                >
                                  Present
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{record.time_in}</TableCell>
                            <TableCell>{record.time_out || "-"}</TableCell>
                            <TableCell>{record.total_working_hours || "-"}</TableCell>
                            <TableCell>{record.overtime || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="card">
                <ScrollArea className="h-[calc(100vh-14rem)] w-full">
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
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {currentAttendance.map((record, index) => (
                        <AttendanceCard key={record.id} record={record} index={indexOfFirstPost + index} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
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

const ManagerAttendance = () => {
  const queryClient = useQueryClient();
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const { data: managers = [], isFetching: isFetchingManagers, isError: isErrorManagers } = useQuery({
    queryKey: ["managers"],
    queryFn: fetchManagers,
    placeholderData: [],
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries(["managers"]);
    queryClient.invalidateQueries(["attendance"]);
    queryClient.invalidateQueries(["all_manager_attendance"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetchingManagers ? (
        <SkeletonLoading />
      ) : isErrorManagers ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load manager list. Please try again.
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">Manager Attendance</h5>
              <p className="text-gray-500 text-sm">Select a manager to view attendance records</p>
            </div>
            <div className="mt-2 md:mt-0 flex gap-3">
              <select
                className="form-select rounded-full pl-3 pr-10 border-gray-300 text-sm h-9"
                onChange={(e) => setSelectedManagerId(e.target.value)}
                value={selectedManagerId}
              >
                <option value="">All Managers</option>
                {managers.map((manager) => (
                  <option value={manager.manager_id} key={manager.manager_id}>
                    {manager.manager_name}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleRefresh}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh
              </Button>
            </div>
          </div>
          <ManagerAttendanceRecords managerId={selectedManagerId} />
        </div>
      )}
    </div>
  );
};

export default ManagerAttendance;