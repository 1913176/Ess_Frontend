// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { Edit, Trash2, UserPlus, Grid, List, Ellipsis } from "lucide-react";
// import AddManager from "./AddManager";
// import UpdateManager from "./UpdateManager";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Alert } from "@/components/ui/alert";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Badge } from "@/components/ui/badge";
// import UserCard from "@/components/UserCard";
// import DefaultImage from "@/assets/Images/Default_user_image.png";

// const apiBaseUrl = process.env.VITE_BASE_API;

// const SkeletonLoading = () => {
//   return (
//     <div className="space-y-4 p-4">
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[...Array(4)].map((_, i) => (
//           <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
//         ))}
//       </div>
//       <div className="bg-gray-200 rounded-lg animate-pulse p-4">
//         <div className="h-8 bg-gray-300 rounded mb-4"></div>
//         <div className="space-y-3">
//           {[...Array(5)].map((_, j) => (
//             <div key={j} className="h-12 bg-gray-300 rounded"></div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// const fetchManagerList = async () => {
//   const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
//   return data || [];
// };

// const fetchDepartmentList = async () => {
//   const { data } = await axios.get(`${apiBaseUrl}/admin/overall-departments/`);
//   return data || [];
// };

// const fetchShiftList = async () => {
//   const { data } = await axios.get(`${apiBaseUrl}/admin/show-shift/`);
//   return data || [];
// };

// const ManagerList = () => {
//   const queryClient = useQueryClient();
//   const [addManagerPopup, setAddManagerPopup] = useState(false);
//   const [updateManagerPopup, setUpdateManagerPopup] = useState(false);
//   const [selectedManager, setSelectedManager] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
//   const [showFilters, setShowFilters] = useState(false);

//   const { data: managerList = [], isFetching: isFetchingManagers, isError: isErrorManagers } = useQuery({
//     queryKey: ["managers"],
//     queryFn: fetchManagerList,
//     placeholderData: [],
//     staleTime: 60 * 1000, // 60 seconds
//     refetchOnWindowFocus: false, // Prevent refetch on focus
//   });

//   const { data: departmentList = [], isFetching: isFetchingDepartments } = useQuery({
//     queryKey: ["departments"],
//     queryFn: fetchDepartmentList,
//     placeholderData: [],
//     staleTime: 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   const { data: shiftList = [], isFetching: isFetchingShifts } = useQuery({
//     queryKey: ["shifts"],
//     queryFn: fetchShiftList,
//     placeholderData: [],
//     staleTime: 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   const filteredData = useMemo(() => {
//     let filtered = [...managerList];
//     if (searchTerm) {
//       filtered = filtered.filter(
//         (manager) =>
//           manager.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           manager.manager_id?.toString().includes(searchTerm)
//       );
//     }
//     if (sortConfig.key) {
//       filtered.sort((a, b) => {
//         const valueA = a[sortConfig.key] || "";
//         const valueB = b[sortConfig.key] || "";
//         return sortConfig.direction === "asc"
//           ? valueA.toString().localeCompare(valueB.toString())
//           : valueB.toString().localeCompare(valueA.toString());
//       });
//     }
//     return filtered;
//   }, [searchTerm, sortConfig, managerList]);

//   const calculateSummaryStats = () => {
//     const totalManagers = managerList.length;
//     const maleManagers = managerList.filter((m) => m.gender === "Male").length;
//     const femaleManagers = managerList.filter((m) => m.gender === "Female").length;
//     const departmentsCovered = new Set(managerList.map((m) => m.department)).size;
//     return { totalManagers, maleManagers, femaleManagers, departmentsCovered };
//   };

//   const stats = calculateSummaryStats();

//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   const getSortIcon = (key) => {
//     if (sortConfig.key !== key) return "↕";
//     return sortConfig.direction === "asc" ? "↑" : "↓";
//   };

//   const handleEdit = (manager) => {
//     setSelectedManager(manager.manager_id);
//     setUpdateManagerPopup(true);
//   };

//   const handleDelete = async (manager) => {
//     if (!window.confirm(`Are you sure you want to delete Manager ID ${manager.manager_id}?`)) {
//       return;
//     }
//     try {
//       await axios.delete(`${apiBaseUrl}/admin/managers/delete/${manager.manager_id}/`);
//       toast.success(`Manager ID ${manager.manager_id} deleted successfully.`);
//       queryClient.invalidateQueries(["managers"]);
//     } catch (error) {
//       toast.error("Failed to delete manager. Please try again.");
//     }
//   };

//   const handleResetFilter = () => {
//     setSearchTerm("");
//     setShowFilters(false);
//   };

//   const handleRefresh = () => {
//     queryClient.invalidateQueries(["managers"]);
//   };

//   return (
//     <div className="p-2 sm:p-4 min-h-screen">
//       {(isFetchingManagers || isFetchingDepartments || isFetchingShifts) ? (
//         <SkeletonLoading />
//       ) : (isErrorManagers) ? (
//         <Alert variant="destructive" className="text-center my-4">
//           Failed to load manager data. Please try again.
//         </Alert>
//       ) : (
//         <>
//           <div className="bg-white rounded-lg shadow-sm mb-4">
//             <div className="flex flex-col md:flex-row justify-between p-4">
//               <div>
//                 <h5 className="font-semibold text-lg mb-1">Manager Summary</h5>
//                 <p className="text-gray-500 text-sm">Overview of manager details</p>
//               </div>
//             </div>
//             <div className="overflow-x-auto">
//               <div className="grid grid-cols-2 md:grid-cols-4 border-t min-w-full" style={{ minWidth: "600px" }}>
//                 <div className="p-4 text-center border-r">
//                   <p className="text-gray-500 text-sm">Total Managers</p>
//                   <p className="text-xl sm:text-2xl font-semibold">
//                     {stats.totalManagers}
//                     <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
//                       Managers
//                     </span>
//                   </p>
//                 </div>
//                 <div className="p-4 text-center border-r">
//                   <p className="text-gray-500 text-sm">Male Managers</p>
//                   <p className="text-xl sm:text-2xl font-semibold">
//                     {stats.maleManagers}
//                     <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
//                       Male
//                     </span>
//                   </p>
//                 </div>
//                 <div className="p-4 text-center border-r">
//                   <p className="text-gray-500 text-sm">Female Managers</p>
//                   <p className="text-xl sm:text-2xl font-semibold">
//                     {stats.femaleManagers}
//                     <span className="text-xs font-normal bg-pink-500 text-white px-2 py-1 rounded-full ml-1">
//                       Female
//                     </span>
//                   </p>
//                 </div>
//                 <div className="p-4 text-center">
//                   <p className="text-gray-500 text-sm">Departments Covered</p>
//                   <p className="text-xl sm:text-2xl font-semibold">
//                     {stats.departmentsCovered}
//                     <span className="text-xs font-normal bg-orange-500 text-white px-2 py-1 rounded-full ml-1">
//                       Depts
//                     </span>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4">
//             <div className="flex flex-col md:flex-row justify-between mb-4">
//               <div>
//                 <h5 className="font-semibold text-lg">Manager Records</h5>
//               </div>
//               <div className="mt-2 md:mt-0 flex gap-3">
//                 <Button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
//                 >
//                   {showFilters ? "Hide Filters" : "Show Filters"}
//                 </Button>
//                 <Button
//                   onClick={() => setAddManagerPopup(true)}
//                   className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
//                 >
//                   <UserPlus className="w-4 h-4 mr-2" /> Add Manager
//                 </Button>
//               </div>
//             </div>
//             {showFilters && (
//               <div className="mb-4 p-4 border border-gray-200 rounded-lg">
//                 <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
//                   <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
//                     <input
//                       type="text"
//                       className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
//                       placeholder="Search by name, email, or ID"
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                       />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <Tabs defaultValue="list" className="min-h-full">
//               <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
//                 <TabsList>
//                   <TabsTrigger value="list"><List /></TabsTrigger>
//                   <TabsTrigger value="card"><Grid /></TabsTrigger>
//                 </TabsList>
//                 <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
//                   <button
//                     onClick={handleRefresh}
//                     className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
//                   >
//                     <i className="fas fa-sync-alt mr-2"></i> Refresh
//                   </button>
//                   <button


//                     onClick={handleResetFilter}
//                     className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//                   >
//                     Reset
//                   </button>
//                 </div>
//               </div>
//               <TabsContent value="list">
//                 {managerList.length === 0 ? (
//                   <p className="text-center text-gray-500 my-4">
//                     No manager records available.
//                   </p>
//                 ) : filteredData.length === 0 ? (
//                   <div className="text-center text-gray-500 my-4">
//                     <p>No manager records found.</p>
//                     <Button
//                       onClick={handleResetFilter}
//                       className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
//                     >
//                       Clear Filters
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="border rounded-md bg-white h-full">
//                     <Table className="table-auto">
//                       <TableHeader>
//                         <TableRow className="text-base bg-slate-100">
//                           <TableCell onClick={() => handleSort("manager_id")} className="cursor-pointer">
//                             ID {getSortIcon("manager_id")}
//                           </TableCell>
//                           <TableCell onClick={() => handleSort("manager_name")} className="cursor-pointer">
//                             Name {getSortIcon("manager_name")}
//                           </TableCell>
//                           <TableCell onClick={() => handleSort("username")} className="cursor-pointer">
//                             Username {getSortIcon("username")}
//                           </TableCell>
//                           <TableCell onClick={() => handleSort("department")} className="cursor-pointer">
//                             Department {getSortIcon("department")}
//                           </TableCell>
//                           <TableCell onClick={() => handleSort("shift")} className="cursor-pointer">
//                             Shift {getSortIcon("shift")}
//                           </TableCell>
//                           <TableCell onClick={() => handleSort("hired_date")} className="cursor-pointer">
//                             Hired Date {getSortIcon("hired_date")}
//                           </TableCell>
//                           <TableCell onClick={() => handleSort("gender")} className="cursor-pointer">
//                             Gender {getSortIcon("gender")}
//                           </TableCell>
//                           <TableCell>Actions</TableCell>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {filteredData.map((manager) => (
//                           <TableRow key={manager.manager_id}>
//                             <TableCell className="font-medium text-sm">
//                               {manager.manager_id}
//                             </TableCell>
//                             <TableCell className="flex items-center gap-2">
//                               <img
//                                 src={manager.manager_image || DefaultImage}
//                                 alt={manager.manager_name}
//                                 className="size-10 rounded-full object-cover border"
//                                 onError={(e) => {
//                                   e.target.src = DefaultImage;
//                                 }}
//                               />
//                               <p className="flex flex-col">
//                                 <span className="font-semibold text-base">
//                                   {manager.manager_name}
//                                 </span>
//                                 <span className="text-muted-foreground text-sm">
//                                   {manager.email}
//                                 </span>
//                               </p>
//                             </TableCell>
//                             <TableCell className="text-base">
//                               {manager.username}
//                             </TableCell>
//                             <TableCell className="text-base">
//                               {departmentList.find((dep) => dep.id === manager.department)?.department_name || "N/A"}
//                             </TableCell>
//                             <TableCell className="text-base">
//                               {shiftList.find((shift) => shift.id === manager.shift)?.shift_number}
//                             </TableCell>
//                             <TableCell className="text-base">
//                               {manager.hired_date}
//                             </TableCell>
//                             <TableCell>
//                               {manager.gender === "Male" ? (
//                                 <Badge
//                                   variant="outline"
//                                   className="border-green-600 text-green-600 rounded-full text-sm"
//                                 >
//                                   {manager.gender}
//                                 </Badge>
//                               ) : (
//                                 <Badge
//                                   variant="outline"
//                                   className="border-blue-600 text-blue-600 rounded-full text-sm"
//                                 >
//                                   {manager.gender}
//                                 </Badge>
//                               )}
//                             </TableCell>
//                             <TableCell>
//                               <DropdownMenu>
//                                 <DropdownMenuTrigger>
//                                   <Ellipsis />
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent>
//                                   <DropdownMenuItem onClick={() => handleEdit(manager)}>
//                                     <Edit className="mr-2" /> Edit
//                                   </DropdownMenuItem>
//                                   <DropdownMenuItem onClick={() => handleDelete(manager)}>
//                                     <Trash2 className="mr-2" /> Delete
//                                   </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 )}
//               </TabsContent>
//               <TabsContent value="card">
//                 <ScrollArea className="h-[calc(100vh-14rem)] w-full">
//                   {managerList.length === 0 ? (
//                     <p className="text-center text-gray-500 my-4">
//                       No manager records available.
//                     </p>
//                   ) : filteredData.length === 0 ? (
//                     <div className="text-center text-gray-500 my-4">
//                       <p>No manager records found.</p>
//                       <Button
//                         onClick={handleResetFilter}
//                         className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
//                       >
//                         Clear Filters
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
//                       {filteredData.map((manager) => (
//                         <UserCard key={manager.manager_id} user={manager} />
//                       ))}
//                     </div>
//                   )}
//                 </ScrollArea>
//               </TabsContent>
//             </Tabs>
//           </div>
//           {addManagerPopup && (
//             <AddManager
//               open={addManagerPopup}
//               setOpen={setAddManagerPopup}
//               DepartmentList={departmentList}
//               ShiftList={shiftList}
//               fetchManagerList={() => queryClient.invalidateQueries(["managers"])}
//             />
//           )}
//           {updateManagerPopup && (
//             <UpdateManager
//               open={updateManagerPopup}
//               setOpen={setUpdateManagerPopup}
//               managerId={selectedManager}
//               DepartmentList={departmentList}
//               ShiftList={shiftList}
//               fetchManagerList={() => queryClient.invalidateQueries(["managers"])}
//             />
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default ManagerList;


import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Edit, Trash2, UserPlus, Grid, List, Ellipsis } from "lucide-react";
import AddManager from "./AddManager";
import UpdateManager from "./UpdateManager";
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
          <div
            key={i}
            className="h-24 bg-gray-200 rounded-lg animate-pulse"
          ></div>
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

const fetchManagerList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
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

const ManagerList = () => {
  const queryClient = useQueryClient();
  const [addManagerPopup, setAddManagerPopup] = useState(false);
  const [updateManagerPopup, setUpdateManagerPopup] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: managerList = [],
    isFetching: isFetchingManagers,
    isError: isErrorManagers,
  } = useQuery({
    queryKey: ["managers"],
    queryFn: fetchManagerList,
    placeholderData: [],
    staleTime: 60 * 1000, // 60 seconds
    refetchOnWindowFocus: false, // Prevent refetch on focus
  });

  const { data: departmentList = [], isFetching: isFetchingDepartments } =
    useQuery({
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

  const { data: locationList = [], isFetching: isFetchingLocations } = useQuery(
    {
      queryKey: ["locations"],
      queryFn: fetchLocationList,
      placeholderData: [],
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  const filteredData = useMemo(() => {
    let filtered = [...managerList];
    if (searchTerm) {
      filtered = filtered.filter(
        (manager) =>
          manager.manager_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manager.manager_id?.toString().includes(searchTerm),
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
  }, [searchTerm, sortConfig, managerList]);

  const calculateSummaryStats = () => {
    const totalManagers = managerList.length;
    const maleManagers = managerList.filter((m) => m.gender === "Male").length;
    const femaleManagers = managerList.filter(
      (m) => m.gender === "Female",
    ).length;
    const departmentsCovered = new Set(managerList.map((m) => m.department))
      .size;
    return { totalManagers, maleManagers, femaleManagers, departmentsCovered };
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

  const handleEdit = (manager) => {
    setSelectedManager(manager.manager_id);
    setUpdateManagerPopup(true);
  };

  const handleDelete = async (manager) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Manager ID ${manager.manager_id}?`,
      )
    ) {
      return;
    }
    try {
      await axios.delete(
        `${apiBaseUrl}/admin/managers/delete/${manager.manager_id}/`,
      );
      toast.success(`Manager ID ${manager.manager_id} deleted successfully.`);
      queryClient.invalidateQueries(["managers"]);
    } catch (error) {
      toast.error("Failed to delete manager. Please try again.");
    }
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["managers"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetchingManagers ||
      isFetchingDepartments ||
      isFetchingShifts ||
      isFetchingLocations ? (
        <SkeletonLoading />
      ) : isErrorManagers ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load manager data. Please try again.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Manager Summary</h5>
                <p className="text-gray-500 text-sm">
                  Overview of manager details
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div
                className="grid grid-cols-2 md:grid-cols-4 border-t min-w-full"
                style={{ minWidth: "600px" }}
              >
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Total Managers</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalManagers}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      Managers
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Male Managers</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.maleManagers}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      Male
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Female Managers</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.femaleManagers}
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
                <h5 className="font-semibold text-lg">Manager Records</h5>
              </div>
              <div className="mt-2 md:mt-0 flex gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  onClick={() => setAddManagerPopup(true)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Add Manager
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
                  <TabsTrigger value="list">
                    <List />
                  </TabsTrigger>
                  <TabsTrigger value="card">
                    <Grid />
                  </TabsTrigger>
                </TabsList>
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
              <TabsContent value="list">
                {managerList.length === 0 ? (
                  <p className="text-center text-gray-500 my-4">
                    No manager records available.
                  </p>
                ) : filteredData.length === 0 ? (
                  <div className="text-center text-gray-500 my-4">
                    <p>No manager records found.</p>
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
                          <TableCell
                            onClick={() => handleSort("manager_id")}
                            className="cursor-pointer"
                          >
                            ID {getSortIcon("manager_id")}
                          </TableCell>
                          <TableCell
                            onClick={() => handleSort("manager_name")}
                            className="cursor-pointer"
                          >
                            Name {getSortIcon("manager_name")}
                          </TableCell>
                          <TableCell
                            onClick={() => handleSort("username")}
                            className="cursor-pointer"
                          >
                            Username {getSortIcon("username")}
                          </TableCell>
                          <TableCell
                            onClick={() => handleSort("department")}
                            className="cursor-pointer"
                          >
                            Department {getSortIcon("department")}
                          </TableCell>
                          <TableCell
                            onClick={() => handleSort("shift")}
                            className="cursor-pointer"
                          >
                            Shift {getSortIcon("shift")}
                          </TableCell>
                          <TableCell
                            onClick={() => handleSort("location")}
                            className="cursor-pointer"
                          >
                            Location {getSortIcon("location")}
                          </TableCell>
                          <TableCell
                            onClick={() => handleSort("hired_date")}
                            className="cursor-pointer"
                          >
                            Hired Date {getSortIcon("hired_date")}
                          </TableCell>
                          <TableCell
                            onClick={() => handleSort("gender")}
                            className="cursor-pointer"
                          >
                            Gender {getSortIcon("gender")}
                          </TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((manager) => (
                          <TableRow key={manager.manager_id}>
                            <TableCell className="font-medium text-sm">
                              {manager.manager_id}
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <img
                                src={manager.manager_image || DefaultImage}
                                alt={manager.manager_name}
                                className="size-10 rounded-full object-cover border"
                                onError={(e) => {
                                  e.target.src = DefaultImage;
                                }}
                              />
                              <p className="flex flex-col">
                                <span className="font-semibold text-base">
                                  {manager.manager_name}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  {manager.email}
                                </span>
                              </p>
                            </TableCell>
                            <TableCell className="text-base">
                              {manager.username}
                            </TableCell>
                            <TableCell className="text-base">
                              {departmentList.find(
                                (dep) => dep.id === manager.department,
                              )?.department_name || "N/A"}
                            </TableCell>
                            <TableCell className="text-base">
                              {
                                shiftList.find(
                                  (shift) => shift.id === manager.shift,
                                )?.shift_number
                              }
                            </TableCell>
                            <TableCell className="text-base">
                              {locationList.find(
                                (loc) => loc.id === manager.location,
                              )?.location_name || "N/A"}
                            </TableCell>
                            <TableCell className="text-base">
                              {manager.hired_date}
                            </TableCell>
                            <TableCell>
                              {manager.gender === "Male" ? (
                                <Badge
                                  variant="outline"
                                  className="border-green-600 text-green-600 rounded-full text-sm"
                                >
                                  {manager.gender}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-blue-600 text-blue-600 rounded-full text-sm"
                                >
                                  {manager.gender}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <Ellipsis />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(manager)}
                                  >
                                    <Edit className="mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(manager)}
                                  >
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
                  {managerList.length === 0 ? (
                    <p className="text-center text-gray-500 my-4">
                      No manager records available.
                    </p>
                  ) : filteredData.length === 0 ? (
                    <div className="text-center text-gray-500 my-4">
                      <p>No manager records found.</p>
                      <Button
                        onClick={handleResetFilter}
                        className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                      {filteredData.map((manager) => (
                        <UserCard key={manager.manager_id} user={manager} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          {addManagerPopup && (
            <AddManager
              open={addManagerPopup}
              setOpen={setAddManagerPopup}
              DepartmentList={departmentList}
              ShiftList={shiftList}
              fetchManagerList={() =>
                queryClient.invalidateQueries(["managers"])
              }
            />
          )}
          {updateManagerPopup && (
            <UpdateManager
              open={updateManagerPopup}
              setOpen={setUpdateManagerPopup}
              managerId={selectedManager}
              DepartmentList={departmentList}
              ShiftList={shiftList}
              fetchManagerList={() =>
                queryClient.invalidateQueries(["managers"])
              }
            />
          )}
        </>
      )}
    </div>
  );
};

export default ManagerList;

