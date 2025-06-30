import React, { useState, useEffect } from "react";
import axios from "axios";

const SupervisorPayroll = () => {
  const [supervisorId, setSupervisorId] = useState("");
  const [month, setMonth] = useState("");
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch supervisor list on component mount
  const [supervisors, setSupervisors] = useState([]);
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/supervisor_list/")
      .then((response) => {
        console.log("API response:", response.data); // Log the response data to inspect its structure
        if (Array.isArray(response.data)) {
          setSupervisors(response.data); // Ensure the data is an array before updating state
        } else {
          setError("Unexpected response format for supervisors.");
        }
      })
      .catch((error) => {
        console.error("Error fetching supervisor list", error);
        setError("Error fetching supervisor list.");
      });
  }, []);

  // Fetch payroll history for the supervisor
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/supervisor-payroll-history/")
      .then((response) => {
        setPayrollHistory(response.data);
      })
      .catch((error) => {
        console.error("Error fetching payroll history", error);
      });
  }, []);

  // Handle payroll generation
  const handleGeneratePayslip = () => {
    if (!supervisorId || !month) {
      setError("Please provide both Supervisor ID and Month.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    // Make the API request to generate the payslip for the selected supervisor
    axios
      .post("http://127.0.0.1:8000/supervisor/process-payroll/", {
        supervisor_id: supervisorId,
        month,
      })
      .then((response) => {
        if (response.data.success) {
          setMessage(`Payslip generated successfully!`);
          setPayrollHistory((prevHistory) => [
            ...prevHistory,
            { ...response.data, month, supervisorId },
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

  // Handle downloading payslips (PDF)
  const handleDownload = (pdfPath) => {
    const downloadUrl = `/media/payslips/${pdfPath}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = pdfPath; // Use the filename as the downloaded name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="supervisorPayroll">
      <h2>Supervisor Payroll Management</h2>

      {/* Generate Payslip Form */}
      <div className="form-container">
        <h3>Generate Payslip</h3>
        <div className="form-fields">
          <div className="input-group">
            <label>Supervisor Name:</label>
            <select
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
            >
              <option value="">Select Supervisor</option>
              {Array.isArray(supervisors) && supervisors.length > 0 ? (
                supervisors.map((supervisor) => (
                  <option
                    key={supervisor.supervisor_id}
                    value={supervisor.supervisor_id}
                  >
                    {supervisor.supervisor_name}
                  </option>
                ))
              ) : (
                <option disabled>No supervisors available</option>
              )}
            </select>
          </div>

          <div className="input-group">
            <label>Month:</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <button onClick={handleGeneratePayslip} disabled={loading}>
            {loading ? "Generating..." : "Generate Payslip"}
          </button>

          {error && <div className="error">{error}</div>}
          {message && <div className="message">{message}</div>}
        </div>
      </div>

      {/* Payroll History for Supervisor */}
      <div className="payroll-history">
        <h3>Payroll History</h3>
        <table>
          <thead>
            <tr>
              <th>Supervisor </th>
              <th>Month</th>
              <th>Net Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollHistory.map((payroll) => (
              <tr key={payroll.payroll_id}>
                <td>{payroll.user}</td>
                <td>{payroll.month}</td>
                <td>{payroll.net_salary}</td>
                <td>
                  <button onClick={() => handleDownload(payroll.pdf_path)}>
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

export default SupervisorPayroll;
