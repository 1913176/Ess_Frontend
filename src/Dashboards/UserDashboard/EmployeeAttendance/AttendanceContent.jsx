import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

axios.defaults.withCredentials = true;
const apiBaseUrl = process.env.VITE_BASE_API;

const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

const SkeletonLoading = () => {
  return (
    <div className="space-y-4">
      {/* Desktop Skeleton */}
      <div className="hidden sm:block space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-6 space-y-3 p-4">
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className="sm:hidden space-y-4 p-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Cards */}
        <div className="mt-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-200 rounded-lg space-y-3 animate-pulse">
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-1">
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EmployeeAttendanceContent = ({ setIsOpenForm }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState("");
  
  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Last 7 days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Edit states
  const [editRecord, setEditRecord] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTimeIn, setEditedTimeIn] = useState("");
  const [editedTimeOut, setEditedTimeOut] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  
  const [summaryStats, setSummaryStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    totalHours: 0
  });

  console.log("employee_id", userInfo.employee_id);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/employee/employee-attendance-history/${userInfo.employee_id}/`
        );

        if (response.status === 200) {
          const records = response.data.all_records || [];
          // Ensure one record per day by keeping the first record for each date
          const uniqueRecords = [];
          const dateMap = new Map();
          
          records.forEach(record => {
            if (record.date && !dateMap.has(record.date)) {
              dateMap.set(record.date, true);
              uniqueRecords.push(record);
            }
          });

          setAttendanceData(uniqueRecords);
          setFilteredData(uniqueRecords);
          calculateSummaryStats(uniqueRecords);
        } else {
          setError("Failed to fetch attendance data.");
        }
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to fetch attendance data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const calculateSummaryStats = (records) => {
    if (records.length > 0) {
      let present = 0;
      let late = 0;
      let absent = 0;
      let totalHours = 0;

      records.forEach(record => {
        if (record.type === "leave") {
          absent += 1;
        } else if (record.type === "attendance") {
          present += 1;

          if (record.time_in && record.shift_start_time) {
            const [checkInHours, checkInMinutes] = record.time_in.split(':').map(Number);
            const [shiftHours, shiftMinutes] = record.shift_start_time.split(':').map(Number);
            const checkInTime = new Date();
            checkInTime.setHours(checkInHours, checkInMinutes, 0, 0);
            const shiftStart = new Date();
            shiftStart.setHours(shiftHours, shiftMinutes, 0, 0);
            const oneHourAfterShift = new Date(shiftStart.getTime() + 60 * 60 * 1000);

            if (checkInTime > oneHourAfterShift) {
              late += 1;
            }
          }

          if (record.total_working_hours) {
            const [hours, minutes, seconds] = record.total_working_hours.split(':').map(Number);
            const hoursInDecimal = hours + (minutes / 60) + (seconds / 3600);
            totalHours += hoursInDecimal;
          }
        }
      });

      setSummaryStats({
        present,
        late,
        absent,
        totalHours: totalHours.toFixed(1)
      });
    } else {
      setSummaryStats({
        present: 0,
        late: 0,
        absent: 0,
        totalHours: 0
      });
    }
  };

  useEffect(() => {
    let filtered = [...attendanceData];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.time_in?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.time_out?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Date range filter based on selected filter
    const now = new Date();
    if (selectedFilter === "Last 7 days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        return recordDate >= sevenDaysAgo && recordDate <= now;
      });
    } else if (selectedFilter === "This month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        return recordDate >= firstDay && recordDate <= now;
      });
    } else if (selectedFilter === "Last month") {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      filtered = filtered.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        return recordDate >= lastMonthStart && recordDate <= lastMonthEnd;
      });
    } else if (selectedFilter === "This year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        return recordDate >= yearStart && recordDate <= now;
      });
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        return recordDate >= start && recordDate <= end;
      });
    }
    
    setFilteredData(filtered);
    calculateSummaryStats(filtered);
  }, [searchTerm, startDate, endDate, selectedFilter, attendanceData]);

  const getWorkingHoursColor = (hours) => {
    const numericHours = parseFloat(hours) || 0;
    return numericHours < 8 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white";
  };

  const getStatusColor = (status, isLate) => {
    if (status === "leave") return "bg-rose-600 text-white";
    if (isLate) return "bg-amber-600 text-white";
    return "bg-emerald-600 text-white";
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (key === 'sno') {
        return direction === 'asc' ? a.index - b.index : b.index - a.index;
      }
      if (key === 'date') {
        return direction === 'asc' 
          ? new Date(a.date) - new Date(b.date) 
          : new Date(b.date) - new Date(a.date);
      }
      if (key === 'status') {
        const statusA = a.status === "absent" ? 0 : a.status === "permission" ? 1 : 2;
        const statusB = b.status === "absent" ? 0 : b.status === "permission" ? 1 : 2;
        return direction === 'asc' ? statusA - statusB : statusB - statusA;
      }
      if (key === 'checkIn' || key === 'checkOut') {
        const timeA = a[key === 'checkIn' ? 'time_in' : 'time_out'] || '';
        const timeB = b[key === 'checkIn' ? 'time_in' : 'time_out'] || '';
        return direction === 'asc' 
          ? timeA.localeCompare(timeB) 
          : timeB.localeCompare(timeA);
      }
      if (key === 'workingHours') {
        const hoursA = parseFloat(a.total_working_hours || 0);
        const hoursB = parseFloat(b.total_working_hours || 0);
        return direction === 'asc' ? hoursA - hoursB : hoursB - hoursA;
      }
      return 0;
    });
    setFilteredData(sortedData);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    if (filter !== "Custom range") {
      setStartDate("");
      setEndDate("");
    }
    setIsDropdownOpen(false);
  };

  const handleApplyCustomRange = () => {
    if (startDate && endDate) {
      setSelectedFilter("Custom range");
      setIsDropdownOpen(false);
    }
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setSelectedFilter("Last 7 days");
    setFilteredData(attendanceData);
    calculateSummaryStats(attendanceData);
  };

  const handleEditClick = (record) => {
    setEditRecord(record);
    setEditedTimeIn(record.time_in || "");
    setEditedTimeOut(record.time_out || "");
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editRecord) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const response = await axios.put(
        `${apiBaseUrl}/employee/update-attendance/${editRecord.id}/`,
        {
          time_in: editedTimeIn,
          time_out: editedTimeOut,
        }
      );

      if (response.status === 200) {
        // Update the local state with edited record
        const updatedData = attendanceData.map(record => 
          record.id === editRecord.id ? response.data.updated_record : record
        );
        
        // Ensure one record per day after update
        const uniqueRecords = [];
        const dateMap = new Map();
        
        updatedData.forEach(record => {
          if (record.date && !dateMap.has(record.date)) {
            dateMap.set(record.date, true);
            uniqueRecords.push(record);
          }
        });
        
        setAttendanceData(uniqueRecords);
        setFilteredData(uniqueRecords);
        calculateSummaryStats(uniqueRecords);
        setIsEditDialogOpen(false);
      }
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update attendance record.");
    } finally {
      setEditLoading(false);
    }
  };

  const renderRecord = (record, index) => {
    let statusText = "Present";
    let isLate = false;

    if (record.type === "leave") {
      statusText = "Leave";
    } else if (record.type === "attendance" && record.time_in && record.shift_start_time) {
      const [checkInHours, checkInMinutes] = record.time_in.split(':').map(Number);
      const [shiftHours, shiftMinutes] = record.shift_start_time.split(':').map(Number);
      const checkInTime = new Date();
      checkInTime.setHours(checkInHours, checkInMinutes, 0, 0);
      const shiftStart = new Date();
      shiftStart.setHours(shiftHours, shiftMinutes, 0, 0);
      const oneHourAfterShift = new Date(shiftStart.getTime() + 60 * 60 * 1000);
      isLate = checkInTime > oneHourAfterShift;
      statusText = isLate ? "Late" : "Present";
    }

    const workingHoursColor = getWorkingHoursColor(record.total_working_hours);
    const statusColor = getStatusColor(record.type, isLate);

    return { statusText, isLate, workingHoursColor, statusColor };
  };

  return (
    <div className="attendance-container p-2 sm:p-4">
      {/* Header Card */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex flex-col md:flex-row justify-between p-4">
            <div>
              <h5 className="font-semibold text-lg mb-1">My Attendance Summary</h5>
              <p className="text-gray-500 text-sm">Your attendance records for the current month</p>
            </div>
            <div className="flex items-center mt-3 md:mt-0">
              {/* <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm">
                Employee ID: {userInfo.employee_id}
              </span> */}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 border-t min-w-full" style={{ minWidth: "600px" }}>
              <div className="p-4 text-center border-r">
                <p className="text-gray-500 text-sm">Present Days</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {summaryStats.present}
                  <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                    {Math.round((summaryStats.present / (filteredData.length || 1)) * 100)}%
                  </span>
                </p>
              </div>
              <div className="p-4 text-center border-r">
                <p className="text-gray-500 text-sm">Late Login</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {summaryStats.late}
                  <span className="text-xs font-normal bg-yellow-500 text-white px-2 py-1 rounded-full ml-1">
                    {Math.round((summaryStats.late / (filteredData.length || 1)) * 100)}%
                  </span>
                </p>
              </div>
              <div className="p-4 text-center border-r">
                <p className="text-gray-500 text-sm">Absent</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {summaryStats.absent}
                  <span className="text-xs font-normal bg-red-500 text-white px-2 py-1 rounded-full ml-1">
                    {Math.round((summaryStats.absent / (filteredData.length || 1)) * 100)}%
                  </span>
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">Total Hours</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {summaryStats.totalHours}
                  <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">Hrs</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
              
      {/* Attendance Records Card */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {loading ? (
          <SkeletonLoading />
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h5 className="font-semibold text-lg">My Attendance Records</h5>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Empty left side if needed */}
              </div>
              
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
                  <input 
                    type="text" 
                    className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9" 
                    placeholder="Search" 
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
                        <i 
                          className="fas fa-times text-gray-500 cursor-pointer" 
                          onClick={() => setIsDropdownOpen(false)}
                        ></i>
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
                          <i className={`far ${option === "Last 7 days" ? "fa-clock" : 
                            option === "This month" ? "fa-calendar" : 
                            option === "Last month" ? "fa-calendar-week" : 
                            option === "This year" ? "fa-calendar-alt" : "fa-calendar-check"} mr-2`}></i>
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

                <button 
                  onClick={handleResetFilter}
                  className="px-4 py-1 bg-gray-200 hover:bg artifact_id-gray-300 rounded text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
            
            {/* Attendance Table */}
            <div className="border rounded-lg overflow-hidden">
              {error && <p className="text-center text-red-500 my-4">{error}</p>}
              {!error && filteredData.length === 0 && (
                <p className="text-center text-gray-500 my-4">No attendance data available for the selected criteria.</p>
              )}
              
              {!error && filteredData.length > 0 && (
                <div className="overflow-x-auto">
                  {/* Mobile View - Card Layout */}
                  <div className="sm:hidden space-y-4 py-2">
                    {filteredData.map((record, index) => {
                      const { statusText, isLate, workingHoursColor, statusColor } = renderRecord(record, index);
                      return (
                        <div key={record.id || index} className="bg-white border rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="font-medium">{record.date || `${new Date().toLocaleDateString()}`}</div>
                              <span className={`${statusColor} px-3 py-1 rounded-md text-xs inline-block w-20 text-center`}>
                                {statusText}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Check In</p>
                              <p>{record.time_in || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Check Out</p>
                              <p>{record.time_out || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Working Hours</p>
                              <p className={`${workingHoursColor} px-3 py-1 rounded-md inline-block w-20 text-center`}>
                                {record.total_working_hours || "0"}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditClick(record)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Desktop View - Table */}
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-200">
                          <TableHead 
                            className="bg-gray-200 cursor-pointer" 
                            onClick={() => handleSort('sno')}
                          >
                            S.No {getSortIcon('sno')}
                          </TableHead>
                          <TableHead 
                            className="bg-gray-200 cursor-pointer" 
                            onClick={() => handleSort('date')}
                          >
                            Date {getSortIcon('date')}
                          </TableHead>
                          <TableHead 
                            className="bg-gray-200 cursor-pointer" 
                            onClick={() => handleSort('status')}
                          >
                            Status {getSortIcon('status')}
                          </TableHead>
                          <TableHead 
                            className="bg-gray-200 cursor-pointer" 
                            onClick={() => handleSort('checkIn')}
                          >
                            Check In {getSortIcon('checkIn')}
                          </TableHead>
                          <TableHead 
                            className="bg-gray-200 cursor-pointer" 
                            onClick={() => handleSort('checkOut')}
                          >
                            Check Out {getSortIcon('checkOut')}
                          </TableHead>
                          <TableHead 
                            className="bg-gray-200 cursor-pointer" 
                            onClick={() => handleSort('workingHours')}
                          >
                            Working Hours {getSortIcon('workingHours')}
                          </TableHead>
                           {/* <TableHead className="bg-gray-200 w-10">
                            Actions
                          </TableHead> */}
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredData.map((record, index) => {
                          const { statusText, isLate, workingHoursColor, statusColor } = renderRecord(record, index);
                          return (
                            <TableRow key={record.id || index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{record.date || `${new Date().toLocaleDateString()}`}</TableCell>
                              <TableCell>
                                <span className={`${statusColor} px-3 py-1 rounded-md text-xs inline-block w-20 text-center`}>
                                  {statusText}
                                </span>
                              </TableCell>
                              <TableCell>{record.time_in || "N/A"}</TableCell>
                              <TableCell>{record.time_out || "N/A"}</TableCell>
                              <TableCell>
                                <span className={`${workingHoursColor} px-3 py-1 rounded-md text-xs inline-block w-20 text-center`}>
                                  {record.total_working_hours || "0"}
                                </span>
                              </TableCell>
                              {/* <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEditClick(record)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                              </TableCell> */}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
            
            {!error && filteredData.length > 0 && (
              <div className="flex justify-end items-center mt-4 flex-wrap">
                <div className="flex space-x-1">
                  <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">Previous</button>
                  <button className="px-3 py-1 border rounded text-sm bg-blue-500 text-white">1</button>
                  <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">2</button>
                  <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">3</button>
                  <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                value={editRecord?.date || ""}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time_in" className="text-right">
                Punch In
              </Label>
              <Input
                id="time_in"
                type="time"
                value={editedTimeIn}
                onChange={(e) => setEditedTimeIn(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time_out" className="text-right">
                Punch Out
              </Label>
              <Input
                id="time_out"
                type="time"
                value={editedTimeOut}
                onChange={(e) => setEditedTimeOut(e.target.value)}
                className="col-span-3"
              />
            </div>
            {editError && (
              <div className="col-span-4 text-red-500 text-sm text-center">
                {editError}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={editLoading}
            >
              {editLoading ? "Saving..." : "Request Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeAttendanceContent;