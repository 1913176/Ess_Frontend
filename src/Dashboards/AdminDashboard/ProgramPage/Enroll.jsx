import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2 as Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddEnroll from "./AddEnroll";
import UpdateEnroll from "./UpdateEnroll";
const apiBaseUrl = process.env.VITE_BASE_API;

const Enroll = () => {
  const [programList, setProgramList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [enrollList, setEnrollList] = useState([]);
  const [addEnrollPopup, setAddEnrollPopup] = useState(false);
  const [updateEnrollPopup, setUpdateEnrollPopup] = useState(false);
  const [selectedEnroll, setSelectedEnroll] = useState(null);

  // Fetch the program list from the API
  const fetchProgramList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/training_programs/`);
      setProgramList(data);
    } catch (error) {
      console.error("Error fetching program list:", error);
      toast.error("Failed to fetch program list.");
    }
  };

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

  // Fetch the manager list from the API
  const fetchEmployeeList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`);
      setEmployeeList(data);
    } catch (error) {
      console.error("Error fetching employee list:", error);
      toast.error("Failed to fetch employee list.");
    }
  };

  const fetchEnrollList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/training_progress/`);
      setEnrollList(
        data.map((enroll) => {
          const programName =
            programList.find((p) => p.program_id === enroll.program)?.name ||
            "Unknown Program";
          const managerName =
            managerList.find((m) => m.id === enroll.manager)?.manager_name ||
            "Unknown Manager";
          const employeeName =
            employeeList.find((e) => e.id === enroll.employee)?.employee_name ||
            "Unknown Employee";

          return {
            id: enroll.id,
            program: programName,
            manager: managerName,
            employee: employeeName,
            completion_status: enroll.completion_status,
            completion_date: enroll.completion_date,
          };
        }),
      );
    } catch (error) {
      console.error("Error fetching enroll list:", error);
      toast.error("Failed to fetch enroll list.");
    }
  };

  // Ensure manager list is fetched before fetching programs
  useEffect(() => {
    fetchProgramList();
    fetchManagerList();
    fetchEmployeeList();
    fetchEnrollList();
  }, []);

  // Handle editing a program
  const handleEdit = (row) => {
    setSelectedEnroll(row);
    setUpdateEnrollPopup(true);
  };

  // Handle deleting a program
  const handleDelete = async (row) => {
    try {
      await axios.delete(`${apiBaseUrl}/delete_progress/${row.id}/`);
      toast.success(`Enroll ID ${row.id} deleted successfully.`);
      fetchEnrollList();
    } catch (error) {
      console.error("Error deleting enroll:", error);
      toast.error("Failed to delete enroll.");
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "program", headerName: "Program Name", width: 200 },
    { field: "manager", headerName: "Manager Name", width: 200 },
    { field: "employee", headerName: "Employee Name", width: 150 },
    { field: "completion_status", headerName: "Completion Status", width: 150 },
    { field: "completion_date", headerName: "Completion Date", width: 150 },
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
          <h3 className="text-2xl font-semibold">Enroll List</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddEnrollPopup(true)}
          >
            <UserPlus size={20} />
            Add Enroll
          </button>
        </div>

        <DataGrid
          className="z-10"
          rows={enrollList}
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

        {/* Add Program Modal */}
        {addEnrollPopup && (
          <AddEnroll
            setAddEnrollPopup={setAddEnrollPopup}
            ProgramList={programList}
            ManagerList={managerList}
            EmployeeList={employeeList}
            fetchEnrollList={fetchEnrollList}
          />
        )}

        {/* Update Program Modal */}
        {updateEnrollPopup && selectedEnroll && (
          <UpdateEnroll
            setUpdateEnrollPopup={setUpdateEnrollPopup}
            enrollId={selectedEnroll.id}
            ProgramList={programList}
            ManagerList={managerList} // Pass reviewId explicitly
            EmployeeList={employeeList}
            fetchEnrollList={fetchEnrollList}
          />
        )}
      </div>
    </>
  );
};

export default Enroll;
