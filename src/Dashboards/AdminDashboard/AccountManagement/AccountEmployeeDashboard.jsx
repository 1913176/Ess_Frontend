import { useState, useEffect, useCallback, useContext } from "react";
import { Search } from "lucide-react";
import { ARManagementContext } from "./AccountManagementLayout";
import axios from "axios";

const apiBaseUrl = process.env.VITE_BASE_API;

// Helper functions
const getCollectedPercentage = (collected, totalAmount) => {
  if (totalAmount === 0 || !totalAmount) return "0%";
  return `${((collected / totalAmount) * 100).toFixed(0)}%`;
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function EmployeeDashboard() {
  const { filterPeriod, dateRange, targets } = useContext(ARManagementContext);
  const [startDate, endDate] = dateRange;

  const [allInvoices, setAllInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalAmount: 0,
    totalPaidAmount: 0,
    outstandingDues: 0,
    overduePayments: 0,
  });
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await axios.get(
          `${apiBaseUrl}/saleinv/sales-invoices/`
        );

        // Log the raw response to debug
        console.log("API Response:", response.data);

        // Handle different possible response structures
        const invoices = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.invoices)
          ? response.data.invoices
          : [];

        // Log the parsed invoices
        console.log("Parsed Invoices:", invoices);

        localStorage.setItem("invoices", JSON.stringify(invoices));
        setAllInvoices(invoices);
        setFilteredData(invoices); // Initialize filteredData with all invoices
        setFetchError(null);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        let errorMessage = "Unable to load invoice data. Please try again later.";
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.data?.error || "Unknown error"}`;
        } else if (error.request) {
          errorMessage = "Network error: Unable to reach the server. Please check your connection.";
        }
        setFetchError(errorMessage);

        // Fallback to localStorage safely
        try {
          const storedInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
          if (Array.isArray(storedInvoices)) {
            setAllInvoices(storedInvoices);
            setFilteredData(storedInvoices);
          }
        } catch (e) {
          console.error("Failed to parse localStorage invoices:", e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Fetch employee targets
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/targets/`);
        // Filter targets where employee is not null
        const validTargets = response.data.filter((target) => target.employee !== null);
        console.log("Fetched Employee Targets:", validTargets);
        setFilteredTargets(validTargets);
        setFetchError(null);
      } catch (error) {
        console.error("Failed to fetch targets:", error);
        let errorMessage = "Unable to load target data. Please try again later.";
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.data?.error || "Unknown error"}`;
        } else if (error.request) {
          errorMessage = "Network error: Unable to reach the server. Please check your connection.";
        }
        setFetchError(errorMessage);
      }
    };
    fetchTargets();
  }, []);

  const applyFilters = useCallback(() => {
    let newFilteredData = [...allInvoices];
    let newFilteredTargets = [...filteredTargets]; // Use fetched targets
    let filterStartDate = null;
    let filterEndDate = null;

    // Log state for debugging
    console.log("All Invoices:", allInvoices);
    console.log("Filter Period:", filterPeriod);
    console.log("Date Range:", startDate, endDate);
    console.log("Search Query:", searchQuery);

    const today = new Date(2025, 4, 21); // May 21, 2025
    today.setHours(0, 0, 0, 0);

    switch (filterPeriod) {
      case "daily":
        filterStartDate = new Date(today);
        filterEndDate = new Date(today);
        break;
      case "weekly":
        filterStartDate = new Date(today);
        filterStartDate.setDate(today.getDate() - today.getDay());
        filterEndDate = new Date(filterStartDate);
        filterEndDate.setDate(filterStartDate.getDate() + 6);
        break;
      case "monthly":
        filterStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        filterEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "quarterly":
        const quarter = Math.floor(today.getMonth() / 3);
        filterStartDate = new Date(today.getFullYear(), quarter * 3, 1);
        filterEndDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case "half-yearly":
        const half = today.getMonth() < 6 ? 0 : 6;
        filterStartDate = new Date(today.getFullYear(), half, 1);
        filterEndDate = new Date(today.getFullYear(), half + 6, 0);
        break;
      case "yearly":
        filterStartDate = new Date(today.getFullYear(), 0, 1);
        filterEndDate = new Date(today.getFullYear(), 11, 31);
        break;
      case "custom":
        filterStartDate = startDate ? new Date(startDate) : null;
        filterEndDate = endDate ? new Date(endDate) : null;
        break;
      default:
        break;
    }

    if (filterStartDate && filterEndDate) {
      newFilteredData = newFilteredData.filter((invoice) => {
        const invoiceDate = new Date(invoice.invoice_date);
        if (isNaN(invoiceDate)) return false; // Skip invalid dates
        const invoiceDayStart = new Date(
          invoiceDate.getFullYear(),
          invoiceDate.getMonth(),
          invoiceDate.getDate()
        );
        const rangeStart = new Date(
          filterStartDate.getFullYear(),
          filterStartDate.getMonth(),
          filterStartDate.getDate()
        );
        const rangeEnd = new Date(
          filterEndDate.getFullYear(),
          filterEndDate.getMonth(),
          filterEndDate.getDate()
        );
        return invoiceDayStart >= rangeStart && invoiceDayStart <= rangeEnd;
      });

      newFilteredTargets = newFilteredTargets.filter((target) => {
        const targetStartDate = new Date(target.start_date);
        const targetEndDate = new Date(target.end_date);
        if (isNaN(targetStartDate) || isNaN(targetEndDate)) return false;
        return (
          targetStartDate <= filterEndDate &&
          targetEndDate >= filterStartDate
        );
      });
    }

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      newFilteredData = newFilteredData.filter(
        (invoice) =>
          (invoice.sales_person?.name || "")
            .toLowerCase()
            .includes(lowerSearchQuery) ||
          (invoice.party_name || "").toLowerCase().includes(lowerSearchQuery)
      );

      newFilteredTargets = newFilteredTargets.filter(
        (target) =>
          target.employee?.name?.toLowerCase().includes(lowerSearchQuery)
      );
    }

    // Log filtered data
    console.log("Filtered Data:", newFilteredData);
    console.log("Filtered Targets:", newFilteredTargets);

    setFilteredData(newFilteredData);
    setFilteredTargets(newFilteredTargets);
  }, [allInvoices, filteredTargets, filterPeriod, startDate, endDate, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  useEffect(() => {
    const safeNumber = (value) => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };
    const totalAmount = filteredData.reduce((acc, invoice) => {
      return acc + safeNumber(invoice.total_amount?.total);
    }, 0);

    const totalPaidAmount = filteredData.reduce((acc, invoice) => {
      return acc + (invoice.payment_status === "paid" ? safeNumber(invoice.total_amount?.total) : 0);
    }, 0);

    const outstandingDues = filteredData.reduce((acc, invoice) => {
      return acc + safeNumber(invoice.outstanding_amount);
    }, 0);

    const overduePayments = filteredData.reduce((acc, invoice) => {
      return acc + safeNumber(invoice.overdue_amount);
    }, 0);

    setSummaryData({
      totalAmount,
      totalPaidAmount,
      outstandingDues,
      overduePayments,
    });

    // Log summary data
    console.log("Summary Data:", {
      totalAmount,
      totalPaidAmount,
      outstandingDues,
      overduePayments,
    });
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="flex-1">
        <main className="p-4 sm:p-6 max-w-full mx-auto">
          {isLoading && (
            <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-md flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Loading invoice data...
            </div>
          )}
          {fetchError && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {fetchError}
              <button
                onClick={() => window.location.reload()} // Simple retry by reloading
                className="ml-4 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {[
              {
                title: "Total Amount",
                value: summaryData?.totalAmount,
                color: "orange",
              },
              {
                title: "Collected Amount",
                value: summaryData?.totalPaidAmount,
                color: "green",
              },
              {
                title: "Outstanding Dues",
                value: summaryData?.outstandingDues,
                color: "blue",
              },
              {
                title: "Overdue Payments",
                value: summaryData?.overduePayments,
                color: "red",
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`bg-white p-5 rounded-xl border-l-4 border-${card.color}-500 shadow-lg hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {card.title}
                </div>
                <div
                  className={`text-3xl font-bold text-${card.color === "orange" ? "gray-800" : card.color + "-600"} mb-2`}
                >
                  ${card.value?.toLocaleString() ?? "0"}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                  placeholder="Search employee or party..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Employee Name",
                      "Total Amount",
                      "Collected",
                      "Outstanding",
                      "Overdue",
                      "Party Name",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                          header === "Total Amount"
                            ? "text-orange-600"
                            : header === "Collected"
                            ? "text-green-600"
                            : header === "Outstanding"
                            ? "text-blue-600"
                            : header === "Overdue"
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          {invoice.sales_person?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          ${Number(invoice.total_amount?.total || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          ${invoice.payment_status === "paid" ? Number(invoice.total_amount?.total || 0).toLocaleString() : "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                          ${Number(invoice.outstanding_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          ${Number(invoice.overdue_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invoice.party_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1 flex items-center">
                          {/* Add action buttons here if needed */}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-16 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Search size={40} className="text-gray-400 mb-3" />
                          <p className="font-semibold">
                            No invoices match your current filters.
                          </p>
                          <p className="text-xs text-gray-400">
                            Try adjusting your search or date range.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                Employee Targets
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Employee Name", "Target Amount", "Collected", "Date Range", "Status"].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTargets.length > 0 ? (
                    filteredTargets.map((target) => {
                      const invoice = allInvoices.find(
                        (e) => e.sales_person?.id == target.employee
                      );
                      const collected = invoice && invoice.payment_status === "paid"
                        ? Number(invoice.total_amount?.total || 0)
                        : 0;
                      const isCompleted = collected >= target.target_amount;
                      return (
                        <tr
                          key={target.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                            {invoice ? invoice.sales_person?.name : target.employee?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            ${Number(target.target_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            ${collected.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {`${formatDate(target.start_date)} - ${formatDate(target.end_date)}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                isCompleted ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {isCompleted ? "Completed" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-16 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Search size={40} className="text-gray-400 mb-3" />
                          <p className="font-semibold">
                            No targets set for the current filters.
                          </p>
                          <p className="text-xs text-gray-400">
                            Try adjusting your filters or setting a new target.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}