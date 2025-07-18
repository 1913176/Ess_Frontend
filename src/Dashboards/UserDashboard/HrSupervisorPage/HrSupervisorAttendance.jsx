// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { DataGrid } from "@mui/x-data-grid";
// import { GridToolbar } from "@mui/x-data-grid";
// const apiBaseUrl = process.env.VITE_BASE_API;

// const SupervisorAttendanceRecords = ({ supervisorId }) => {
//   const [attendanceList, setAttendanceList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAttendanceList = async () => {
//       if (supervisorId) {
//         setLoading(true);
//         setError(null);
//         try {
//           const { data } = await axios.get(
//             `${apiBaseUrl}/admin/supervisor-attendance-history/`,
//             {
//               params: { supervisor_id: supervisorId },
//             }
//           );
//           setAttendanceList(
//             data.all_records.map((record, index) => ({
//               id: `${supervisorId}-${record.date}-${index}`,
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
//   }, [supervisorId]);

//   const columns = [
//     { field: "id", headerName: "S.No", width: 90 },
//     { field: "supervisor_name", headerName: "Name", width: 150 },
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
//         <div>No attendance records available for this supervisor.</div>
//       )}
//       {error && <div>{error}</div>}
//     </>
//   );
// };

// const HrSupervisorAttendance = () => {
//   const [supervisors, setSupervisors] = useState([]);
//   const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
//   const [loadingSupervisors, setLoadingSupervisors] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSupervisors = async () => {
//       setLoadingSupervisors(true);
//       setError(null);
//       try {
//         const { data } = await axios.get(`${apiBaseUrl}/api/supervisor_list/`);
//         setSupervisors(data);
//       } catch (error) {
//         setError("Failed to fetch supervisor list. Please try again.");
//       } finally {
//         setLoadingSupervisors(false);
//       }
//     };

//     fetchSupervisors();
//   }, []);

//   return (
//     <div className="flex flex-col p-4">
//       <div className="supervisor-header flex justify-between items-center">
//         <h3>Attendance</h3>
//         <select
//           className="bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
//           onChange={(e) => setSelectedSupervisorId(e.target.value)}
//         >
//           <option value="">Supervisor: All</option>
//           {supervisors.map((supervisor) => (
//             <option value={supervisor.supervisor_id} key={supervisor.supervisor_id}>
//               {supervisor.supervisor_name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="mt-4">
//         <SupervisorAttendanceRecords supervisorId={selectedSupervisorId} />
//       </div>
//     </div>
//   );
// };

// export default HrSupervisorAttendance;

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

const SupervisorAttendanceRecords = ({ supervisorId }) => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceList = async () => {
      if (supervisorId) {
        setLoading(true);
        setError(null);
        try {
          const { data } = await axios.get(
            `${apiBaseUrl}/admin/supervisor-attendance-history/`,
            {
              params: { supervisor_id: supervisorId },
            },
          );
          setAttendanceList(
            data.all_records.map((record, index) => ({
              id: `${supervisorId}-${record.date}-${index}`,
              ...record,
            })),
          );
        } catch (error) {
          setError("Failed to fetch attendance records. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAttendanceList();
  }, [supervisorId]);

  return (
    <div className="border rounded p-4">
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {attendanceList.length === 0 && !loading && !error ? (
        <div>No attendance records available for this supervisor.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Supervisor Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Time In</TableHead>
              <TableHead>Time Out</TableHead>
              <TableHead>In Status</TableHead>
              <TableHead>Out Status</TableHead>
              <TableHead>Work Time</TableHead>
              <TableHead>Over Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceList.map((record, index) => (
              <TableRow key={record.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{record.supervisor_name}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.time_in}</TableCell>
                <TableCell>{record.time_out}</TableCell>
                <TableCell>{record.in_status}</TableCell>
                <TableCell>{record.out_status}</TableCell>
                <TableCell>{record.total_working_hours}</TableCell>
                <TableCell>{record.overtime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

const SupervisorAttendance = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      setLoadingSupervisors(true);
      setError(null);
      try {
        const { data } = await axios.get(`${apiBaseUrl}/api/supervisor_list/`);
        setSupervisors(data);
      } catch (error) {
        setError("Failed to fetch supervisor list. Please try again.");
      } finally {
        setLoadingSupervisors(false);
      }
    };

    fetchSupervisors();
  }, []);

  return (
    <div className="flex flex-col p-4">
      <div className="supervisor-header flex justify-between items-center">
        <h3>Attendance</h3>
        <select
          className="bg-transparent text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:border-slate-400 hover:border-slate-300"
          onChange={(e) => setSelectedSupervisorId(e.target.value)}
        >
          <option value="">Supervisor: All</option>
          {supervisors.map((supervisor) => (
            <option
              value={supervisor.supervisor_id}
              key={supervisor.supervisor_id}
            >
              {supervisor.supervisor_name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <SupervisorAttendanceRecords supervisorId={selectedSupervisorId} />
      </div>
    </div>
  );
};

export default SupervisorAttendance;
