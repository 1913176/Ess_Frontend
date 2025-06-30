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
// import AddReview from "./AddReview";
// import UpdateReview from "./UpdateReview";
const apiBaseUrl = process.env.VITE_BASE_API;

const EmployeeGoal = () => {
  const [employeegoalList, setEmployeeGoalList] = useState([]);
  //   const [managerList, setManagerList] = useState([]);
  //   const [addReviewPopup, setAddReviewPopup] = useState(false);
  //   const [updateReviewPopup, setUpdateReviewPopup] = useState(false);
  //   const [selectedReview, setSelectedReview] = useState(null);

  // Fetch the review list from the API
  const fetchEmployeeGoalList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/goal/list/`);
      setEmployeeGoalList(
        data.map((goal) => ({
          id: goal.id,
          employee: goal.employee.employee_name, // Extract manager_name
          goal_text: goal.goal_text,
          start_date: goal.start_date,
          end_date: goal.end_date,
          is_completed: goal.is_completed,
        })),
      );
    } catch (error) {
      console.error("Error fetching employee goal list:", error);
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
    fetchEmployeeGoalList();
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
      await axios.delete(`${apiBaseUrl}/goals-delete/${row.id}/`);
      toast.success(`Employee Goal ID ${row.id} deleted successfully.`);
      fetchEmployeeGoalList();
    } catch (error) {
      toast.error("Failed to delete Goal.");
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "employee", headerName: "Employee Name", width: 200 },
    { field: "goal_text", headerName: "Goal Text", width: 200 },
    { field: "start_date", headerName: "Start Date", width: 150 },
    { field: "end_date", headerName: "End Date", width: 150 },
    { field: "is_completed", headerName: "Is Completed", width: 150 },
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
          <h3 className="text-2xl font-semibold">Employee Goal List</h3>
          {/* <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddReviewPopup(true)}
          >
            <UserPlus size={20} />
            Add Manager Performance Review
          </button> */}
        </div>

        <div className="border rounded-lg">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeegoalList.map((goal) => (
                <TableRow>
                  <TableCell>{goal.id}</TableCell>
                  <TableCell>{goal.employee}</TableCell>
                  <TableCell>{goal.goal_text}</TableCell>
                  <TableCell>{goal.start_date}</TableCell>
                  <TableCell>{goal.end_date}</TableCell>
                  <TableCell>
                    {goal.is_completed === true ? (
                      <span>Completed</span>
                    ) : (
                      <span>Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* <button className="btn-primary" onClick={() => handleEdit(goal)}>
            <Edit />
          </button> */}
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(goal)}
                      >
                        <Trash2Icon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* <DataGrid
          rows={employeegoalList}
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

export default EmployeeGoal;
