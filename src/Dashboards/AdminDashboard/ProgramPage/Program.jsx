import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2 as Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddProgram from "./AddProgram";
import UpdateProgram from "./UpdateProgram";
const apiBaseUrl = process.env.VITE_BASE_API;

const Program = () => {
  const [programList, setProgramList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [addProgramPopup, setAddProgramPopup] = useState(false);
  const [updateProgramPopup, setUpdateProgramPopup] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Fetch the manager list from the API
  const fetchManagerList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
      setManagerList(data);
    } catch (error) {
      console.error("Error fetching manager list:", error);
      toast.error("Failed to fetch manager list.");
    }
  };

  // Fetch the program list from the API
  const fetchProgramList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/training_programs/`);

      const mappedPrograms = data.map((program) => {
        const trainingInchargeName =
          managerList.find(
            (manager) => manager.id === program.training_incharge,
          )?.manager_name || `ID: ${program.training_incharge}`; // Fallback to ID if name not found

        return {
          program_id: program.program_id,
          name: program.name,
          description: program.description,
          start_date: program.start_date,
          end_date: program.end_date,
          for_managers: program.for_managers ? "Yes" : "No",
          for_employees: program.for_employees ? "Yes" : "No",
          training_incharge: trainingInchargeName,
        };
      });

      setProgramList(mappedPrograms);
    } catch (error) {
      console.error("Error fetching program list:", error);
      toast.error("Failed to fetch program list.");
    }
  };

  // Ensure manager list is fetched before fetching programs
  useEffect(() => {
    const fetchData = async () => {
      await fetchManagerList();
      fetchProgramList();
    };

    fetchData();
  }, []);

  // Handle editing a program
  const handleEdit = (row) => {
    setSelectedProgram(row);
    setUpdateProgramPopup(true);
  };

  // Handle deleting a program
  const handleDelete = async (row) => {
    try {
      await axios.delete(`${apiBaseUrl}/delete_program/${row.program_id}/`);
      toast.success(`Program ID ${row.program_id} deleted successfully.`);
      fetchProgramList();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program.");
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    { field: "program_id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Program Name", width: 200 },
    { field: "description", headerName: "Description", width: 200 },
    { field: "start_date", headerName: "Start Date", width: 150 },
    { field: "end_date", headerName: "End Date", width: 150 },
    { field: "for_managers", headerName: "For Managers", width: 150 },
    { field: "for_employees", headerName: "For Employees", width: 150 }, // Correct column name
    { field: "training_incharge", headerName: "Training Incharge", width: 200 }, // Correct column name
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
      <div className="h-full min-h-screen p-6 container mx-auto z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">Training Program List</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddProgramPopup(true)}
          >
            <UserPlus size={20} />
            Add Program
          </button>
        </div>

        <DataGrid
          className="bg-white z-10"
          rows={programList}
          columns={columns}
          getRowId={(row) => row.program_id} // Ensure unique ID is used
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

        {/* Add Program Modal */}
        {addProgramPopup && (
          <AddProgram
            setAddProgramPopup={setAddProgramPopup}
            ManagerList={managerList}
            fetchProgramList={fetchProgramList}
          />
        )}

        {/* Update Program Modal */}
        {updateProgramPopup && selectedProgram && (
          <UpdateProgram
            setUpdateProgramPopup={setUpdateProgramPopup}
            programId={selectedProgram.program_id} // Pass reviewId explicitly
            ManagerList={managerList}
            fetchProgramList={fetchProgramList}
          />
        )}
      </div>
    </>
  );
};

export default Program;
