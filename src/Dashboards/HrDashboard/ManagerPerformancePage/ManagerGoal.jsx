import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddGoal from "./AddGoal";
import UpdateGoal from "./UpdateGoal";

const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerGoal = () => {
  const [goalList, setGoalList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [addGoalPopup, setAddGoalPopup] = useState(false);
  const [updateGoalPopup, setUpdateGoalPopup] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Fetch the review list from the API
  const fetchGoalList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/get-manager-goal-all/`);
      setGoalList(
        data.map((goal) => ({
          id: goal.id,
          manager: goal.manager.manager_name, // Extract manager_name
          goal_text: goal.goal_text,
          start_date: goal.start_date,
          end_date: goal.end_date,
          is_completed: goal.is_completed,
        })),
      );
    } catch (error) {
      console.error("Error fetching goal list:", error);
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
    fetchGoalList();
    fetchManagerList();
  }, []);

  // Handle editing a review
  const handleEdit = (row) => {
    setSelectedGoal(row);
    setUpdateGoalPopup(true);
  };

  // Handle deleting a review
  const handleDelete = async (row) => {
    try {
      await axios.delete(`${apiBaseUrl}/delete-goal/${row.id}/`);
      toast.success(`Manager goal ID ${row.id} deleted successfully.`);
      fetchGoalList();
    } catch (error) {
      toast.error("Failed to delete goal.");
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "manager", headerName: "Manager Name", width: 200 },
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
          <h3 className="text-2xl font-semibold">Manager Goal List</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddGoalPopup(true)}
          >
            <UserPlus size={20} />
            Add Manager Goal
          </button>
        </div>

        <DataGrid
          rows={goalList}
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
        {addGoalPopup && (
          <AddGoal
            setAddGoalPopup={setAddGoalPopup}
            ManagerList={managerList}
            fetchGoalList={fetchGoalList}
          />
        )}

        {/* Update Manager Review Modal */}
        {updateGoalPopup && selectedGoal && (
          <UpdateGoal
            setUpdateGoalPopup={setUpdateGoalPopup}
            goalId={selectedGoal.id} // Pass reviewId explicitly
            ManagerList={managerList}
            fetchGoalList={fetchGoalList}
          />
        )}
      </div>
    </>
  );
};

export default ManagerGoal;
