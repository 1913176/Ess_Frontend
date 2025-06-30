// // src/components/PartyPaymentManager.js
// (unchanged code for PartyPaymentManager is here, as you provided)

// File: PaymentIn.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaCog,
  FaKeyboard,
  FaArrowLeft,
  FaChevronDown,
  FaDownload,
  FaPrint,
  FaInfoCircle,
  FaShareAlt,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import axios from "axios";

const baseurl = process.env.REACT_APP_BASEAPI;

const dateRanges = [
  "Today", "Yesterday", "This Week", "Last Week",
  "Last 7 Days", "This Month", "Previous Month",
  "Last 30 Days", "Last Quarter", "Previous Quarter",
  "Current Fiscal Year", "Previous Fiscal Year",
  "Last 365 Days", "Custom Date Range"
];

export default function PaymentIn() {
  const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'detail'
  const [payments, setPayments] = useState([]);
  const [parties, setParties] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [manualAmount, setManualAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [payment_date, setpayment_date] = useState("");
  const [payment_mode, setpayment_mode] = useState("Cash");
  const [payment_in_number, setpayment_in_number] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Last 365 Days");
  const [partyDropdownOpen, setPartyDropdownOpen] = useState(false);
  const [partySearch, setPartySearch] = useState("");
  const rangeRef = useRef(null);
  const partyRef = useRef(null);
  const detailRef = useRef(null);

  // Load initial data from localStorage
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const partyRes = await axios.get(`${baseurl}/pincode/party-list/`);
        setParties(partyRes.data);
        console.log("📥 Parties:", partyRes.data);
  
        const paymentRes = await axios.get(`${baseurl}/payment/payment-in/list/`);
        setPayments(paymentRes.data);
        console.log("📥 PaymentIn List:", paymentRes.data);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };
  
    fetchInitialData();
  }, []);
  

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) {
        setRangeOpen(false);
      }
      if (partyRef.current && !partyRef.current.contains(e.target)) {
        setPartyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter for the main payments list
  const filteredPayments = payments.filter((p) =>
    p.party_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  // Filter for the party dropdown
  const filteredParties = parties.filter((p) =>
    (p.name && p.name.toLowerCase().includes(partySearch.toLowerCase())) ||
    String(p.id).includes(partySearch)
  );
  

  // Sum of all amounts settled in the selected invoices
 const totalSettled = selectedInvoices.reduce(
  (sum, i) => sum + (Number(i.amountSettled) || 0), // Make sure it's a number
  0
);


useEffect(() => {
  // Autofill manualAmount when invoice selection changes
  setManualAmount(totalSettled.toFixed(2));
}, [totalSettled]);


  // Switch to Create view
  const startCreate = () => {
    setViewMode("create");
    setSelectedPayment(null);
    setSelectedParty(null);
    setInvoices([]);
    setSelectedInvoices([]);
    setpayment_date(new Date().toISOString().slice(0, 10));
    setpayment_mode("Cash");
    setNotes("");
    setpayment_in_number(payments.length + 1);
  };

  // Save the newly created payment
  const handleSave = async () => {
  if (!selectedParty || Number(manualAmount) === 0) return;

  const payload = {
    invoice_id: selectedInvoices[0]?.id, // ✅ corrected key: 'invoice_ids'
    payment_amount: Number(manualAmount),
    payment_mode,
    notes,
    payment_date,
    payment_in_number,
  };

  console.log("📦 Payload before POST:", payload);

  try {
    const res = await axios.post(
      `${baseurl}/payment/convert-invoice/${selectedParty.id}/`,
      payload
    );

    console.log("✅ Payment saved:", res.data);
    alert("Payment recorded successfully!");
    setPayments([...payments, ...res.data.results]);
    setViewMode("list");
  } catch (error) {
     setViewMode("list");
    console.error("❌ Error saving payment:", error);
    if (error.response && error.response.data) {
      alert(`Failed to save payment. Details: ${JSON.stringify(error.response.data)}`);
    } else {
      alert("Failed to save payment. Please try again.");
    }
  }
};
  // When user selects a party from the dropdown
  const handlePartySelect = async (p) => {
    setSelectedParty(p);
    setPartyDropdownOpen(false);
    setPartySearch("");
    setSelectedInvoices([]);
  
    try {
      const res = await axios.get(`${baseurl}/payment/unpaid-invoices/${p.id}/`);
      const unpaidInvoices = res.data;
  
      const filteredUnpaid = unpaidInvoices.filter(
        (inv) => inv.Invoice_Amount > 0
      );
  
      setInvoices(filteredUnpaid);
      console.log("📥 Unpaid Invoices for party:", filteredUnpaid);
    } catch (error) {
      console.error("❌ Failed to fetch unpaid invoices:", error);
      setInvoices([]);  // fallback if error
    }
  };
  

  // Toggle an invoice in or out of the selectedInvoices array
 const toggleInvoice = (inv) => {
  console.log("📦 Invoice clicked:", inv); // Debug

  const invoiceId = inv.id; // Check if this is undefined

  if (!invoiceId) {
    console.warn("⚠️ Invoice has no ID:", inv);
    return;
  }

  const isSelected = selectedInvoices.some((i) => i.id === invoiceId);

  if (isSelected) {
    setSelectedInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
  } else {
    setSelectedInvoices((prev) => [
      ...prev,
      {
        ...inv,
        amountSettled: manualAmount,
      },
    ]);
  }
};


  

  // Switch to detail view
  const showDetail = (pmt) => {
    setSelectedPayment(pmt);
    setViewMode("detail");
  };

  

  // Delete a payment from localStorage
 const handleDelete = async () => {
  if (!selectedPayment) return;
  if (!selectedPayment.id) {
    console.error("❌ No payment ID found:", selectedPayment);
    return;
  }

  if (!window.confirm("Delete this payment?")) return;

  try {
    await axios.delete(`${baseurl}/payment/delete/${selectedPayment.id}/`);

    const updated = payments.filter((p) => p.id !== selectedPayment.id);
    localStorage.setItem("paymentsIn", JSON.stringify(updated));
    setPayments(updated);
    setSelectedPayment(null);
    setViewMode("list");

    console.log("✅ Payment deleted successfully");
  } catch (error) {
    console.error("❌ Failed to delete payment:", error);
    alert("Something went wrong while deleting the payment.");
  }
};

   

  // Download PDF of the detail view
  const downloadPDF = async () => {
    if (!detailRef.current) return;
    const canvas = await html2canvas(detailRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`paymentin_${selectedPayment.payment_in_number}.pdf`);
  };

  // Print the detail view
  const printDetail = () => {
    window.print();
  };

  // Render
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {viewMode === "list" && (
        <>
          {/* List View */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Payment In</h2>
            <button
              onClick={startCreate}
              className="bg-[#7B68EE] text-white px-5 py-2 rounded-md hover:brightness-90"
            >
              Create Payment In
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative text-gray-500">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-3 py-2 border rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative" ref={rangeRef}>
                <button
                  onClick={() => setRangeOpen((o) => !o)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm"
                >
                  <FaCalendarAlt /> {selectedRange}
                </button>
                {rangeOpen && (
                  <ul className="absolute mt-1 w-48 bg-white border rounded-md shadow-lg max-h-60 overflow-auto z-10">
                    {dateRanges.map((r) => (
                      <li
                        key={r}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setSelectedRange(r);
                          setRangeOpen(false);
                        }}
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-md hover:bg-gray-100">
                <FaCog size={16} />
              </button>
              <button className="p-2 rounded-md hover:bg-gray-100">
                <FaKeyboard size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border rounded-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Payment Number</th>
                  <th className="px-4 py-3 text-left">Party Name</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500 italic">
                      No payments recorded
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p, i) => (
                    <tr
                      key={i}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => showDetail(p)}
                    >
                      <td className="px-4 py-3">{p.payment_date}</td>
                      <td className="px-4 py-3">{p.payment_in_number}</td>
                      <td className="px-4 py-3">{p.party_name}</td>
                      <td className="px-4 py-3">₹ {p.payment_amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {viewMode === "create" && (
        <>
          {/* Create View */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode("list")}
                className="p-2 rounded hover:bg-gray-100"
              >
                <FaArrowLeft />
              </button>
              <h2 className="text-2xl font-semibold">
                Record Payment In #{payment_in_number}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded hover:bg-gray-100">
                <FaKeyboard />
              </button>
              <button className="p-2 rounded hover:bg-gray-100">
                <FaCog />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="bg-[#7B68EE] text-white px-4 py-2 rounded-md hover:brightness-90"
              >
                Cancel
              </button>
              <button
                disabled={!selectedParty || totalSettled === 0}
                onClick={handleSave}
                className="bg-[#7B68EE] text-white px-4 py-2 rounded-md hover:brightness-90 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card */}
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <div className="relative" ref={partyRef}>
                <button
                  onClick={() => setPartyDropdownOpen((o) => !o)}
                  className="w-full border rounded-md p-2 text-left flex justify-between items-center"
                >
                  {selectedParty
                    ? selectedParty.party_name
                    : "Search party by name or number"}
                  <FaChevronDown />
                </button>
                {partyDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                    <input
                      type="text"
                      placeholder="Search party by name or number"
                      value={partySearch}
                      onChange={(e) => setPartySearch(e.target.value)}
                      className="w-full p-2 border-b focus:outline-none"
                    />
                    <div className="max-h-48 overflow-auto">
                      {filteredParties.length > 0 ? (
                        filteredParties.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handlePartySelect(p)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {p.party_name}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No parties found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

             <div>
  <label className="block text-sm font-medium mb-1">
    Enter Payment Amount
  </label>
  <input
    type="number"
    step="0.01"
    value={manualAmount}
    onChange={(e) => setManualAmount(e.target.value)}
    className="w-full bg-white border rounded-md p-2 text-sm text-gray-800"
  />
</div>

            </div>

            {/* Right Card */}
            <div className="bg-white border rounded-lg p-6 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">
                    Payment Date
                  </label>
                  <FaCalendarAlt className="absolute left-3 top-10 text-gray-400" />
                  <input
                    type="date"
                    value={payment_date}
                    onChange={(e) => setpayment_date(e.target.value)}
                    className="w-full border rounded-md p-2 pl-10 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={payment_mode}
                    onChange={(e) => setpayment_mode(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option>Cash</option>
                    <option>Bank</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div>
  <label className="block text-sm font-medium mb-1">
    Payment In Number
  </label>
  <input
    type="text"
    value={payment_in_number}
    onChange={(e) => setpayment_in_number(e.target.value)}
    className="w-full border rounded-md p-2 bg-white text-sm"
    placeholder="Enter Payment In Number"
  />
</div>

              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Invoice Settlement */}
          {selectedParty && invoices.length > 0 ? (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold">Settle invoices with this payment</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2"></th>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Due Date</th>
                      <th className="px-3 py-2 text-left">Invoice Number</th>
                      <th className="px-3 py-2 text-left">Invoice Amount</th>
                      <th className="px-3 py-2 text-left">Amount Settled</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
             {invoices.map((inv, idx) => {
  const selected = selectedInvoices.find((i) => i.id === inv.id);
  const sel = !!selected;
  const settledAmount = selected ? selected.amountSettled : 0;

  return (
    <tr
      key={idx}
      className="border-t hover:bg-gray-50 cursor-pointer"
      onClick={() => toggleInvoice(inv)}
    >
      <td className="px-3 py-2 text-center">
        <input type="checkbox" checked={sel} readOnly />
      </td>
      <td className="px-3 py-2">{inv.Date}</td>
      <td className="px-3 py-2">{inv.dueDate}</td>
      <td className="px-3 py-2">{inv.sales_invoice?.invoice_number}</td>
      <td className="px-3 py-2">
        ₹ {inv.grandTotal} (
        <span className="text-red-500">₹ {inv.Invoice_Amount} pending</span>)
      </td>
      <td className="px-3 py-2">₹ {settledAmount}</td>
      <td className="px-3 py-2">{inv.Payment_Status}</td>
    </tr>
  );
})}


                    <tr className="font-semibold">
                      <td colSpan="5" className="px-3 py-2 text-right">
                        Total
                      </td>
                      <td className="px-3 py-2">₹ {totalSettled}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
              <img
                src="/icons/no-transactions.svg"
                alt="No transactions"
                className="mx-auto mb-4 h-24"
              />
              <p className="mb-4">
                No Transactions yet!
                <br />
                Select Party Name to view transactions
              </p>
              <button
                className="bg-[#7B68EE] text-white px-6 py-2 rounded-md hover:brightness-90"
                onClick={() =>
                  partyRef.current.querySelector("button").focus()
                }
              >
                Select Party
              </button>
            </div>
          )}
        </>
      )}

      {viewMode === "detail" && selectedPayment && (
        <>
          {/* Detail View */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode("list")}
                className="p-2 rounded hover:bg-gray-100"
              >
                <FaArrowLeft />
              </button>
              <h2 className="text-2xl font-semibold">
                Payment In #{selectedPayment.payment_in_number}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadPDF}
                className="bg-[#7B68EE] text-white px-4 py-2 rounded-md hover:brightness-90"
              >
                <FaDownload className="inline mr-2" />
                Download PDF
              </button>
              <button
                onClick={printDetail}
                className="bg-[#7B68EE] text-white px-4 py-2 rounded-md hover:brightness-90"
              >
                <FaPrint className="inline mr-2" />
                Print PDF
              </button>
              <button className="p-2 rounded hover:bg-gray-100">
                <FaInfoCircle />
              </button>
              <button className="p-2 rounded hover:bg-gray-100">
                <FaShareAlt />
              </button>
              <button
                onClick={() => setViewMode("create")}
                className="p-2 rounded hover:bg-gray-100"
              >
                <FaEdit />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded hover:bg-gray-100 text-red-500"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          <div ref={detailRef} className="space-y-6">
            {/* Payment Details */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium block">Party Name</span>
                  <span>{selectedPayment.party_name}</span>
                </div>
                <div>
                  <span className="font-medium block">Payment Date</span>
                  <span>{selectedPayment.payment_date}</span>
                </div>
                <div>
                  <span className="font-medium block">Payment Amount</span>
                  <span>₹ {selectedPayment.payment_amount}</span>
                </div>
                <div>
                  <span className="font-medium block">Payment Type</span>
                  <span>{selectedPayment.payment_mode}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium block">Notes</span>
                  <span>{selectedPayment.notes || "-"}</span>
                </div>
              </div>
            </div>

            {/* Settled Invoices */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">
                Invoices settled with this payment
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Invoice Number</th>
                      <th className="px-4 py-2 text-left">Invoice Amount</th>
                      <th className="px-4 py-2 text-left">
                        Invoice Amount Settled
                      </th>
                      <th className="px-4 py-2 text-left">TDS Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPayment?.settledInvoices?.map((inv, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{inv.Date}</td>
                        <td className="px-4 py-2">{inv.Invoice_Number}</td>
                        <td className="px-4 py-2">₹ {inv.grandTotal}</td>
                        <td className="px-4 py-2">₹ {inv.amountSettled}</td>
                        <td className="px-4 py-2">₹ 0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
