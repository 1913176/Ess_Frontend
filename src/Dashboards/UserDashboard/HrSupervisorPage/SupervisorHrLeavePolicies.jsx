// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { Edit, Trash2Icon } from "lucide-react";
// const apiBaseUrl = process.env.VITE_BASE_API;
// const SupervisorHrLeavePolicies = () => {
//   const [supervisorList, setSupervisorList] = useState([]);
//   const [leavePolicies, setLeavePolicies] = useState([]);
//   const [showModal, setShowModal] = useState(false); // State to show/hide modal
//   const [isEditMode, setIsEditMode] = useState(false); // For Edit Mode
//   const [selectedLeaveId, setSelectedLeaveId] = useState(null); // Store the leave policy ID to edit
//   const [formData, setFormData] = useState({
//     selectedSupervisor: "",
//     medical_leave: "",
//     vacation_leave: "",
//     personal_leave: "",
//   });
//   const [loading, setLoading] = useState(false);

//   // Fetch employee list
//   const fetchSupervisorList = async () => {
//     try {
//       const { data } = await axios.get(`${apiBaseUrl}/api/supervisor_list/`);
//       setSupervisorList(data);
//     } catch (error) {
//       console.error("Error fetching Supervisor list:", error);
//       toast.error("Failed to fetch Supervisor list.");
//     }
//   };

//   // Fetch leave policies
//   const fetchLeavePolicies = async () => {
//     try {
//       const { data } = await axios.get(`${apiBaseUrl}/supervisor-leave-policies/`);
//       setLeavePolicies(data);
//     } catch (error) {
//       console.error("Error fetching leave policies:", error);
//       toast.error("Failed to fetch leave policies.");
//     }
//   };

//   // Handle form input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Handle form submission to update leave balance
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.selectedSupervisor) {
//       toast.error("Please select a Supervisor.");
//       return;
//     }

//     setLoading(true);
//     try {
//       if (isEditMode) {
//         // Edit leave balance for the selected employee
//         await axios.put(
//           `${apiBaseUrl}/edit_supervisor_leave_balance/${selectedLeaveId}/`,
//           {
//             medical_leave: formData.medical_leave,
//             vacation_leave: formData.vacation_leave,
//             personal_leave: formData.personal_leave,
//           }
//         );
//         toast.success("Leave balance updated successfully.");
//       } else {
//         // Add new leave balance for the selected employee
//         await axios.post(
//           `${apiBaseUrl}/post-supervisor-leave-balance/update/${formData.selectedSupervisor}/`,
//           {
//             medical_leave: formData.medical_leave,
//             vacation_leave: formData.vacation_leave,
//             personal_leave: formData.personal_leave,
//           }
//         );
//         toast.success("Leave balance added successfully.");
//       }

//       fetchLeavePolicies(); // Refresh leave policies list
//       setShowModal(false); // Close the modal
//     } catch (error) {
//       console.error("Error updating leave balance:", error);
//       toast.error("Failed to update leave balance.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Open modal to add or edit leave policy
//   const openModal = (leave = null) => {
//     if (leave) {
//       setIsEditMode(true);
//       setSelectedLeaveId(leave.id);
//       setFormData({
//         selectedSupervisor: leave.user,
//         medical_leave: leave.leave_balance.medical_leave,
//         vacation_leave: leave.leave_balance.vacation_leave,
//         personal_leave: leave.leave_balance.personal_leave,
//       });
//     } else {
//       setIsEditMode(false);
//       setFormData({
//         selectedSupervisor: "",
//         medical_leave: "",
//         vacation_leave: "",
//         personal_leave: "",
//       });
//     }
//     setShowModal(true);
//   };

//   // Close modal
//   const closeModal = () => {
//     setShowModal(false);
//     setIsEditMode(false);
//     setSelectedLeaveId(null);
//   };

//   // Delete leave policy
//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this leave policy?")) {
//       try {
//         await axios.delete(`${apiBaseUrl}/delete_supervisor_leave_balance/${id}/`);
//         toast.success("Leave policy deleted successfully.");
//         fetchLeavePolicies(); // Refresh the leave policies list
//       } catch (error) {
//         console.error("Error deleting leave policy:", error);
//         toast.error("Failed to delete leave policy.");
//       }
//     }
//   };

//   useEffect(() => {
//     fetchSupervisorList();
//     fetchLeavePolicies();
//   }, []);

//   const columns = [
//     { field: "id", headerName: "S.No", width: 90 },
//     { field: "user", headerName: "Name", width: 150 },
//     { field: "department", headerName: "Department", width: 150 },
//     { field: "role", headerName: "Role", width: 130 },
//     {
//       field: "leave_balance.medical_leave",
//       headerName: "Medical Leave",
//       width: 150,
//       renderCell: (params) => params.row.leave_balance.medical_leave,
//     },
//     {
//       field: "leave_balance.vacation_leave",
//       headerName: "Vacation Leave",
//       width: 150,
//       renderCell: (params) => params.row.leave_balance.vacation_leave,
//     },
//     {
//       field: "leave_balance.personal_leave",
//       headerName: "Personal Leave",
//       width: 150,
//       renderCell: (params) => params.row.leave_balance.personal_leave,
//     },
//     {
//       field: "leave_balance.total_leave_days",
//       headerName: "Total Leave Days",
//       width: 150,
//       renderCell: (params) => params.row.leave_balance.total_leave_days,
//     },
//     {
//       field: "action",
//       headerName: "Action",
//       width: 130,
//       renderCell: (params) => (
//         <div className="flex gap-2 justify-center items-center h-full">
//           <button
//             className="text-gray-700"
//             onClick={() => openModal(params.row)}
//           >
//             <Edit />
//           </button>
//           <button
//             className="text-red-600"
//             onClick={() => handleDelete(params.row.id)}
//           >
//             <Trash2Icon />
//           </button>
//         </div>
//       ),
//     },
//     //  { field: "overtime", headerName: "Over Time", width: 130 },
//   ];

//   return (
//     <div className="flex flex-col min-h-dvh h-full p-4">
//       {/* Leave Policies Table */}
//       <div className="flex items-center justify-between mb-4 ">
//         <h2 className="text-2xl font-semibold">Supervisor Leave Policies</h2>
//         <button onClick={() => openModal()} className="primary-btn">
//           Add Leave Policies
//         </button>
//       </div>
//       <div className="mb-6 h-full bg-white/50">
//         {/* <table className="table-auto w-full border border-gray-200">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">ID</th>
//               <th className="px-4 py-2 border">Name</th>
//               <th className="px-4 py-2 border">Department</th>
//               <th className="px-4 py-2 border">Role</th>
//               <th className="px-4 py-2 border">Medical Leave</th>
//               <th className="px-4 py-2 border">Vacation Leave</th>
//               <th className="px-4 py-2 border">Personal Leave</th>
//               <th className="px-4 py-2 border">Total Leave Days</th>
//               <th className="px-4 py-2 border">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {leavePolicies.map((leave) => (
//               <tr key={leave.id} className="text-center">
//                 <td className="px-4 py-2 border">{leave.id}</td>
//                 <td className="px-4 py-2 border">{leave.user}</td>
//                 <td className="px-4 py-2 border">{leave.department}</td>
//                 <td className="px-4 py-2 border">{leave.role}</td>
//                 <td className="px-4 py-2 border">{leave.leave_balance.medical_leave}</td>
//                 <td className="px-4 py-2 border">{leave.leave_balance.vacation_leave}</td>
//                 <td className="px-4 py-2 border">{leave.leave_balance.personal_leave}</td>
//                 <td className="px-4 py-2 border">{leave.leave_balance.total_leave_days}</td>
//                 <td className="px-4 py-2 border">
//                   <button
//                     onClick={() => openModal(leave)}
//                     className="btn-primary mr-2"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(leave.id)}
//                     className="btn-danger"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table> */}

//         <DataGrid
//           rows={leavePolicies}
//           columns={columns}
//           getRowId={(getRowId) => getRowId.id} // Ensure unique ID is used
//           pageSize={6} // Default page size
//           rowsPerPageOptions={[5, 10, 20]} // Options for pagination
//           checkboxSelection
//           disableRowSelectionOnClick
//           components={{ Toolbar: GridToolbar }} // Optional: Uncomment for a toolbar
//           loading={loading}
//           className="h-full"
//         />

//         {/* Add Leave Policies Button */}
//       </div>

//       {/* Modal for Adding/Editing Leave Policy */}
//       {showModal && (
//         <div className="fixed z-10 inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg w-1/2">
//             <h3 className="text-xl font-semibold mb-4">
//               {isEditMode ? "Edit Leave Policy" : "Add Leave Policy"}
//             </h3>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block font-medium">Select Supervisor:</label>
//                 <select
//                   name="selectedSupervisor"
//                   value={formData.selectedSupervisor}
//                   onChange={handleChange}
//                   className="w-full p-2 border rounded"
//                 >
//                   <option value="">Select Supervisor</option>
//                   {supervisorList.map((supervisor) => (
//                     <option key={supervisor.username} value={supervisor.username}>
//                       {supervisor.supervisor_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block font-medium">Medical Leave:</label>
//                 <input
//                   type="number"
//                   name="medical_leave"
//                   value={formData.medical_leave}
//                   onChange={handleChange}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div>
//                 <label className="block font-medium">Vacation Leave:</label>
//                 <input
//                   type="number"
//                   name="vacation_leave"
//                   value={formData.vacation_leave}
//                   onChange={handleChange}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div>
//                 <label className="block font-medium">Personal Leave:</label>
//                 <input
//                   type="number"
//                   name="personal_leave"
//                   value={formData.personal_leave}
//                   onChange={handleChange}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div className="flex gap-4">
//                 <button
//                   type="submit"
//                   className="btn-primary"
//                   disabled={loading}
//                 >
//                   {loading ? "Saving..." : "Save"}
//                 </button>
//                 <button
//                   type="button"
//                   className="btn-secondary"
//                   onClick={closeModal}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SupervisorHrLeavePolicies;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Edit, Trash2Icon, Menu } from "lucide-react";
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

const SupervisorLeavePolicies = () => {
  const [supervisorList, setSupervisorList] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [formData, setFormData] = useState({
    selectedSupervisor: "",
    medical_leave: "",
    vacation_leave: "",
    personal_leave: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSupervisorList();
    fetchLeavePolicies();
  }, []);

  const fetchSupervisorList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/supervisor_list/`);
      setSupervisorList(data);
    } catch (error) {
      toast.error("Failed to fetch supervisor list.");
    }
  };

  const fetchLeavePolicies = async () => {
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/supervisor-leave-policies/`,
      );
      setLeavePolicies(data);
    } catch (error) {
      toast.error("Failed to fetch leave policies.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedSupervisor) {
      toast.error("Please select a Supervisor.");
      return;
    }
    setLoading(true);
    try {
      if (isEditMode) {
        await axios.put(
          `${apiBaseUrl}/edit_supervisor_leave_balance/${selectedLeaveId}/`,
          formData,
        );
        toast.success("Leave balance updated successfully.");
      } else {
        await axios.post(
          `${apiBaseUrl}/supervisor-leave-balance/update/${formData.selectedSupervisor}/`,
          formData,
        );
        toast.success("Leave balance added successfully.");
      }
      fetchLeavePolicies();
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to update leave balance.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (leave = null) => {
    if (leave) {
      setIsEditMode(true);
      setSelectedLeaveId(leave.id);
      setFormData({
        selectedSupervisor: leave.user,
        medical_leave: leave.leave_balance.medical_leave,
        vacation_leave: leave.leave_balance.vacation_leave,
        personal_leave: leave.leave_balance.personal_leave,
      });
    } else {
      setIsEditMode(false);
      setFormData({
        selectedSupervisor: "",
        medical_leave: "",
        vacation_leave: "",
        personal_leave: "",
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave policy?")) {
      try {
        await axios.delete(
          `${apiBaseUrl}/delete_supervisor_leave_balance/${id}/`,
        );
        toast.success("Leave policy deleted successfully.");
        fetchLeavePolicies();
      } catch (error) {
        toast.error("Failed to delete leave policy.");
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Supervisor Leave Policies</h2>
        <button variant="contained" onClick={() => openModal()} color="primary">
          Add Leave Policy
        </button>
      </div>

      <div className="border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Medical Leave</TableHead>
              <TableHead>Vacation Leave</TableHead>
              <TableHead>Personal Leave</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leavePolicies.map((policy, index) => (
              <TableRow key={policy.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{policy.user}</TableCell>
                <TableCell>{policy.leave_balance.medical_leave}</TableCell>
                <TableCell>{policy.leave_balance.vacation_leave}</TableCell>
                <TableCell>{policy.leave_balance.personal_leave}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Menu />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openModal(policy)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(policy.id)}>
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

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h3 className="text-xl font-semibold mb-4">
              {isEditMode ? "Edit Leave Policy" : "Add Leave Policy"}
            </h3>
            <form onSubmit={handleSubmit}>
              <label>Select Supervisor:</label>
              <select
                name="selectedSupervisor"
                value={formData.selectedSupervisor}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Supervisor</option>
                {supervisorList.map((supervisor) => (
                  <option key={supervisor.username} value={supervisor.username}>
                    {supervisor.supervisor_name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="medical_leave"
                value={formData.medical_leave}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Medical Leave"
              />
              <input
                type="number"
                name="vacation_leave"
                value={formData.vacation_leave}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Vacation Leave"
              />
              <input
                type="number"
                name="personal_leave"
                value={formData.personal_leave}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Personal Leave"
              />
              <button type="submit" className="btn-primary">
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorLeavePolicies;
