import React, { useState, useEffect } from "react";
import axios from "axios";
const apiBaseUrl = process.env.VITE_BASE_API;
import {
  Button,
  Modal,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const ProcessSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [managers, setManagers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    participant: "",
    interviewer: "",
    date: "",
    time: "",
    duration: "",
    role: "",
    email: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState(null);

  // Fetch schedules, managers, and roles on load
  useEffect(() => {
    fetchSchedules();
    fetchManagers();
    fetchRoles();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/interview-schedules/`,
      );
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/manager_list/`);
      setManagers(response.data);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/roles/list/`);
      console.log("Roles Response:", response.data);

      if (response.data.success && Array.isArray(response.data.roles)) {
        setRoles(response.data.roles);
      } else {
        console.error("Roles data is not an array or missing:", response.data);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddSchedule = () => {
    setFormData({
      participant: "",
      interviewer: "",
      date: "",
      time: "",
      duration: "",
      role: "",
      email: "",
    });
    setOpenModal(true);
    setEditMode(false);
  };

  const handleSaveSchedule = async () => {
    if (editMode) {
      try {
        await axios.put(
          `${apiBaseUrl}/api/interview-schedules-update/${currentScheduleId}/`,
          formData,
        );
        fetchSchedules();
        setOpenModal(false);
      } catch (error) {
        console.error("Error updating schedule:", error);
      }
    } else {
      try {
        await axios.post(`${apiBaseUrl}/api/add-interview-schedule/`, formData);
        fetchSchedules();
        setOpenModal(false);
      } catch (error) {
        console.error("Error adding schedule:", error);
      }
    }
  };

  const handleEditSchedule = (scheduleId) => {
    const schedule = schedules.find((item) => item.id === scheduleId);
    setFormData({
      participant: schedule.participant,
      interviewer: schedule.interviewer_name,
      date: schedule.date,
      time: schedule.time,
      duration: schedule.duration,
      role: schedule.role,
      email: schedule.email,
    });
    setCurrentScheduleId(scheduleId);
    setOpenModal(true);
    setEditMode(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await axios.delete(
        `${apiBaseUrl}/api/interview-schedules-delete/${scheduleId}/`,
      );
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const columns = [
    { field: "participant", headerName: "Participant", width: 180 },
    { field: "interviewer", headerName: "Interviewer", width: 180 },
    { field: "date", headerName: "Date", width: 130 },
    { field: "time", headerName: "Time", width: 130 },
    { field: "duration", headerName: "Duration", width: 130 },
    { field: "role", headerName: "Role", width: 180 },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleEditSchedule(params.id)}>Edit</Button>
          <Button onClick={() => handleDeleteSchedule(params.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-4 min-h-dvh relative">
      <div className="flex justify-between items-center mb-5">
        <h3>Schedules</h3>
        <Button variant="contained" color="primary" onClick={handleAddSchedule}>
          Add Schedule
        </Button>
      </div>

      <div className="w-full h-full bg-white/50">
        <DataGrid
          className=""
          rows={schedules}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div
          style={{
            padding: "20px",
            background: "white",
            maxWidth: "500px",
            margin: "50px auto",
          }}
        >
          <h2>{editMode ? "Edit Schedule" : "Add Schedule"}</h2>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Participant"
                fullWidth
                name="participant"
                value={formData.participant}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Interviewer</InputLabel>
                <Select
                  name="interviewer"
                  value={formData.interviewer}
                  onChange={handleInputChange}
                >
                  {managers.map((manager) => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.manager_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Duration"
                type="time"
                fullWidth
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  {Array.isArray(roles) && roles.length > 0 ? (
                    roles.map((role) => (
                      <MenuItem key={role.id} value={role.role_name}>
                        {role.role_name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No roles available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} style={{ marginTop: "20px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSchedule}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </div>
      </Modal>
    </div>
  );
};

export default ProcessSchedule;
