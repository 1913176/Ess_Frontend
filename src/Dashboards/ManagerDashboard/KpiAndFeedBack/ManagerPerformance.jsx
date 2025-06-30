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

const ManagerPerformance = ({ manager_name }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/view_manager_reviews/`)
      .then((response) => {
        // Check if response.data is an array or an object with a message
        if (Array.isArray(response.data)) {
          setReviews(response.data);  // Set reviews to the array of reviews
        } else {
          setReviews([]);  // If it's an object with a message, fallback to empty array
          setError(response.data.message || "Failed to load performance reviews.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching performance reviews:", error);
        setError("Failed to load performance reviews.");
        setLoading(false);
      });
  }, [manager_name]);

  // const columns = [
  //   { field: "review_date", headerName: "Review Date", flex: 1 },
  //   {
  //     field: "reviewer",
  //     headerName: "Reviewer",
  //     flex: 1,
  //     renderCell: () => "Admin",
  //   },
  //   { field: "comments", headerName: "Comments", flex: 2 },
  //   { field: "score", headerName: "Score", flex: 1 },
  // ];

  // if (error) {
  //   return <Typography sx={{ p: 2, color: "red" }}>{error}</Typography>;
  // }

  return (
    // <Box sx={{ p: 2 }}>
    //   <Typography variant="h6" sx={{ mb: 2 }}>
    //     Performance Reviews
    //   </Typography>

    //   <Box  sx={{ height: "100dvh", width: "100%" }}>
    //     <DataGrid
    //       className="bg-white"
    //       rows={reviews}
    //       columns={columns}
    //       pageSize={5}
    //       getRowId={(row) => row.id || row.review_date} // Unique row IDs
    //       disableSelectionOnClick
    //       loading={loading}
    //     />
    //   </Box>
    // </Box>

    <div className="p-4 space-y-4">
      <h2 className="text-xl font-medium">Performance Reviews</h2>
      <div className="border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.no</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Score</TableHead>
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
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No performance reviews found.</TableCell>
              </TableRow>
            ) : (
              reviews.map((review, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{review.review_date}</TableCell>
                  <TableCell>{review.manager.manager_name}</TableCell>
                  <TableCell>{review.comments}</TableCell>
                  <TableCell>{review.score}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManagerPerformance;
