import React, { useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Edit, Trash2, Ellipsis } from "lucide-react";
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

const fetchManagerList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
  return data || [];
};

const fetchLeavePolicies = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/manager-leave-policies/`);
  return data || [];
};

const ManagerLeavePolicies = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [formData, setFormData] = useState({
    selectedManager: "",
    medical_leave: "",
    vacation_leave: "",
    personal_leave: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: managerList = [], isFetching: isFetchingManagers, isError: isErrorManagers } = useQuery({
    queryKey: ["managers"],
    queryFn: fetchManagerList,
    placeholderData: [],
    refetchOnWindowFocus: false,
  });

  const { data: leavePolicies = [], isFetching: isFetchingPolicies, isError: isErrorPolicies } = useQuery({
    queryKey: ["leavePolicies"],
    queryFn: fetchLeavePolicies,
    placeholderData: [],
    refetchOnWindowFocus: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedManager) {
      toast.error("Please select a Manager.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await axios.put(`${apiBaseUrl}/edit_manager_leave_balance/${selectedLeaveId}/`, formData);
        toast.success("Leave balance updated successfully.");
      } else {
        await axios.post(
          `${apiBaseUrl}/manager-leave-balance/update/${formData.selectedManager}/`,
          formData
        );
        toast.success("Leave balance added successfully.");
      }
      queryClient.invalidateQueries(["leavePolicies"]);
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to update leave balance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (leave = null) => {
    if (leave) {
      setIsEditMode(true);
      setSelectedLeaveId(leave.id);
      setFormData({
        selectedManager: leave.user,
        medical_leave: leave.leave_balance.medical_leave,
        vacation_leave: leave.leave_balance.vacation_leave,
        personal_leave: leave.leave_balance.personal_leave,
      });
    } else {
      setIsEditMode(false);
      setFormData({
        selectedManager: "",
        medical_leave: "",
        vacation_leave: "",
        personal_leave: "",
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave policy?")) {
      try {
        await axios.delete(`${apiBaseUrl}/delete_manager_leave_balance/${id}/`);
        toast.success("Policies deleted successfully.");
        queryClient.invalidateQueries(["leavePolicies"]);
      } catch (error) {
        toast.error("Failed to delete leave policy.");
      }
    }
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {(isFetchingManagers || isFetchingPolicies) ? (
        <SkeletonLoading />
      ) : (isErrorManagers || isErrorPolicies) ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load data. Please try again.
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">Manager Leave Policies</h5>
              <p className="text-gray-500 text-sm">Manage leave balances for managers</p>
            </div>
            <div className="mt-2 md:mt-0 flex gap-3">
              <Button
                onClick={() => queryClient.invalidateQueries(["leavePolicies"])}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh
              </Button>
              <Button
                onClick={() => openModal()}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:bg-gradient-to-bl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Add Leave Policy
              </Button>
            </div>
          </div>
          <div className="border rounded-md bg-white">
            <Table className="table-auto">
              <TableHeader>
                <TableRow className="text-base bg-slate-100">
                  <TableCell>S.No</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Medical Leave</TableCell>
                  <TableCell>Vacation Leave</TableCell>
                  <TableCell>Personal Leave</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leavePolicies.length > 0 ? (
                  leavePolicies.map((policy, index) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium text-sm">{index + 1}</TableCell>
                      <TableCell className="text-base">{policy.user}</TableCell>
                      <TableCell className="text-base">{policy.leave_balance.medical_leave}</TableCell>
                      <TableCell className="text-base">{policy.leave_balance.vacation_leave}</TableCell>
                      <TableCell className="text-base">{policy.leave_balance.personal_leave}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Ellipsis className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openModal(policy)}>
                              <Edit className="mr-2 w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(policy.id)}>
                              <Trash2 className="mr-2 w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                      No leave policies available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {showModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">
                  {isEditMode ? "Edit Leave Policy" : "Add Leave Policy"}
                </h3>
                <div className="space-y-4">
                  {!isEditMode && (
                    <div>
                      <label className="text-sm text-gray-600">Select Manager</label>
                      <select
                        name="selectedManager"
                        value={formData.selectedManager}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Manager</option>
                        {managerList.map((manager) => (
                          <option key={manager.username} value={manager.username}>
                            {manager.manager_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-600">Medical Leave</label>
                    <input
                      type="number"
                      name="medical_leave"
                      value={formData.medical_leave}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Medical Leave"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Vacation Leave</label>
                    <input
                      type="number"
                      name="vacation_leave"
                      value={formData.vacation_leave}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Vacation Leave"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Personal Leave</label>
                    <input
                      type="number"
                      name="personal_leave"
                      value={formData.personal_leave}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Personal Leave"
                      min="0"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className={`bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerLeavePolicies;