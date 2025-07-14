import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import RequestLeave from "./RequestLeave";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";

const apiBaseUrl = process.env.VITE_BASE_API;
const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

const HrLeaveManagement = () => {
  const [isOpenRequest, setIsOpenRequest] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });

  const [leaveData, setLeaveData] = useState([]);

  // Fetch Leave Data from Backend
  useEffect(() => {
    const fetchLeaveData = async () => {
      const userdata = JSON.parse(sessionStorage.getItem("userdata"));
      try {
        const response = await axios.get(
          `${apiBaseUrl}/hr-leave-history-id/${userdata.hr_id}/`,
        );
        setLeaveData(response.data); // Update leave data from API response
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    };

    fetchLeaveData();
  }, []);

  // Filter Leave Data
  const filteredData = leaveData.filter((leave) => {
    const isStartDateMatch =
      !filters.startDate || leave.startDate >= filters.startDate;
    const isEndDateMatch = !filters.endDate || leave.endDate <= filters.endDate;
    const isStatusMatch =
      !filters.status ||
      leave.status.toLowerCase() === filters.status.toLowerCase();

    return isStartDateMatch && isEndDateMatch && isStatusMatch;
  });

  const columns = [
    { field: "no", headerName: "No", width: 100 },
    { field: "start_date", headerName: "Start Date", width: 150 },
    { field: "end_date", headerName: "End Date", width: 150 },
    { field: "reason", headerName: "Reason", width: 200 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Button variant="contained" color="primary">
          View
        </Button>
      ),
    },
  ];

  const rows = filteredData.map((leave, index) => ({
    id: leave.id,
    no: index + 1,
    start_date: leave.start_date,
    end_date: leave.end_date,
    reason: leave.reason,
    status: (
      <p
        className={`p-2 text-center text-sm rounded-lg ${
          leave.status === "Pending"
            ? "text-orange-700 bg-orange-100"
            : leave.status === "Approved"
              ? "text-green-700 bg-green-100"
              : "text-red-700 bg-red-100"
        }`}
      >
        {leave.status}
      </p>
    ),
    actions: (
      <Button variant="contained" color="primary">
        View
      </Button>
    ),
  }));

  return (
    <div className="relative p-4 flex flex-col gap-4 min-h-dvh h-full">
      <h2 className="text-header">Leave Management</h2>
      <div className="h-full flex flex-col w-full border rounded-md gap-4">
        <div className="w-full flex items-center justify-between">
          <p>Total Leave: 10 days</p>
          <div className="flex flex-col items-end gap-4">
            <div className="btn-group flex items-center gap-2">
              <button
                className="secondary-btn"
                onClick={() => setIsOpenFilter((prev) => !prev)}
              >
                Filter
              </button>
              <button
                className="primary-btn flex items-center"
                onClick={() => setIsOpenRequest(true)}
              >
                <Plus height={15} width={15} /> Add Leave
              </button>
            </div>
            {/* Filter Section */}
            {isOpenFilter && (
              <FilterLeave filters={filters} setFilters={setFilters} />
            )}
          </div>
        </div>

        {/* DataGrid for Leave Table */}
        <div className="w-full h-full min-h-dvh">
          <DataGrid
            className="min-h-dvh"
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </div>

        {/* Add Leave Modal */}
        {isOpenRequest && (
          <RequestLeave
            setIsOpenRequest={setIsOpenRequest}
            leaveData={leaveData}
          />
        )}
      </div>
    </div>
  );
};

export default HrLeaveManagement;

// Filter Component
const FilterLeave = ({ filters, setFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="w-full flex flex-wrap gap-4 items-center">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="input input-bordered w-full p-2 bg-slate-200 rounded-lg"
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
};
