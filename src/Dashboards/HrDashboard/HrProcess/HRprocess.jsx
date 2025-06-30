import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";

const apiBaseUrl = process.env.VITE_BASE_API;

const HRprocess = () => {
  return (
    <div>
      <Schedule />
      <Job />
      <CalendarEvent />
    </div>
  );
};

export default HRprocess;

const Schedule = () => {
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
      console.log("Roles Response:", response.data); // Check what data is returned

      // Check if 'roles' is an array and set the state
      if (response.data.success && Array.isArray(response.data.roles)) {
        setRoles(response.data.roles);
      } else {
        console.error("Roles data is not an array or missing:", response.data);
        setRoles([]); // Default to empty array if the response is not correct
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]); // Set empty array in case of an error
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
      // Update existing schedule
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
      // Add new schedule
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

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleAddSchedule}>
        Add Schedule
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Participant</TableCell>
              <TableCell>Interviewer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.participant}</TableCell>
                <TableCell>{schedule.interviewer_name}</TableCell>
                <TableCell>{schedule.date}</TableCell>
                <TableCell>{schedule.time}</TableCell>
                <TableCell>{schedule.duration}</TableCell>
                <TableCell>{schedule.role}</TableCell>
                <TableCell>{schedule.email}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditSchedule(schedule.id)}>
                    Edit
                  </Button>
                  <Button onClick={() => handleDeleteSchedule(schedule.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';

const Job = () => {
  const [jobs, setJobs] = useState([]);
  //   const [managers, setManagers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    experience_level: "",
    location: "",
    job_type: "",
    openings: "",
    role: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);

  // Fetch schedules, managers, and roles on load
  useEffect(() => {
    fetchJobs();
    fetchLocations();
    fetchRoles();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/department-active-jobs/`,
      );
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/admin/overall-location/`);
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/roles/list/`);
      console.log("Roles Response:", response.data); // Check what data is returned

      // Check if 'roles' is an array and set the state
      if (response.data.success && Array.isArray(response.data.roles)) {
        setRoles(response.data.roles);
      } else {
        console.error("Roles data is not an array or missing:", response.data);
        setRoles([]); // Default to empty array if the response is not correct
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]); // Set empty array in case of an error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddJob = () => {
    setFormData({
      title: "",
      role: "",
      location: "",
      experience_level: "",
      job_type: "",
      openings: "",
    });
    setOpenModal(true);
    setEditMode(false);
  };

  const handleSaveJob = async () => {
    if (editMode) {
      // Update existing schedule
      try {
        await axios.put(
          `${apiBaseUrl}/api/department-active-jobs-update/${currentJobId}/`,
          formData,
        );
        fetchJobs();
        setOpenModal(false);
      } catch (error) {
        console.error("Error updating jobs:", error);
      }
    } else {
      // Add new schedule
      try {
        await axios.post(
          `${apiBaseUrl}/api/department-active-jobs/add/`,
          formData,
        );
        fetchJobs();
        setOpenModal(false);
      } catch (error) {
        console.error("Error adding jobs:", error);
      }
    }
  };

  const handleEditSchedule = (jobId) => {
    const job = jobs.find((item) => item.id === jobId);
    setFormData({
      title: job.title,
      location: job.location,
      experience_level: job.experience_level,
      job_type: job.job_type,
      openings: job.openings,
      role: job.role,
    });
    setCurrentJobId(jobId);
    setOpenModal(true);
    setEditMode(true);
  };

  const handleDeleteSchedule = async (jobId) => {
    try {
      await axios.delete(
        `${apiBaseUrl}/api/department-active-jobs-delete/${jobId}/`,
      );
      fetchJobs();
    } catch (error) {
      console.error("Error deleting jobs:", error);
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleAddJob}>
        Add Job
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Location Name</TableCell>
              <TableCell>Experiance Leave</TableCell>
              <TableCell>Job Type</TableCell>
              <TableCell>Openings</TableCell>
              <TableCell>Role</TableCell>

              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>{job.experience_level}</TableCell>
                <TableCell>{job.job_type}</TableCell>
                <TableCell>{job.openings}</TableCell>
                <TableCell>{job.role}</TableCell>

                <TableCell>
                  <Button onClick={() => handleEditSchedule(job.id)}>
                    Edit
                  </Button>
                  <Button onClick={() => handleDeleteSchedule(job.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div
          style={{
            padding: "20px",
            background: "white",
            maxWidth: "500px",
            margin: "50px auto",
          }}
        >
          <h2>{editMode ? "Edit Job" : "Add Job"}</h2>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                >
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.location_name}>
                      {location.location_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Experiance Level"
                type="text"
                fullWidth
                name="experience_level"
                value={formData.experience_level}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Job type"
                type="text"
                fullWidth
                name="job_type"
                value={formData.job_type}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Openings"
                fullWidth
                type="number"
                name="openings"
                value={formData.openings}
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

            <Grid item xs={12} style={{ marginTop: "20px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveJob}
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

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';

const CalendarEvent = () => {
  const [events, setEvents] = useState([]);

  const [roles, setRoles] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/calendar/`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  //   const fetchLocations = async () => {
  //     try {
  //       const response = await axios.get(`${apiBaseUrl}/admin/overall-location/`);
  //       setLocations(response.data);
  //     } catch (error) {
  //       console.error('Error fetching location:', error);
  //     }
  //   };

  //   const fetchRoles = async () => {
  //     try {
  //       const response = await axios.get(`${apiBaseUrl}/roles/list/`);
  //       console.log('Roles Response:', response.data);  // Check what data is returned

  //       // Check if 'roles' is an array and set the state
  //       if (response.data.success && Array.isArray(response.data.roles)) {
  //         setRoles(response.data.roles);
  //       } else {
  //         console.error('Roles data is not an array or missing:', response.data);
  //         setRoles([]);  // Default to empty array if the response is not correct
  //       }
  //     } catch (error) {
  //       console.error('Error fetching roles:', error);
  //       setRoles([]);  // Set empty array in case of an error
  //     }
  //   };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddEvent = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
    });
    setOpenModal(true);
    setEditMode(false);
  };

  const handleSaveEvent = async () => {
    if (editMode) {
      // Update existing schedule
      try {
        await axios.put(
          `${apiBaseUrl}/api/calendar-update/${currentEventId}/`,
          formData,
        );
        fetchEvents();
        setOpenModal(false);
      } catch (error) {
        console.error("Error updating Events:", error);
      }
    } else {
      // Add new schedule
      try {
        await axios.post(`${apiBaseUrl}/api/calendar/add/`, formData);
        fetchEvents();
        setOpenModal(false);
      } catch (error) {
        console.error("Error adding events:", error);
      }
    }
  };

  const handleEditSchedule = (eventId) => {
    const event = events.find((item) => item.id === eventId);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
    });
    setCurrentEventId(eventId);
    setOpenModal(true);
    setEditMode(true);
  };

  const handleDeleteSchedule = async (eventId) => {
    try {
      await axios.delete(`${apiBaseUrl}/api/calendar-delete/${eventId}/`);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting events:", error);
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleAddEvent}>
        Add Event
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>

              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>{event.start_time}</TableCell>
                <TableCell>{event.end_time}</TableCell>

                <TableCell>
                  <Button onClick={() => handleEditSchedule(event.id)}>
                    Edit
                  </Button>
                  <Button onClick={() => handleDeleteSchedule(event.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div
          style={{
            padding: "20px",
            background: "white",
            maxWidth: "500px",
            margin: "50px auto",
          }}
        >
          <h2>{editMode ? "Edit Event" : "Add Event"}</h2>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                type="text"
                fullWidth
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
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
                label="Start Time"
                type="time"
                fullWidth
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="End Time"
                type="time"
                fullWidth
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} style={{ marginTop: "20px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveEvent}
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
