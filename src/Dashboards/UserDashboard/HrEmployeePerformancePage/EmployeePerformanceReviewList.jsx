import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import AddReview from "./AddReview";
// import UpdateReview from "./UpdateReview";
const apiBaseUrl = process.env.VITE_BASE_API;

const EmployeePerformanceRivewList = () => {
  const [employeereviewList, setEmployeeReviewList] = useState([]);
  //   const [managerList, setManagerList] = useState([]);
  //   const [addReviewPopup, setAddReviewPopup] = useState(false);
  //   const [updateReviewPopup, setUpdateReviewPopup] = useState(false);
  //   const [selectedReview, setSelectedReview] = useState(null);

  // Fetch the review list from the API
  const fetchEmployeeReviewList = async () => {
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/api/performance-review/list/`,
      );
      setEmployeeReviewList(
        data.map((review) => ({
          id: review.id,
          employee: review.employee.employee_name,
          manager: review.manager.manager_name, // Extract manager_name
          review_date: review.review_date,
          comments: review.comments,
          score: review.score,
        })),
      );
    } catch (error) {
      console.error("Error fetching employee review list:", error);
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
    fetchEmployeeReviewList();
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
      await axios.delete(`${apiBaseUrl}/performance-reviews-delete/${row.id}/`);
      toast.success(`Employee Performance ID ${row.id} deleted successfully.`);
      fetchEmployeeReviewList();
    } catch (error) {
      toast.error("Failed to delete review.");
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "employee", headerName: "Employee Name", width: 200 },
    { field: "manager", headerName: "Manager Name", width: 200 },
    { field: "review_date", headerName: "Review Date", width: 200 },
    { field: "comments", headerName: "Comments", width: 150 },
    { field: "score", headerName: "Score", width: 150 },
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
          <h3 className="text-2xl font-semibold">
            Employee Performance Review List
          </h3>
          {/* <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddReviewPopup(true)}
          >
            <UserPlus size={20} />
            Add Manager Performance Review
          </button> */}
        </div>

        <DataGrid
          rows={employeereviewList}
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
        />

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

export default EmployeePerformanceRivewList;
