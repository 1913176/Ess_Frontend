import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddReview from "./AddReview";
import UpdateReview from "./UpdateReview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerPerformanceRivewList = () => {
  const [reviewList, setReviewList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [addReviewPopup, setAddReviewPopup] = useState(false);
  const [updateReviewPopup, setUpdateReviewPopup] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Fetch the review list from the API
  const fetchReviewList = async () => {
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/admin/get_performance_review_all/`,
      );
      setReviewList(
        data.map((review) => ({
          id: review.id,
          manager: review.manager.manager_name, // Extract manager_name
          review_date: review.review_date,
          comments: review.comments,
          score: review.score,
        })),
      );
    } catch (error) {
      console.error("Error fetching review list:", error);
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
    fetchReviewList();
    fetchManagerList();
  }, []);

  // Handle editing a review
  const handleEdit = (row) => {
    setSelectedReview(row);
    setUpdateReviewPopup(true);
  };

  // Handle deleting a review
  const handleDelete = async (row) => {
    try {
      await axios.delete(
        `${apiBaseUrl}/delete_performance_review_manager/${row.id}/`,
      );
      toast.success(`Manager Performance ID ${row.id} deleted successfully.`);
      fetchReviewList();
    } catch (error) {
      toast.error("Failed to delete review.");
    }
  };

  // Define the columns for the DataGrid
  // const columns = [
  //   { field: "id", headerName: "ID", width: 90 },
  //   { field: "manager", headerName: "Manager Name", width: 200 },
  //   { field: "review_date", headerName: "Review Date", width: 200 },
  //   { field: "comments", headerName: "Comments", width: 150 },
  //   { field: "score", headerName: "Score", width: 150 },
  //   {
  //     field: "actions",
  //     headerName: "Actions",
  //     width: 150,
  //     renderCell: (params) => (
  //       <div className="flex gap-2">
  //         <button
  //           className="btn-primary"
  //           onClick={() => handleEdit(params.row)}>
  //           <Edit />
  //         </button>
  //         <button
  //           className="btn-danger"
  //           onClick={() => handleDelete(params.row)}>
  //           <Trash2Icon />
  //         </button>
  //       </div>
  //     ),
  //   },
  // ];

  return (
    <>
      <div className="h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">
            Manager Performance Review List
          </h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddReviewPopup(true)}
          >
            <UserPlus size={20} />
            Add Manager Performance Review
          </button>
        </div>

        <Table className="text-base border h-full rounded-xl">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewList.map((review) => (
              <TableRow key={review.id}>
                <TableCell>{review.id}</TableCell>
                <TableCell>{review.manager}</TableCell>
                <TableCell>{review.review_date}</TableCell>
                <TableCell>{review.comments}</TableCell>
                <TableCell>{review.score}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      className="btn-primary"
                      onClick={() => handleEdit(review)}
                    >
                      <Edit />
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(review)}
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
          rows={reviewList}
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
        {addReviewPopup && (
          <AddReview
            setAddReviewPopup={setAddReviewPopup}
            ManagerList={managerList}
            fetchReviewList={fetchReviewList}
          />
        )}

        {/* Update Manager Review Modal */}
        {updateReviewPopup && selectedReview && (
          <UpdateReview
            setUpdateReviewPopup={setUpdateReviewPopup}
            reviewId={selectedReview.id} // Pass reviewId explicitly
            ManagerList={managerList}
            fetchReviewList={fetchReviewList}
          />
        )}
      </div>
    </>
  );
};

export default ManagerPerformanceRivewList;
