import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

// Example icons from React Icons (optional)
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaFileInvoice,
  FaChartBar,
  FaCalculator,
  FaCog,
} from "react-icons/fa";

const menuItems = [
  {
    title: "GENERAL",
    icon: <FaHome />,
    children: [
      { label: "Dashboard",path: "/manager/billing" },
      { label: "Parties", path: "/manager/billing" },
    ],
  },
  // {
  //   title: "ITEMS",
  //   icon: <FaBox />,
  //   children: [
  //     { label: "Inventory", className: "text-xl font-semibold mb-4",path: "/manager/billing/itemspage" },
  //    // { label: "Godown (Warehouse)" },
  //   ],
  // },
  {
    
    title: "SALES",
    icon: <FaShoppingCart />,
    children: [
      { label: "Sales Invoices", path: "/manager/billing/salesinvoice" },
      { label: "Quotation / Estimate", path: "/manager/billing/quotationestimate" },
      { label: "Payment In", path: "/manager/billing/paymentin" },
      //{ label: "Sales Return", path: "/salesreturn" },
      { label: "Credit Note", path: "/manager/billing/creditinvoice" },
      { label: "Delivery Challan", path: "/manager/billing/deliverychallen" },
      { label: "Proforma Invoice", path: "/manager/billing/invoice" },
    ],
  },
  // {
  //   title: "Purchases",
  //   icon: <FaFileInvoice />,
  //   children: [],
  // },
  // {
  //   title: "Reports",
  //   icon: <FaChartBar />,
  //   children: [],
  // },
  // {
  //   title: "Accounting Solutions",
  //   icon: <FaCalculator />,
  //   children: [
  //     { label: "Cash & Bank" },
  //     { label: "E-Invoicing" },
  //     { label: "Automated Bills" },
  //   ],
  // },
  // {
  //   title: "Settings",
  //   icon: <FaCog />,
  //   children: [],
  // },
];

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeParent, setActiveParent] = useState("");
  const [activeSubItem, setActiveSubItem] = useState("");

  const navigate = useNavigate();

  // Toggle parent dropdown
  const handleParentClick = (item) => {
    setOpenDropdown(openDropdown === item.title ? null : item.title);
   // setActiveParent(item.title);
   // setActiveSubItem("");
  };

  // Handle sub-item click and navigate if path is defined
  const handleSubClick = (parentTitle, sub) => {
    setActiveParent(parentTitle);
    setActiveSubItem(sub.label);
    if (sub.path) {
      navigate(sub.path);
    }
    setOpenDropdown(null); // Close dropdown after selection
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      {/* Header */}
      <div className="text-xl font-semibold mb-4">
        BILLING
      </div>
     {/* Menu */}
     <div className="flex flex-wrap items-center px-4">
     {menuItems.map((item, idx) => (
       <div key={idx} className="relative">
         {/* Parent item */}
         <div
           className={`flex items-center py-2.5 px-2.5 cursor-pointer text-slate-800 hover:border-b-2 hover:border-blue-600 font-medium text-base leading-10 tracking-wide ${
             activeParent === item.title && !activeSubItem
               ? "border-b-2 border-blue-600 text-blue-600"
               : ""
           }`}
           onClick={() => handleParentClick(item)}
         >
           <span className="text-xl mr-2">{item.icon}</span>
           <span>{item.title}</span>
           {item.children && item.children.length > 0 && (
             <svg
               className={`ml-2 transition-transform ${
                 openDropdown === item.title ? "rotate-180" : ""
               }`}
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
               width="16"
               height="16"
             >
               <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeWidth={2}
                 d="M19 9l-7 7-7-7"
               />
             </svg>
           )}
         </div>


            {/* Sub-items (dropdown) */}
            {openDropdown === item.title && item.children.length > 0 && (
              <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded-md min-w-[200px]">
                {item.children.map((sub, sIdx) => (
                  <div
                    key={sIdx}
                    className={`px-4 py-2 text-sm text-slate-800 hover:bg-blue-50 cursor-pointer ${
                      activeParent === item.title && activeSubItem === sub.label
                        ? "bg-blue-100 text-blue-600"
                        : ""
                    }`}
                    onClick={() => handleSubClick(item.title, sub)}
                  >
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 text-xs text-slate-600 flex justify-between">
        <p>100% Secure</p>
        <p>ISO Certified</p>
      </div>
    </div>
  );
}