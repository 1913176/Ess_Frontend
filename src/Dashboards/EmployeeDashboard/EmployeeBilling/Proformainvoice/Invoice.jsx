import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";

// API Base URL (Update this based on your backend)
const baseurl=process.env.REACT_APP_BASEAPI;

// Helper function to parse dates
function parseDate(dateStr) {
  return dayjs(dateStr, ["YYYY-MM-DD", "MM/DD/YYYY"]);
}

const ProformaInvoices = () => {
  const navigate = useNavigate();

  // State for proforma invoices
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch proforma invoices from API
  useEffect(() => {
    axios
      .get(`${baseurl}/proformainv/proforma-invoices-list/`) // ✅ API Call
      .then((response) => {
        console.log("API Response:", response.data); // 🔥 Debugging Log
        if (Array.isArray(response.data)) {
          setProformas(response.data); // ✅ Store API response in state
        } else {
          console.error("Unexpected API response format:", response.data);
          setError("Invalid response format from server.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching proforma invoices:", error);
        setError("Failed to load proforma invoices.");
        setLoading(false);
      });
  }, []);

  // State for filters
  const [dateRange, setDateRange] = useState("365"); // default: last 365 days
  const [statusFilter, setStatusFilter] = useState("All Invoices");

  // Filtering proformas
  const filteredProformas = proformas.filter((pf) => {
    if (!pf.proforma_invoice_date) return false;
    const pDate = parseDate(pf.proforma_invoice_date);
    if (!pDate.isValid()) return false;
    const now = dayjs();
    const earliest = now.subtract(dateRange, "day");
    const withinRange = pDate.isAfter(earliest) || pDate.isSame(earliest, "day");

    // Check if converted
    const isConverted = pf.status === "Converted to Sales Invoice";

    // Apply status filter
    if (statusFilter === "Open Invoices" && isConverted) return false;
    if (statusFilter === "Converted Invoices" && !isConverted) return false;
    
    return withinRange;
  });

  // Navigate to create proforma invoice
  const handleCreateProforma = () => {
    navigate("/employee/billing/proformainvoice");
  };

  // Navigate to proforma invoice details
  const handleRowClick = (e, proformaId) => {
    if (e.target.type === "checkbox") return;
    navigate(`/employee/billing/proformainvoice?proformaId=${proformaId}&view=1`);
  };

  // Get "Due In" label
  const getDueInLabel = (pf) => {
    return pf.paymentTerms ? `${pf.paymentTerms} Days` : "-";
  };

  // Get "Status" label
  const getStatusLabel = (pf) => {
    return pf.status || "Open";
  };

  // Display loading message
  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading...</div>;
  }

  // Display error message
  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 p-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Proforma Invoice</h1>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Last</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="365">365 Days</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="All Invoices">Show All Invoices</option>
            <option value="Open Invoices">Show Open Invoices</option>
            <option value="Converted Invoices">Show Converted Invoices</option>
          </select>
        </div>

        <button
          onClick={handleCreateProforma}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Create Proforma Invoice
        </button>
      </div>

      {/* Proforma Invoices Table */}
      <div className="bg-white rounded border shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left">
              <th className="p-2 w-10">
                <input type="checkbox" disabled />
              </th>
              <th className="p-2">Date</th>
              <th className="p-2">Proforma Invoice Number</th>
              <th className="p-2">Party Name</th>
              <th className="p-2">Due In</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProformas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No proforma invoices found
                </td>
              </tr>
            ) : (
              filteredProformas.map((pf) => {
                const pDate = parseDate(pf.proforma_invoice_date).format("DD MMM YYYY");
                const statusLabel = getStatusLabel(pf);
                const isConverted = statusLabel === "Converted to Sales Invoice";
                const statusClasses = isConverted
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600";

                return (
                  <tr
                    key={pf.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => handleRowClick(e, pf.id)}
                  >
                    <td className="p-2 text-center cursor-auto">
                      <input type="checkbox" disabled />
                    </td>
                    <td className="p-2">{pDate}</td>
                    <td className="p-2">{pf.proforma_invoice_number}</td>
                    <td className="p-2">{pf.party_name || "Unknown"}</td>
                    <td className="p-2">{getDueInLabel(pf)}</td>
                    <td className="p-2 text-right">
                      ₹ {parseFloat(pf.total_amount?.total || "0").toLocaleString()}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusClasses}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProformaInvoices;
