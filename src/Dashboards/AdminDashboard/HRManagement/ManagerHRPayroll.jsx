import React, { useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Ellipsis, Download } from "lucide-react";
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

const fetchPayrollHistory = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/hr_payroll-history/`);
  return data || [];
};

const ManagerHRPayroll = () => {
  const queryClient = useQueryClient();
  const [hrId, setHrId] = useState("");
  const [month, setMonth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: hrs = [], isFetching: isFetchingHrs, isError: isErrorHrs } = useQuery({
    queryKey: ["hrs"],
    queryFn: fetchHrList,
    placeholderData: [],
    staleTime: 5000,
  });

  const { data: payrollHistory = [], isFetching: isFetchingPayroll, isError: isErrorPayroll } = useQuery({
    queryKey: ["payrollHistory"],
    queryFn: fetchPayrollHistory,
    placeholderData: [],
    staleTime: 5000,
  });

  const handleGeneratePayslip = async () => {
    if (!hrId || !month) {
      toast.error("Please select an HR and month.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/hr-process-payroll/`, {
        hr_id: hrId,
        month,
      });
      if (response.data.success) {
        toast.success("Payslip generated successfully!");
        queryClient.invalidateQueries(["payrollHistory"]);
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

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {(isFetchingHrs || isFetchingPayroll) ? (
        <SkeletonLoading />
      ) : (isErrorHrs || isErrorPayroll) ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load data. Please try again.
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">HR Payroll</h5>
              <p className="text-gray-500 text-sm">Generate and manage payroll records for HR</p>
            </div>
            <div className="mt-2 md:mt-0 flex gap-3">
              <Button
                onClick={() => queryClient.invalidateQueries(["payrollHistory"])}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh
              </Button>
            </div>
          </div>
          <div className="mb-6">
            <form className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <select
                  value={hrId}
                  onChange={(e) => setHrId(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" disabled>
                    Select HR
                  </option>
                  {hrs.map((hr) => (
                    <option key={hr.hr_id} value={hr.hr_id}>
                      {hr.hr_name || hr.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <Button
                onClick={handleGeneratePayslip}
                disabled={isSubmitting}
                className={`bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
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
                  <TableCell>HR Name</TableCell>
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

export default ManagerHRPayroll;