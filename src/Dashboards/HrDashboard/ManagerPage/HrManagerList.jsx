// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import axios from "axios";
// import { Edit, Trash2Icon, UserPlus } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import AddManager from "./AddManager";
// import UpdateManager from "./UpdateManager";
// import Default_img from "../../../assets/Images/Default_user_image.png";
// import { toast } from "react-toastify";

// const apiBaseUrl = process.env.VITE_BASE_API;

// const HrManagerList = () => {
//   const [managerList, setManagerList] = useState([]);
//   const [departmentList, setDepartmentList] = useState([]);
//   const [shiftList, setShiftList] = useState([]);
//   const [addManagerPopup, setAddManagerPopup] = useState(false);
//   const [updateManagerPopup, setUpdateManagerPopup] = useState(false);
//   const [selectedManager, setSelectedManager] = useState(null);

//   const fetchManagerList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
//     setManagerList(
//       data.map((manager) => ({
//         id: manager.manager_id,
//         manager_name: manager.manager_name,
//         username: manager.username,
//         email: manager.email,
//         role: manager.role,
//         department: manager.department,
//         shift: manager.shift,
//         dob: manager.dob,
//         hiredDate: manager.hired_date,
//         gender: manager.gender,
//         avatar: manager.manager_image,
//       }))
//     );
//   };

//   const fetchDepartmentList = async () => {
//     const { data } = await axios.get(
//       `${apiBaseUrl}/admin/overall-departments/`
//     );
//     setDepartmentList(data);
//   };

//   const fetchShiftList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/admin/show-shift/`);
//     setShiftList(data);
//   };

//   useEffect(() => {
//     fetchManagerList();
//     fetchDepartmentList();
//     fetchShiftList();
//   }, []);

//   const handleEdit = (row) => {
//     setSelectedManager(row);
//     setUpdateManagerPopup(true);
//   };

//   const handleDelete = async (row) => {
//     if (
//       !window.confirm(`Are you sure you want to delete Manager ID ${row.id}?`)
//     ) {
//       return; // If user cancels, do nothing
//     }

//     try {
//       await axios.delete(`${apiBaseUrl}/admin/managers/delete/${row.id}/`);
//       toast.success(`Manager ID ${row.id} deleted successfully.`);

//       await fetchManagerList(); // Ensure the list updates immediately
//     } catch (error) {
//       console.error("Error deleting manager:", error);
//       toast.error("Failed to delete manager. Please try again.");
//     }
//   };

//   const columns = [
//     { field: "id", headerName: "ID", width: 90 },
//     {
//       field: "avatar",
//       headerName: "Avatar",
//       width: 80,
//       renderCell: (params) => (
//         <div className="grid place-items-center">
//           <img
//             src={`${apiBaseUrl}${params.row.avatar}`} // Ensure valid image
//             alt={params.row.username || "Manager"}
//             height={40}
//             width={40}
//             className="rounded-full object-cover"
//             // onError={(e) => (e.target.src = Default_img)} // Fallback on error
//           />
//         </div>
//       ),
//     },

//     { field: "manager_name", headerName: "Name", width: 200 },
//     { field: "username", headerName: "User Name", width: 200 },
//     { field: "email", headerName: "Email", width: 200 },
//     { field: "role", headerName: "Role", width: 150 },
//     {
//       field: "department",
//       headerName: "Department",
//       width: 150,
//       renderCell: (params) => {
//         console.log(params.row);

//         const department = departmentList.find(
//           (dep) => dep.id === params.row.department
//         );
//         console.log(department);

//         return department ? department.department_name : "N/A"; // Return department name
//       },
//     },
//     { field: "shift", headerName: "Shift", width: 150 },
//     { field: "dob", headerName: "DOB", width: 90 },
//     { field: "hiredDate", headerName: "Hired Date", width: 150 },
//     { field: "gender", headerName: "Gender", width: 90 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 150,
//       renderCell: (params) => (
//         <div className="flex gap-2">
//           <button
//             className="btn-primary"
//             onClick={() => handleEdit(params.row)}
//           >
//             <Edit />
//           </button>
//           <button
//             className="btn-danger"
//             onClick={() => handleDelete(params.row)}
//           >
//             <Trash2Icon />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <>
//       <div className="h-full min-h-screen p-4 w-full">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-2xl font-semibold">Manager List</h3>
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//             onClick={() => setAddManagerPopup(true)}
//           >
//             <UserPlus size={20} />
//             Add Manager
//           </button>
//         </div>

//         {/* Scrollable Container for Horizontal Scrolling */}
//         <div className="overflow-y-auto h-full">
//           <DataGrid
//             rows={managerList}
//             columns={columns}
//             initialState={{
//               pagination: {
//                 paginationModel: {
//                   pageSize: 6,
//                 },
//               },
//             }}
//             slots={{ toolbar: GridToolbar }}
//             pageSizeOptions={[5, 10, 20]}
//             checkboxSelection
//             disableRowSelectionOnClick
//             sx={{
//               "& .MuiDataGrid-viewport": {
//                 overflowX: "auto", // Enable smooth horizontal scrolling
//               },
//             }}
//             className="h-full"
//           />
//         </div>

//         {/* Add Manager Modal */}
//         {addManagerPopup && (
//           <AddManager
//             setAddManagerPopup={setAddManagerPopup}
//             DepartmentList={departmentList}
//             ShiftList={shiftList}
//           />
//         )}

//         {/* Update Manager Modal */}
//         {updateManagerPopup && selectedManager && (
//           <UpdateManager
//             setUpdateManagerPopup={setUpdateManagerPopup}
//             managerId={selectedManager.id} // Pass managerId explicitly
//             DepartmentList={departmentList}
//             ShiftList={shiftList}
//             fetchManagerList={fetchManagerList}
//           />
//         )}
//       </div>
//     </>
//   );
// };

// export default HrManagerList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, UserPlus, Menu } from "lucide-react";
import { toast } from "react-toastify";
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

const apiBaseUrl = process.env.VITE_BASE_API;

const HrManagerList = () => {
  const [managerList, setManagerList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [addManagerPopup, setAddManagerPopup] = useState(false);
  const [updateManagerPopup, setUpdateManagerPopup] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  const fetchManagerList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
      setManagerList(data);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const fetchDepartmentList = async () => {
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/admin/overall-departments/`,
      );
      setDepartmentList(data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartmentList([]);
    }
  };

  const fetchShiftList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/admin/show-shift/`);
      setShiftList(data || []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      setShiftList([]);
    }
  };

  useEffect(() => {
    fetchManagerList();
    fetchDepartmentList();
    fetchShiftList();
  }, []);

  const handleEdit = (manager) => {
    setSelectedManager(manager);
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
      fetchManagerList();
    } catch (error) {
      console.error("Error deleting manager:", error);
      toast.error("Failed to delete manager. Please try again.");
    }
  };

  return (
    <div className="h-full min-h-screen p-4 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Manager List</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setAddManagerPopup(true)}
        >
          <UserPlus size={20} /> Add Manager
        </button>
      </div>

      <div className="border rounded overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Hired Date</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managerList.map((manager, index) => (
              <TableRow key={manager.manager_id}>
                <TableCell>{manager.manager_id}</TableCell>
                <TableCell>{manager.manager_name}</TableCell>
                <TableCell>{manager.username}</TableCell>
                <TableCell>{manager.email}</TableCell>
                <TableCell>{manager.role}</TableCell>
                <TableCell>
                  {departmentList.find((dep) => dep.id === manager.department)
                    ?.department_name || "N/A"}
                </TableCell>
                <TableCell>{manager.shift}</TableCell>
                <TableCell>{manager.dob}</TableCell>
                <TableCell>{manager.hired_date}</TableCell>
                <TableCell>{manager.gender}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Menu />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(manager)}>
                        <Edit className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(manager)}>
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

      {addManagerPopup && (
        <AddManager
          setAddManagerPopup={setAddManagerPopup}
          DepartmentList={departmentList}
          ShiftList={shiftList}
        />
      )}
      {updateManagerPopup && selectedManager && (
        <UpdateManager
          setUpdateManagerPopup={setUpdateManagerPopup}
          managerId={selectedManager.manager_id}
          DepartmentList={departmentList}
          ShiftList={shiftList}
          fetchManagerList={fetchManagerList}
        />
      )}
    </div>
  );
};

export default HrManagerList;
