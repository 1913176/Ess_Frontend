import React, { useState, useMemo } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Edit, Trash2, UserPlus, Grid, List, Ellipsis } from "lucide-react";
import AddEmployee from "./AddEmployee";
import UpdateEmployee from "./UpdateEmployee";
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

const apiBaseUrl = import.meta.env.VITE_BASE_API;

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

const fetchEmployeeList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`);
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

const EmployeeList = () => {
  const queryClient = useQueryClient();
  const [addEmployeePopup, setAddEmployeePopup] = useState(false);
  const [updateEmployeePopup, setUpdateEmployeePopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: employeeList = [], isFetching: isFetchingEmployees, isError: isErrorEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployeeList,
    placeholderData: [],
    staleTime: 60 * 1000,
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
    let filtered = [...employeeList];
    if (searchTerm) {
      filtered = filtered.filter(
        (employee) =>
          employee.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.employee_id?.toString().includes(searchTerm)
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
  }, [searchTerm, sortConfig, employeeList]);

  const calculateSummaryStats = () => {
    const totalEmployees = employeeList.length;
    const maleEmployees = employeeList.filter((e) => e.gender === "Male").length;
    const femaleEmployees = employeeList.filter((e) => e.gender === "Female").length;
    const departmentsCovered = new Set(employeeList.map((e) => e.department)).size;
    return { totalEmployees, maleEmployees, femaleEmployees, departmentsCovered };
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

  const handleEdit = (employee) => {
    setSelectedEmployee(employee.employee_id);
    setUpdateEmployeePopup(true);
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete Employee ID ${employee.employee_id}?`)) {
      return;
    }
    try {
      await axios.delete(`${apiBaseUrl}/admin/employees/delete/${employee.employee_id}/`);
      toast.success(`Employee ID ${employee.employee_id} deleted successfully.`);
      queryClient.invalidateQueries(["employees"]);
    } catch (error) {
      toast.error("Failed to delete employee. Please try again.");
    }
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["employees"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {(isFetchingEmployees || isFetchingDepartments || isFetchingShifts || isFetchingLocations) ? (
        <SkeletonLoading />
      ) : (isErrorEmployees) ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load employee data. Please try again.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Employee Summary</h5>
                <p className="text-gray-500 text-sm">Overview of employee details</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 border-t min-w-full" style={{ minWidth: "600px" }}>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Total Employees</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalEmployees}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      Employees
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Male Employees</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.maleEmployees}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      Male
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Female Employees</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.femaleEmployees}
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
                <h5 className="font-semibold text-lg">Employee Records</h5>
              </div>
              <div className="mt-2 md:mt-0 flex gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  onClick={() => setAddEmployeePopup(true)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Add Employee
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
                {employeeList.length === 0 ? (
                  <p className="text-center text-gray-500 my-4">
                    No employee records available.
                  </p>
                ) : filteredData.length === 0 ? (
                  <div className="text-center text-gray-500 my-4">
                    <p>No employee records found.</p>
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
                          <TableCell onClick={() => handleSort("employee_id")} className="cursor-pointer">
                            ID {getSortIcon("employee_id")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("employee_name")} className="cursor-pointer">
                            Name {getSortIcon("employee_name")}
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
                        {filteredData.map((employee) => (
                          <TableRow key={employee.employee_id}>
                            <TableCell className="font-medium text-sm">
                              {employee.employee_id}
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <img
                                src={employee.employee_image || DefaultImage}
                                alt={employee.employee_name}
                                className="size-10 rounded-full object-cover border"
                                onError={(e) => {
                                  e.target.src = DefaultImage;
                                }}
                              />
                              <p className="flex flex-col">
                                <span className="font-semibold text-base">
                                  {employee.employee_name}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  {employee.email}
                                </span>
                              </p>
                            </TableCell>
                            <TableCell className="text-base">
                              {employee.username}
                            </TableCell>
                            <TableCell className="text-base">
                              {departmentList.find((dep) => dep.id === employee.department)?.department_name || "N/A"}
                            </TableCell>
                            <TableCell className="text-base">
                              {shiftList.find((shift) => shift.id === employee.shift)?.shift_number}
                            </TableCell>
                            <TableCell className="text-base">
                              {locationList.find((loc) => loc.id === employee.location)?.location_name || "N/A"}
                            </TableCell>
                            <TableCell className="text-base">
                              {employee.hired_date}
                            </TableCell>
                            <TableCell>
                              {employee.gender === "Male" ? (
                                <Badge
                                  variant="outline"
                                  className="border-green-600 text-green-600 rounded-full text-sm"
                                >
                                  {employee.gender}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-blue-600 text-blue-600 rounded-full text-sm"
                                >
                                  {employee.gender}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <Ellipsis />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleEdit(employee)}>
                                    <Edit className="mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(employee)}>
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
                  {employeeList.length === 0 ? (
                    <p className="text-center text-gray-500 my-4">
                      No employee records available.
                    </p>
                  ) : filteredData.length === 0 ? (
                    <div className="text-center text-gray-500 my-4">
                      <p>No employee records found.</p>
                      <Button
                        onClick={handleResetFilter}
                        className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                      {filteredData.map((employee) => (
                        <UserCard
                          key={employee.employee_id}
                          user={employee}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          {addEmployeePopup && (
            <AddEmployee
              open={addEmployeePopup}
              setOpen={setAddEmployeePopup}
              DepartmentList={departmentList}
              ShiftList={shiftList}
              fetchEmployeeList={() => queryClient.invalidateQueries(["employees"])}
            />
          )}
          {updateEmployeePopup && (
            <UpdateEmployee
              open={updateEmployeePopup}
              setOpen={setUpdateEmployeePopup}
              employeeId={selectedEmployee}
              DepartmentList={departmentList}
              ShiftList={shiftList}
              fetchEmployeeList={() => queryClient.invalidateQueries(["employees"])}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeList;