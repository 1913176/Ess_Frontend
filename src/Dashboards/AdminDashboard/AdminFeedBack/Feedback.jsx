// import { Feedback } from "@mui/icons-material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  //   const [managerList, setManagerList] = useState([]);
  //   const [addReviewPopup, setAddReviewPopup] = useState(false);
  //   const [updateReviewPopup, setUpdateReviewPopup] = useState(false);
  //   const [selectedReview, setSelectedReview] = useState(null);

  // Fetch the review list from the API
  const fetchFeedbackList = async () => {
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/api/admin_feedback_dashboard/`,
      );
      setFeedbackList(
        data.map((feedback) => ({
          id: feedback.id,
          employee: feedback.employee.employee_name || N / A,
          manager: feedback.manager.manager_name || N / A, // Extract manager_name
          feedback_date: feedback.feedback_date,
          comments: feedback.comments,
          is_reviewed: feedback.is_reviewed,
        })),
      );
    } catch (error) {
      console.error("Error fetching feedback list:", error);
    }
  };

  // Fetch the manager list from the API
  //   const fetchManagerList = async () => {
  //     try {
  //       const { data } = await axios.get(`http://127.0.0.1:8000/api/manager_list/`);
  //       setManagerList(data);
  //     } catch (error) {
  //       console.error("Error fetching manager list:", error);
  //     }
  //   };

  useEffect(() => {
    fetchFeedbackList();
    // fetchManagerList();
  }, []);

  // Handle editing a review
  //   const handleEdit = (row) => {
  //     setSelectedReview(row);
  //     setUpdateReviewPopup(true);
  //   };

  // Handle deleting a review
  const handleDelete = async (row) => {
    try {
      await axios.delete(`${apiBaseUrl}/delete_admin_feedback/${row.id}/`);
      toast.success(`Feedback ID ${row.id} deleted successfully.`);
      fetchFeedbackList();
    } catch (error) {
      toast.error("Failed to delete feedback.");
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "employee", headerName: "Employee Name", width: 200 },
    { field: "manager", headerName: "Manager Name", width: 200 },
    { field: "feedback_date", headerName: "Feedback Date", width: 200 },
    { field: "comments", headerName: "Comments", width: 150 },
    { field: "is_reviewed", headerName: "Is Reviewed", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2">
          {/* <button className="btn-primary" onClick={() => handleEdit(params.row)}>
            <Edit />
          </button> */}
          <button
            className="btn-danger"
            onClick={() => handleDelete(params.row)}
          >
            <Trash2Icon />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="h-full min-h-screen p-6 container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">Feedback List</h3>
          {/* <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddReviewPopup(true)}
          >
            <UserPlus size={20} />
            Add Manager Performance Review
          </button> */}
        </div>

        <div className="border">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbackList.length > 0 ? (
                feedbackList.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.id}</TableCell>
                    <TableCell>{feedback.manager}</TableCell>
                    <TableCell>{feedback.employee}</TableCell>
                    <TableCell>{feedback.feedback_date}</TableCell>
                    <TableCell>{feedback.comments}</TableCell>
                    <TableCell>{feedback.is_reviewed}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell> Do you have any feedbacks </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* <DataGrid
          rows={feedbackList}
          columns={columns}
          getRowId={(row) => row.id} // Ensure unique ID is used
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 6,
              },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          disableRowSelectionOnClick
        /> */}

        {/* Add Manager Review Modal */}
        {/* {addReviewPopup && (
          <AddReview
            setAddReviewPopup={setAddReviewPopup}
            ManagerList={managerList}
            fetchReviewList={fetchReviewList}
          />
        )} */}

        {/* Update Manager Review Modal */}
        {/* {updateReviewPopup && selectedReview && (
          <UpdateReview
            setUpdateReviewPopup={setUpdateReviewPopup}
            reviewId={selectedReview.id} // Pass reviewId explicitly
            ManagerList={managerList}
            fetchReviewList={fetchReviewList}
          />
        )} */}
      </div>
    </>
  );
};

export default Feedback;
