// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { DataGrid } from "@mui/x-data-grid";
// import { GridToolbar } from "@mui/x-data-grid";
// const apiBaseUrl = process.env.VITE_BASE_API;

// const EmployeeAttendanceRecords = ({ employeeId }) => {
//   const [attendanceList, setAttendanceList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAttendanceList = async () => {
//       if (employeeId) {
//         setLoading(true);
//         setError(null);
//         try {
//           const { data } = await axios.get(
//             `${apiBaseUrl}/admin/employee-attendance-history/`,
//             {
//               params: { employee_id: employeeId },
//             }
//           );
//           setAttendanceList(
//             data.all_records.map((record, index) => ({
//               id: `${employeeId}-${record.date}-${index}`,
//               ...record,
//             }))
//           );
//         } catch (error) {
//           setError("Failed to fetch attendance records. Please try again.");
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     fetchAttendanceList();
//   }, [employeeId]);

//   const columns = [
//     { field: "id", headerName: "S.No", width: 90 },
//     { field: "employee_name", headerName: "Name", width: 150 },
//     { field: "date", headerName: "Date", width: 150 },
//     { field: "type", headerName: "Type", width: 130 },
//     { field: "time_in", headerName: "Time In", width: 150 },
//     { field: "time_out", headerName: "Time Out", width: 150 },
//     { field: "in_status", headerName: "In Status", width: 150 },
//     { field: "out_status", headerName: "Out Status", width: 150 },
//     { field: "total_working_hours", headerName: "Work Time", width: 130 },
//     { field: "overtime", headerName: "Over Time", width: 130 },
//   ];

//   return (
//     <>
//       {loading && <div>Loading...</div>}
//       <DataGrid
//         rows={attendanceList}
//         columns={columns}
//         getRowId={(row) => row.id}
//         pageSize={6}
//         rowsPerPageOptions={[5, 10, 20]}
//         checkboxSelection
//         disableRowSelectionOnClick
//         components={{ Toolbar: GridToolbar }}
//       />
//       {attendanceList.length === 0 && !loading && !error && (
//         <div>No attendance records available for this employee.</div>
//       )}
//       {error && <div>{error}</div>}
//     </>
//   );
// };

// const EmployeeHrAttendance = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
//   const [loadingEmployees, setLoadingEmployees] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       setLoadingEmployees(true);
//       setError(null);
//       try {
//         const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`);
//         setEmployees(data);
//       } catch (error) {
//         setError("Failed to fetch employee list. Please try again.");
//       } finally {
//         setLoadingEmployees(false);
//       }
//     };

//     fetchEmployees();
//   }, []);

//   return (
//     <div className="flex flex-col p-4">
//       <div className="employee-header flex justify-between items-center">
//         <h3>Attendance</h3>
//         <select
//           className="bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
//           onChange={(e) => setSelectedEmployeeId(e.target.value)}
//         >
//           <option value="">Employee: All</option>
//           {employees.map((employee) => (
//             <option value={employee.employee_id} key={employee.employee_id}>
//               {employee.employee_name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="mt-4">
//         <EmployeeAttendanceRecords employeeId={selectedEmployeeId} />
//       </div>
//     </div>
//   );
// };

// export default EmployeeHrAttendance;

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const apiBaseUrl = process.env.VITE_BASE_API;

const EmployeeAttendanceRecords = ({ employeeId }) => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceList = async () => {
      if (employeeId) {
        setLoading(true);
        setError(null);
        try {
          const { data } = await axios.get(
            `${apiBaseUrl}/admin/employee-attendance-history/`,
            { params: { employee_id: employeeId } },
          );
          setAttendanceList(data.all_records);
        } catch (error) {
          setError("Failed to fetch attendance records. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAttendanceList();
  }, [employeeId]);

  return (
    <div className="border rounded p-4">
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Time In</TableHead>
              <TableHead>Time Out</TableHead>
              <TableHead>Work Time</TableHead>
              <TableHead>Over Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceList.length > 0 ? (
              attendanceList.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{record.employee_name}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.time_in}</TableCell>
                  <TableCell>{record.time_out}</TableCell>
                  <TableCell>{record.total_working_hours}</TableCell>
                  <TableCell>{record.overtime}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No attendance records available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

const EmployeeAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`);
        setEmployees(data);
      } catch {
        console.error("Failed to fetch employee list");
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="p-4">
      <h3>Employee Attendance</h3>
      <select onChange={(e) => setSelectedEmployeeId(e.target.value)}>
        <option value="">Select Employee</option>
        {employees.map((employee) => (
          <option key={employee.employee_id} value={employee.employee_id}>
            {employee.employee_name}
          </option>
        ))}
      </select>
      <EmployeeAttendanceRecords employeeId={selectedEmployeeId} />
    </div>
  );
};

export default EmployeeAttendance;
