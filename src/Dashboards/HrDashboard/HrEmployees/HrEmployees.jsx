// import { DataGrid, GridToolbar, renderActionsCell } from "@mui/x-data-grid";
// import axios from "axios";
// import { Edit, Trash2Icon, UserCircle, UserPlus } from "lucide-react";
// import React, { useEffect } from "react";
// import { useState } from "react";
// import AddHrEmployee from "./AddHrEmployee";
// import UpdateHrEmployee from "./UpdateHrEmployee";
// import Default_img from '../../../assets/Images/Default_user_image.png'
// import { toast } from "react-toastify";

// const apiBaseUrl = process.env.VITE_BASE_API;

// // table component

// // main page
// const HrEmployees = () => {
//   const [employeeList, setEmployeeList] = useState({});
//   const [departmentList, setDepartmentList] = useState([{}]);
//   const [shiftList, setShiftList] = useState([{}]);
//   const [addEmployeePopup, setAddEmployeePopup] = useState(false);
//   const [updateEmployeePopup, setUpdateEmployeePopup] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   const fetchEmployeeList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`);
//     setEmployeeList(
//       data.map((employee) => ({
//         id: employee.employee_id, // Replace with manager.id if available
//         username: employee.username,
//         email: employee.email,
//         role: employee.role,
//         department_name: employee.department_name,
//         shift:employee.shift,
//         dob: employee.dob,
//         hiredDate: employee.hired_date,
//         gender: employee.gender,
//         avatar: employee.employee_image, // Ensure API returns this field
//       }))
//     );
//     console.log(data);
//   };

//   // Fetch Department List
//   const fetchDepartmentList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/admin/overall-departments/`);
//     setDepartmentList(data);
//     console.log(data);
//   };

//   // Fetch Shift List
//   const fetchShiftList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/admin/show-shift/`);
//     setShiftList(data);
//     console.log(data);
//   };

//   useEffect(() => {
//     fetchEmployeeList();
//     fetchDepartmentList();
//     fetchShiftList();
//   }, []);

//   const handleEdit = (row) => {
//     setSelectedEmployee(row);
//     setUpdateEmployeePopup(true);
//   };

//   const handleDelete = async (row) => {
//     if (!window.confirm(`Are you sure you want to delete Employee ID ${row.id}?`)) {
//       return; // If user cancels, do nothing
//     }

//     try {
//       await axios.delete(`${apiBaseUrl}/admin/employees/delete/${row.id}/`);
//       toast.success(`Employee ID ${row.id} deleted successfully.`);

//       await fetchEmployeeList(); // Ensure the list updates immediately
//     } catch (error) {
//       console.error("Error deleting employee:", error);
//       toast.error("Failed to delete employee. Please try again.");
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
//             src={params.row.avatar || Default_img} // Ensure valid image
//             alt={params.row.username || "Employee"}
//             height={40}
//             width={40}
//             className="rounded-full object-cover"
//             onError={(e) => (e.target.src = Default_img)} // Fallback on error
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
//           <h3 className="text-2xl font-semibold">Employee List</h3>
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//             onClick={() => setAddEmployeePopup(true)}
//           >
//             <UserPlus size={20} />
//             Add Employee
//           </button>
//         </div>

//         <DataGrid
//           rows={employeeList}
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

//         {/* Add Employee Modal */}
//         {addEmployeePopup && (
//           <AddHrEmployee
//             setAddEmployeePopup={setAddEmployeePopup}
//             DepartmentList={departmentList}
//             ShiftList={shiftList}
//           />
//         )}

//         {/* Update Employee Modal */}
//         {updateEmployeePopup && selectedEmployee && (
//          <UpdateHrEmployee
//           setUpdateEmployeePopup={setUpdateEmployeePopup}
//            employeeId={selectedEmployee.id} // Pass managerId explicitly
//            DepartmentList={departmentList}
//            ShiftList={shiftList}
//            fetchEmployeeList={fetchEmployeeList}
//          />
//         )}
//       </div>
//     </>
//   );
// };

// export default HrEmployees;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, UserPlus, Menu } from "lucide-react";
import { toast } from "react-toastify";
import AddHrEmployee from "./AddHrEmployee";
import UpdateHrEmployee from "./UpdateHrEmployee";
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

const EmployeeList = () => {
  const [employeeList, setEmployeeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [addEmployeePopup, setAddEmployeePopup] = useState(false);
  const [updateEmployeePopup, setUpdateEmployeePopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployeeList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`);
      setEmployeeList(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
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
    fetchEmployeeList();
    fetchDepartmentList();
    fetchShiftList();
  }, []);

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setUpdateEmployeePopup(true);
  };

  const handleDelete = async (employee) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Employee ID ${employee.employee_id}?`,
      )
    ) {
      return;
    }
    try {
      await axios.delete(
        `${apiBaseUrl}/admin/employees/delete/${employee.employee_id}/`,
      );
      toast.success(
        `Employee ID ${employee.employee_id} deleted successfully.`,
      );
      fetchEmployeeList();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee. Please try again.");
    }
  };

  return (
    <div className="h-full min-h-screen p-4 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Employee List</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setAddEmployeePopup(true)}
        >
          <UserPlus size={20} /> Add Employee
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
            {employeeList.map((employee, index) => (
              <TableRow key={employee.employee_id}>
                <TableCell>{employee.employee_id}</TableCell>
                <TableCell>{employee.employee_name}</TableCell>
                <TableCell>{employee.username}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>
                  {departmentList.find((dep) => dep.id === employee.department)
                    ?.department_name || "N/A"}
                </TableCell>
                <TableCell>{employee.shift}</TableCell>
                <TableCell>{employee.dob}</TableCell>
                <TableCell>{employee.hired_date}</TableCell>
                <TableCell>{employee.gender}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Menu />
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

      {addEmployeePopup && (
        <AddHrEmployee
          setAddEmployeePopup={setAddEmployeePopup}
          DepartmentList={departmentList}
          ShiftList={shiftList}
        />
      )}
      {updateEmployeePopup && selectedEmployee && (
        <UpdateHrEmployee
          setUpdateEmployeePopup={setUpdateEmployeePopup}
          employeeId={selectedEmployee.employee_id}
          DepartmentList={departmentList}
          ShiftList={shiftList}
          fetchEmployeeList={fetchEmployeeList}
        />
      )}
    </div>
  );
};

export default EmployeeList;
