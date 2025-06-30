import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Edit, Trash2, UserPlus, Ellipsis } from "lucide-react";
import AddSalary from "./AddSalary";
import UpdateSalary from "./UpdateSalary";
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

// SkeletonLoading component embedded directly in Salary.jsx
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

const Salary = () => {
  const [salaryList, setSalaryList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [addSalaryPopup, setAddSalaryPopup] = useState(false);
  const [updateSalaryPopup, setUpdateSalaryPopup] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [isFetchingSalaries, setIsFetchingSalaries] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [isErrorSalaries, setIsErrorSalaries] = useState(false);
  const [isErrorEmployees, setIsErrorEmployees] = useState(false);

  const fetchSalaryList = async () => {
    setIsFetchingSalaries(true);
    setIsErrorSalaries(false);
    try {
      const { data } = await axios.get(`${apiBaseUrl}/salary/history/`);
      setSalaryList(data || []);
    } catch (error) {
      setIsErrorSalaries(true);
      toast.error("Failed to fetch salary list.");
    } finally {
      setIsFetchingSalaries(false);
    }
  };

  const fetchEmployeeList = async () => {
    setIsFetchingEmployees(true);
    setIsErrorEmployees(false);
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`);
      setEmployeeList(data || []);
    } catch (error) {
      setIsErrorEmployees(true);
      toast.error("Failed to fetch employee list.");
    } finally {
      setIsFetchingEmployees(false);
    }
  };

  useEffect(() => {
    fetchSalaryList();
    fetchEmployeeList();
  }, []);

  const handleEdit = (row) => {
    setSelectedSalary(row);
    setUpdateSalaryPopup(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete Salary ID ${row.id}?`)) {
      try {
        await axios.delete(`${apiBaseUrl}/delete-salary/${row.id}/`);
        toast.success(`Salary ID ${row.id} deleted successfully.`);
        fetchSalaryList();
      } catch (error) {
        toast.error("Failed to delete Salary.");
      }
    }
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {(isFetchingSalaries || isFetchingEmployees) ? (
        <SkeletonLoading />
      ) : (isErrorSalaries || isErrorEmployees) ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load data. Please try again.
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">Employee Salary Records</h5>
              <p className="text-gray-500 text-sm">Manage salary details for employees</p>
            </div>
            <div className="mt-2 md:mt-0 flex gap-3">
              <Button
                onClick={fetchSalaryList}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh
              </Button>
              <Button
                onClick={() => setAddSalaryPopup(true)}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Add Salary
              </Button>
            </div>
          </div>
          <div className="border rounded-md bg-white">
            <Table className="table-auto">
              <TableHeader>
                <TableRow className="text-base bg-slate-100">
                  <TableHead>S.No</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Annual Salary</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Total Salary</TableHead>
                  <TableHead>Monthly Salary</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Updated Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryList.length > 0 ? (
                  salaryList.map((salary, index) => (
                    <TableRow key={salary.id}>
                      <TableCell className="font-medium text-sm">{index + 1}</TableCell>
                      <TableCell className="text-base">
                        {employeeList.find((e) => e.employee_id === salary.user_id)?.employee_name || salary.user_id}
                      </TableCell>
                      <TableCell className="text-base">{salary.annual_salary}</TableCell>
                      <TableCell className="text-base">{salary.bonus}</TableCell>
                      <TableCell className="text-base">{salary.total_salary}</TableCell>
                      <TableCell className="text-base">{salary.monthly_salary}</TableCell>
                      <TableCell className="text-base">{salary.effective_date}</TableCell>
                      <TableCell className="text-base">{salary.updated_date}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Ellipsis className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEdit(salary)}>
                              <Edit className="mr-2 w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(salary)}>
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
                      No salary records available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {addSalaryPopup && (
            <AddSalary
              open={addSalaryPopup}
              setOpen={setAddSalaryPopup}
              EmployeeList={employeeList}
              fetchSalaryList={fetchSalaryList}
            />
          )}
          {updateSalaryPopup && selectedSalary && (
            <UpdateSalary
              open={updateSalaryPopup}
              setOpen={setUpdateSalaryPopup}
              salaryId={selectedSalary}
              EmployeeList={employeeList}
              fetchSalaryList={fetchSalaryList}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Salary;