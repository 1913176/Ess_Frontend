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

const apiBaseUrl = process.env.VITE_BASE_API;

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
  const { data } = await axios.get(`${apiBaseUrl}/admin/manager-reset-requests/`);
  return data.reset_requests || [];
};

const ManagerAttendanceReset = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(null); // Track processing request ID

  const { data: resetRequests = [], isFetching, isError } = useQuery({
    queryKey: ["resetRequests"],
    queryFn: fetchResetRequests,
    placeholderData: [],
    staleTime: 5000,
  });

  const handleApprove = async (requestId) => {
    setIsProcessing(requestId);
    try {
      await axios.post(`${apiBaseUrl}/admin/approve-and-reset-checkout-time/${requestId}/`);
      toast.success("Request approved successfully.");
      queryClient.invalidateQueries(["resetRequests"]);
    } catch (error) {
      toast.error("Failed to approve request. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    setIsProcessing(requestId);
    try {
      await axios.post(`${apiBaseUrl}/admin/reject-reset-request/${requestId}/`);
      toast.success("Request rejected successfully.");
      queryClient.invalidateQueries(["resetRequests"]);
    } catch (error) {
      toast.error("Failed to reject request. Please try again.");
    } finally {
      setIsProcessing(null);
    }
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
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">Manager Attendance Reset Requests</h5>
              <p className="text-gray-500 text-sm">Manage attendance reset requests</p>
            </div>
            <Button
              onClick={() => queryClient.invalidateQueries(["resetRequests"])}
              className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
            >
              <i className="fas fa-sync-alt mr-2"></i> Refresh
            </Button>
          </div>
          <div className="border rounded-md bg-white">
            <Table className="table-auto">
              <TableHeader>
                <TableRow className="text-base bg-slate-100">
                  <TableCell>S.No</TableCell>
                  <TableCell>Manager ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Request Type</TableCell>
                  <TableCell>Request Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Shift</TableCell>
                  <TableCell>Time In</TableCell>
                  <TableCell>Time Out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resetRequests.length > 0 ? (
                  resetRequests.map((request, index) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium text-sm">{index + 1}</TableCell>
                      <TableCell className="text-base">{request.manager_id}</TableCell>
                      <TableCell className="text-base">{request.username}</TableCell>
                      <TableCell className="text-base">{request.request_type}</TableCell>
                      <TableCell className="text-base">{request.request_description}</TableCell>
                      <TableCell className="text-base">{request.date}</TableCell>
                      <TableCell className="text-base">{request.shift || "N/A"}</TableCell>
                      <TableCell className="text-base">{request.time_in || "N/A"}</TableCell>
                      <TableCell className="text-base">{request.time_out || "N/A"}</TableCell>
                      <TableCell className="text-base">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            request.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(request.id)}
                            disabled={request.status !== "Pending" || isProcessing === request.id}
                            className={`${
                              request.status !== "Pending"
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:-translate-y-0.5"
                            } text-white px-4 py-1 rounded-full shadow-md transition-all duration-300`}
                          >
                            {isProcessing === request.id ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            disabled={request.status !== "Pending" || isProcessing === request.id}
                            className={`${
                              request.status !== "Pending"
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gradient-to-br from-red-600 to-red-500 hover:shadow-lg hover:-translate-y-0.5"
                            } text-white px-4 py-1 rounded-full shadow-md transition-all duration-300`}
                          >
                            {isProcessing === request.id ? "Processing..." : "Reject"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-gray-500 py-4">
                      No reset requests available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAttendanceReset;