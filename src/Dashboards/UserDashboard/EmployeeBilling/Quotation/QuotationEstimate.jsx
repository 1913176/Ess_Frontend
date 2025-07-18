// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import dayjs from "dayjs";

// // Helper to parse date strings
// function parseDate(dateStr) {
//   return dayjs(dateStr, ["MM/DD/YYYY", "YYYY-MM-DD"]);
// }

// const QuotationEstimate = () => {
//   const navigate = useNavigate();

//   // 1) Load quotations from localStorage
//   const [quotations, setQuotations] = useState([]);

//   useEffect(() => {
//     const stored = JSON.parse(localStorage.getItem("quotations")) || [];
//     setQuotations(stored);
//   }, []);

//   // 2) Date Range Filter
//   const [dateRange, setDateRange] = useState("365"); // default: last 365 days

//   // 3) Status Filter (All, Open, Closed)
//   const [statusFilter, setStatusFilter] = useState("All Quotation");

//   // 4) Filter logic
//   const filteredQuotations = quotations.filter((qt) => {
//     // Filter by date range
//     if (!qt.quotationDate) return false;
//     const qDate = parseDate(qt.quotationDate);
//     if (!qDate.isValid()) return false;
//     const now = dayjs();
//     const earliest = now.subtract(dateRange, "day");
//     const withinRange = qDate.isAfter(earliest) || qDate.isSame(earliest, "day");

//     // Determine if "closed"
//     // We'll say "closed" if isFullyPaid === true or balanceAmount === 0
//     let isClosed = false;
//     if (qt.isFullyPaid || qt.balanceAmount === 0) {
//       isClosed = true;
//     }
//     let passStatus = true;
//     if (statusFilter === "Open Quotation" && isClosed) {
//       passStatus = false;
//     }
//     if (statusFilter === "Closed Quotation" && !isClosed) {
//       passStatus = false;
//     }
//     return withinRange && passStatus;
//   });

//   // Summaries or totals if desired
//   // const totalAmount = filteredQuotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0);

//   // 5) "Create Quotation" => navigate
//   const handleCreateQuotation = () => {
//     navigate("/employee/billing/quotation");
//   };

//   // 6) Clicking a row => preview mode
//   const handleRowClick = (e, quotationId) => {
//     // if the user clicked on the checkbox, don’t navigate
//     if (e.target.type === "checkbox") return;
//     // otherwise open the preview
//     navigate(`/quotation?quotationId=${quotationId}&view=1`);
//   };

//   // 7) “Due In” label
//   const getDueInLabel = (qt) => {
//     if (!qt.dueDate) return "-";
//     const d = parseDate(qt.dueDate);
//     if (!d.isValid()) return "-";
//     const today = dayjs().startOf("day");
//     const diff = d.diff(today, "day");
//     if (diff === 0) return "Due Today";
//     if (diff < 0) return `Overdue by ${Math.abs(diff)} day(s)`;
//     return `${diff} day(s) left`;
//   };

//   // 8) “Status” => "Closed" if fully paid, else "Open"
//   const getStatusLabel = (qt) => {
//     if (qt.isFullyPaid || qt.balanceAmount === 0) {
//       return "Closed";
//     }
//     return "Open";
//   };

//   return (
//     <div className="h-screen flex flex-col bg-gray-100 p-4">
//       {/* Top Bar */}
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-xl font-semibold">Quotation / Estimate</h1>
//       </div>

//       {/* Filter Row */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
//         <div className="flex items-center space-x-2">
//           {/* Date Range */}
//           <label className="text-sm text-gray-600">Last</label>
//           <select
//             value={dateRange}
//             onChange={(e) => setDateRange(e.target.value)}
//             className="border rounded px-2 py-1 text-sm"
//           >
//             <option value="7">7 Days</option>
//             <option value="30">30 Days</option>
//             <option value="90">90 Days</option>
//             <option value="365">365 Days</option>
//           </select>

//           {/* Status Filter */}
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="border rounded px-2 py-1 text-sm"
//           >
//             <option value="All Quotation">Show All Quotation</option>
//             <option value="Open Quotation">Open Quotation</option>
//             <option value="Closed Quotation">Closed Quotation</option>
//           </select>
//         </div>

//         {/* Create Quotation Button */}
//         <button
//           onClick={handleCreateQuotation}
//           className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
//         >
//           Create Quotation
//         </button>
//       </div>

//       {/* Quotations Table */}
//       <div className="bg-white rounded border shadow-sm overflow-auto">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-50 border-b">
//             <tr className="text-left">
//               <th className="p-2 w-10">
//                 <input type="checkbox" disabled />
//               </th>
//               <th className="p-2">Date</th>
//               <th className="p-2">Quotation Number</th>
//               <th className="p-2">Party Name</th>
//               <th className="p-2">Due In</th>
//               <th className="p-2 text-right">Amount</th>
//               <th className="p-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredQuotations.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="text-center py-4 text-gray-500">
//                   No quotations found
//                 </td>
//               </tr>
//             ) : (
//               filteredQuotations.map((qt) => {
//                 const qDate = parseDate(qt.quotationDate).format("DD MMM YYYY");
//                 const statusLabel = getStatusLabel(qt);
//                 const isClosed = statusLabel === "Closed";
//                 const statusClasses = isClosed
//                   ? "bg-green-100 text-green-600"
//                   : "bg-red-100 text-red-600";

//                 return (
//                   <tr
//                     key={qt.id}
//                     className="border-b hover:bg-gray-50 cursor-pointer"
//                     onClick={(e) => handleRowClick(e, qt.id)}
//                   >
//                     <td className="p-2 text-center cursor-auto">
//                       <input type="checkbox" disabled />
//                     </td>
//                     <td className="p-2">{qDate}</td>
//                     <td className="p-2">{qt.quotationNumber}</td>
//                     <td className="p-2">{qt.party?.name || "Unknown"}</td>
//                     <td className="p-2">{getDueInLabel(qt)}</td>
//                     <td className="p-2 text-right">
//                       ₹ {(qt.grandTotal || 0).toLocaleString()}
//                     </td>
//                     <td className="p-2">
//                       <span
//                         className={`px-2 py-1 rounded text-xs font-medium ${statusClasses}`}
//                       >
//                         {statusLabel}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };
//____________________________________________________________________________________________

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import dayjs from "dayjs";
// import axios from "axios";

// const baseurl = process.env.REACT_APP_BASEAPI;

// // Helper to parse date strings
// function parseDate(dateStr) {
//   return dayjs(dateStr, ["MM/DD/YYYY", "YYYY-MM-DD"]);
// }

// const QuotationEstimate = () => {
//   const navigate = useNavigate();

//   // 1) Load quotations from API
//   const [quotations, setQuotations] = useState([]);
//   const [loading, setLoading] = useState(true);  // State to track loading
//   const [error, setError] = useState(null);  // State to track any errors

//   useEffect(() => {
//     // Fetch quotations from API
//     const fetchQuotations = async () => {
//       try {
//         const response = await axios.get(`${baseurl}/quotation/quotation-estimates/`); // Use baseurl from .env
//         setQuotations(response.data);  // Set the fetched data into state
//         setLoading(false);  // Set loading to false after data is fetched
//       } catch (err) {
//         setError("Error fetching quotations");  // Handle any errors
//         setLoading(false);  // Set loading to false if there's an error
//       }
//     };

//     fetchQuotations();
//   }, [baseurl]);  // Include baseurl in the dependency array

//   // 2) Date Range Filter
//   const [dateRange, setDateRange] = useState("365"); // default: last 365 days

//   // 3) Status Filter (All, Open, Closed)
//   const [statusFilter, setStatusFilter] = useState("All Quotation");

//   // 4) Filter logic
//   const filteredQuotations = quotations.filter((qt) => {
//     // Filter by date range
//     if (!qt.quotationDate) return false;
//     const qDate = parseDate(qt.quotationDate);
//     if (!qDate.isValid()) return false;
//     const now = dayjs();
//     const earliest = now.subtract(dateRange, "day");
//     const withinRange = qDate.isAfter(earliest) || qDate.isSame(earliest, "day");

//     // Determine if "closed"
//     let isClosed = false;
//     if (qt.isFullyPaid || qt.balanceAmount === 0) {
//       isClosed = true;
//     }
//     let passStatus = true;
//     if (statusFilter === "Open Quotation" && isClosed) {
//       passStatus = false;
//     }
//     if (statusFilter === "Closed Quotation" && !isClosed) {
//       passStatus = false;
//     }
//     return withinRange && passStatus;
//   });

//   // 5) "Create Quotation" => navigate
//   const handleCreateQuotation = () => {
//     navigate("/employee/billing/quotation");
//   };

//   // 6) Clicking a row => preview mode
//   const handleRowClick = (e, quotationId) => {
//     // if the user clicked on the checkbox, don’t navigate
//     if (e.target.type === "checkbox") return;
//     // otherwise open the preview
//     navigate(`/quotation?quotationId=${quotationId}&view=1`);
//   };

//   // 7) “Due In” label
//   const getDueInLabel = (qt) => {
//     if (!qt.dueDate) return "-";
//     const d = parseDate(qt.dueDate);
//     if (!d.isValid()) return "-";
//     const today = dayjs().startOf("day");
//     const diff = d.diff(today, "day");
//     if (diff === 0) return "Due Today";
//     if (diff < 0) return `Overdue by ${Math.abs(diff)} day(s)`;
//     return `${diff} day(s) left`;
//   };

//   // 8) “Status” => "Closed" if fully paid, else "Open"
//   const getStatusLabel = (qt) => {
//     if (qt.isFullyPaid || qt.balanceAmount === 0) {
//       return "Closed";
//     }
//     return "Open";
//   };

//   if (loading) {
//     return <div>Loading...</div>;  // Show loading indicator while fetching data
//   }

//   if (error) {
//     return <div>{error}</div>;  // Show error message if there's an issue
//   }

//   return (
//     <div className="h-screen flex flex-col bg-gray-100 p-4">
//       {/* Top Bar */}
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-xl font-semibold">Quotation / Estimate</h1>
//       </div>

//       {/* Filter Row */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
//         <div className="flex items-center space-x-2">
//           {/* Date Range */}
//           <label className="text-sm text-gray-600">Last</label>
//           <select
//             value={dateRange}
//             onChange={(e) => setDateRange(e.target.value)}
//             className="border rounded px-2 py-1 text-sm"
//           >
//             <option value="7">7 Days</option>
//             <option value="30">30 Days</option>
//             <option value="90">90 Days</option>
//             <option value="365">365 Days</option>
//           </select>

//           {/* Status Filter */}
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="border rounded px-2 py-1 text-sm"
//           >
//             <option value="All Quotation">Show All Quotation</option>
//             <option value="Open Quotation">Open Quotation</option>
//             <option value="Closed Quotation">Closed Quotation</option>
//           </select>
//         </div>

//         {/* Create Quotation Button */}
//         <button
//           onClick={handleCreateQuotation}
//           className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
//         >
//           Create Quotation
//         </button>
//       </div>

//       {/* Quotations Table */}
//       <div className="bg-white rounded border shadow-sm overflow-auto">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-50 border-b">
//             <tr className="text-left">
//               <th className="p-2 w-10">
//                 <input type="checkbox" disabled />
//               </th>
//               <th className="p-2">Date</th>
//               <th className="p-2">Quotation Number</th>
//               <th className="p-2">Party Name</th>
//               <th className="p-2">Due In</th>
//               <th className="p-2 text-right">Amount</th>
//               <th className="p-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredQuotations.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="text-center py-4 text-gray-500">
//                   No quotations found
//                 </td>
//               </tr>
//             ) : (
//               filteredQuotations.map((qt) => {
//                 const qDate = parseDate(qt.quotationDate).format("DD MMM YYYY");
//                 const statusLabel = getStatusLabel(qt);
//                 const isClosed = statusLabel === "Closed";
//                 const statusClasses = isClosed
//                   ? "bg-green-100 text-green-600"
//                   : "bg-red-100 text-red-600";

//                 return (
//                   <tr
//                     key={qt.id}
//                     className="border-b hover:bg-gray-50 cursor-pointer"
//                     onClick={(e) => handleRowClick(e, qt.id)}
//                   >
//                     <td className="p-2 text-center cursor-auto">
//                       <input type="checkbox" disabled />
//                     </td>
//                     <td className="p-2">{qDate}</td>
//                     <td className="p-2">{qt.quotationNumber}</td>
//                     <td className="p-2">{qt.party?.name || "Unknown"}</td>
//                     <td className="p-2">{getDueInLabel(qt)}</td>
//                     <td className="p-2 text-right">
//                       ₹ {(qt.grandTotal || 0).toLocaleString()}
//                     </td>
//                     <td className="p-2">
//                       <span
//                         className={`px-2 py-1 rounded text-xs font-medium ${statusClasses}`}
//                       >
//                         {statusLabel}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default QuotationEstimate;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

// Helper to parse date strings
function parseDate(dateStr) {
  return dayjs(dateStr, ["MM/DD/YYYY", "YYYY-MM-DD"]);
}

const QuotationEstimate = () => {
  const navigate = useNavigate();

  // 1) Load quotations from API
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASEAPI}/quotation/quotation-estimates/`);
        setQuotations(response.data);
        console.log("Fetched Quotations:", response.data); // Debugging
      } catch (error) {
        console.error("Error fetching quotations:", error);
      }
    };
    fetchQuotations();
  }, []);

  // 2) Date Range Filter
  const [dateRange, setDateRange] = useState("365"); // default: last 365 days

  // 3) Status Filter (All, Open, Closed)
  const [statusFilter, setStatusFilter] = useState("All Quotation");

  // 4) Filter logic
  const filteredQuotations = quotations.filter((qt) => {
    // Filter by date range
    if (!qt.quotation_date) return false;
    const qDate = parseDate(qt.quotation_date);
    if (!qDate.isValid()) return false;
    const now = dayjs();
    const earliest = now.subtract(dateRange, "day");
    const withinRange = qDate.isAfter(earliest) || qDate.isSame(earliest, "day");
  
    // Determine if "closed"
    let isClosed = false;
    if (qt.is_fully_paid || qt.balance_amount === 0) {
      isClosed = true;
    }
    let passStatus = true;
    if (statusFilter === "Open Quotation" && isClosed) {
      passStatus = false;
    }
    if (statusFilter === "Closed Quotation" && !isClosed) {
      passStatus = false;
    }
    return withinRange && passStatus;
  });

  // Log filtered quotations
  console.log("Filtered Quotations:", filteredQuotations);

  // 5) "Create Quotation" => navigate
  const handleCreateQuotation = () => {
    navigate("/employee/billing/Quotation");
  };

  // 6) Clicking a row => preview mode
  const handleRowClick = (e, quotationId) => {
    if (e.target.type === "checkbox") return;
    navigate(`/quotation?quotationId=${quotationId}&view=1`);
  };

  // 7) “Due In” label
  const getDueInLabel = (qt) => {
    if (!qt.due_date) return "-";
    const d = parseDate(qt.due_date);
    if (!d.isValid()) return "-";
    const today = dayjs().startOf("day");
    const diff = d.diff(today, "day");
    if (diff === 0) return "Due Today";
    if (diff < 0) return `Overdue by ${Math.abs(diff)} day(s)`;
    return `${diff} day(s) left`;
  };

  const getStatusLabel = (qt) => {
    // First, check if the status indicates that the quotation has been converted to an invoice
    if (qt.status === "Convert_into_Invoice") {
      return "Closed";  // Quotation has been converted into an invoice, marked as "Closed"
    }
    
    // You can also keep the payment status check if needed
    if (qt.is_fully_paid || qt.balance_amount === 0) {
      return "Closed";  // Fully paid or balance is 0
    }
  
    return "Open";  // Default to Open if neither condition is met
  };
  

  return (
    <div className="h-screen flex flex-col bg-gray-100 p-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Quotation / Estimate</h1>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          {/* Date Range */}
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="All Quotation">Show All Quotation</option>
            <option value="Open Quotation">Open Quotation</option>
            <option value="Closed Quotation">Closed Quotation</option>
          </select>
        </div>

        {/* Create Quotation Button */}
        <button
          onClick={handleCreateQuotation}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Create Quotation
        </button>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded border shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left">
              <th className="p-2 w-10">
                <input type="checkbox" disabled />
              </th>
              <th className="p-2">Date</th>
              <th className="p-2">Quotation Number</th>
              <th className="p-2">Party Name</th>
              <th className="p-2">Due In</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No quotations found
                </td>
              </tr>
            ) : (
              filteredQuotations.map((qt) => {
                const qDate = parseDate(qt.quotation_date).format("DD MMM YYYY");
                const statusLabel = getStatusLabel(qt);
                const isClosed = statusLabel === "Closed";
                const statusClasses = isClosed
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600";

                return (
                  <tr
                    key={qt.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => handleRowClick(e, qt.id)}
                  >
                    <td className="p-2 text-center cursor-auto">
                      <input type="checkbox" disabled />
                    </td>
                    <td className="p-2">{qDate}</td>
                    <td className="p-2">{qt.quotation_number}</td>
                    <td className="p-2">{qt.party_name || "Unknown"}</td>
                    <td className="p-2">{qt.due_date || "-"}</td>
                    <td className="p-2 text-right"> ₹ {qt.total_amount?.total || "0.00"}</td>
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

export default QuotationEstimate;
