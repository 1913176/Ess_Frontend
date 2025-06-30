import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Select,
  MenuItem,
  TextField,
  Grid,
  Typography,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const apiBaseUrl = process.env.VITE_BASE_API;

const MEmployeeGoal = ({ setisemployeegoal }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [goals, setGoals] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateGoalId, setUpdateGoalId] = useState(null);
  const [showForm, setShowForm] = useState(false); // Control form visibility

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/employee_list/`)
      .then((response) => setEmployees(response.data))
      .catch((error) => console.error("Error fetching employees:", error));

    fetchGoalList();
  }, []);

  const fetchGoalList = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/api/goal/list/`);
      setGoals(res.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const handleSubmitGoal = () => {
    if (!selectedEmployee || !goal || !startDate || !endDate) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    const goalData = {
      employee_id: selectedEmployee,
      goal_text: goal,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    };

    if (isUpdate) {
      axios
        .put(`${apiBaseUrl}/goals/${updateGoalId}/update/`, goalData)
        .then((response) => {
          setGoals(
            goals.map((g) => (g.id === updateGoalId ? response.data : g)),
          );
          resetForm();
          alert("Goal updated successfully!");
          setIsUpdate(false);
          setShowForm(false); // Hide form after submission
        })
        .catch((error) => {
          console.error("Error updating goal:", error);
          alert("Failed to update goal.");
        });
    } else {
      axios
        .post(`${apiBaseUrl}/api/goal/create/`, goalData)
        .then((response) => {
          setGoals([...goals, response.data]);
          resetForm();
          alert("Goal submitted successfully!");
          setShowForm(false); // Hide form after submission
        })
        .catch((error) => {
          console.error("Error creating goal:", error);
          alert("Failed to create goal.");
        });
    }
  };

  const resetForm = () => {
    setSelectedEmployee("");
    setGoal("");
    setStartDate(null);
    setEndDate(null);
  };

  const handleUpdateGoal = (goalId) => {
    const goalToUpdate = goals.find((goal) => goal.id === goalId);
    if (goalToUpdate) {
      setSelectedEmployee(goalToUpdate.employee_id);
      setGoal(goalToUpdate.goal_text);
      setStartDate(new Date(goalToUpdate.start_date));
      setEndDate(new Date(goalToUpdate.end_date));
      setUpdateGoalId(goalId);
      setIsUpdate(true);
      setShowForm(true); // Show form when updating
    }
  };

  const handleDeleteGoal = (goalId) => {
    axios
      .delete(`${apiBaseUrl}/goals-delete/${goalId}/`)
      .then(() => {
        setGoals(goals.filter((goal) => goal.id !== goalId));
        alert("Goal deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting goal:", error);
        alert("Failed to delete goal.");
      });
  };

  const columns = [
    { field: "employee_id", headerName: "Employee ID", width: 120 },
    { field: "goal_text", headerName: "Goal", width: 250 },
    {
      field: "start_date",
      headerName: "Start Date",
      width: 130,
      valueGetter: (params) =>
        new Date(params.row.start_date).toLocaleDateString(),
    },
    {
      field: "end_date",
      headerName: "End Date",
      width: 130,
      valueGetter: (params) =>
        new Date(params.row.end_date).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleUpdateGoal(params.row.id)}
            sx={{ marginRight: 1 }}
          >
            Update
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDeleteGoal(params.row.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className=" flex justify-between items-center">
        <Typography variant="h6" sx={{ mb: 2 }}>
          Manage Employee Goals
        </Typography>

        {/* Button to show the form */}
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hide Goal Form" : "Create or Update Goal"}
        </Button>
      </div>

      {/* Show form only when button is clicked */}
      {showForm && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>Employee:</Typography>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              fullWidth
            >
              <MenuItem value="" disabled>
                Select Employee
              </MenuItem>
              {employees.map((employee) => (
                <MenuItem
                  key={employee.employee_id}
                  value={employee.employee_id}
                >
                  {employee.employee_name}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>Goal:</Typography>
            <TextField
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>Start Date:</Typography>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="border border-gray-300 rounded-md p-1 w-full"
              minDate={new Date()}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>End Date:</Typography>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="border border-gray-300 rounded-md p-1 w-full"
              minDate={new Date()}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitGoal}
            >
              {isUpdate ? "Update Goal" : "Submit Goal"}
            </Button>
          </Grid>
        </Grid>
      )}

      {/* <div style={{ height: 400, width: "100%", marginTop: 20 }}>
        <DataGrid rows={goals} columns={columns} pageSize={5} />
      </div> */}

      <div className="border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.no</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal, index) => (
              <TableRow key={goal.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{goal.employee.employee_id}</TableCell>
                <TableCell>{goal.start_date}</TableCell>
                <TableCell>{goal.end_date}</TableCell>
                <TableCell>{goal.goal_text}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Menu />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleUpdateGoal(goal.id)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* <Button>option</Button> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MEmployeeGoal;
