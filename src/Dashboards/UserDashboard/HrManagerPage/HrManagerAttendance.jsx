// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { DataGrid } from "@mui/x-data-grid"; // Make sure to import DataGrid
// import { GridToolbar } from "@mui/x-data-grid"; // Import GridToolbar
// const apiBaseUrl = process.env.VITE_BASE_API;

// const ManagerAttendanceRecords = ({ managerId }) => {
//   const [attendanceList, setAttendanceList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAttendanceList = async () => {
//       if (managerId) {
//         setLoading(true);
//         setError(null); // Reset error state
//         try {
//           const { data } = await axios.get(
//             `${apiBaseUrl}/admin/manager-attendance-history/`,
//             {
//               params: { manager_id: managerId }, // Pass manager_id as a query param
//             }
//           );
//           setAttendanceList(
//             data.all_records.map((record, index) => ({
//               id: `${managerId}-${record.date}-${index}`,
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
//   }, [managerId]);

//   const columns = [
//     { field: "id", headerName: "S.No", width: 90 },
//     { field: "manager_name", headerName: "Name", width: 150 },
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
//         getRowId={(row) => row.id} // Ensure unique ID is used
//         pageSize={6} // Default page size
//         rowsPerPageOptions={[5, 10, 20]} // Options for pagination
//         checkboxSelection
//         disableRowSelectionOnClick
//         components={{ Toolbar: GridToolbar }} // Optional: Uncomment for a toolbar
//       />
//       {attendanceList.length === 0 && !loading && !error && (
//         <div>No attendance records available for this manager.</div>
//       )}
//       {error && <div>{error}</div>}
//     </>
//   );
// };

// const HrManagerAttendance = () => {
//   const [managers, setManagers] = useState([]);
//   const [selectedManagerId, setSelectedManagerId] = useState("");
//   const [loadingManagers, setLoadingManagers] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchManagers = async () => {
//       setLoadingManagers(true);
//       setError(null); // Reset error state
//       try {
//         const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
//         setManagers(data); // Assuming data is an array of managers
//       } catch (error) {
//         setError("Failed to fetch manager list. Please try again.");
//       } finally {
//         setLoadingManagers(false);
//       }
//     };

//     fetchManagers();
//   }, []);

//   return (
//     <div className="flex flex-col p-4">
//       <div className="manager-header flex justify-between items-center">
//         <h3>Attendance</h3>
//         <select
//           className="bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
//           onChange={(e) => setSelectedManagerId(e.target.value)}
//         >
//           <option value="">Manager: All</option>
//           {managers.map((manager) => (
//             <option value={manager.manager_id} key={manager.manager_id}>
//               {manager.manager_name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="mt-4">
//       <ManagerAttendanceRecords managerId={selectedManagerId} />
//       </div>
//     </div>
//   );
// };

// export default HrManagerAttendance;

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

const ManagerAttendanceRecords = ({ managerId }) => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceList = async () => {
      if (managerId) {
        setLoading(true);
        setError(null);
        try {
          const { data } = await axios.get(
            `${apiBaseUrl}/admin/manager-attendance-history/`,
            {
              params: { manager_id: managerId },
            },
          );
          setAttendanceList(
            data.all_records.map((record, index) => ({
              id: `${managerId}-${record.date}-${index}`,
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
  }, [managerId]);

  return (
    <div className="border rounded p-4">
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {attendanceList.length === 0 && !loading && !error ? (
        <div>No attendance records available for this manager.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Manager Name</TableHead>
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
                <TableCell>{record.manager_name}</TableCell>
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

const ManagerAttendance = () => {
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManagers = async () => {
      setLoadingManagers(true);
      setError(null);
      try {
        const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
        setManagers(data);
      } catch (error) {
        setError("Failed to fetch manager list. Please try again.");
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchManagers();
  }, []);

  return (
    <div className="flex flex-col p-4">
      <div className="manager-header flex justify-between items-center">
        <h3>Attendance</h3>
        <select
          className="bg-transparent text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:border-slate-400 hover:border-slate-300"
          onChange={(e) => setSelectedManagerId(e.target.value)}
        >
          <option value="">Manager: All</option>
          {managers.map((manager) => (
            <option value={manager.manager_id} key={manager.manager_id}>
              {manager.manager_name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <ManagerAttendanceRecords managerId={selectedManagerId} />
      </div>
    </div>
  );
};

export default ManagerAttendance;
