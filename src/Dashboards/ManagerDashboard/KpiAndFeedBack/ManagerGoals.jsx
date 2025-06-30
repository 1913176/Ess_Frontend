import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Box } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerGoal = ({ managerName }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/view_manager_goals/`)
      .then((response) => {
        // Check if response.data is an array or an object with a message
        if (Array.isArray(response.data)) {
          setGoals(response.data);  // Set goals to the array of goals
        } else {
          setGoals([]);  // If it's an object with a message, fallback to empty array
          setError(response.data.message || "Failed to load goals.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching goals:", error);
        setError("Failed to load goals.");
        setLoading(false);
      });
  }, [managerName]);

  // const columns = [
  //   { field: "goal_text", headerName: "Goal", flex: 2 },
  //   { field: "start_date", headerName: "Start Date", flex: 1 },
  //   { field: "end_date", headerName: "End Date", flex: 1 },
  //   {
  //     field: "is_completed",
  //     headerName: "Status",
  //     flex: 1,
  //     renderCell: (params) => (params.value ? "Completed" : "Pending"),
  //   },
  // ];

  // if (loading) {
  //   return (
  //     <Typography sx={{ p: 2, color: "gray" }}>Loading goals...</Typography>
  //   );
  // }

  // if (error) {
  //   return <Typography sx={{ p: 2, color: "red" }}>{error}</Typography>;
  // }

  return (
    // <Box sx={{ p: 2 }}>
    //   <Typography variant="h6" sx={{ mb: 2 }}>
    //     Manager Goals
    //   </Typography>
    //     <Box sx={{ height:"100dvh", width: "100%" }}>
    //     <DataGrid
    //       className="bg-white"
    //       rows={goals}
    //       columns={columns}
    //       pageSize={5}
    //       getRowId={(row) => row.id || row.goal_text} // Ensure unique row IDs
    //     disableSelectionOnClick
    //     loading={loading}
    //     />
    //   </Box>
    // </Box>

    <div className="space-y-4 p-4">
      <h2 className="font-medium text-xl">Manager Goals</h2>
      <div className="border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.no</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} style={{ color: "red" }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : goals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No goals available</TableCell>
              </TableRow>
            ) : (
              goals.map((goal, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{goal.goal_text}</TableCell>
                  <TableCell>{goal.start_date}</TableCell>
                  <TableCell>{goal.end_date}</TableCell>
                  <TableCell>{goal.is_completed ? "Completed" : "Pending"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManagerGoal;
