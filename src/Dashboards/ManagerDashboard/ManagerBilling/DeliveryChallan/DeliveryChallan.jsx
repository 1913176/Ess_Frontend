import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import axios from "axios";

const baseurl = process.env.REACT_APP_BASEAPI;

const dateRanges = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "Last 7 Days",
  "This Month",
  "Previous Month",
  "Last 30 Days",
  "Last Quarter",
  "Previous Quarter",
  "Current Fiscal Year",
  "Previous Fiscal Year",
  "Last 365 Days",
  "Custom Date Range",
];

const statusOptions = ["Show Open Challans", "Show All Challans"];

export default function DeliveryChallan() {
  const navigate = useNavigate();

  const [challans, setChallans] = useState([]);
  const [selectedRange, setSelectedRange] = useState("Last 365 Days");
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef(null);

  const [selectedStatus, setSelectedStatus] = useState("Show Open Challans");
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef(null);

  // ✅ Load challans from backend API on mount
  useEffect(() => {
    const fetchChallans = async () => {
      try {
        const res = await axios.get(`${baseurl}/deliverych/delivery-challans/`);
        if (res.status === 200) {
          setChallans(res.data);
        } else {
          console.error("❌ Failed to fetch challans");
        }
      } catch (err) {
        console.error("❌ Error fetching challans:", err);
      }
    };

    fetchChallans();
  }, []);

  // ✅ Dropdown click outside logic
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) {
        setRangeOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Apply status filter
  const filteredChallans = challans.filter((c) => {
    if (selectedStatus === "Show Open Challans" && c.status !== "Open") {
      return false;
    }
    return true;
  });

  const handleCreateChallan = () => {
    navigate("/manager/billing/createdeliverychallan");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Delivery Challan</h1>
        <button
          onClick={handleCreateChallan}
          className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:brightness-90"
        >
          Create Delivery Challan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range Filter */}
        <div className="relative" ref={rangeRef}>
          <button
            onClick={() => setRangeOpen(!rangeOpen)}
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            <FaCalendarAlt />
            {selectedRange}
            <FaChevronDown />
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

        {/* Status Filter */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            {selectedStatus}
            <FaChevronDown />
          </button>
          {statusOpen && (
            <ul className="absolute mt-1 w-48 bg-white border rounded-md shadow-lg max-h-60 overflow-auto z-10">
              {statusOptions.map((s) => (
                <li
                  key={s}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSelectedStatus(s);
                    setStatusOpen(false);
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded-md shadow-sm">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-700 uppercase text-xs tracking-wider">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Delivery Challan Number</th>
              <th className="px-4 py-3">Party Name</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredChallans.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500 italic">
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src="/icons/no-transactions.svg"
                      alt="No transactions"
                      className="h-16 mb-2"
                    />
                    No Transactions Matching the current filter
                  </div>
                </td>
              </tr>
            ) : (
              filteredChallans.map((challan, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    // Optional: navigate to challan details
                  }}
                >
                  <td className="px-4 py-3">{challan.delivery_challan_date}</td>
                  <td className="px-4 py-3">{challan.delivery_challan_number}</td>
                  <td className="px-4 py-3">{challan.party_name}</td>
                  <td className="px-4 py-3">₹ {challan.total_amount?.total?.toLocaleString()}</td>
                  <td className="px-4 py-3">{challan.payment_status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
