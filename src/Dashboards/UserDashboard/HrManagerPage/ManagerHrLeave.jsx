// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import axios from "axios";
// import { Edit, Trash2 as Trash2Icon } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// const apiBaseUrl = process.env.VITE_BASE_API;
// const ManagerHrLeave = () => {
//   const [managerleaveList, setManagerLeaveList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     user: "",
//     status: "",
//     start_date: "",
//     end_date: "",
//   });

//   // Fetch leave list from the backend with filters
//   const fetchManagerLeaveList = async () => {
//     setLoading(true);
//     try {
//       const queryParams = new URLSearchParams(filters).toString();
//       const { data } = await axios.get(
//         `${apiBaseUrl}/manager-leave-status/?${queryParams}`
//       );
//       setManagerLeaveList(
//         (data || []).map((leave) => ({
//           id: leave.id,
//           user: leave.user,
//           start_date: leave.start_date,
//           end_date: leave.end_date,
//           leave_type: leave.leave_type,
//           reason: leave.reason,
//           status: leave.status,
//         }))
//       );
//     } catch (error) {
//       console.error("Error fetching leave list:", error);
//       toast.error("Failed to fetch leave list.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle status change (Approve or Reject)
//   const handleStatusChange = async (status, currentRow) => {
//     if (!currentRow || !currentRow.id) {
//       toast.error("Invalid leave record selected.");
//       return;
//     }

//     try {
//       const response = await axios.post(`${apiBaseUrl}/manager-leave-status/`, {
//         leave_id: currentRow.id,
//         status: status.toLowerCase(), // Convert status to lowercase
//       });
//       toast.success(response.data.message);
//       fetchManagerLeaveList();
//     } catch (error) {
//       console.error("Error updating status:", error.response?.data);
//       toast.error(error.response?.data?.error || "Failed to update leave status.");
//     }
//   };

//   // Handle delete leave record
//   const handleDelete = async (row) => {
//     if (!row || !row.id) {
//       toast.error("Invalid leave record selected.");
//       return;
//     }

//     if (!window.confirm(`Are you sure you want to delete Leave ID ${row.id}?`)) {
//       return;
//     }

//     try {
//       await axios.delete(`${apiBaseUrl}/delete_manager_leave/${row.id}/`);
//       toast.success(`Leave ID ${row.id} deleted successfully.`);
//       fetchManagerLeaveList();
//     } catch (error) {
//       console.error("Error deleting leave record:", error);
//       toast.error("Failed to delete leave record.");
//     }
//   };

//   // Handle filter changes
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   // Apply filters and fetch the filtered data
//   const applyFilters = () => {
//     fetchManagerLeaveList();
//   };

//   useEffect(() => {
//     fetchManagerLeaveList();
//   }, []);

//   // Define table columns
//   const columns = [
//     { field: "id", headerName: "ID", width: 90 },
//     { field: "user", headerName: "User Name", width: 200 },
//     { field: "start_date", headerName: "Start Date", width: 200 },
//     { field: "end_date", headerName: "End Date", width: 150 },
//     { field: "leave_type", headerName: "Leave Type", width: 150 },
//     { field: "reason", headerName: "Reason", width: 150 },
//     { field: "status", headerName: "Status", width: 120 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 300,
//       renderCell: (params) => {
//         if (!params.row) return <div>No actions available</div>;

//         return (
//           <div className="flex gap-2">
//             <button
//               className="btn-primary"
//               onClick={() => handleStatusChange("Approved", params.row)}
//               disabled={params.row.status === "approved"}
//             >
//               Approve
//             </button>
//             <button
//               className="btn-danger"
//               onClick={() => handleStatusChange("Rejected", params.row)}
//               disabled={params.row.status === "rejected"}
//             >
//               Reject
//             </button>
//             <button
//               className="btn-danger"
//               onClick={() => handleDelete(params.row)}
//             >
//               <Trash2Icon />
//             </button>
//           </div>
//         );
//       },
//     },
//   ];

//   return (
//     <div className="h-full min-h-screen p-4 overflow-y-scroll">
//       <div className="flex justify-between items-center">
//       <h3 className="">Manager Leave List</h3>
//       <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
//         Filter
//       </button>
//       </div>
//       <div className="mb-4 flex gap-4">
//         <input
//           type="text"
//           name="user"
//           placeholder="Search by User"
//           value={filters.user}
//           onChange={handleFilterChange}
//           className="input"
//         />
//         <select
//           name="status"
//           value={filters.status}
//           onChange={handleFilterChange}
//           className="input"
//         >
//           <option value="">All Status</option>
//           <option value="approved">Approved</option>
//           <option value="rejected">Rejected</option>
//           <option value="pending">Pending</option>
//         </select>
//         <input
//           type="date"
//           name="start_date"
//           value={filters.start_date}
//           onChange={handleFilterChange}
//           className="input"
//         />
//         <input
//           type="date"
//           name="end_date"
//           value={filters.end_date}
//           onChange={handleFilterChange}
//           className="input"
//         />
//         <button
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//           onClick={applyFilters}
//         >
//           Apply Filters
//         </button>
//       </div>

//       <DataGrid
//         rows={managerleaveList || []}
//         columns={columns}
//         getRowId={(row) => row.id || Math.random()}
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
//         loading={loading}
//       />
//     </div>
//   );
// };

// export default ManagerHrLeave;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 as Trash2Icon } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerLeave = () => {
  const [managerleaveList, setManagerLeaveList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchManagerLeaveList = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${apiBaseUrl}/manager-leave-status/`);
      setManagerLeaveList(data || []);
    } catch (error) {
      console.error("Error fetching leave list:", error);
      toast.error("Failed to fetch leave list.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status, leaveId) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/manager-leave-status/`, {
        leave_id: leaveId,
        status: status.toLowerCase(),
      });
      toast.success(response.data.message);
      fetchManagerLeaveList();
    } catch (error) {
      console.error("Error updating status:", error.response?.data);
      toast.error("Failed to update leave status.");
    }
  };

  const handleDelete = async (leaveId) => {
    if (
      !window.confirm(`Are you sure you want to delete Leave ID ${leaveId}?`)
    ) {
      return;
    }
    try {
      await axios.delete(`${apiBaseUrl}/delete_manager_leave/${leaveId}/`);
      toast.success(`Leave ID ${leaveId} deleted successfully.`);
      fetchManagerLeaveList();
    } catch (error) {
      console.error("Error deleting leave record:", error);
      toast.error("Failed to delete leave record.");
    }
  };

  useEffect(() => {
    fetchManagerLeaveList();
  }, []);

  return (
    <div className="h-full min-h-screen p-4 overflow-y-scroll">
      <h3 className="mb-4">Manager Leave List</h3>
      <div className="border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.no</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managerleaveList.map((leave, index) => (
              <TableRow key={leave.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{leave.user}</TableCell>
                <TableCell>{leave.start_date}</TableCell>
                <TableCell>{leave.end_date}</TableCell>
                <TableCell>{leave.leave_type}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>{leave.status}</TableCell>
                <TableCell className="flex gap-2">
                  <button
                    className="btn-primary"
                    onClick={() => handleStatusChange("Approved", leave.id)}
                    disabled={leave.status === "approved"}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleStatusChange("Rejected", leave.id)}
                    disabled={leave.status === "rejected"}
                  >
                    Reject
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(leave.id)}
                  >
                    <Trash2Icon />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManagerLeave;
