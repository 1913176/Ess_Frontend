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
        "http://127.0.0.1:8000/api/department-active-jobs/",
      );
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/admin/overall-location/",
      );
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/roles/list/");
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
          `http://127.0.0.1:8000/api/department-active-jobs-update/${currentJobId}/`,
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
          "http://127.0.0.1:8000/api/department-active-jobs/add/",
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
        `http://127.0.0.1:8000/api/department-active-jobs-delete/${jobId}/`,
      );
      fetchJobs();
    } catch (error) {
      console.error("Error deleting jobs:", error);
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleAddJob}>
        Add Schedule
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

export default Job;
