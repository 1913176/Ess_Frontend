import React, { useState, useMemo } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Edit, Trash2, UserPlus, Grid, List, Ellipsis } from "lucide-react";
import AddHRManager from "./AddHRManager";
import UpdateHRManager from "./UpdateHRManager";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import UserCard from "@/components/UserCard";
import DefaultImage from "@/assets/Images/Default_user_image.png";

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

const fetchHrList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/api/hr_list/`);
  return data || [];
};

const fetchDepartmentList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/admin/overall-departments/`);
  return data || [];
};

const fetchShiftList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/admin/show-shift/`);
  return data || [];
};

const fetchLocationList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/admin/overall-location/`);
  return data || [];
};

const ManagerHRList = () => {
  const queryClient = useQueryClient();
  const [addHrPopup, setAddHrPopup] = useState(false);
  const [updateHrPopup, setUpdateHrPopup] = useState(false);
  const [selectedHr, setSelectedHr] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: hrList = [], isFetching: isFetchingHr, isError: isErrorHr } = useQuery({
    queryKey: ["hr"],
    queryFn: fetchHrList,
    placeholderData: [],
    staleTime: 60 * 1000, // 60 seconds
    refetchOnWindowFocus: false,
  });

  const { data: departmentList = [], isFetching: isFetchingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentList,
    placeholderData: [],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: shiftList = [], isFetching: isFetchingShifts } = useQuery({
    queryKey: ["shifts"],
    queryFn: fetchShiftList,
    placeholderData: [],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: locationList = [], isFetching: isFetchingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocationList,
    placeholderData: [],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredData = useMemo(() => {
    let filtered = [...hrList];
    if (searchTerm) {
      filtered = filtered.filter(
        (hr) =>
          hr.hr_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hr.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hr.hr_id?.toString().includes(searchTerm)
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
  }, [searchTerm, sortConfig, hrList]);

  const calculateSummaryStats = () => {
    const totalHr = hrList.length;
    const maleHr = hrList.filter((h) => h.gender === "Male").length;
    const femaleHr = hrList.filter((h) => h.gender === "Female").length;
    const departmentsCovered = new Set(hrList.map((h) => h.department)).size;
    return { totalHr, maleHr, femaleHr, departmentsCovered };
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

  const handleEdit = (hr) => {
    setSelectedHr(hr.hr_id);
    setUpdateHrPopup(true);
  };

  const handleDelete = async (hr) => {
    if (!window.confirm(`Are you sure you want to delete HR ID ${hr.hr_id}?`)) {
      return;
    }
    try {
      await axios.delete(`${apiBaseUrl}/admin/hrs/delete/${hr.hr_id}/`);
      toast.success(`HR ID ${hr.hr_id} deleted successfully.`);
      queryClient.invalidateQueries(["hr"]);
    } catch (error) {
      toast.error("Failed to delete HR. Please try again.");
    }
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["hr"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {(isFetchingHr || isFetchingDepartments || isFetchingShifts || isFetchingLocations) ? (
        <SkeletonLoading />
      ) : (isErrorHr) ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load HR data. Please try again.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">HR Summary</h5>
                <p className="text-gray-500 text-sm">Overview of HR details</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 border-t min-w-full" style={{ minWidth: "600px" }}>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Total HR</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalHr}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      HR
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Male HR</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.maleHr}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      Male
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Female HR</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.femaleHr}
                    <span className="text-xs font-normal bg-pink-500 text-white px-2 py-1 rounded-full ml-1">
                      Female
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">Departments Covered</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.departmentsCovered}
                    <span className="text-xs font-normal bg-orange-500 text-white px-2 py-1 rounded-full ml-1">
                      Depts
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h5 className="font-semibold text-lg">HR Records</h5>
              </div>
              <div className="mt-2 md:mt-0 flex gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  onClick={() => setAddHrPopup(true)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Add HR
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
                      placeholder="Search by name, email, or ID"
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
                </div>
              </div>
            )}
            <Tabs defaultValue="list" className="min-h-full">
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
                <TabsList>
                  <TabsTrigger value="list"><List /></TabsTrigger>
                  <TabsTrigger value="card"><Grid /></TabsTrigger>
                </TabsList>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                  <Button
                    onClick={handleRefresh}
                    className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                  >
                    <i className="fas fa-sync-alt mr-2"></i> Refresh
                  </Button>
                  <Button
                    onClick={handleResetFilter}
                    className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <TabsContent value="list">
                {hrList.length === 0 ? (
                  <p className="text-center text-gray-500 my-4">
                    No HR records available.
                  </p>
                ) : filteredData.length === 0 ? (
                  <div className="text-center text-gray-500 my-4">
                    <p>No HR records found.</p>
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
                        <TableRow className="text-base bg-slate-100">
                          <TableCell onClick={() => handleSort("hr_id")} className="cursor-pointer">
                            ID {getSortIcon("hr_id")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("hr_name")} className="cursor-pointer">
                            Name {getSortIcon("hr_name")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("username")} className="cursor-pointer">
                            Username {getSortIcon("username")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("department")} className="cursor-pointer">
                            Department {getSortIcon("department")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("shift")} className="cursor-pointer">
                            Shift {getSortIcon("shift")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("location")} className="cursor-pointer">
                            Location {getSortIcon("location")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("hired_date")} className="cursor-pointer">
                            Hired Date {getSortIcon("hired_date")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("gender")} className="cursor-pointer">
                            Gender {getSortIcon("gender")}
                          </TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((hr) => (
                          <TableRow key={hr.hr_id}>
                            <TableCell className="font-medium text-sm">
                              {hr.hr_id}
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <img
                                src={hr.hr_image || DefaultImage}
                                alt={hr.hr_name}
                                className="size-10 rounded-full object-cover border"
                                onError={(e) => {
                                  e.target.src = DefaultImage;
                                }}
                              />
                              <p className="flex flex-col">
                                <span className="font-semibold text-base">
                                  {hr.hr_name}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  {hr.email}
                                </span>
                              </p>
                            </TableCell>
                            <TableCell className="text-base">
                              {hr.username}
                            </TableCell>
                            <TableCell className="text-base">
                              {departmentList.find((dep) => dep.id === hr.department)?.department_name || "N/A"}
                            </TableCell>
                            <TableCell className="text-base">
                              {shiftList.find((shift) => shift.id === hr.shift)?.shift_number}
                            </TableCell>
                            <TableCell className="text-base">
                              {locationList.find((loc) => loc.id === hr.location)?.location_name || "N/A"}
                            </TableCell>
                            <TableCell className="text-base">
                              {hr.hired_date}
                            </TableCell>
                            <TableCell>
                              {hr.gender === "Male" ? (
                                <Badge
                                  variant="outline"
                                  className="border-green-600 text-green-600 rounded-full text-sm"
                                >
                                  {hr.gender}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-blue-600 text-blue-600 rounded-full text-sm"
                                >
                                  {hr.gender}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <Ellipsis />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleEdit(hr)}>
                                    <Edit className="mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(hr)}>
                                    <Trash2 className="mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="card">
                <ScrollArea className="h-[calc(100vh-14rem)] w-full">
                  {hrList.length === 0 ? (
                    <p className="text-center text-gray-500 my-4">
                      No HR records available.
                    </p>
                  ) : filteredData.length === 0 ? (
                    <div className="text-center text-gray-500 my-4">
                      <p>No HR records found.</p>
                      <Button
                        onClick={handleResetFilter}
                        className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                      {filteredData.map((hr) => (
                        <UserCard key={hr.hr_id} user={hr} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          {addHrPopup && (
            <AddHRManager
              open={addHrPopup}
              setOpen={setAddHrPopup}
              DepartmentList={departmentList}
              ShiftList={shiftList}
              fetchHrList={() => queryClient.invalidateQueries(["hr"])}
            />
          )}
          {updateHrPopup && (
            <UpdateHRManager
              open={updateHrPopup}
              setOpen={setUpdateHrPopup}
              hrId={selectedHr}
              DepartmentList={departmentList}
              ShiftList={shiftList}
              fetchHrList={() => queryClient.invalidateQueries(["hr"])}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ManagerHRList;