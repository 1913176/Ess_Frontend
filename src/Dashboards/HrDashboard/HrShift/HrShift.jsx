// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   MenuItem,
//   DialogActions,
// } from "@mui/material";

// const apiBaseUrl = process.env.VITE_BASE_API;

// const ShiftTable = () => {
//   const [shifts, setShifts] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [formData, setFormData] = useState({
//     employee: "",
//     start_time: "",
//     end_time: "",
//     working_day: "",
//   });

//   // Fetch all shifts
//   const fetchShifts = async () => {
//     try {
//       const response = await axios.get(`${apiBaseUrl}/api/get-shift-time/`);
//       setShifts(response.data);
//     } catch (error) {
//       console.error("Error fetching shifts:", error);
//     }
//   };

//   // Fetch employee list
//   const fetchEmployees = async () => {
//     try {
//       const response = await axios.get(`${apiBaseUrl}/api/employee_list/`);
//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//     }
//   };

//   useEffect(() => {
//     fetchShifts();
//     fetchEmployees();
//   }, []);

//   // Handle input change
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Open form for adding new shift
//   const handleOpen = () => {
//     setEditId(null);
//     setFormData({
//       employee: "",
//       start_time: "",
//       end_time: "",
//       working_day: "",
//     });
//     setOpen(true);
//   };

//   // Open form for editing existing shift
//   const handleEdit = (shift) => {
//     setEditId(shift.id);
//     setFormData({
//       employee: shift.employee,
//       start_time: shift.start_time,
//       end_time: shift.end_time,
//       working_day: shift.working_day,
//     });
//     setOpen(true);
//   };

//   // Handle form submission (Add or Update)
//   const handleSubmit = async () => {
//     try {
//       if (editId) {
//         await axios.put(
//           `${apiBaseUrl}/api/shift-time-update/${editId}/`,
//           formData
//         );
//       } else {
//         await axios.post(`${apiBaseUrl}/api/shift-time/add/`, formData);
//       }
//       fetchShifts();
//       setOpen(false);
//     } catch (error) {
//       console.error("Error saving shift:", error);
//     }
//   };

//   // Handle delete action
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${apiBaseUrl}/api/shift-time-delete/${id}/`);
//       fetchShifts();
//     } catch (error) {
//       console.error("Error deleting shift:", error);
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <div className="flex justify-between items-center">
//         <h2>Shift Attendance</h2>
//         <Button variant="contained" color="primary" onClick={handleOpen}>
//           Add Shift
//         </Button>
//       </div>

//       {/* Shift Table */}
//       <TableContainer component={Paper} style={{ marginTop: "20px" }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>ID</TableCell>
//               <TableCell>Employee Name</TableCell>
//               <TableCell>Start Time</TableCell>
//               <TableCell>End Time</TableCell>
//               <TableCell>Total Time</TableCell>
//               <TableCell>Working Day</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {shifts.map((shift) => (
//               <TableRow key={shift.id}>
//                 <TableCell>{shift.id}</TableCell>
//                 <TableCell>{shift.employee_name}</TableCell>
//                 <TableCell>{shift.start_time}</TableCell>
//                 <TableCell>{shift.end_time}</TableCell>
//                 <TableCell>{shift.total_time}</TableCell>
//                 <TableCell>{shift.working_day}</TableCell>
//                 <TableCell>
//                   <Button color="primary" onClick={() => handleEdit(shift)}>
//                     Edit
//                   </Button>
//                   <Button
//                     color="secondary"
//                     onClick={() => handleDelete(shift.id)}
//                   >
//                     Delete
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Add/Edit Shift Dialog */}
//       <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
//         <DialogTitle>{editId ? "Edit Shift" : "Add Shift"}</DialogTitle>
//         <DialogContent>
//           <TextField
//             select
//             label="Employee"
//             name="employee"
//             value={formData.employee}
//             onChange={handleChange}
//             fullWidth
//             margin="dense"
//           >
//             {employees.map((emp) => (
//               <MenuItem key={emp.id} value={emp.id}>
//                 {emp.employee_name}
//               </MenuItem>
//             ))}
//           </TextField>
//           <TextField
//             label="Start Time"
//             type="time"
//             name="start_time"
//             value={formData.start_time}
//             onChange={handleChange}
//             fullWidth
//             margin="dense"
//           />
//           <TextField
//             label="End Time"
//             type="time"
//             name="end_time"
//             value={formData.end_time}
//             onChange={handleChange}
//             fullWidth
//             margin="dense"
//           />
//           <TextField
//             select
//             label="Working Day"
//             name="working_day"
//             value={formData.working_day}
//             onChange={handleChange}
//             fullWidth
//             margin="dense"
//           >
//             {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
//               (day) => (
//                 <MenuItem key={day} value={day}>
//                   {day}
//                 </MenuItem>
//               )
//             )}
//           </TextField>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>Cancel</Button>
//           <Button onClick={handleSubmit} color="primary">
//             {editId ? "Update" : "Add"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default ShiftTable;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const apiBaseUrl = process.env.VITE_BASE_API;

const ShiftTable = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    employee: "",
    start_time: "",
    end_time: "",
    working_day: "",
  });

  // Fetch all shifts
  const fetchShifts = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/get-shift-time/`);
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  // Fetch employee list
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/employee_list/`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open form for adding new shift
  const handleOpen = () => {
    setEditId(null);
    setFormData({
      employee: "",
      start_time: "",
      end_time: "",
      working_day: "",
    });
    setOpen(true);
  };

  // Open form for editing existing shift
  const handleEdit = (shift) => {
    setEditId(shift.id);
    setFormData({
      employee: shift.employee,
      start_time: shift.start_time,
      end_time: shift.end_time,
      working_day: shift.working_day,
    });
    setOpen(true);
  };

  // Handle form submission (Add or Update)
  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(
          `${apiBaseUrl}/api/shift-time-update/${editId}/`,
          formData,
        );
      } else {
        await axios.post(`${apiBaseUrl}/api/shift-time/add/`, formData);
      }
      fetchShifts();
      setOpen(false);
    } catch (error) {
      console.error("Error saving shift:", error);
    }
  };

  // Handle delete action
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/api/shift-time-delete/${id}/`);
      fetchShifts();
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  // Define columns for DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "employee_name", headerName: "Employee Name", width: 180 },
    { field: "start_time", headerName: "Start Time", width: 180 },
    { field: "end_time", headerName: "End Time", width: 180 },
    { field: "total_time", headerName: "Total Time", width: 180 },
    { field: "working_day", headerName: "Working Day", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            color="primary"
            onClick={() => handleEdit(params.row)}
            style={{ marginRight: "10px" }}
          >
            Edit
          </Button>
          <Button color="secondary" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  // Prepare rows for DataGrid
  const rows = shifts.map((shift) => ({
    id: shift.id,
    employee_name: shift.employee_name,
    start_time: shift.start_time,
    end_time: shift.end_time,
    total_time: shift.total_time,
    working_day: shift.working_day,
  }));

  return (
    <div
      style={{
        padding: "20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="flex justify-between items-center">
        <h2>Shift Attendance</h2>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Shift
        </Button>
      </div>

      {/* DataGrid for Shift Table */}
      <div style={{ flexGrow: 1, marginTop: "20px" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          style={{ height: "100%" }} // Full height of its container
        />
      </div>

      {/* Add/Edit Shift Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Shift" : "Add Shift"}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Employee"
            name="employee"
            value={formData.employee}
            onChange={handleChange}
            fullWidth
            margin="dense"
          >
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.employee_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Start Time"
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="End Time"
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            select
            label="Working Day"
            name="working_day"
            value={formData.working_day}
            onChange={handleChange}
            fullWidth
            margin="dense"
          >
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
              (day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ),
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ShiftTable;
