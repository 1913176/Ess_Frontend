import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
// import { TextField, Typography, Box, Button } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      .get(`${apiBaseUrl}/api/performance-review/list/`)
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

  // const columns = [
  //   { field: "feedback_date", headerName: "Date", flex: 1 },
  //   { field: "comments", headerName: "Comments", flex: 2 },
  // ];

  // if (loading) {
  //   return (
  //     <Typography sx={{ p: 2, color: "gray" }}>Loading feedback...</Typography>
  //   );
  // }

  // if (error) {
  //   return <Typography sx={{ p: 2, color: "red" }}>{error}</Typography>;
  // }

  return (
    // <Box sx={{ p: 2 }}>
    //   <div className="flex justify-between items-center">
    //     <Typography variant="h6" sx={{ mb: 2 }}>
    //       Feedback From Admin
    //     </Typography>
    //     {/* Add Feedback Button */}
    //     <Button
    //       variant="contained"
    //       color="primary"
    //       sx={{ mt: 2 }}
    //       onClick={() => setShowCommentBox(true)}
    //     >
    //       Add Feedback
    //     </Button>
    //   </div>
    //   <Box sx={{ height: 400, width: "100%" }}>
    //     <DataGrid
    //       rows={feedbacks}
    //       columns={columns}
    //       pageSize={5}
    //       getRowId={(row) => row.id || row.feedback_date} // Unique row IDs
    //       disableSelectionOnClick
    //       loading={loading}
    //     />
    //   </Box>

    //   {showCommentBox && (
    //     <Box sx={{ mt: 2 }}>
    //       <TextField
    //         fullWidth
    //         label="Enter Comment"
    //         value={comment}
    //         onChange={handleCommentChange}
    //         error={!!errorMsg}
    //         helperText={errorMsg}
    //         variant="outlined"
    //       />
    //     </Box>
    //   )}
    // </Box>

    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-xl">Manager Goals</h2>
        <Dialog>
          <DialogTrigger>
            <Button>add Feedback</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Goal</DialogTitle>
            </DialogHeader>
            <Input type="text" value={comment} onChange={handleCommentChange} />
            <DialogFooter>
              <DialogClose>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded h-full">
        <Table className="h-full">
          <TableHeader>
            <TableRow>
              <TableHead>S.no</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>no feed back available</TableCell>
              </TableRow>
            ) : (
              // <TableRow></TableRow>
              feedbacks.map((feedback, index) => (
                <TableRow>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{feedback.feedback_date}</TableCell>
                  <TableCell>{feedback.comments}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MManagerFeedback;
