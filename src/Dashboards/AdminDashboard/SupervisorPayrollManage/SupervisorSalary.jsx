import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, Trash2Icon, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddSupervisorSalary from "./AddSupervisorSalary";
import UpdateSupervisorSalary from "./UpdateSupervisorSalary";
import Default_img from "../../../assets/Images/Default_user_image.png";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;

const SupervisorSalary = () => {
  const [salaryList, setSalaryList] = useState([]);
  const [supervisorList, setSupervisorList] = useState([]);
  const [addSalaryPopup, setAddSalaryPopup] = useState(false);
  const [updateSalaryPopup, setUpdateSalaryPopup] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const fetchSalaryList = async () => {
    const { data } = await axios.get(
      `http://127.0.0.1:8000/supervisor-salary/history/`,
    );
    setSalaryList(
      data.map((salary) => ({
        id: salary.id,
        user_id: salary.user_id,
        annual_salary: salary.annual_salary,
        bonus: salary.bonus,
        total_salary: salary.total_salary,
        monthly_salary: salary.monthly_salary,
        effective_date: salary.effective_date,
        updated_date: salary.updated_date,
      })),
    );
  };

  const fetchSupervisorList = async () => {
    const { data } = await axios.get(
      `http://127.0.0.1:8000/api/supervisor_list/`,
    );
    setSupervisorList(data);
  };

  useEffect(() => {
    fetchSalaryList();
    fetchSupervisorList();
  }, []);

  const handleEdit = (row) => {
    setSelectedSalary(row.id);
    setUpdateSalaryPopup(true);
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/delete-supervisor-salary/${row.id}/`,
      );
      toast.success(`Salary ID ${row.id} deleted successfully.`);
      fetchSalaryList();
    } catch (error) {
      toast.error("Failed to delete Salary.");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "user_id", headerName: "Supervisor ID", width: 90 },
    { field: "annual_salary", headerName: "Annual Salary", width: 200 },
    { field: "bonus", headerName: "Bonus", width: 200 },
    { field: "total_salary", headerName: "Total Salary", width: 150 },
    { field: "monthly_salary", headerName: "Monthly Salary", width: 150 },
    { field: "effective_date", headerName: "Effective Date", width: 90 },
    { field: "updated_date", headerName: "Updated Date", width: 90 },
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
          <h3 className="text-2xl font-semibold">Supervisor Salary List</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setAddSalaryPopup(true)}
          >
            <UserPlus size={20} />
            Add Salary
          </button>
        </div>

        <DataGrid
          rows={salaryList}
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

        {/* Add Supervisor Salary Modal */}
        {addSalaryPopup && (
          <AddSupervisorSalary
            setAddSalaryPopup={setAddSalaryPopup}
            SupervisorList={supervisorList}
            fetchSalaryList={fetchSalaryList}
          />
        )}

        {/* Update Supervisor Salary Modal */}
        {updateSalaryPopup && selectedSalary && (
          <UpdateSupervisorSalary
            setUpdateSalaryPopup={setUpdateSalaryPopup}
            salaryId={selectedSalary} // Pass supervisorId explicitly
            SupervisorList={supervisorList}
          />
        )}
      </div>
    </>
  );
};

export default SupervisorSalary;
