import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const apiBaseUrl = process.env.VITE_BASE_API;

const EmpLeavePolicies = () => {
  const [employeeList, setEmployeeList] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [formData, setFormData] = useState({
    selectedEmployee: "",
    medical_leave: "",
    vacation_leave: "",
    personal_leave: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployeeList = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`, {
        withCredentials: true,
      });
      setEmployeeList(data || []);
    } catch (error) {
      console.error("Error fetching employee list:", error);
      toast.error(
        error.response?.data?.detail || "Failed to fetch employee list."
      );
    }
  };

  const fetchLeavePolicies = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${apiBaseUrl}/leave-policies/`, {
        withCredentials: true,
      });
      setLeavePolicies(data || []);
    } catch (error) {
      console.error("Error fetching leave policies:", error);
      toast.error(
        error.response?.data?.detail || "Failed to fetch leave policies."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeList();
    fetchLeavePolicies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedEmployee) {
      toast.error("Please select an Employee.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await axios.put(
          `${apiBaseUrl}/edit_employee_leave_balance/${selectedLeaveId}/`,
          formData,
          { withCredentials: true }
        );
        toast.success("Leave balance updated successfully.");
      } else {
        await axios.post(
          `${apiBaseUrl}/leave-balance/update/${formData.selectedEmployee}/`,
          formData,
          { withCredentials: true }
        );
        toast.success("Leave balance added successfully.");
      }
      fetchLeavePolicies();
      setShowModal(false);
    } catch (error) {
      console.error("Error updating leave balance:", error);
      toast.error(
        error.response?.data?.error || "Failed to update leave balance."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (leave = null) => {
    if (leave) {
      setIsEditMode(true);
      setSelectedLeaveId(leave.id);
      setFormData({
        selectedEmployee: leave.user,
        medical_leave: leave.leave_balance.medical_leave,
        vacation_leave: leave.leave_balance.vacation_leave,
        personal_leave: leave.leave_balance.personal_leave,
      });
    } else {
      setIsEditMode(false);
      setFormData({
        selectedEmployee: "",
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
        await axios.delete(`${apiBaseUrl}/delete_employee_leave_balance/${id}/`, {
          withCredentials: true,
        });
        toast.success("Leave policy deleted successfully.");
        fetchLeavePolicies();
      } catch (error) {
        console.error("Error deleting leave policy:", error);
        toast.error(
          error.response?.data?.detail || "Failed to delete leave policy."
        );
      }
    }
  };

  return (
    <div className="h-full p-4">
      <h3 className="mb-4">Employee Leave Policies</h3>
      <div className="border rounded-md bg-background">
        <div className="flex justify-between mb-4 p-4">
          <div>
            <h5 className="font-semibold text-lg">Employee Leave Policies</h5>
            <p className="text-gray-500 text-sm">Manage leave balances for employees</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchLeavePolicies()}
              className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
            >
              <i className="fas fa-sync-alt mr-2"></i> Refresh
            </button>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Add Leave Policy
            </button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.no</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Medical Leave</TableHead>
              <TableHead>Vacation Leave</TableHead>
              <TableHead>Personal Leave</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="6" className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : leavePolicies.length > 0 ? (
              leavePolicies.map((policy, index) => (
                <TableRow key={policy.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{policy.user}</TableCell>
                  <TableCell>{policy.leave_balance.medical_leave}</TableCell>
                  <TableCell>{policy.leave_balance.vacation_leave}</TableCell>
                  <TableCell>{policy.leave_balance.personal_leave}</TableCell>
                  <TableCell className="flex gap-2">
                    <button
                      className="btn-primary"
                      onClick={() => openModal(policy)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(policy.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="6" className="text-center">
                  No leave policies found.
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isEditMode && (
                <div>
                  <label className="text-sm text-gray-600">Select Employee</label>
                  <select
                    name="selectedEmployee"
                    value={formData.selectedEmployee}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Employee</option>
                    {employeeList.map((employee) => (
                      <option key={employee.username} value={employee.username}>
                        {employee.employee_name}
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
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpLeavePolicies;