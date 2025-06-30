import React, { useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const apiBaseUrl = process.env.VITE_BASE_API || "http://localhost:8000";

const SkeletonLoading = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="bg-gray-200 rounded-lg animate-pulse p-4">
        <div className="h-8 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, j) => (
            <div key={j} className="h-12 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const fetchResetRequests = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/admin/employee-reset-requests/`);
  return data.reset_requests || [];
};

const EmployeeAttendanceReset = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState({});

  const { data: resetRequests = [], isFetching, isError } = useQuery({
    queryKey: ["employeeResetRequests"],
    queryFn: fetchResetRequests,
    placeholderData: [],
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const handleApprove = async (requestId) => {
    setIsProcessing((prev) => ({ ...prev, [requestId]: true }));
    try {
      await axios.post(`${apiBaseUrl}/admin/approve-and-reset-employee-reset-request/${requestId}/`);
      toast.success("Request approved successfully");
      queryClient.invalidateQueries(["employeeResetRequests"]);
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request. Please try again.");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId) => {
    setIsProcessing((prev) => ({ ...prev, [requestId]: true }));
    try {
      await axios.post(`${apiBaseUrl}/admin/reject-employee-reset-request/${requestId}/`);
      toast.success("Request rejected successfully");
      queryClient.invalidateQueries(["employeeResetRequests"]);
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request. Please try again.");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["employeeResetRequests"]);
    toast.info("Refreshing reset requests...");
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetching ? (
        <SkeletonLoading />
      ) : isError ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load reset requests. Please try again.
        </Alert>
      ) : (
        <Card className="bg-white rounded-lg shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle className="text-lg font-semibold">Employee Attendance Reset Requests</CardTitle>
                <p className="text-gray-500 text-sm">Manage employee attendance reset requests</p>
              </div>
              <Button
                onClick={handleRefresh}
                className="mt-2 md:mt-0 bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md bg-white">
              <Table className="table-auto">
                <TableHeader className="text-base bg-slate-100">
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Logout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resetRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-gray-500">
                        No reset requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    resetRequests.map((request, index) => (
                      <TableRow key={request.id} className="text-base hover:bg-gray-50">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{request.employee_id}</TableCell>
                        <TableCell>{request.username}</TableCell>
                        <TableCell>{request.request_type}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.request_description}</TableCell>
                        <TableCell>{request.date}</TableCell>
                        <TableCell>{request.shift || "N/A"}</TableCell>
                        <TableCell>{request.time_in || "N/A"}</TableCell>
                        <TableCell>{request.time_out || "N/A"}</TableCell>
                        <TableCell>{request.status}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(request.id)}
                            disabled={request.status !== "Pending" || isProcessing[request.id]}
                            aria-label={`Approve request for ${request.username}`}
                            className="bg-gradient-to-br from-green-500 to-teal-500 text-white px-3 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                          >
                            {isProcessing[request.id] ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            disabled={request.status !== "Pending" || isProcessing[request.id]}
                            aria-label={`Reject request for ${request.username}`}
                            className="bg-gradient-to-br from-red-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                          >
                            {isProcessing[request.id] ? "Processing..." : "Reject"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeAttendanceReset;