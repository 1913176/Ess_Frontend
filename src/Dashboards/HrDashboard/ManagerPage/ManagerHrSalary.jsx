// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import axios from "axios";
// import { Edit, Trash2Icon, UserPlus } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import AddManagerSalary from "./AddManagerSalary";
// import UpdateManagerSalary from "./UpdateManagerSalary";
// import Default_img from "../../../assets/Images/Default_user_image.png";
// import { toast } from "react-toastify";

// const apiBaseUrl = process.env.VITE_BASE_API;

// const ManagerHrSalary = () => {
//   const [salaryList, setSalaryList] = useState([]);
//   const [managerList, setManagerList] = useState([]);
//   const [addSalaryPopup, setAddSalaryPopup] = useState(false);
//   const [updateSalaryPopup, setUpdateSalaryPopup] = useState(false);
//   const [selectedSalary, setSelectedSalary] = useState(null);

//   const fetchSalaryList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/manager-salary/history/`);
//     // const {projects} = data
//     setSalaryList(
//       data.map((salary) => ({
//         id: salary.id,
//         user_id: salary.user_id,
//         annual_salary: salary.annual_salary,
//         bonus: salary.bonus,
//         total_salary: salary.total_salary,
//         monthly_salary: salary.monthly_salary,
//         effective_date: salary.effective_date,
//         updated_date: salary.updated_date,
//       }))
//     );
//   };

//   const fetchManagerList = async () => {
//     const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
//     setManagerList(data);
//   };

//   useEffect(() => {
//     fetchSalaryList();
//     fetchManagerList();

//   }, []);

//   const handleEdit = (row) => {
//     setSelectedSalary(row.id);
//     setUpdateSalaryPopup(true);
//   };

//   const handleDelete = async (row) => {
//     try {
//       await axios.delete(`${apiBaseUrl}/delete-manager-salary/${row.id}/`);
//       toast.success(`Salary ID ${row.id} deleted successfully.`);
//       fetchSalaryList();
//     } catch (error) {
//       toast.error("Failed to delete Salary.");
//     }
//   };

//   const columns = [
//     { field: "id", headerName: "ID", width: 90 },
//     { field: "user_id", headerName: "Manager ID", width: 90 },
//     { field: "annual_salary", headerName: "Annual Salary", width: 200 },
//     { field: "bonus", headerName: "Bonus", width: 200 },
//     { field: "total_salary", headerName: "Total Salary", width: 150 },
//     { field: "monthly_salary", headerName: "Monthly Salary", width: 150 },
//     { field: "effective_date", headerName: "Effective Date", width: 90 },
//     { field: "updated_date", headerName: "Updated Date", width: 90 },
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
//       <div className="h-full min-h-screen p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-2xl font-semibold">Manager Salary List</h3>
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//             onClick={() => setAddSalaryPopup(true)}
//           >
//             <UserPlus size={20} />
//             Add Salary
//           </button>
//         </div>

//         <DataGrid
//         rows={salaryList}
//         columns={columns}
//         getRowId={(row) => row.id} // Ensure unique ID is used
//         initialState={{
//           pagination: {
//             paginationModel: {
//               pageSize: 6,
//             },
//           },
//         }}
//         slots={{ toolbar: GridToolbar }}
//         pageSizeOptions={[5, 10, 20]}
//         checkboxSelection
//         disableRowSelectionOnClick
//       />

//         {/* Add Manager Modal */}
//         {addSalaryPopup && (
//           <AddManagerSalary
//             setAddSalaryPopup={setAddSalaryPopup}
//             ManagerList={managerList}
//             fetchSalaryList={ fetchSalaryList}

//           />
//         )}

//         {/* Update Manager Modal */}
//         {updateSalaryPopup && selectedSalary && (
//          <UpdateManagerSalary
//           setUpdateSalaryPopup={setUpdateSalaryPopup}
//            salaryId={selectedSalary} // Pass managerId explicitly
//            ManagerList={managerList}
//            fetchSalaryList={fetchSalaryList}
//          />
//         )}
//       </div>
//     </>
//   );
// };

// export default ManagerHrSalary;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2Icon, UserPlus, Menu } from "lucide-react";
import { toast } from "react-toastify";
import AddManagerSalary from "./AddManagerSalary";
import UpdateManagerSalary from "./UpdateManagerSalary";
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

const ManagerSalary = () => {
  const [salaryList, setSalaryList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [addSalaryPopup, setAddSalaryPopup] = useState(false);
  const [updateSalaryPopup, setUpdateSalaryPopup] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  useEffect(() => {
    fetchSalaryList();
    fetchManagerList();
  }, []);

  const fetchSalaryList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/manager-salary/history/`);
      setSalaryList(data);
    } catch (error) {
      toast.error("Failed to fetch salary list.");
    }
  };

  const fetchManagerList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
      setManagerList(data);
    } catch (error) {
      toast.error("Failed to fetch manager list.");
    }
  };

  const handleEdit = (row) => {
    setSelectedSalary(row.id);
    setUpdateSalaryPopup(true);
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(`${apiBaseUrl}/delete-manager-salary/${row.id}/`);
      toast.success(`Salary ID ${row.id} deleted successfully.`);
      fetchSalaryList();
    } catch (error) {
      toast.error("Failed to delete Salary.");
    }
  };

  return (
    <div className="h-full min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Manager Salary List</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setAddSalaryPopup(true)}
        >
          <UserPlus size={20} /> Add Salary
        </button>
      </div>

      <div className="border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.no</TableHead>
              <TableHead>Manager ID</TableHead>
              <TableHead>Annual Salary</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Total Salary</TableHead>
              <TableHead>Monthly Salary</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryList.map((salary, index) => (
              <TableRow key={salary.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{salary.user_id}</TableCell>
                <TableCell>{salary.annual_salary}</TableCell>
                <TableCell>{salary.bonus}</TableCell>
                <TableCell>{salary.total_salary}</TableCell>
                <TableCell>{salary.monthly_salary}</TableCell>
                <TableCell>{salary.effective_date}</TableCell>
                <TableCell>{salary.updated_date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Menu />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(salary)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(salary)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {addSalaryPopup && (
        <AddManagerSalary
          setAddSalaryPopup={setAddSalaryPopup}
          ManagerList={managerList}
          fetchSalaryList={fetchSalaryList}
        />
      )}

      {updateSalaryPopup && selectedSalary && (
        <UpdateManagerSalary
          setUpdateSalaryPopup={setUpdateSalaryPopup}
          salaryId={selectedSalary}
          ManagerList={managerList}
        />
      )}
    </div>
  );
};

export default ManagerSalary;
