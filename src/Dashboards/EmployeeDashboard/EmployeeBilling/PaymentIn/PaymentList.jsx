import React from "react";
import { useNavigate } from "react-router-dom";

function PaymentDetails() {
  const navigate = useNavigate();

  // Example handlers for the top-right buttons.
  // Replace with your actual PDF generation, printing, sharing, and editing logic.
  const handleDownloadPDF = () => {
    // TODO: Implement actual PDF download logic here.
    alert("Download PDF clicked!");
  };

  const handlePrintPDF = () => {
    // A quick approach: opens the browser’s print dialog for the current page
    window.print();
  };

  const handleShare = () => {
    // Example using the Web Share API (works on mobile & some modern browsers)
    if (navigator.share) {
      navigator
        .share({
          title: "Payment In #1",
          text: "Check out this payment detail!",
          url: window.location.href,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      // Fallback for browsers without the Web Share API
      alert("Sharing is not supported in this browser.");
    }
  };

  const handleEdit = () => {
    // Navigate to an edit screen, or open an edit modal, etc.
    // Example: navigate to /edit-payment/1
    navigate("/employee/billing/edit-payment/1");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header: Back Arrow + Title + Action Buttons */}
      <div className="flex items-center">
        {/* Back Arrow Button */}
        <button
          className="mr-2 text-gray-500 hover:text-gray-700"
          onClick={() => navigate(-1)}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page Title */}
        <h2 className="text-lg font-semibold">Payment In #1</h2>

        {/* Action Buttons (right-aligned) */}
        <div className="ml-auto flex items-center space-x-2">
          <button
            onClick={handleDownloadPDF}
            className="bg-white border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
          >
            Download PDF
          </button>
          <button
            onClick={handlePrintPDF}
            className="bg-white border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
          >
            Print PDF
          </button>
          <button
            onClick={handleShare}
            className="bg-white border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
          >
            Share
          </button>
          <button
            onClick={handleEdit}
            className="bg-white border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="bg-white border border-gray-200 p-4">
        <h3 className="font-semibold mb-4">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
          <div>
            <span className="text-gray-500 block">Party Name</span>
            <div className="font-medium">Cash Sale</div>
          </div>
          <div>
            <span className="text-gray-500 block">Payment Date</span>
            <div className="font-medium">05 Mar 2025</div>
          </div>
          <div>
            <span className="text-gray-500 block">Payment Amount</span>
            <div className="font-medium">&#8377; 1,000</div>
          </div>
          <div>
            <span className="text-gray-500 block">Payment Type</span>
            <div className="font-medium">Cash</div>
          </div>
          <div className="md:col-span-2">
            <span className="text-gray-500 block">Notes</span>
            <div className="font-medium">N/A</div>
          </div>
        </div>
      </div>

      {/* Table of Invoices Settled */}
      <div className="bg-white border border-gray-200 p-4">
        <h3 className="font-semibold mb-4">Invoices settled with this payment</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 font-medium text-gray-600">Date</th>
                <th className="px-4 py-2 font-medium text-gray-600">Invoice Number</th>
                <th className="px-4 py-2 font-medium text-gray-600">INVOICE AMOUNT</th>
                <th className="px-4 py-2 font-medium text-gray-600">
                  INVOICE AMOUNT SETTLED
                </th>
                <th className="px-4 py-2 font-medium text-gray-600">TDS Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2">05 Mar 2025</td>
                <td className="px-4 py-2">6</td>
                <td className="px-4 py-2">&#8377; 1,000</td>
                <td className="px-4 py-2">&#8377; 1,000</td>
                <td className="px-4 py-2">&#8377; 0</td>
              </tr>
              {/* Repeat rows for additional invoices if needed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetails;
