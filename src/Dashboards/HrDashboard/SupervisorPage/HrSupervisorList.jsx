// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import axios from "axios";
// import { Edit, Trash2Icon, UserPlus } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import AddSupervisor from "./AddSupervisor";
// import UpdateSupervisor from "./UpdateSupervisor";
// import Default_img from '../../../assets/Images/Default_user_image.png'
// import { toast } from "react-toastify";

// const apiBaseUrl = process.env.VITE_BASE_API;

// const HrSupervisorList = () => {
//   const [supervisorList, setSupervisorList] = useState({});
//   const [departmentList, setDepartmentList] = useState([{}]);
//   const [shiftList, setShiftList] = useState([{}]);
//   const [addSupervisorPopup, setAddSupervisorPopup] = useState(false);
//   const [updateSupervisorPopup, setUpdateSupervisorPopup] = useState(false);
//   const [selectedSupervisor, setSelectedSupervisor] = useState(null);

//   const fetchSupervisorList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/api/supervisor_list/`);
//     setSupervisorList(
//       data.map((supervisor) => ({
//         id: supervisor.supervisor_id,
//         username: supervisor.username,
//         email: supervisor.email,
//         role: supervisor.role,
//         department_name: supervisor.department_name,
//         shift: supervisor.shift,
//         dob: supervisor.dob,
//         hiredDate: supervisor.hired_date,
//         gender: supervisor.gender,
//         avatar: supervisor.supervisor_image,
//       }))
//     );
//   };

//   const fetchDepartmentList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/admin/overall-departments/`);
//     setDepartmentList(data);
//   };

//   const fetchShiftList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/admin/show-shift/`);
//     setShiftList(data);
//   };

//   useEffect(() => {
//     fetchSupervisorList();
//     fetchDepartmentList();
//     fetchShiftList();
//   }, []);

//   const handleEdit = (row) => {
//     setSelectedSupervisor(row);
//     setUpdateSupervisorPopup(true);
//   };

//   const handleDelete = async (row) => {
//     if (!window.confirm(`Are you sure you want to delete Supervisor ID ${row.id}?`)) {
//       return;
//     }

//     try {
//       await axios.delete(`${apiBaseUrl}/admin/supervisor/delete/${row.id}/`);
//       toast.success(`Supervisor ID ${row.id} deleted successfully.`);
//       await fetchSupervisorList();
//     } catch (error) {
//       console.error("Error deleting supervisor:", error);
//       toast.error("Failed to delete supervisor. Please try again.");
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
//             src={params.row.avatar || Default_img}
//             alt={params.row.username || "Supervisor"}
//             height={40}
//             width={40}
//             className="rounded-full object-cover"
//             onError={(e) => (e.target.src = Default_img)}
//           />
//         </div>
//       ),
//     },
//     { field: "username", headerName: "User Name", width: 200 },
//     { field: "email", headerName: "Email", width: 200 },
//     { field: "role", headerName: "Role", width: 150 },
//     { field: "department_name", headerName: "Department", width: 150 },
//     { field: "dob", headerName: "DOB", width: 90 },
//     { field: "hiredDate", headerName: "Hired Date", width: 150 },
//     { field: "gender", headerName: "Gender", width: 90 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 150,
//       renderCell: (params) => (
//         <div className="flex gap-2">
//           <button className="btn-primary" onClick={() => handleEdit(params.row)}>
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
//       <div className="h-full min-h-screen p-6 container mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-2xl font-semibold">Supervisor List</h3>
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//             onClick={() => setAddSupervisorPopup(true)}
//           >
//             <UserPlus size={20} />
//             Add Supervisor
//           </button>
//         </div>

//         <DataGrid
//           rows={supervisorList}
//           columns={columns}
//           initialState={{
//             pagination: {
//               paginationModel: {
//                 pageSize: 6,
//               },
//             },
//           }}
//           slots={{ toolbar: GridToolbar }}
//           pageSizeOptions={[5, 10, 20]}
//           checkboxSelection
//           disableRowSelectionOnClick
//         />

//         {addSupervisorPopup && (
//           <AddSupervisor
//             setAddSupervisorPopup={setAddSupervisorPopup}
//             DepartmentList={departmentList}
//             ShiftList={shiftList}
//           />
//         )}

//         {updateSupervisorPopup && selectedSupervisor && (
//           <UpdateSupervisor
//             setUpdateSupervisorPopup={setUpdateSupervisorPopup}
//             supervisorId={selectedSupervisor.id}
//             DepartmentList={departmentList}
//             ShiftList={shiftList}
//             fetchSupervisorList={fetchSupervisorList}
//           />
//         )}
//       </div>
//     </>
//   );
// };

// export default HrSupervisorList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, UserPlus, Menu } from "lucide-react";
import { toast } from "react-toastify";
import AddSupervisor from "./AddSupervisor";
import UpdateSupervisor from "./UpdateSupervisor";
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

const SupervisorList = () => {
  const [supervisorList, setSupervisorList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [addSupervisorPopup, setAddSupervisorPopup] = useState(false);
  const [updateSupervisorPopup, setUpdateSupervisorPopup] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  const fetchSupervisorList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/supervisor_list/`);
      setSupervisorList(data);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
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
    fetchSupervisorList();
    fetchDepartmentList();
    fetchShiftList();
  }, []);

  const handleEdit = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setUpdateSupervisorPopup(true);
  };

  const handleDelete = async (supervisor) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Supervisor ID ${supervisor.supervisor_id}?`,
      )
    ) {
      return;
    }
    try {
      await axios.delete(
        `${apiBaseUrl}/admin/supervisor/delete/${supervisor.supervisor_id}/`,
      );
      toast.success(
        `Supervisor ID ${supervisor.supervisor_id} deleted successfully.`,
      );
      fetchSupervisorList();
    } catch (error) {
      console.error("Error deleting supervisor:", error);
      toast.error("Failed to delete supervisor. Please try again.");
    }
  };

  return (
    <div className="h-full min-h-screen p-4 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Supervisor List</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setAddSupervisorPopup(true)}
        >
          <UserPlus size={20} /> Add Supervisor
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
            {supervisorList.map((supervisor, index) => (
              <TableRow key={supervisor.supervisor_id}>
                <TableCell>{supervisor.supervisor_id}</TableCell>
                <TableCell>{supervisor.supervisor_name}</TableCell>
                <TableCell>{supervisor.username}</TableCell>
                <TableCell>{supervisor.email}</TableCell>
                <TableCell>{supervisor.role}</TableCell>
                <TableCell>
                  {departmentList.find(
                    (dep) => dep.id === supervisor.department,
                  )?.department_name || "N/A"}
                </TableCell>
                <TableCell>{supervisor.shift}</TableCell>
                <TableCell>{supervisor.dob}</TableCell>
                <TableCell>{supervisor.hired_date}</TableCell>
                <TableCell>{supervisor.gender}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Menu />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(supervisor)}>
                        <Edit className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(supervisor)}
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

      {addSupervisorPopup && (
        <AddSupervisor
          setAddSupervisorPopup={setAddSupervisorPopup}
          DepartmentList={departmentList}
          ShiftList={shiftList}
        />
      )}
      {updateSupervisorPopup && selectedSupervisor && (
        <UpdateSupervisor
          setUpdateSupervisorPopup={setUpdateSupervisorPopup}
          supervisorId={selectedSupervisor.supervisor_id}
          DepartmentList={departmentList}
          ShiftList={shiftList}
          fetchSupervisorList={fetchSupervisorList}
        />
      )}
    </div>
  );
};

export default SupervisorList;
