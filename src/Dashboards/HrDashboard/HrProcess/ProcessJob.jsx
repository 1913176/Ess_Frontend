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
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid

const ProcessJob = () => {
  const [jobs, setJobs] = useState([]);
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

  // Fetch jobs, locations, and roles on load
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
      console.error("Error fetching locations:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/roles/list/`);
      if (response.data.success && Array.isArray(response.data.roles)) {
        setRoles(response.data.roles);
      } else {
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
      // Update existing job
      try {
        await axios.put(
          `${apiBaseUrl}/api/department-active-jobs-update/${currentJobId}/`,
          formData,
        );
        fetchJobs();
        setOpenModal(false);
      } catch (error) {
        console.error("Error updating job:", error);
      }
    } else {
      // Add new job
      try {
        await axios.post(
          `${apiBaseUrl}/api/department-active-jobs/add/`,
          formData,
        );
        fetchJobs();
        setOpenModal(false);
      } catch (error) {
        console.error("Error adding job:", error);
      }
    }
  };

  const handleEditJob = (jobId) => {
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

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(
        `${apiBaseUrl}/api/department-active-jobs-delete/${jobId}/`,
      );
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  // Columns for the DataGrid
  const columns = [
    { field: "title", headerName: "Title", width: 180 },
    { field: "location", headerName: "Location Name", width: 180 },
    { field: "experience_level", headerName: "Experience Level", width: 180 },
    { field: "job_type", headerName: "Job Type", width: 180 },
    { field: "openings", headerName: "Openings", width: 120 },
    { field: "role", headerName: "Role", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleEditJob(params.row.id)}>Edit</Button>
          <Button
            color="error"
            onClick={() => handleDeleteJob(params.row.id)}
            style={{ marginLeft: 10 }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h3>Jobs</h3>
        <Button variant="contained" color="primary" onClick={handleAddJob}>
          Add Job
        </Button>
      </div>

      <div className="w-full h-full bg-white/50">
        <DataGrid rows={jobs} columns={columns} pageSize={5} />
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
                label="Experience Level"
                type="text"
                fullWidth
                name="experience_level"
                value={formData.experience_level}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Job Type"
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

export default ProcessJob;
