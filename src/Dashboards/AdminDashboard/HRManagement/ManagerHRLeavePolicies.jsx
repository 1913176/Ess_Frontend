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

const fetchHrList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/api/hr_list/`);
  return data || [];
};

const fetchLeavePolicies = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/hr-leave-policies/`);
  return data || [];
};

const ManagerHRLeavePolicies = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [formData, setFormData] = useState({
    selectedHr: "",
    medical_leave: "",
    vacation_leave: "",
    personal_leave: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: hrList = [], isFetching: isFetchingHr, isError: isErrorHr } = useQuery({
    queryKey: ["hrList"],
    queryFn: fetchHrList,
    placeholderData: [],
    refetchOnWindowFocus: false,
  });

  const { data: leavePolicies = [], isFetching: isFetchingPolicies, isError: isErrorPolicies } = useQuery({
    queryKey: ["hrLeavePolicies"],
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
    if (!formData.selectedHr) {
      toast.error("Please select an HR.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await axios.put(`${apiBaseUrl}/edit_hr_leave_balance/${selectedLeaveId}/`, {
          medical_leave: formData.medical_leave,
          vacation_leave: formData.vacation_leave,
          personal_leave: formData.personal_leave,
        });
        toast.success("Leave balance updated successfully.");
      } else {
        await axios.post(`${apiBaseUrl}/update-hr-leave-balance/${formData.selectedHr}/`, {
          medical_leave: formData.medical_leave,
          vacation_leave: formData.vacation_leave,
          personal_leave: formData.personal_leave,
        });
        toast.success("Leave balance added successfully.");
      }
      queryClient.invalidateQueries(["hrLeavePolicies"]);
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
        selectedHr: leave.user,
        medical_leave: leave.leave_balance.medical_leave,
        vacation_leave: leave.leave_balance.vacation_leave,
        personal_leave: leave.leave_balance.personal_leave,
      });
    } else {
      setIsEditMode(false);
      setFormData({
        selectedHr: "",
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
        await axios.delete(`${apiBaseUrl}/delete_hr_leave_balance/${id}/`);
        toast.success("Leave policy deleted successfully.");
        queryClient.invalidateQueries(["hrLeavePolicies"]);
      } catch (error) {
        toast.error("Failed to delete leave policy.");
      }
    }
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {(isFetchingHr || isFetchingPolicies) ? (
        <SkeletonLoading />
      ) : (isErrorHr || isErrorPolicies) ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load data. Please try again.
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">HR Leave Policies</h5>
              <p className="text-gray-500 text-sm">Manage leave balances for HR</p>
            </div>
            <div className="mt-2 md:mt-0 flex gap-3">
              <Button
                onClick={() => queryClient.invalidateQueries(["hrLeavePolicies"])}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh
              </Button>
              <Button
                onClick={() => openModal()}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Add Leave Policy
              </Button>
            </div>
          </div>
          <div className="border rounded-md bg-white">
            <Table className="table-auto">
              <TableHeader>
                <TableRow className="text-base bg-slate-100">
                  <TableHead>S.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Medical Leave</TableHead>
                  <TableHead>Vacation Leave</TableHead>
                  <TableHead>Personal Leave</TableHead>
                  <TableHead>Total Leave</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leavePolicies.length > 0 ? (
                  leavePolicies.map((policy, index) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium text-sm">{index + 1}</TableCell>
                      <TableCell className="text-base">{policy.user}</TableCell>
                      <TableCell className="text-base">{policy.department}</TableCell>
                      <TableCell className="text-base">{policy.role}</TableCell>
                      <TableCell className="text-base">{policy.leave_balance.medical_leave}</TableCell>
                      <TableCell className="text-base">{policy.leave_balance.vacation_leave}</TableCell>
                      <TableCell className="text-base">{policy.leave_balance.personal_leave}</TableCell>
                      <TableCell className="text-base">{policy.leave_balance.total_leave_days}</TableCell>
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
                    <TableCell colSpan={9} className="text-center text-gray-500 py-4">
                      No leave policies available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {showModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 जिन">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">
                  {isEditMode ? "Edit Leave Policy" : "Add Leave Policy"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isEditMode && (
                    <div>
                      <label className="text-sm text-gray-600">Select HR</label>
                      <select
                        name="selectedHr"
                        value={formData.selectedHr}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select HR</option>
                        {hrList.map((hr) => (
                          <option key={hr.username} value={hr.username}>
                            {hr.hr_name}
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
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerHRLeavePolicies;