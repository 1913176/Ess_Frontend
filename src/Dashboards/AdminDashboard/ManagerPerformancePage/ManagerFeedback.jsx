import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddFeedback from "./AddFeedback";
import UpdateFeedback from "./UpdateFeedback";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tab } from "@mui/material";
const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [addFeedbackPopup, setAddFeedbackPopup] = useState(false);
  const [updateFeedbackPopup, setUpdateFeedbackPopup] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Fetch the review list from the API
  const fetchFeedbackList = async () => {
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/api/view_manager_feedbacks/`,
      );
      console.log("Feedback API response:", data); // Debug log
      if (Array.isArray(data)) {
        setFeedbackList(
          data.map((feedback) => ({
            id: feedback.id,
            to_manager: feedback.to_manager.manager_name, // Extract manager_name
            comments: feedback.comments,
            feedback_date: feedback.feedback_date,
          })),
        );
      } else {
        setFeedbackList([]); // Set empty list if response is not an array
      }
    } catch (error) {
      console.error("Error fetching feedback list:", error);
      toast.error("Failed to fetch feedback list.");
      setFeedbackList([]); // Ensure list is cleared on error
    }
  };

  // Fetch the manager list from the API
  const fetchManagerList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
      setManagerList(data);
    } catch (error) {
      console.error("Error fetching manager list:", error);
    }
  };

  useEffect(() => {
    fetchFeedbackList();
    fetchManagerList();
  }, []);

  // Handle editing a review
  const handleEdit = (row) => {
    setSelectedFeedback(row);
    setUpdateFeedbackPopup(true);
  };

  // Handle deleting a review
  const handleDelete = async (row) => {
    try {
      await axios.delete(`${apiBaseUrl}/delete_manager_feedback/${row.id}/`);
      toast.success(`Manager Feedback ID ${row.id} deleted successfully.`);
      fetchFeedbackList(); // This refreshes the list properly
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete feedback.");
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "to_manager", headerName: "Manager Name", width: 200 },
    { field: "comments", headerName: "Comments", width: 200 },
    { field: "feedback_date", headerName: "Feedback Date", width: 150 },

    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            className="btn-primary"
            onClick={() => handleEdit(params.row)}
          >
            <Edit />
          </button>
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
          <h3 className="text-2xl font-semibold">Manager Feedback List</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddFeedbackPopup(true)}
          >
            <UserPlus size={20} />
            Add Manager Feedback
          </button>
        </div>

        <Table className="border text-base">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbackList.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>{feedback.id}</TableCell>
                <TableCell>{feedback.to_manager}</TableCell>
                <TableCell>{feedback.comments}</TableCell>
                <TableCell>{feedback.feedback_date}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      className="btn-primary"
                      onClick={() => handleEdit(feedback)}
                    >
                      <Edit />
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(feedback)}
                    >
                      <Trash2Icon />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

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
        {addFeedbackPopup && (
          <AddFeedback
            setAddFeedbackPopup={setAddFeedbackPopup}
            ManagerList={managerList}
            fetchFeedbackList={fetchFeedbackList}
          />
        )}

        {/* Update Manager Review Modal */}
        {updateFeedbackPopup && selectedFeedback && (
          <UpdateFeedback
            setUpdateFeedbackPopup={setUpdateFeedbackPopup}
            feedbackId={selectedFeedback.id} // Pass reviewId explicitly
            ManagerList={managerList}
            fetchFeedbackList={fetchFeedbackList}
          />
        )}
      </div>
    </>
  );
};

export default ManagerFeedback;