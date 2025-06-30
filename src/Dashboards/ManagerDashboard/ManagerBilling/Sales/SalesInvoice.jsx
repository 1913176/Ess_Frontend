//______________________________________________________________________________________________________________________
//export default SalesInvoices;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { FaDollarSign, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";

// Helper to parse dates
function parseDate(dateStr) {
  return dayjs(dateStr, ["MM/DD/YYYY", "YYYY-MM-DD"]);
}

const baseurl=process.env.REACT_APP_BASEAPI;

const SalesInvoices = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]); // For bulk actions
  const [dateRange, setDateRange] = useState("365"); // Default: last 365 days

  // Fetch invoices from Django API
  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASEAPI}/saleinv/sales-invoices/`);
      if (response.status === 200) {
        setInvoices(response.data);
      } else {
        console.error("Failed to fetch invoices with status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      if (error.response?.status === 502) {
        alert("Server is temporarily unavailable. Please try again later.");
      }
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, []);
 
  // Filter invoices based on the date range
  const filteredInvoices = invoices.filter((inv) => {
    if (!inv.invoice_date) return false;
    const invDate = parseDate(inv.invoice_date);
    if (!invDate.isValid()) return false;
    const now = dayjs();
    const earliest = now.subtract(dateRange, "day");
    return invDate.isAfter(earliest) || invDate.isSame(earliest, "day");
  });


  let totalSales = 0, totalPaid = 0, totalUnpaid = 0;

filteredInvoices.forEach((inv) => {
  console.log(inv); // Check the structure of each invoice
  
  // Safely access the total amount and ensure it's a valid number
  const amt = parseFloat(inv.total_amount?.total) || 0;  // Convert to number, fallback to 0 if invalid

  // Add to total sales (sum of all paid and unpaid amounts)
  totalSales += amt;

  // Check the payment status and add to the respective total
  if (inv.payment_status === "paid") {
    totalPaid += amt;  // Add to totalPaid if invoice is marked as "paid"
  } else if (inv.payment_status === "unpaid") {
    totalUnpaid += amt;  // Add to totalUnpaid if invoice is marked as "unpaid"
  }
});

// Optionally, output the calculated totals for debugging
console.log("Total Sales:", totalSales);
console.log("Total Paid:", totalPaid);
console.log("Total Unpaid:", totalUnpaid);

// Display the totals with proper formatting


  // Create new Sales Invoice
  const handleCreateInvoice = async () => {
  navigate("/manager/billing/createsalesinvoice")
};

  // Navigate to invoice details
  const handleRowClick = (e, invoiceId) => {
    if (e.target.type === "checkbox") return;
    navigate(`/manager/billing/createsalesinvoice?invoiceId=${invoiceId}&view=1`);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-none p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Sales Invoices</h1>
          <button
            onClick={() => alert("Reports clicked!")}
            className="px-3 py-2 border rounded text-sm hover:bg-gray-50"
          >
            Reports
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded border shadow-sm flex items-center space-x-2">
            <FaDollarSign className="text-blue-500" />
            <div>
              <div className="text-sm text-gray-500">Total Sales</div>
              <div className="text-xl font-bold">₹ {totalSales.toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded border shadow-sm flex items-center space-x-2">
            <FaCheckCircle className="text-green-500" />
            <div>
              <div className="text-sm text-gray-500">Paid</div>
              <div className="text-xl font-bold">₹ {totalPaid.toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded border shadow-sm flex items-center space-x-2">
            <FaTimesCircle className="text-red-500" />
            <div>
              <div className="text-sm text-gray-500">Unpaid</div>
              <div className="text-xl font-bold">₹ {totalUnpaid.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Create New Invoice */}
        <button
          onClick={handleCreateInvoice}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Create Sales Invoice
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="bg-white rounded border shadow-sm overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-2">Date</th>
                <th className="p-2">Invoice No</th>
                <th className="p-2">Party Name</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
  {filteredInvoices.length === 0 ? (
    <tr>
      <td colSpan={7} className="text-center py-4 text-gray-500">
        No invoices found
      </td>
    </tr>
  ) : (
    filteredInvoices.map((inv) => {
      const invoiceDate = parseDate(inv.invoice_date).format("DD MMM YYYY");

      let statusLabel = "Unpaid";
      let statusClasses = "bg-red-100 text-red-600";

      if (inv.payment_status === "paid") {
        statusLabel = "Paid";
        statusClasses = "bg-green-100 text-green-600";
      } else if (inv.payment_status === "partially_paid") {
        statusLabel = "Partially Paid";
        statusClasses = "bg-yellow-100 text-yellow-600";
      }

      return (
        <tr
          key={inv.id}
          className="border-b hover:bg-gray-50 cursor-pointer"
          onClick={(e) => handleRowClick(e, inv.id)}
        >
          <td className="p-2">{invoiceDate}</td>
          <td className="p-2">{inv.invoice_number}</td>
          <td className="p-2">{inv.party_name || "Unknown"}</td>
          <td className="p-2 text-right">₹ {inv.total_amount?.total?.toLocaleString()}</td>
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
    </div>
  );
};

export default SalesInvoices;

