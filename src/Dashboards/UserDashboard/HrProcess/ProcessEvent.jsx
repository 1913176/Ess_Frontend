import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, TextField, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const apiBaseUrl = process.env.VITE_BASE_API;

const ProcessEvent = () => {
  const [events, setEvents] = useState([]);
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
      console.error("Error fetching events:", error);
    }
  };

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
      // Update existing event
      try {
        await axios.put(
          `${apiBaseUrl}/api/calendar-update/${currentEventId}/`,
          formData,
        );
        fetchEvents();
        setOpenModal(false);
      } catch (error) {
        console.error("Error updating Event:", error);
      }
    } else {
      // Add new event
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

  // Define columns for DataGrid
  const columns = [
    { field: "title", headerName: "Title", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
    { field: "date", headerName: "Date", width: 150 },
    { field: "start_time", headerName: "Start Time", width: 150 },
    { field: "end_time", headerName: "End Time", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div>
          <Button onClick={() => handleEditSchedule(params.row.id)}>
            Edit
          </Button>
          <Button onClick={() => handleDeleteSchedule(params.row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Convert events to rows for DataGrid
  const rows = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    start_time: event.start_time,
    end_time: event.end_time,
  }));

  return (
    <div className="p-4">
      <div className=" flex justify-between items-center mb-4">
        <h3>Events</h3>
        <Button variant="contained" color="primary" onClick={handleAddEvent}>
          Add Event
        </Button>
      </div>

      <div className="bg-white/50 w-full h-full">
        <DataGrid rows={rows} columns={columns} pageSize={5} />
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

export default ProcessEvent;
