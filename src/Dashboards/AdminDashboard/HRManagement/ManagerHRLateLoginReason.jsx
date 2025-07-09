import React, { useState, useEffect } from "react";
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
import { Button } from "@mui/material";

const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerHRLateLoginReason = () => {
  const [lateLoginReasons, setLateLoginReasons] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLateLoginReasons = async (retryCount = 3) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiBaseUrl}/admin_hr_late_login_reasons/`,
        { withCredentials: true }
      );
      const normalizedData = response.data.late_login_reasons.map((reason) => ({
        ...reason,
        status: reason.status.charAt(0).toUpperCase() + reason.status.slice(1),
        leave_type: reason.leave_type || "N/A",
      }));
      setLateLoginReasons(normalizedData);
    } catch (error) {
      console.error("Error fetching HR late login reasons:", error);
      if (retryCount > 0) {
        console.log(`Retrying fetchLateLoginReasons... (${retryCount} attempts left)`);
        setTimeout(() => fetchLateLoginReasons(retryCount - 1), 1000);
      } else {
        toast.error("Failed to fetch HR late login reasons.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLateLoginReasons();
  }, []);

  const handleApprove = async (reasonId) => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/approve_hr_late_login_reason/${reasonId}/`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message || "Reason approved successfully. Associated leave marked as rejected.");
      fetchLateLoginReasons();
    } catch (error) {
      console.error("Error approving HR reason:", error);
      const errorMessage = error.response?.data?.error || "Failed to approve reason.";
      toast.error(errorMessage);
    }
  };

  const handleReject = async (reasonId) => {
    if (!window.confirm("Rejecting this reason will keep the leave approved and may deduct from the HR's leave balance. Continue?")) {
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/reject_hr_late_login_reason/${reasonId}/`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message || "Reason rejected successfully. Associated leave remains approved.");
      fetchLateLoginReasons();
    } catch (error) {
      console.error("Error rejecting HR reason:", error);
      const errorMessage = error.response?.data?.error || "Failed to reject reason.";
      toast.error(errorMessage);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchLateLoginReasons();
  };

  return (
    <div className="h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">HR Late Login Reason Submissions</h3>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          disabled={loading}
          style={{ textTransform: "none" }}
        >
          Refresh
        </Button>
      </div>
      <div className="border rounded-md bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>HR</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Reason Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="7" className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : lateLoginReasons.length > 0 ? (
              lateLoginReasons.map((reason, index) => (
                <TableRow key={reason.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{reason.hr_name}</TableCell>
                  <TableCell>{reason.date}</TableCell>
                  <TableCell>
                    {reason.leave_type.charAt(0).toUpperCase() + reason.leave_type.slice(1)}
                  </TableCell>
                  <TableCell>{reason.reason}</TableCell>
                  <TableCell>
                    <span
                      className={`p-2 text-center text-sm rounded-lg ${
                        reason.status === "Pending"
                          ? "text-orange-700 bg-orange-100"
                          : reason.status === "Approved"
                          ? "text-green-700 bg-green-100"
                          : "text-red-700 bg-red-100"
                      }`}
                    >
                      {reason.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(reason.id)}
                      disabled={reason.status !== "Pending"}
                      style={{ marginRight: "8px" }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(reason.id)}
                      disabled={reason.status !== "Pending"}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="text-center">
                  No HR late login reasons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManagerHRLateLoginReason;