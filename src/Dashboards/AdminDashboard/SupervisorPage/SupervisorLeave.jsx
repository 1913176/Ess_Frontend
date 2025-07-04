
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 as Trash2Icon } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

const SupervisorLeave = () => {
  const [supervisorLeaveList, setSupervisorLeaveList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSupervisorLeaveList = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${apiBaseUrl}/supervisor-leave-status/`,
        { withCredentials: true }
      );
      const normalizedData = data.map((leave) => ({
        ...leave,
        status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
      }));
      setSupervisorLeaveList(normalizedData || []);
    } catch (error) {
      console.error("Error fetching leave list:", error);
      toast.error(
        error.response?.data?.detail || "Failed to fetch leave list."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisorLeaveList();
  }, []);

  const handleStatusChange = async (status, leaveId) => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/supervisor-leave-status/`,
        {
          leave_id: leaveId,
          status: status.toLowerCase(),
        },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      fetchSupervisorLeaveList();
    } catch (error) {
      console.error("Error updating status:", error.response?.data);
      toast.error(
        error.response?.data?.error || "Failed to update leave status."
      );
    }
  };

  const handleDelete = async (leaveId) => {
    if (!window.confirm(`Are you sure you want to delete Leave ID ${leaveId}?`)) {
      return;
    }
    try {
      await axios.delete(`${apiBaseUrl}/delete_supervisor_leave/${leaveId}/`, {
        withCredentials: true,
      });
      toast.success(`Leave ID ${leaveId} deleted successfully.`);
      fetchSupervisorLeaveList();
    } catch (error) {
      console.error("Error deleting leave record:", error);
      toast.error(
        error.response?.data?.detail || "Failed to delete leave record."
      );
    }
  };

  return (
    <div className="h-full p-4">
      <h3 className="mb-4">Supervisor Leave List</h3>
      <div className="border rounded-md bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.no</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="8" className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : supervisorLeaveList.length > 0 ? (
              supervisorLeaveList.map((leave, index) => (
                <TableRow key={leave.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{leave.user}</TableCell>
                  <TableCell>{leave.start_date}</TableCell>
                  <TableCell>{leave.end_date}</TableCell>
                  <TableCell>{leave.leave_type}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <span
                      className={`p-2 text-center text-sm rounded-lg ${
                        leave.status === "Pending"
                          ? "text-orange-700 bg-orange-100"
                          : leave.status === "Approved"
                          ? "text-green-700 bg-green-100"
                          : "text-red-700 bg-red-100"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <button
                      className="btn-primary"
                      onClick={() => handleStatusChange("Approved", leave.id)}
                      disabled={leave.status === "Approved"}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleStatusChange("Rejected", leave.id)}
                      disabled={leave.status === "Rejected"}
                    >
                      Reject
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(leave.id)}
                    >
                      <Trash2Icon />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="8" className="text-center">
                  No leave requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SupervisorLeave;
