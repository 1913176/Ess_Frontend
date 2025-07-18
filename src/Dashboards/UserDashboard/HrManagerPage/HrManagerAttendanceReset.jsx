// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Button } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid

// const apiBaseUrl = process.env.VITE_BASE_API;

// const HrManagerAttendanceReset = () => {
//   const [resetRequests, setResetRequests] = useState([]);

//   // Fetch reset requests
//   const fetchResetRequests = async () => {
//     try {
//       const response = await axios.get(
//         `${apiBaseUrl}/admin/manager-reset-requests/`
//       );
//       setResetRequests(response.data.reset_requests);
//     } catch (error) {
//       console.error("Error fetching reset requests:", error);
//     }
//   };

//   useEffect(() => {
//     fetchResetRequests();
//   }, []);

//   // Approve request
//   const handleApprove = async (requestId) => {
//     try {
//       await axios.post(
//         `${apiBaseUrl}/admin/approve-and-reset-checkout-time/${requestId}/`
//       );
//       alert("Request approved successfully");
//       fetchResetRequests(); // Refresh data
//     } catch (error) {
//       console.error("Error approving request:", error);
//     }
//   };

//   // Reject request
//   const handleReject = async (requestId) => {
//     try {
//       await axios.post(
//         `${apiBaseUrl}/admin/reject-reset-request/${requestId}/`
//       );
//       alert("Request rejected successfully");
//       fetchResetRequests(); // Refresh data
//     } catch (error) {
//       console.error("Error rejecting request:", error);
//     }
//   };

//   // Define columns for the DataGrid
//   const columns = [
//     { field: "id", headerName: "ID", width: 100 },
//     { field: "manager_id", headerName: "Manager ID", width: 150 },
//     { field: "username", headerName: "Username", width: 150 },
//     { field: "request_type", headerName: "Request Type", width: 150 },
//     {
//       field: "request_description",
//       headerName: "Request Description",
//       width: 200,
//     },
//     { field: "date", headerName: "Date", width: 180 },
//     { field: "shift", headerName: "Shift", width: 130 },
//     { field: "time_in", headerName: "Time In", width: 130 },
//     { field: "time_out", headerName: "Time Out", width: 130 },
//     { field: "status", headerName: "Status", width: 120 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 200,
//       renderCell: (params) => (
//         <>
//           <Button
//             variant="contained"
//             color="success"
//             onClick={() => handleApprove(params.row.id)}
//             disabled={params.row.status !== "Pending"}
//           >
//             Approve
//           </Button>
//           <Button
//             variant="contained"
//             color="error"
//             onClick={() => handleReject(params.row.id)}
//             disabled={params.row.status !== "Pending"}
//             style={{ marginLeft: "10px" }}
//           >
//             Reject
//           </Button>
//         </>
//       ),
//     },
//   ];

//   // Prepare rows data (mapping resetRequests to the appropriate format for DataGrid)
//   const rows = resetRequests.map((request) => ({
//     id: request.id,
//     manager_id: request.manager_id,
//     username: request.username,
//     request_type: request.request_type,
//     request_description: request.request_description,
//     date: request.date,
//     shift: request.shift || "N/A",
//     time_in: request.time_in || "N/A",
//     time_out: request.time_out || "N/A",
//     status: request.status,
//   }));

//   return (
//     <div className="flex flex-col p-4 h-full">
//       <div className="flex justify-between items-center py-4">
//         <h2 className="font-semibold" >Manager Attendance Reset Requests</h2>
//         <div className=""></div>
//       </div>
//       <div style={{ height: "100%", width: "100%" }}>
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           pageSize={5} // Set the number of rows per page
//           rowsPerPageOptions={[5, 10, 20]} // Pagination options
//           checkboxSelection
//           disableSelectionOnClick
//         />
//       </div>
//     </div>
//   );
// };

// export default HrManagerAttendanceReset;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerAttendanceReset = () => {
  const [resetRequests, setResetRequests] = useState([]);

  const fetchResetRequests = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/admin/manager-reset-requests/`,
      );
      setResetRequests(response.data.reset_requests);
    } catch (error) {
      console.error("Error fetching reset requests:", error);
    }
  };

  useEffect(() => {
    fetchResetRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await axios.post(
        `${apiBaseUrl}/admin/approve-and-reset-checkout-time/${requestId}/`,
      );
      alert("Request approved successfully");
      fetchResetRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(
        `${apiBaseUrl}/admin/reject-reset-request/${requestId}/`,
      );
      alert("Request rejected successfully");
      fetchResetRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold mb-4">Manager Attendance Reset Requests</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S.No</TableHead>
            <TableHead>Manager ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Request Type</TableHead>
            <TableHead>Request Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>Time In</TableHead>
            <TableHead>Time Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resetRequests.length > 0 ? (
            resetRequests.map((request, index) => (
              <TableRow key={request.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{request.manager_id}</TableCell>
                <TableCell>{request.username}</TableCell>
                <TableCell>{request.request_type}</TableCell>
                <TableCell>{request.request_description}</TableCell>
                <TableCell>{request.date}</TableCell>
                <TableCell>{request.shift || "N/A"}</TableCell>
                <TableCell>{request.time_in || "N/A"}</TableCell>
                <TableCell>{request.time_out || "N/A"}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApprove(request.id)}
                    disabled={request.status !== "Pending"}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleReject(request.id)}
                    disabled={request.status !== "Pending"}
                    style={{ marginLeft: "10px" }}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center">
                No reset requests available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManagerAttendanceReset;
