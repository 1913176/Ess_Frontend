import React, { useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Trash2, Ellipsis } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const fetchArLeaveList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/ar-leave-status/`);
  return data || [];
};

const ManagerARLeave = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(null); // Track processing leave ID

  const { data: arLeaveList = [], isFetching, isError } = useQuery({
    queryKey: ["arLeaves"],
    queryFn: fetchArLeaveList,
    placeholderData: [],
    staleTime: 5000,
  });

  const handleStatusChange = async (status, leaveId) => {
    setIsProcessing(leaveId);
    try {
      const response = await axios.post(`${apiBaseUrl}/ar-leave-status/`, {
        leave_id: leaveId,
        status: status.toLowerCase(),
      });
      toast.success(response.data.message);
      queryClient.invalidateQueries(["arLeaves"]);
    } catch (error) {
      toast.error("Failed to update leave status.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (leaveId) => {
    if (window.confirm(`Are you sure you want to delete Leave ID ${leaveId}?`)) {
      setIsProcessing(leaveId);
      try {
        await axios.delete(`${apiBaseUrl}/delete_ar_leave/${leaveId}/`);
        toast.success(`Leave ID ${leaveId} deleted successfully.`);
        queryClient.invalidateQueries(["arLeaves"]);
      } catch (error) {
        toast.error("Failed to delete leave record.");
      } finally {
        setIsProcessing(null);
      }
    }
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetching ? (
        <SkeletonLoading />
      ) : isError ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load leave records. Please try again.
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">AR Leave Records</h5>
              <p className="text-gray-500 text-sm">Manage leave requests for AR</p>
            </div>
            <Button
              onClick={() => queryClient.invalidateQueries(["arLeaves"])}
              className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center mt-2 md:mt-0"
            >
              <i className="fas fa-sync-alt mr-2"></i> Refresh
            </Button>
          </div>
          <div className="border rounded-md bg-white">
            <Table className="table-auto">
              <TableHeader>
                <TableRow className="text-base bg-slate-100">
                  <TableCell>S.No</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arLeaveList.length > 0 ? (
                  arLeaveList.map((leave, index) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium text-sm">{index + 1}</TableCell>
                      <TableCell className="text-base">{leave.user}</TableCell>
                      <TableCell className="text-base">{leave.start_date}</TableCell>
                      <TableCell className="text-base">{leave.end_date}</TableCell>
                      <TableCell className="text-base">{leave.leave_type}</TableCell>
                      <TableCell className="text-base">{leave.reason}</TableCell>
                      <TableCell className="text-base">
                        <span
                          className={`px-2 py-1 rounded-full text-sm capitalize ${
                            leave.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : leave.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusChange("Approved", leave.id)}
                            disabled={
                              leave.status === "approved" ||
                              leave.status === "rejected" ||
                              isProcessing === leave.id
                            }
                            className={`${
                              leave.status === "approved" || leave.status === "rejected"
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:-translate-y-0.5"
                            } text-white px-4 py-1 rounded-full shadow-md transition-all duration-300`}
                          >
                            {isProcessing === leave.id ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            onClick={() => handleStatusChange("Rejected", leave.id)}
                            disabled={
                              leave.status === "approved" ||
                              leave.status === "rejected" ||
                              isProcessing === leave.id
                            }
                            className={`${
                              leave.status === "approved" || leave.status === "rejected"
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gradient-to-br from-red-600 to-red-500 hover:shadow-lg hover:-translate-y-0.5"
                            } text-white px-4 py-1 rounded-full shadow-md transition-all duration-300`}
                          >
                            {isProcessing === leave.id ? "Processing..." : "Reject"}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Ellipsis className="w-5 h-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleDelete(leave.id)}>
                                <Trash2 className="mr-2 w-4 h-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                      No leave records available.
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

export default ManagerARLeave;