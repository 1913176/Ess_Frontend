import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  FaPlus,
  FaChevronDown,
  FaFileInvoice,
  FaMoneyBillWave,
  FaFileAlt,
  FaFileInvoiceDollar,
  FaUndo
} from "react-icons/fa";
import axios from "axios";


const baseurl=process.env.REACT_APP_BASEAPI;

const PartyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  
  const [parties, setParties] = useState([]);
  const [party, setParty] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("transactions");

  const [Address, SetAddress] = useState({
    shipping_address: null,
    billing_address: null,
  });




  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("Last 365 Days");
  const dateRangeOptions = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "Last 7 days",
    "This Month",
    "Previous Month",
    "Last 30 Days",
    "Last Quarter",
    "Previous Quarter",
    "Current Fiscal Year",
    "Previous Fiscal Year",
    "Last 365 Days",
    "Custom Date Range"
  ];

  const [txTypeOpen, setTxTypeOpen] = useState(false);
  // Default filter is "All Transactions" to show all types
  const [selectedTxType, setSelectedTxType] = useState("All Transactions");
  const transactionTypeOptions = [
    "All Transactions",
    "Sales Invoices",
    "Proforma Invoice",
    "Quotation",
    "Credit Note",
    "Payment In",
    "Sales Return",
    "Purchase Return",
    "Payment Out"
  ];


  const [mergedTransactions, setMergedTransactions] = useState([]);

  
  const [ledgerData, setLedgerData] = useState([]);
  const [itemWiseData, setItemWiseData] = useState([]);

  
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const invoiceRef = useRef(null);
  const invoiceOptions = [
    { label: "Sales Invoice", icon: <FaFileInvoice className="w-4 h-4" />, route: "/manager/billing/CreateSalesInvoice" },
    { label: "Payment In", icon: <FaMoneyBillWave className="w-4 h-4" />, route: "/manager/billing/PaymentIn" },
    { label: "Quotation", icon: <FaFileAlt className="w-4 h-4" />, route: "/manager/billing/QuotationEstimate" },
    { label: "Proforma Invoice", icon: <FaFileInvoiceDollar className="w-4 h-4" />, route: "/manager/billing/ProformaInvoice" },
    { label: "Sales Return", icon: <FaUndo className="w-4 h-4" />, route: "/manager/billing/createsalesreturn" }
  ];


  const transactionsRef = useRef(null);

 
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (invoiceRef.current && !invoiceRef.current.contains(e.target)) {
        setInvoiceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleInvoiceDropdown = () => {
    setInvoiceOpen((prev) => !prev);
  };

  const handleInvoiceOptionClick = (option) => {
    if (option.label === "Sales Invoice") {
      navigate(option.route, { state: { party } });
    } else {
      navigate(option.route);
    }
    setInvoiceOpen(false);
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("parties")) || [];
    setParties(stored);
    let found = stored.find((p) => String(p.id) === id);
    if (!found) {
      const idx = parseInt(id, 10);
      if (!isNaN(idx) && stored[idx]) {
        found = stored[idx];
      }
    }
    setParty(found);
  }, [id]);

  
  useEffect(() => {
    if (party) {
      setLedgerData(party.ledger || []);
      setItemWiseData(party.itemWise || []);
    }
  }, [party]);


useEffect(() => {
  if (party) {
    const getaddress = async () => {
      try {
        const response = await axios.get(`${baseurl}/pincode/addresses/${party.id}`);
        if (response.status === 200 && !response.data.message) {
          SetAddress(response.data);
        } else {
          console.log(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    };

    getaddress();
  }
}, [party]);

  // ---------------- Merge Transactions from Multiple Sources ---
  const getTransactions = (storageKey, transformFn) => {
    const data = JSON.parse(localStorage.getItem(storageKey)) || [];
    return data
      .filter((rec) => rec.party && String(rec.party.id) === String(party?.id))
      .map(transformFn);
  };



  useEffect(() => {
    if (!party || !party.id) {
      setMergedTransactions([]);
      return;
    }
  
    const fetchTransactions = async () => {
      const transactions = [];
  
      const promises = [
        axios.get(`${baseurl}/saleinv/sales-invoices/party/${party.id}/`).then((res) => {
          res.data.forEach((inv) =>
            transactions.push({
              date: inv.invoice_date,
              type: "Sales Invoices",
              number: inv.invoice_number,
              amount: inv.total_amount?.total ?? 0,
              status: inv.balanceAmount === 0 ? "Paid" : "Unpaid",
            })
          );
        }),
  
        axios.get(`${baseurl}/proformainv/proforma-invoices/party/${party.id}/`).then((res) => {
          res.data.forEach((pf) =>
            transactions.push({
              date: pf.proforma_invoice_date,
              type: "Proforma Invoice",
              number: pf.proforma_invoice_number,
              amount: pf.total_amount?.total ?? 0,
              status: pf.payment_status ? "Paid" : "Open",
            })
          );
        }),
  
        axios.get(`${baseurl}/quotation/quotation-estimates/party/${party.id}/`).then((res) => {
          res.data.forEach((qt) =>
            transactions.push({
              date: qt.quotation_date,
              type: "Quotation",
              number: qt.quotation_number,
              amount: qt.total_amount?.total ?? 0,
              status: qt.is_fully_paid ? "Closed" : "Open",
            })
          );
        }),
  
        axios.get(`${baseurl}/credit/creditnotes/party/${party.id}/`).then((res) => {
          res.data.forEach((cn) =>
            transactions.push({
              date: cn.credit_note_date,
              type: "Credit Note",
              number: cn.credit_note_number,
              amount: cn.total_amount?.total ?? 0,
              status: cn.isFullyPaid ? "Paid" : "Unpaid",
            })
          );
        }),
  
        axios.get(`${baseurl}/payment/payments-in/party/${party.id}/`).then((res) => {
          res.data.forEach((pm) =>
            transactions.push({
              date: pm.payment_date,
              type: "Payment In",
              number: pm.payment_in_number,
              amount: pm.payment_amount,
              status: "Completed",
            })
          );
        }),
      ];
  
      // Add localStorage data (these don't throw network errors)
      try {
        const salesReturnTx = getTransactions("salesReturns", (sr) => ({
          date: sr.returnDate,
          type: "Sales Return",
          number: sr.returnNumber,
          amount: sr.returnAmount,
          status: "Completed",
        }));
        const purchaseReturnTx = getTransactions("purchaseReturns", (pr) => ({
          date: pr.returnDate,
          type: "Purchase Return",
          number: pr.returnNumber,
          amount: pr.returnAmount,
          status: "Completed",
        }));
        const paymentOutTx = getTransactions("paymentsOut", (po) => ({
          date: po.paymentDate,
          type: "Payment Out",
          number: po.paymentNumber,
          amount: po.amountPaid,
          status: "Completed",
        }));
  
        transactions.push(...salesReturnTx, ...purchaseReturnTx, ...paymentOutTx);
      } catch (err) {
        console.error("❌ Error reading from localStorage:", err);
      }
  
      // Wait for all promises (even if some fail)
      const results = await Promise.allSettled(promises);
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          console.error(`❌ Error in transaction fetch [${i}]:`, result.reason);
        }
      });
  
      transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      setMergedTransactions(transactions);
    };
  
    fetchTransactions();
  }, [party]);

  
  const filteredParties = parties.filter((p) =>
    p.party_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSelectParty = (partyIdOrIndex) => {
    navigate(`/manager/billing/partydetails/${partyIdOrIndex}`);
  };

 
  const handleEditParty = () => {
    if (!party) return;
    navigate(`/manager/billing/createparty?editId=${party.id}`);
  };

  const handleDeleteParty = async () => {
    if (!party) return;
  
    const confirmed = window.confirm(`Are you sure you want to delete "${party.party_name}"?`);
    if (!confirmed) return;
  
    try {
      // Call backend API to delete the party
      const res = await axios.delete(
        `${process.env.REACT_APP_BASEAPI}/pincode/party/delete/${party.id}/`
      );
  
      if (res.status === 204 || res.status === 200) {
        // Update localStorage after successful API deletion
        const updated = parties.filter((p) => p.id !== party.id);
        localStorage.setItem("parties", JSON.stringify(updated));
        navigate("/manager/billing");
      } else {
        throw new Error("Failed to delete party from server.");
      }
    } catch (error) {
      console.error("❌ Error deleting party:", error.message);
      alert("Something went wrong while deleting the party.");
    }
  };
  

  if (!party) {
    return (
      <div className="p-4 text-sm">
        <h2 className="text-lg font-bold">Party not found</h2>
        <button onClick={() => navigate(-1)} className="mt-2 px-3 py-2 bg-gray-300 rounded text-sm">
          Back
        </button>
      </div>
    );
  }

 
  const handleDownloadPDF = async () => {
    if (!transactionsRef.current) return;
    const canvas = await html2canvas(transactionsRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasHeight / canvasWidth;
    const newHeight = pdfWidth * ratio;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, newHeight);
    pdf.save(`party_${party.name}_transactions.pdf`);
  };

  const renderTransactionsTab = () => {
    let displayedTx = mergedTransactions;
    if (selectedTxType !== "All Transactions") {
      displayedTx = displayedTx.filter((tx) => tx.type === selectedTxType);
    }


    return (
      <div ref={transactionsRef} className="m-4 bg-white p-3 rounded shadow text-sm">
        <div className="flex flex-wrap items-center gap-3 mb-3">
       
          <div className="relative">
            <button
              onClick={() => {
                setDateRangeOpen(!dateRangeOpen);
                setTxTypeOpen(false);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              {selectedDateRange}
            </button>
            {dateRangeOpen && (
              <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                {dateRangeOptions.map((opt) => (
                  <div
                    key={opt}
                    className="p-1 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedDateRange(opt);
                      setDateRangeOpen(false);
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
  
          <div className="relative">
            <button
              onClick={() => {
                setTxTypeOpen(!txTypeOpen);
                setDateRangeOpen(false);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              {selectedTxType}
            </button>
            {txTypeOpen && (
              <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                {transactionTypeOptions.map((opt) => (
                  <div
                    key={opt}
                    className="p-1 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedTxType(opt);
                      setTxTypeOpen(false);
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
          >
            Download PDF
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">
            Print
          </button>
        </div>

        {displayedTx.length === 0 ? (
          <div className="flex flex-col items-center mt-6 text-gray-500 text-sm">
            <img src="/icons/no-transactions.svg" alt="No transactions" className="w-16 mb-2" />
            <p>No transactions found</p>
          </div>
        ) : (
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="p-1 text-left border-b border-gray-300">Date</th>
                <th className="p-1 text-left border-b border-gray-300">Transaction Type</th>
                <th className="p-1 text-left border-b border-gray-300">Transaction Number</th>
                <th className="p-1 text-left border-b border-gray-300">Amount</th>
                <th className="p-1 text-left border-b border-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedTx.map((tx, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    if (e.target.type !== "checkbox") {
                      navigate(`/manager/billing/transactionpreview?type=${tx.type}&number=${tx.number}`);
                    }
                  }}
                >
                  <td className="p-1">{tx.date}</td>
                  <td className="p-1">{tx.type}</td>
                  <td className="p-1">{tx.number}</td>
                  <td className="p-1">{tx.amount}</td>
                  <td className="p-1">{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };


  const renderProfileTab = () => {
    return (
      <div className="m-4 bg-white p-3 rounded shadow text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded shadow space-y-3">
            <h4 className="text-sm font-semibold">General Details</h4>
            <div className="flex justify-between">
              <span className="font-medium">Party Name</span>
              <span>{party.party_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Party Type</span>
              <span>{party.party_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Mobile Number</span>
              <span>{party.mobile_number || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Party Category</span>
              <span>{party.party_category || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email</span>
              <span>{party.email || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Opening Balance</span>
              <span>
                ₹{Math.abs(party.opening_balance_amount)} {party.opening_balance === 'to_collect' ? "To Collect" : "To Pay"}
              </span>
            </div>
            <hr />
            <h4 className="text-sm font-semibold">Credit Details</h4>
            <div className="flex justify-between">
              <span className="font-medium">Credit Period</span>
              <span>{party.credit_period_days || 0} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Credit Limit</span>
              <span>₹ {party.credit_limit_rupees || 0}</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow space-y-3">
            <h4 className="text-sm font-semibold">Business Details</h4>
            <div className="flex justify-between">
              <span className="font-medium">GSTIN</span>
              <span>{party.gstin || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">PAN Number</span>
              <span>{party.pan_number || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Billing Address</span>
              <span>{party.billing   || Address.billing_address===null ? "-" :  Address.billing_address?.street +','+Address.billing_address?.city+','+Address.billing_address?.state+','+Address.billing_address?.pincode || "-"}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-medium">Shipping Address</span>
              <div className="text-right">
                <span className="block">{party.shipping ||  Address.shipping_address===null ? "-": Address.shipping_address?.street +','+Address.shipping_address?.city+','+Address.shipping_address?.state+','+Address.shipping_address?.pincode || "-"}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/manager/billing/createparty?editId=${party.id}&manageShipping=1`);
                  }}
                  className="text-blue-500 text-sm mt-1"
                >
                  Manage Shipping Address
                </button>
              </div>
            </div>
          </div>
        </div>
        {party.customFields && party.customFields.length > 0 && (
          <div className="bg-white p-3 rounded shadow mt-3">
            <h4 className="text-sm font-semibold mb-1">Custom Fields</h4>
            {party.customFields.map((field) => (
              <div key={field.id} className="flex justify-between">
                <span className="font-medium">{field.label}</span>
                <span>{field.value || "(No value)"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLedgerTab = () => {
    return (
      <div className="m-4 bg-white p-3 rounded shadow text-sm">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <select defaultValue="Last 365 Days" className="p-2 border border-gray-300 rounded text-sm">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 365 Days</option>
            <option>Custom Range</option>
          </select>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">
            Download
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">
            Print
          </button>
        </div>
        {ledgerData.length === 0 ? (
          <div className="text-center text-gray-500 mt-6 text-sm">
            <p>No ledger data</p>
          </div>
        ) : (
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="p-1 border-b border-gray-300">Date</th>
                <th className="p-1 border-b border-gray-300">Voucher</th>
                <th className="p-1 border-b border-gray-300">SR No</th>
                <th className="p-1 border-b border-gray-300">Debit</th>
                <th className="p-1 border-b border-gray-300">Credit</th>
                <th className="p-1 border-b border-gray-300">TDS by Party</th>
                <th className="p-1 border-b border-gray-300">TDS by Self</th>
                <th className="p-1 border-b border-gray-300">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((ld, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="p-1">{ld.date}</td>
                  <td className="p-1">{ld.voucher}</td>
                  <td className="p-1">{ld.srNo}</td>
                  <td className="p-1">{ld.debit}</td>
                  <td className="p-1">{ld.credit}</td>
                  <td className="p-1">{ld.tdsParty}</td>
                  <td className="p-1">{ld.tdsSelf}</td>
                  <td className="p-1">{ld.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

 
  const renderItemwiseTab = () => {
    return (
      <div className="m-4 bg-white p-3 rounded shadow text-sm">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <select defaultValue="Last 365 Days" className="p-2 border border-gray-300 rounded text-sm">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 365 Days</option>
            <option>Custom Range</option>
          </select>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">
            Download
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">
            Print
          </button>
        </div>
        {itemWiseData.length === 0 ? (
          <div className="text-center text-gray-500 mt-6 text-sm">
            <p>No item wise data</p>
          </div>
        ) : (
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="p-1 border-b border-gray-300">Item Name</th>
                <th className="p-1 border-b border-gray-300">Item Code</th>
                <th className="p-1 border-b border-gray-300">Sales Quantity</th>
                <th className="p-1 border-b border-gray-300">Sales Amount</th>
                <th className="p-1 border-b border-gray-300">Purchase Quantity</th>
                <th className="p-1 border-b border-gray-300">Purchase Amount</th>
              </tr>
            </thead>
            <tbody>
              {itemWiseData.map((item, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="p-1">{item.name || "-"}</td>
                  <td className="p-1">{item.code || "-"}</td>
                  <td className="p-1">{item.salesQty ? item.salesQty + " PCS" : "-"}</td>
                  <td className="p-1">{item.salesAmt ? "₹ " + item.salesAmt : "-"}</td>
                  <td className="p-1">{item.purchaseQty ? item.purchaseQty + " PCS" : "-"}</td>
                  <td className="p-1">{item.purchaseAmt ? "₹ " + item.purchaseAmt : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

 
  return (
    <div className="flex h-screen font-sans text-sm">
      
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <input
          type="text"
          placeholder="Search Party"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="m-4 p-2 border border-gray-300 rounded text-sm"
        />
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredParties.map((p, i) => {
            const isActive = p === party;
            return (
              <div
                key={p.id ?? i}
                onClick={() => handleSelectParty(p.id ?? i)}
                className={`p-3 m-2 rounded border cursor-pointer hover:bg-blue-100 transition ${
                  isActive ? "bg-purple-200 border-purple-200" : "bg-white border-gray-200"
                }`}
              >
                <span className="font-semibold block text-sm">{p.party_name}</span>
                <span className="text-sm text-gray-600">
                  {p.opening_balance === 'to_collect'
                    ? `₹${p.opening_balance_amount} To Collect`
                    : `₹${Math.abs(p.opening_balance_amount)} To Pay`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    
      <div className="flex-1 flex flex-col">

        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <div className="text-lg font-semibold">{party.name}</div>
          <div className="flex space-x-2">
            <div className="relative" ref={invoiceRef}>
              <button
                onClick={toggleInvoiceDropdown}
                className="px-3 py-1 border border-gray-300 rounded flex items-center space-x-1 text-sm"
              >
                <FaPlus className="w-3 h-3" />
                <span>Create New Invoice</span>
                <FaChevronDown className="w-3 h-3" />
              </button>
              {invoiceOpen && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-300 rounded shadow-lg z-10">
                  {invoiceOptions.map((option) => (
                    <div
                      key={option.label}
                      onClick={() => handleInvoiceOptionClick(option)}
                      className="p-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleEditParty}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteParty}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm text-red-500"
            >
              Delete
            </button>
          </div>
        </div>

        
        <div className="flex space-x-3 p-3 border-b border-gray-200">
          <span
            onClick={() => setActiveTab("transactions")}
            className={`cursor-pointer font-semibold pb-1 ${
              activeTab === "transactions"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Transactions
          </span>
          <span
            onClick={() => setActiveTab("profile")}
            className={`cursor-pointer font-semibold pb-1 ${
              activeTab === "profile"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Profile
          </span>
          <span
            onClick={() => setActiveTab("ledger")}
            className={`cursor-pointer font-semibold pb-1 ${
              activeTab === "ledger"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Ledger (Statement)
          </span>
          <span
            onClick={() => setActiveTab("itemwise")}
            className={`cursor-pointer font-semibold pb-1 ${
              activeTab === "itemwise"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Item Wise Report
          </span>
        </div>

        {/* Tab Content */}
        {activeTab === "transactions"
          ? renderTransactionsTab()
          : activeTab === "profile"
          ? renderProfileTab()
          : activeTab === "ledger"
          ? renderLedgerTab()
          : activeTab === "itemwise"
          ? renderItemwiseTab()
          : null}
      </div>
    </div>
  );
};

export default PartyDetails;
