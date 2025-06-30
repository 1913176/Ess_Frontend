import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Ellipsis, Download, RefreshCw } from "lucide-react";
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

const apiBaseUrl = process.env.VITE_BASE_API || "http://localhost:8000";

const SkeletonLoading = ({ rowCount = 5 }) => {
  return (
    <div className="space-y-4 p-4">
      <div className="bg-gray-200 rounded-lg animate-pulse p-4">
        <div className="h-8 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(rowCount)].map((_, j) => (
            <div key={j} className="h-12 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SupervisorPayroll = () => {
  const [supervisorId, setSupervisorId] = useState("");
  const [month, setMonth] = useState("");
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [isFetchingSupervisors, setIsFetchingSupervisors] = useState(false);
  const [isFetchingPayroll, setIsFetchingPayroll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      setIsFetchingSupervisors(true);
      try {
        const { data } = await axios.get(`${apiBaseUrl}/api/supervisor_list/`);
        setSupervisors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching supervisor list:", error);
        setError("Failed to load supervisors. Please try again.");
      } finally {
        setIsFetchingSupervisors(false);
      }
    };
    fetchSupervisors();
  }, []);

  useEffect(() => {
    const fetchPayrollHistory = async () => {
      setIsFetchingPayroll(true);
      try {
        const { data } = await axios.get(`${apiBaseUrl}/supervisor-payroll-history/`);
        setPayrollHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching payroll history:", error);
        setError("Failed to load payroll history. Please try again.");
      } finally {
        setIsFetchingPayroll(false);
      }
    };
    fetchPayrollHistory();
  }, []);

  const handleGeneratePayslip = async () => {
    if (!supervisorId || !month) {
      toast.error("Please select a supervisor and month.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await axios.post(`${apiBaseUrl}/supervisor/process-payroll/`, {
        supervisor_id: supervisorId,
        month,
      });
      if (response.data.success) {
        toast.success("Payslip generated successfully!");
        const newPayroll = { ...response.data, month, user: supervisors.find(s => s.supervisor_id === supervisorId)?.name || supervisorId };
        setPayrollHistory([newPayroll, ...payrollHistory]);
      } else {
        toast.error(response.data.message || "Failed to generate payslip.");
      }
    } catch (error) {
      toast.error("An error occurred while generating the payslip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (pdfPath, payrollName) => {
    let downloadUrl;
    if (pdfPath.includes("media\\") || pdfPath.includes("media/")) {
      downloadUrl = `${apiBaseUrl}/media/${pdfPath.split("media\\").pop() || pdfPath.split("media/").pop()}`;
    } else {
      downloadUrl = pdfPath.startsWith("http") ? pdfPath : `${apiBaseUrl}${pdfPath}`;
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = payrollName ? `${payrollName}-payslip.pdf` : "payslip.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    setIsFetchingPayroll(true);
    axios
      .get(`${apiBaseUrl}/supervisor-payroll-history/`)
      .then((response) => setPayrollHistory(Array.isArray(response.data) ? response.data : []))
      .catch(() => setError("Failed to refresh payroll history."))
      .finally(() => setIsFetchingPayroll(false));
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      {(isFetchingSupervisors || isFetchingPayroll) ? (
        <SkeletonLoading />
      ) : error ? (
        <Alert variant="destructive" className="text-center my-4">
          {error}
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">Supervisor Payroll</h5>
              <p className="text-gray-500 text-sm">Generate and manage payroll records for supervisors</p>
            </div>
            <div className="mt-2 md:mt-0 flex gap-3">
              <Button
                onClick={handleRefresh}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>
          </div>
          <div className="mb-6">
            <form className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <select
                  aria-label="Select Supervisor"
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" disabled>
                    Select Supervisor
                  </option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.supervisor_id} value={supervisor.supervisor_id}>
                      {supervisor.supervisor_name || supervisor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <input
                  type="month"
                  aria-label="Select Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <Button
                onClick={handleGeneratePayslip}
                disabled={isSubmitting || !supervisorId || !month}
                className={`bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
                  isSubmitting || !supervisorId || !month ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Generating..." : "Generate Payslip"}
              </Button>
            </form>
          </div>
          <div className="border rounded-md bg-white">
            <Table className="table-auto">
              <TableHeader>
                <TableRow className="text-base bg-slate-100">
                  <TableCell>S.No</TableCell>
                  <TableCell>Supervisor Name</TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell>Net Salary</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollHistory.length > 0 ? (
                  payrollHistory.map((payroll, index) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium text-sm">{index + 1}</TableCell>
                      <TableCell className="text-base">{payroll.user}</TableCell>
                      <TableCell className="text-base">{payroll.month}</TableCell>
                      <TableCell className="text-base">{payroll.net_salary}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button
                              className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-3 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                            >
                              <Ellipsis className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleDownload(payroll.pdf_path, payroll.user)}
                            >
                              <Download className="mr-2 w-4 h-4" /> Download Payslip
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                      No payroll records available.
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

export default SupervisorPayroll;