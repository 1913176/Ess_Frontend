import React, { useState, useEffect } from "react";
import axios from "axios";
const apiBaseUrl = process.env.VITE_BASE_API;
const HrPayRoll = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch employee list on component mount
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/employee_list/`)
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error("Error fetching employee list", error);
      });
  }, []);

  // Fetch payroll history on component mount
  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/payroll-history/`)
      .then((response) => {
        setPayrollHistory(response.data);
      })
      .catch((error) => {
        console.error("Error fetching payroll history", error);
      });
  }, []);

  // Handle the payroll generation
  const handleGeneratePayslip = () => {
    if (!employeeId || !month) {
      setError("Please provide both Employee ID and Month.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    // Make the API request to generate the payslip
    axios
      .post(`${apiBaseUrl}/process-payroll/`, {
        employee_id: employeeId,
        month,
      })
      .then((response) => {
        if (response.data.success) {
          setMessage("Payslip generated successfully!");
          setPayrollHistory((prevHistory) => [
            ...prevHistory,
            { ...response.data, month, employeeId },
          ]);
        } else {
          setError(response.data.message);
        }
      })
      .catch((error) => {
        setError("An error occurred while generating the payslip.");
        console.error("Error generating payslip", error);
      })
      .finally(() => setLoading(false));
  };

  const handleDownload = (pdfPath, payrollName) => {
    let downloadUrl;

    // Check if the pdfPath is a local path and replace it with the correct URL
    if (pdfPath.includes("D:\\PROJECT\\ESS Project\\ess-backend\\media\\")) {
      downloadUrl = `${apiBaseUrl}${pdfPath.replace(
        "D:\\PROJECT\\ESS Project\\ess-backend\\media\\",
        "/media/",
      )}`;
    } else if (pdfPath.includes("/opt/render/project/src/media/")) {
      downloadUrl = `${apiBaseUrl}${pdfPath.replace(
        "/opt/render/project/src/media/",
        "/media/",
      )}`;
    } else {
      // Handle case where pdfPath is already a URL
      downloadUrl = pdfPath;
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = payrollName || "payroll.pdf"; // Use the payroll name as default or fallback to "payroll.pdf"
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Employee Payroll</h2>

      {/* Generate Payslip Form */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Generate Payslip</h3>
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="font-medium mb-2">Employee Name:</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {employee.name} {employee.employee_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-2">Month:</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleGeneratePayslip}
            disabled={loading}
            className="bg-blue-500 text-white rounded-lg py-2 px-4 w-full mt-4 hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "Generate Payslip"}
          </button>

          {error && <div className="text-red-500 mt-4">{error}</div>}
          {message && <div className="text-green-500 mt-4">{message}</div>}
        </div>
      </div>

      {/* Payroll History */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Payroll History</h3>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left font-medium">Employee ID</th>
              <th className="px-4 py-2 text-left font-medium">Month</th>
              <th className="px-4 py-2 text-left font-medium">Net Salary</th>
              <th className="px-4 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollHistory.map((payroll) => (
              <tr key={payroll.payroll_id} className="border-b">
                <td className="px-4 py-2">{payroll.user}</td>
                <td className="px-4 py-2">{payroll.month}</td>
                <td className="px-4 py-2">{payroll.net_salary}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() =>
                      handleDownload(payroll.pdf_path, payroll.user)
                    }
                    className="text-blue-500 hover:underline"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HrPayRoll;
