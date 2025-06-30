import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";

// Helper to parse date strings
function parseDate(dateStr) {
  return dayjs(dateStr, ["MM/DD/YYYY", "YYYY-MM-DD"]);
}

const CreditNotes = () => {
  const navigate = useNavigate();
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator

  // 1) Load credit notes from API
  useEffect(() => {
    const fetchCreditNotes = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASEAPI}/credit/list/`); // Adjust API URL as needed
        setCreditNotes(response.data);
        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error("Error fetching credit notes:", error);
        setLoading(false); // Stop loading even if there is an error
      }
    };

    fetchCreditNotes();
  }, []);

  // 2) Date range filter
  const [dateRange, setDateRange] = useState("365"); // default last 365 days

  // Filter the credit notes by date range
  const filteredCreditNotes = creditNotes.filter((cn) => {
    if (!cn.credit_note_date) return false;
    const noteDate = parseDate(cn.credit_note_date);
    if (!noteDate.isValid()) return false;
    const now = dayjs();
    const earliest = now.subtract(dateRange, "day");
    // keep if noteDate >= earliest
    return noteDate.isAfter(earliest) || noteDate.isSame(earliest, "day");
  });

  // 3) Create Credit Note => navigate
  const handleCreateCreditNote = () => {
    navigate("/employee/billing/creditnote");
  };

  // 4) Clicking a row => open in preview mode
  const handleRowClick = (e, noteId) => {
    if (e.target.type === "checkbox") return; // ignore checkbox clicks
    navigate(`/creditnote?creditNoteId=${noteId}&view=1`);
  };

  // 5) “Status” => "Paid" if isFullyPaid or balanceAmount===0, else "Unpaid"
  const getStatusLabel = (cn) => {
    if (cn.status === "paid") {
      return "Paid";
    }
    return "Unpaid";
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 p-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Credit Note</h1>
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
        </div>

        <button
          onClick={handleCreateCreditNote}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Create Credit Note
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-4 text-gray-500">
          Loading credit notes...
        </div>
      )}

      {/* Credit Notes Table */}
      <div className="bg-white rounded border shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left">
              <th className="p-2 w-10">
                <input type="checkbox" disabled />
              </th>
              <th className="p-2">Date</th>
              <th className="p-2">Credit Note Number</th>
              <th className="p-2">Party Name</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCreditNotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No credit notes found
                </td>
              </tr>
            ) : (
              filteredCreditNotes.map((cn) => {
                // Format date
                const noteDate = parseDate(cn.credit_note_date).format("DD MMM YYYY");
                // Status
                const statusLabel = getStatusLabel(cn);
                const isPaid = statusLabel === "Paid";
                const statusClasses = isPaid
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600";

                // Calculate total amount
                const totalAmount = cn.total_amount.total || 0;

                return (
                  <tr
                    key={cn.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => handleRowClick(e, cn.id)}
                  >
                    <td className="p-2 text-center cursor-auto">
                      <input type="checkbox" disabled />
                    </td>
                    <td className="p-2">{noteDate}</td>
                    <td className="p-2">{cn.credit_note_number}</td>
                    <td className="p-2">{cn.party_name || "Unknown"}</td>
                    <td className="p-2 text-right">
                      ₹ {totalAmount.toLocaleString()}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${statusClasses}`}
                      >
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

export default CreditNotes;

