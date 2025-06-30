import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { TextField, Typography, Box, Button } from "@mui/material";

const apiBaseUrl = process.env.VITE_BASE_API;

const MManagerFeedback = ({ managerName }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState(""); // Comment input state
  const [errorMsg, setErrorMsg] = useState(""); // Input validation error
  const [showCommentBox, setShowCommentBox] = useState(false); // Controls comment box visibility

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/view_manager_feedbacks/`)
      .then((response) => {
        setFeedbacks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching feedback:", error);
        setError("Failed to load feedback.");
        setLoading(false);
      });
  }, [managerName]);

  // Handle comment input validation
  const handleCommentChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9\s]*$/; // Allows only letters, numbers, and spaces

    if (regex.test(value)) {
      setComment(value);
      setErrorMsg(""); // Clear error message
    } else {
      setErrorMsg("Special characters are not allowed.");
    }
  };

  const columns = [
    { field: "feedback_date", headerName: "Date", flex: 1 },
    { field: "comments", headerName: "Comments", flex: 2 },
  ];

  // if (loading) {
  //   return (
  //     <Typography sx={{ p: 2, color: "gray" }}>Loading feedback...</Typography>
  //   );
  // }

  if (error) {
    return <Typography sx={{ p: 2, color: "red" }}>{error}</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" sx={{ mb: 2 }}>
          Feedback From Admin
        </Typography>
        {/* Add Feedback Button */}
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => setShowCommentBox(true)}
        >
          Add Feedback
        </Button>
      </div>
      <Box sx={{ height: "100dvh", width: "100%" }}>
        <DataGrid
          className="bg-white"
          rows={feedbacks}
          columns={columns}
          pageSize={5}
          getRowId={(row) => row.id || row.feedback_date} // Unique row IDs
          disableSelectionOnClick
          loading={loading}
        />
      </Box>
      {/* Comment Input (Visible only when button is clicked) */}
      {showCommentBox && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1">
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Enter Comment"
              value={comment}
              onChange={handleCommentChange}
              error={!!errorMsg}
              helperText={errorMsg}
              variant="outlined"
            />
          </Box>
        </div>
      )}
    </Box>
  );
};

export default MManagerFeedback;
