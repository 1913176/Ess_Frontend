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

const CalendarEvent = () => {
  const [events, setEvents] = useState([]);
  //   const [managers, setManagers] = useState([]);
  const [roles, setRoles] = useState([]);
  //   const [locations, setLocations] = useState([]);
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

  // Fetch schedules, managers, and roles on load
  useEffect(() => {
    fetchEvents();
    // fetchLocations();
    // fetchRoles();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/calendar/");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  //   const fetchLocations = async () => {
  //     try {
  //       const response = await axios.get('http://127.0.0.1:8000/admin/overall-location/');
  //       setLocations(response.data);
  //     } catch (error) {
  //       console.error('Error fetching location:', error);
  //     }
  //   };

  //   const fetchRoles = async () => {
  //     try {
  //       const response = await axios.get('http://127.0.0.1:8000/roles/list/');
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
          `http://127.0.0.1:8000/api/calendar-update/${currentEventId}/`,
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
        await axios.post("http://127.0.0.1:8000/api/calendar/add/", formData);
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
      await axios.delete(
        `http://127.0.0.1:8000/api/calendar-delete/${eventId}/`,
      );
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

export default CalendarEvent;
