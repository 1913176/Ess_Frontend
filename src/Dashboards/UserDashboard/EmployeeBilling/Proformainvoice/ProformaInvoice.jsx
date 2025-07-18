import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import axios from "axios";

// Indian states array (same as in CreateSalesInvoice)
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Lakshadweep",
  "Puducherry",
];

// Extended tax dropdown options (same as in CreateSalesInvoice)
const taxOptions = [
  { label: "None", value: 0 },
  { label: "Exempted", value: 0 },
  { label: "GST @ 0%", value: 0 },
  { label: "GST @ 0.1%", value: 0.1 },
  { label: "GST @ 0.25%", value: 0.25 },
  { label: "GST @ 1.5%", value: 1.5 },
  { label: "GST @ 3%", value: 3 },
  { label: "GST @ 5%", value: 5 },
  { label: "GST @ 12%", value: 12 },
  { label: "GST @ 13.8%", value: 13.8 },
  { label: "GST @ 14% + cess @ 12%", value: 26 },
  { label: "GST @ 28%", value: 28 },
  { label: "GST @ 28% + Cess @ 12%", value: 40 },
  { label: "GST @ 28% + Cess @ 60%", value: 88 },
];

const CreateProformaInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  // If you want to pass a "partyId" or "proformaId" or "view" param:
  const partyId = searchParams.get("partyId");
  const proformaId = searchParams.get("proformaId");
  const viewParam = searchParams.get("view");

  // ------------------------------------------------------------------
  // 1) Party & Shipping Setup
  // ------------------------------------------------------------------
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);

  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showChangeShippingModal, setShowChangeShippingModal] = useState(false);
  const [showEditShippingModal, setShowEditShippingModal] = useState(false);

  // Additional UI modals
  const [showNotes, setShowNotes] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);

  // Bank account fields
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [asOfDate, setAsOfDate] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [reEnterBankAccountNumber, setReEnterBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [upiId, setUpiId] = useState("");

  const [showAdditionalCharge, setShowAdditionalCharge] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);

  // ------------------------------------------------------------------
  // 2) Proforma Preview states
  // ------------------------------------------------------------------
  const [savedProforma, setSavedProforma] = useState(null);
  const [showProformaPreview, setShowProformaPreview] = useState(false);

  // If proformaId + view=1 => load from localStorage => show preview
  useEffect(() => {
    if (proformaId && viewParam === "1") {
      const allProformas = JSON.parse(localStorage.getItem("proformaInvoices")) || [];
      const existing = allProformas.find((p) => String(p.id) === proformaId);
      if (existing) {
        setSavedProforma(existing);
        setShowProformaPreview(true);
      }
    }
  }, [proformaId, viewParam]);

  // ------------------------------------------------------------------
  // 3) Load Party from localStorage
  // ------------------------------------------------------------------
  useEffect(() => {
   
    const storedParties = async () =>{const res=await axios.get(`${process.env.REACT_APP_BASEAPI}/pincode/party-list/`); setParties(res.data);} 
    storedParties()
    console.log(parties)
     
    let foundParty = null;
    if (partyId) {
      foundParty = parties.find((p) => String(p.id) === partyId);
      if (!foundParty) {
        const idx = parseInt(partyId, 10);
        if (!isNaN(idx) && storedParties[idx]) {
          foundParty = storedParties[idx];
        }
      }
    }
    if (!foundParty && location.state?.party) {
      foundParty = location.state.party;
    }
    if (foundParty) {
      setSelectedParty(foundParty);
      setShippingAddresses(foundParty.shippingAddresses || []);
    }
  }, [partyId, location.state]);

  const filteredParties = parties?.filter((p) =>
    p.party_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectParty = async (p) => {
    try {
      // Fetch shipping addresses from the API
      const res = await axios.get(`${process.env.REACT_APP_BASEAPI}/pincode/addresses/${p.id}/`);
      const shippingData = res.data || {};
  
      // Extract shipping address from API response
      const shippingAddresses = shippingData.shipping_address
        ? [{ ...shippingData.shipping_address, name: "Shipping Address" }]
        : [];
  
      // Update React state with the correct address format
      const updatedParty = {
        ...p,
        shippingAddresses,
        shipping: shippingAddresses.length ? formatAddressString(shippingAddresses[0]) : "",
      };
  
      // Update state
      setSelectedParty(updatedParty);
      setShippingAddresses(shippingAddresses);
      setShowPartyDropdown(false);
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
    }
  };  
  const updatePartyInLocalStorage = (updatedParty) => {
    const all = JSON.parse(localStorage.getItem("parties")) || [];
    const newList = all.map((partyObj) =>
      partyObj.id === updatedParty.id ? updatedParty : partyObj
    );
    localStorage.setItem("parties", JSON.stringify(newList));
    setParties(newList);
    setSelectedParty(updatedParty);
    setShippingAddresses(updatedParty.shippingAddresses || []);
  };

  // Shipping address handling
  const handleChangeShippingAddress = () => {
    if (!selectedParty || selectedParty.id == null) {
      alert("No party selected. Please select a party first.");
      return;
    }
    setShowChangeShippingModal(true);
  };

  const handleAddNewShippingAddress = () => {
    setEditingAddress({ name: "", street: "", state: "", pincode: "", city: "" });
    setShowEditShippingModal(true);
  };

  const handleEditShippingAddress = (address) => {
    setEditingAddress({ ...address });
    setShowEditShippingModal(true);
  };

  const handleSelectShippingAddress = (address) => {
    const updatedParty = {
      ...selectedParty,
      shipping: formatAddressString(address),
    };
    updatePartyInLocalStorage(updatedParty);
  };

  const handleDoneShipping = () => {
    setShowChangeShippingModal(false);
  };

  const formatAddressString = (addr) => {
    return `${addr.name}\n${addr.street}\n${addr.city}, ${addr.state} - ${addr.pincode}`;
  };

  const handlePincodeChange = async (e) => {
    const pin = e.target.value;
    setEditingAddress({ ...editingAddress, pincode: pin });
    if (pin.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0].Status === "Success") {
          const cityName = data[0].PostOffice[0].District || "";
          setEditingAddress({
            ...editingAddress,
            pincode: pin,
            city: cityName,
          });
        }
      } catch (err) {
        console.log("Error fetching city:", err);
      }
    }
  };

  const handleSaveShippingAddress = () => {
    if (!editingAddress.name || !editingAddress.street) {
      alert("Shipping Name and Street Address are required.");
      return;
    }
    let updatedAddresses = [...shippingAddresses];
    if (!editingAddress.id) {
      editingAddress.id = Date.now();
      updatedAddresses.push(editingAddress);
    } else {
      updatedAddresses = updatedAddresses.map((addr) =>
        addr.id === editingAddress.id ? editingAddress : addr
      );
    }
    const updatedParty = {
      ...selectedParty,
      shippingAddresses: updatedAddresses,
      shipping: formatAddressString(editingAddress),
    };
    updatePartyInLocalStorage(updatedParty);
    setShowEditShippingModal(false);
  };

  const renderShippingAddress = () => {
    if (!selectedParty?.shipping) return "[No shipping address set]";
    return selectedParty.shipping.split("\n").map((line, idx) => (
      <span key={idx} className="block">
        {line}
      </span>
    ));
  };

  // ------------------------------------------------------------------
  // 4) Buttons
  // ------------------------------------------------------------------
  const handleScanBarcode = () => alert("Scan Barcode clicked!");
  const handleSettings = () => alert("Settings clicked!");
  const handleSaveAndNew = () => alert("Save & New clicked!");

  // ------------------------------------------------------------------
  // 5) Proforma Items & Calculations
  // ------------------------------------------------------------------
  const [proformaItems, setProformaItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);

  const [additionalChargeValue, setAdditionalChargeValue] = useState(0);
  const [additionalChargeTaxRate, setAdditionalChargeTaxRate] = useState(0);
  const [discountAfterTax, setDiscountAfterTax] = useState(0);
  const [discountAfterTaxIsPercent, setDiscountAfterTaxIsPercent] = useState(true);

  const [autoRoundOff, setAutoRoundOff] = useState(false);
  const [roundOffValue, setRoundOffValue] = useState(0);

  const [grandTotal, setGrandTotal] = useState(0);

  // Mark as fully paid logic
  const [markAsFullyPaid, setMarkAsFullyPaid] = useState(false);

  useEffect(() => {
    calculateTotals();
  }, [
    proformaItems,
    additionalChargeValue,
    additionalChargeTaxRate,
    discountAfterTax,
    discountAfterTaxIsPercent,
    autoRoundOff,
    roundOffValue,
  ]);

  const calculateTotals = () => {
    let sub = 0;
    let tax = 0;
    let disc = 0;
    proformaItems.forEach((item) => {
      const qty = parseFloat(item.qty || 0);
      const price = parseFloat(item.salesPrice || 0);
      const lineSubtotal = qty * price;
      sub += lineSubtotal;
      const itemTax = parseFloat(item.tax || 0);
      const itemDisc = parseFloat(item.discount || 0);
      tax += (lineSubtotal * itemTax) / 100;
      disc += (lineSubtotal * itemDisc) / 100;
    });

    let newTotal = sub + tax - disc;

    const addChargeVal = parseFloat(additionalChargeValue) || 0;
    const addChargeTax =
      (addChargeVal * parseFloat(additionalChargeTaxRate || 0)) / 100;
    newTotal += addChargeVal + addChargeTax;

    const afterTaxDisc = parseFloat(discountAfterTax) || 0;
    if (afterTaxDisc > 0) {
      newTotal -= discountAfterTaxIsPercent
        ? (newTotal * afterTaxDisc) / 100
        : afterTaxDisc;
    }

    if (autoRoundOff) {
      const roundVal = parseFloat(roundOffValue) || 0;
      newTotal = Math.round(newTotal + roundVal);
    }

    if (newTotal < 0) newTotal = 0;

    setSubtotal(sub);
    setTaxTotal(tax);
    setDiscountTotal(disc);
    setGrandTotal(newTotal);
  };

  const balanceAmount = markAsFullyPaid ? 0 : grandTotal;

  // ------------------------------------------------------------------
  // 6) Load itemCategories from localStorage
  // ------------------------------------------------------------------
  const [itemCategories, setItemCategories] = useState([]);
  useEffect(() => {
    const storedCats = JSON.parse(localStorage.getItem("itemCategories")) || [];
    const catNames = storedCats.map((c) => (typeof c === "string" ? c : c.name));
    setItemCategories(catNames);
  }, []);

  // ------------------------------------------------------------------
  // 7) Add Items Modal
  // ------------------------------------------------------------------
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("Select Category");
  const [modalQuantities, setModalQuantities] = useState({});

 // ✅ Load items when modal opens
 useEffect(() => {
  if (showAddItemsModal) {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASEAPI}/item/api/product-service-items/`);
        console.log("✅ Loaded Items from API:", res.data);

        if (Array.isArray(res.data) && res.data.length > 0) {
          const formattedItems = res.data.map((item) => ({
            id: item.id,
            name: item.item_name || item.service_name || "Unnamed Item",
            item_code: item.product_code || item.service_code || "N/A",
            type: item.type || "Unknown",
            
            // Correct HSN/SAC mapping based on the type
            hsn_sac_code: item.type === "product" ? item.hsn_code || "-" : item.sac_code || "-",

            // Ensure sales price is always fetched correctly
            sales_price: parseFloat(item.sales_price_with_tax) || parseFloat(item.sales_price_without_tax) || 0,
            purchase_price: parseFloat(item.purchase_price) || 0,
            current_stock: parseFloat(item.opening_stock) || 0,
            final_total: parseFloat(item.final_total) || 0,

            // Ensure correct GST tax field is used
            gst_tax: parseFloat(item.gst_tax) || parseFloat(item.gst_tax_rate) || 0,

            measuring_unit: item.measuring_unit || "Unit",
            barcode_image: item.barcode_image || "",
            stock_threshold: parseFloat(item.stock_threshold) || 0,
            as_of_date: item.as_of_date || "",
          }));

          setAllItems(formattedItems);
        } else {
          console.warn("⚠️ No items found in API response.");
        }
      } catch (error) {
        console.error("❌ Error fetching items from API:", error);
      }
    };
 
    fetchItems();
  }
}, [showAddItemsModal]);  // ✅ Runs every time modal opens
 // ✅ Open Modal
const handleOpenAddItemsModal = () => {
  setShowAddItemsModal(true);
};
  const handleCloseAddItemsModal = () => {
    setShowAddItemsModal(false);
    setItemSearchTerm("");
    setItemCategoryFilter("Select Category");
    setModalQuantities({});
  };
  
    
 // ✅ Filter Items for Display
const filteredModalItems = allItems.filter((it) => {
  const name = it.name.toLowerCase();
  const matchName = name.includes(itemSearchTerm.toLowerCase()); // Match search term with name

  const matchCategory =
    itemCategoryFilter === "Select Category" || itemCategoryFilter === it.type;

  return matchName && matchCategory;
});

console.log("🔍 Filtered Items:", filteredModalItems);

  const handleChangeModalQuantity = (index, qty) => {
    setModalQuantities((prev) => ({ ...prev, [index]: qty }));
  };

  const handleCreateNewItem = () => {
    navigate("/employee/billing/items?createNew=1");
  };
  
      // ✅ Add Selected Items to Invoice
  
  // ✅ Add Selected Items to Invoice
  const handleDoneAddingItems = async () => {
    try {
      const selectedItems = filteredModalItems
        .filter((_, idx) => parseFloat(modalQuantities[idx] || 0) > 0)
        .map((it, idx) => {
          let gstTax = 0;
          let hsnSacCode = "-"; 
  
          if (it.type === "product") {
            gstTax = parseFloat(it.gst_tax) || 0;
            hsnSacCode = it.hsn_sac_code || "-";
          } else if (it.type === "service") {
            gstTax = parseFloat(it.gst_tax_rate) || 0;
            hsnSacCode = it.sac_code || "-";
          }
  
          return {
            ...it,
            qty: parseFloat(modalQuantities[idx]) || 0,
            discount: 0,
            tax: gstTax,
            itemName: it.name || "",
            hsn_sac_code: hsnSacCode,
            salesPrice: parseFloat(it.sales_price) || 0,
          };
        });
  
      console.log("✅ Selected Items:", selectedItems);
  
      if (selectedItems.length > 0) {
        // ✅ Use setProformaItems to update the state
        setProformaItems((prev) => [...prev, ...selectedItems]);
      }
    } catch (error) {
      console.error("❌ Error adding items:", error);
    }
  
    handleCloseAddItemsModal();  
  };
  

  // ------------------------------------------------------------------
  // 8) Table item edits
  // ------------------------------------------------------------------
  const handleAddItem = () => {
    handleOpenAddItemsModal();
  };
  const handleQtyChange = (idx, newQty) => {
    const updated = [...proformaItems];
    updated[idx] = { ...updated[idx], qty: newQty };
    setProformaItems(updated);
  };
  const handlePriceChange = (idx, newPrice) => {
    const updated = [...proformaItems];
    updated[idx] = { ...updated[idx], salesPrice: newPrice };
    setProformaItems(updated);
  };
  const handleDiscountChange = (idx, newDisc) => {
    const updated = [...proformaItems];
    updated[idx] = { ...updated[idx], discount: newDisc };
    setProformaItems(updated);
  };
  const handleTaxChange = (idx, newTaxLabel) => {
    const option = taxOptions.find((o) => o.label === newTaxLabel);
    const numericRate = option ? option.value : 0;
    const updated = [...proformaItems];
    updated[idx] = { ...updated[idx], tax: numericRate };
    setProformaItems(updated);
  };
  const handleRemoveProformaItem = (idx) => {
    const updated = [...proformaItems];
    updated.splice(idx, 1);
    setProformaItems(updated);
  };

  // ------------------------------------------------------------------
  // 9) Save => store proforma => show preview
  // ------------------------------------------------------------------
  const [proforma_invoice_number, setProformaInvoiceNumber] = useState(1);
  const [proforma_invoice_date, setProformaInvoiceDate] = useState(
    new Date().toLocaleDateString()
  );
  const [paymentTerms, setPaymentTerms] = useState(0);
  const [due_date, setExpiryDate] = useState("");
  const handleSave = async () => {
    try {
      console.log("🛠 Debug: Saving Proforma Invoice...");
  
      const itemsToMap = Array.isArray(proformaItems) ? proformaItems : [];
      console.log("🛠 Debug: Current Proforma Items:", itemsToMap);
  
      const mappedItems = itemsToMap
        .filter(item => item?.id)
        .map(item => ({
          product_item: item.type === "product" ? item.id : null,
          service_item: item.type === "service" ? item.id : null,
          quantity: Number(item.qty) || 1,
          price_per_item: parseFloat(item.salesPrice) || 0,
          discount: parseFloat(item.discount) || 0,
          amount: parseFloat(item.final_total) || 0,
        }));
  
      if (mappedItems.length === 0) {
        throw new Error("❌ No valid items included in the proforma invoice.");
      }
  
      if (!selectedParty?.id) {
        throw new Error("❌ Party ID is missing.");
      }
  
      const creditNoteData = {
        party: selectedParty?.id,
        proforma_invoice_date,
        proforma_invoice_number,
        due_date,
        items: mappedItems,
        subtotal: parseFloat(subtotal) || 0,
        taxTotal: parseFloat(taxTotal) || 0,
        discountTotal: parseFloat(discountTotal) || 0,
        grandTotal: parseFloat(grandTotal) || 0,
        isFullyPaid: markAsFullyPaid,
        balanceAmount: markAsFullyPaid ? 0 : parseFloat(grandTotal) || 0,
        receivedAmount: markAsFullyPaid ? parseFloat(grandTotal) || 0 : 0,
      };
  
      console.log("📤 Sending Proforma Invoice Data:", creditNoteData);
  
      // Decide between POST or PUT
      const method = savedProforma?.id ? "put" : "post";
      const url = savedProforma?.id
        ? `${process.env.REACT_APP_BASEAPI}/proformainv/proforma-invoice/${savedProforma.id}/update/`
        : `${process.env.REACT_APP_BASEAPI}/proformainv/proforma-invoice/`;
  
      const res = await axios[method](url, creditNoteData);
  
      if (res.status === 200 || res.status === 201) {
        console.log(`✅ Proforma Invoice ${method === "put" ? "updated" : "created"} successfully`, res.data);
        setSavedProforma(res.data);
        setShowProformaPreview(true);
      } else {
        console.error(`❌ Error: Unexpected response status - ${res.status}`);
      }
  
    } catch (error) {
      console.error("❌ Error in handleSave:", error.message);
    }
  };
  

  // ------------------------------------------------------------------
  // For the "delete proforma" confirmation modal
  // ------------------------------------------------------------------
  const [showDeleteModal, setShowDeleteModal] = useState(false);

 const handleConfirmDelete = async () => {
  try {
    if (!savedProforma?.id) {
      alert("⚠️ Proforma Invoice ID not found.");
      return;
    }

    const url = `${process.env.REACT_APP_BASEAPI}/proformainv/proforma-invoice/delete/${savedProforma.id}/`;
    console.log("🛰️ Sending DELETE request to:", url);

    const res = await axios.delete(url);

    if (res.status === 204 || res.status === 200) {
      const all = JSON.parse(localStorage.getItem("proformaInvoices")) || [];
      const updated = all.filter(p => p.id !== savedProforma.id);
      localStorage.setItem("proformaInvoices", JSON.stringify(updated));

      setShowProformaPreview(false);
      setSavedProforma(null);
      setShowDeleteModal(false);

      alert("✅ Proforma Invoice deleted successfully.");
    } else {
      throw new Error("Server responded with an unexpected status.");
    }
  } catch (error) {
    console.error("❌ Error deleting Proforma Invoice:", error.message);
    alert("⚠️ Something went wrong while deleting the Proforma Invoice.");
  }
};

  

  // PDF capture
  const proformaRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!proformaRef.current) return;
    const canvas = await html2canvas(proformaRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasHeight / canvasWidth;
    const newHeight = pdfWidth * ratio;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, newHeight);
    pdf.save(`proforma_${savedProforma.proforma_invoice_number}.pdf`);
  };

  // ------------------------------------------------------------------
  // 10) If in preview mode, show the Proforma preview
  // ------------------------------------------------------------------
  if (showProformaPreview && savedProforma) {
    const isPaid = savedProforma.balanceAmount === 0;

    return (
      <>
        {/* TOP BAR => Proforma #, Paid/Unpaid, Download, Print, etc. */}
        <div className="p-4 flex items-center justify-between border-b bg-white ">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">
              Proforma Invoice #{savedProforma.proforma_invoice_number}
            </h2>
            <span
              className={`text-sm px-2 py-1 rounded ${
                isPaid
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isPaid ? "Paid" : "Unpaid"}
            </span>
          </div>
          <div className="space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
            >
              Download PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
            >
              Print PDF
            </button>
          </div>
        </div>

        {/* EDIT / DELETE */}
        <div className="p-4 flex items-center justify-end space-x-2 border-b bg-white ">
          <button
            onClick={() => {
              // Reopen the form with saved proforma data
              setProformaItems(savedProforma.items);
              setProformaInvoiceNumber(savedProforma.proforma_invoice_number);
              setProformaInvoiceDate(savedProforma.proforma_invoice_date);
              setPaymentTerms(savedProforma.paymentTerms || 0);
              setExpiryDate(savedProforma.due_date);
              setSelectedParty(savedProforma.party);
              setSubtotal(savedProforma.subtotal);
              setTaxTotal(savedProforma.taxTotal);
              setDiscountTotal(savedProforma.discountTotal);
              setGrandTotal(savedProforma.grandTotal);
              setMarkAsFullyPaid(savedProforma.isFullyPaid);

              setShowProformaPreview(false);
            }}
            className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-1 border rounded hover:bg-gray-100 text-sm text-red-500"
          >
            Delete
          </button>
        </div>

        {/* PROFORMA PREVIEW SECTION */}
        <div
          className="max-w-4xl bg-white p-4 mt-4 ml-64 border border-gray-300 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
          ref={proformaRef}
        >
          {/* Top Row */}
          <div className="flex justify-between border-b pb-2 mb-2">
            <div className="font-bold uppercase text-sm">PROFORMA INVOICE</div>
            <div className="font-bold uppercase text-sm">ORIGINAL</div>
          </div>

          {/* Business Name / Mobile */}
          <div className="text-center mb-4">
            <div className="text-lg font-bold">Business Name</div>
            <div className="text-sm">Mobile: 7010738782</div>
          </div>

          {/* Bill To & Proforma Info */}
          <div className="flex justify-between border-b pb-2 mb-4 text-sm">
            {/* Left side: Bill To */}
            <div>
  <div className="font-semibold">BILL TO</div>
  <div>{selectedParty.party_name || "CASH SALE"}</div>
  <div>Mobile: {selectedParty.mobile_number || "1234567890"}</div>
  <div>{renderShippingAddress()}</div>
 {/* Display address */}
</div> 
            {/* Right side: Proforma details */}
            <div className="text-right">
              <div>Proforma Invoice No: {savedProforma.proforma_invoice_number}</div>
              <div>Proforma Invoice Date: {savedProforma.proforma_invoice_date}</div>
              <div>Expiry Date: {savedProforma.due_date || "--/--/----"}</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm border border-gray-300 mb-2">
            <thead className="border-b bg-gray-100">
              <tr>
                <th className="p-2 border-r">S.NO</th>
                <th className="p-2 border-r">ITEM / SERVICE</th>
                <th className="p-2 border-r">QTY.</th>
                <th className="p-2 border-r">RATE</th>
                <th className="p-2">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
  {Array.isArray(savedProforma?.proforma_invoice_items) ? (
    savedProforma.proforma_invoice_items.map((it, index) => {
      const name = it.item_name || "-";
      const qty = parseFloat(it.quantity || 0);
      const rate = parseFloat(it.price_per_item || 0);
      const amount = parseFloat(it.amount || (qty * rate));

      return (
        <tr key={index} className="border-b">
          <td className="p-2 border-r text-center">{index + 1}</td>
          <td className="p-2 border-r">{name}</td>
          <td className="p-2 border-r text-center">
            {qty}
          </td>
          <td className="p-2 border-r text-center">
            {rate.toFixed(2)}
          </td>
          <td className="p-2 text-right">
            {amount.toFixed(2)}
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="5" className="p-2 text-center">
        No items available
      </td>
    </tr>
  )}
</tbody>


          </table>

          {/* TOTAL / RECEIVED AMOUNT */}
          <div className="flex justify-end">
  <table className="text-sm border">
    <tbody>
      <tr className="border-b">
        <td className="px-2 py-1 font-semibold border-r">TOTAL</td>
        <td className="px-2 py-1 border-r">
          {Array.isArray(savedProforma?.proforma_invoice_items) ? savedProforma.proforma_invoice_items.length : 0}
        </td>
        <td className="px-2 py-1 text-right">
          ₹ {savedProforma?.proforma_invoice_total?.total || "0.00"}
        </td>
      </tr>
      <tr>
        <td className="px-2 py-1 font-semibold border-r">RECEIVED AMOUNT</td>
        <td colSpan={2} className="px-2 py-1 text-right">
          ₹ {savedProforma?.received_amount || "0.00"}
        </td>
      </tr>
    </tbody>
  </table>
</div>


          {/* Amount in Words */}
          <div className="mt-4 text-sm">
            <p className="font-semibold">Total Amount (in words)</p>
            <p className="italic">Zero Rupees</p>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-4 text-sm">
            <h4 className="font-semibold">Terms and Conditions</h4>
            <p>1. Goods once sold will not be taken back or exchanged</p>
            <p>
              2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction
              only
            </p>
          </div>

          {/* Authorized Signatory */}
          <div className="mt-4 flex justify-end">
            <div className="text-right text-sm">
              <p className="font-semibold">
                Authorized Signatory For Business Name
              </p>
              <div className="border border-dashed w-32 h-16 mt-2" />
            </div>
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-2">
                Are you sure you want to delete this Proforma Invoice?
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Once deleted, it cannot be recovered.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ------------------------------------------------------------------
  // 11) Otherwise, show normal create-proforma form
  // ------------------------------------------------------------------
  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-white border-b flex-none">
          <button
            onClick={handleSettings}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Settings
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveAndNew}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Save &amp; New
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>

        {/* Main Create-Proforma Form */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* TOP ROW: BILL TO, SHIP TO, PROFORMA DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Bill To */}
            <div className="bg-white border rounded p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Bill To</h2>
                <button
                  onClick={() => setShowPartyDropdown(true)}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Change Party
                </button>
              </div>
              <p className="text-sm font-medium">
                {selectedParty ? selectedParty.party_name : "[Party Name]"}
              </p>
              <p className="text-sm text-gray-600">
                Phone Number:{" "}
                {selectedParty?.mobile_number ? selectedParty.mobile_number : "[xxxxxxx]"}
              </p>
              {showPartyDropdown && (
                <div className="mt-2 bg-white border border-gray-200 rounded shadow-lg p-2 relative z-10">
                  <input
                    type="text"
                    placeholder="Search party by name or number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                  />
                  {filteredParties.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectParty(p)}
                      className="flex justify-between p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <span>{p.party_name}</span>
                      <span className="text-gray-500">
                        ₹ {Math.abs(p.opening_balance_amount) || 0}{" "}
                        {p.opening_balance === 'to_'? (
                          <span className="text-green-600">&#8595;</span>
                        ) : (
                          <span className="text-red-600">&#8593;</span>
                        )}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => navigate("/employee/billing/createparty")}
                    className="p-2 text-blue-500 text-sm font-medium border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    + Create Party
                  </div>
                </div>
              )}
            </div>

            {/* Ship To */}
            <div className="bg-white border rounded p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Ship To</h2>
                <button
                  onClick={handleChangeShippingAddress}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Change Shipping Address
                </button>
              </div>
              <p className="text-sm font-medium">
                {selectedParty ? selectedParty.party_name : "[Shipping Name]"}
              </p>
              <p className="text-sm text-gray-600">
                Phone Number:{" "}
                {selectedParty?.mobile_number ? selectedParty.mobile_number : "[xxxxxxx]"}
              </p>
              <p className="text-sm text-gray-500">{renderShippingAddress()}</p>
            </div>

            {/* Proforma Invoice Details */}
            <div className="bg-white border rounded p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm text-gray-600">Proforma Invoice No</label>
                <input
                  type="text"
                  placeholder="ex: 1"
                  value={proforma_invoice_number}
                  onChange={(e) => setProformaInvoiceNumber(e.target.value)}
                  className="border rounded p-1 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm text-gray-600">Proforma Invoice Date</label>
                <input
                  type="date"
                  value={proforma_invoice_date}
                  onChange={(e) => setProformaInvoiceDate(e.target.value)}
                  className="border rounded p-1 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="col-span-2 text-sm text-gray-600">
                  Payment Terms
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    placeholder="0"
                    className="border rounded p-1 text-sm w-16"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  />
                  <span className="text-sm text-gray-600">days</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm text-gray-600">Expiry Date</label>
                <input
                  type="date"
                  value={due_date}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="border rounded p-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between pb-2 border-b mb-2">
              <div className="text-sm font-semibold text-gray-700">
                <span>ITEMS / SERVICES</span>
              </div>
              <button
                onClick={handleScanBarcode}
                className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
              >
                Scan Barcode
              </button>
            </div>
            <div className="hidden md:grid grid-cols-8 gap-2 text-xs font-medium text-gray-500 border-b pb-2">
              <div className="text-center">NO</div>
              <div className="col-span-2">ITEMS / SERVICES</div>
              <div className="text-center">HSN / SAC</div>
              <div className="text-center">QTY</div>
              <div className="text-center">PRICE (ITEM)</div>
              <div className="text-center">DISCOUNT</div>
              <div className="text-center">TAX</div>
              <div className="text-center">AMOUNT (₹)</div>
            </div>
            {proformaItems.length === 0 ? (
              <div className="my-4 text-center text-gray-500">
                No items added yet
              </div>
            ) : (
              proformaItems.map((item, idx) => {
                const itemName = item.name || "unnamed item";
                const hsn_sac_code = item.hsn_sac_code || "-";
                const qty = parseFloat(item.quantity) || 1;
                const price = parseFloat(item.sales_price) || 0;
                const discount = parseFloat(item.discount) || 0;
                const gstTaxRate = parseFloat(item.gst_tax) || 0;
            
                const subtotal = qty * price;
                const discountAmount = (subtotal * discount) / 100;
                const taxAmount = (subtotal * gstTaxRate) / 100;
                const lineTotal = subtotal + taxAmount - discountAmount; 
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-8 gap-2 text-sm items-center border-b py-2"
                  >
                    <div className="text-center">{idx + 1}</div>
                    <div className="col-span-2">
                      <div className="font-medium">{itemName}</div>
                      <div className="text-xs text-gray-400">
                        {item.category}
                      </div>
                    </div>
                    <div className="text-center">{hsn_sac_code}</div>
                    <div className="text-center">
                      <input
                        type="number"
                        className="border rounded p-1 w-16 text-sm text-right"
                        value={item.qty || ""}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                      />
                    </div>
                    <div className="text-center">
                      <input
                        type="number"
                        className="border rounded p-1 w-16 text-sm text-right"
                        value={item.salesPrice || ""}
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                      />
                    </div>
                    <div className="text-center">
                      <input
                        type="number"
                        className="border rounded p-1 w-12 text-sm text-right"
                        value={item.discount || ""}
                        onChange={(e) => handleDiscountChange(idx, e.target.value)}
                        placeholder="%"
                      />
                    </div>
                    <div className="text-center">
                      <select
                        className="border rounded p-1 text-sm"
                        value={
                          taxOptions.find((o) => o.value === item.tax)?.label ||
                          "None"
                        }
                        onChange={(e) => handleTaxChange(idx, e.target.value)}
                      >
                        {taxOptions.map((o) => (
                          <option key={o.label} value={o.label}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-center">{lineTotal.toFixed(2)}</div>
                    <div className="col-span-8 flex justify-end">
                      <button
                        onClick={() => handleRemoveProformaItem(idx)}
                        className="text-xs text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            <div
              onClick={handleAddItem}
              className="border-dashed border-2 border-blue-400 rounded text-center py-6 my-4 text-sm text-blue-500 cursor-pointer"
            >
              + Add Item
            </div>
            <div className="mt-4 flex justify-end">
              <table className="text-right text-sm">
                <tbody>
                  <tr>
                    <td className="px-4 py-1">Subtotal</td>
                    <td className="px-4 py-1">₹{subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1">Discount</td>
                    <td className="px-4 py-1">₹{discountTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1">Tax</td>
                    <td className="px-4 py-1">₹{taxTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2-COLUMN LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* LEFT COLUMN: Notes, Terms, New Account */}
            <div className="space-y-2">
              {!showNotes && (
                <button
                  onClick={() => setShowNotes(true)}
                  className="text-blue-500 text-sm font-medium"
                >
                  + Add Notes
                </button>
              )}
              {showNotes && (
                <div className="bg-white border rounded p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Notes</label>
                    <button
                      onClick={() => setShowNotes(false)}
                      className="text-sm text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>
                  </div>
                  <textarea
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Enter your notes"
                  />
                </div>
              )}

              {!showTerms && (
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-blue-500 text-sm font-medium"
                >
                  + Add Terms and Conditions
                </button>
              )}
              {showTerms && (
                <div className="bg-white border rounded p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Terms and Conditions
                    </label>
                    <button
                      onClick={() => setShowTerms(false)}
                      className="text-sm text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>
                  </div>
                  <textarea
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Enter your terms and conditions"
                  />
                </div>
              )}

              <button
                onClick={() => setShowNewAccountModal(true)}
                className="text-blue-500 text-sm font-medium"
              >
                + Add New Account
              </button>
            </div>

            {/* RIGHT COLUMN: Additional Charges, Discount, Payment, etc. */}
            <div className="space-y-4 text-sm">
              {showAdditionalCharge ? (
                <div className="relative border p-2 rounded space-y-2">
                  <button
                    className="absolute -top-3 -right-4 text-gray-400 hover:text-gray-600 text-xl"
                    onClick={() => {
                      setShowAdditionalCharge(false);
                      setAdditionalChargeValue(0);
                      setAdditionalChargeTaxRate(0);
                    }}
                  >
                    &times;
                  </button>
                  <label className="block text-sm font-medium">
                    Additional Charge
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Description (e.g. Transport Charge)"
                      className="border rounded p-2 text-sm flex-1"
                    />
                    <input
                      type="number"
                      placeholder="₹ 0"
                      value={additionalChargeValue}
                      onChange={(e) => setAdditionalChargeValue(e.target.value)}
                      className="border rounded p-2 text-sm w-24 text-right"
                    />
                    <select
                      value={additionalChargeTaxRate}
                      onChange={(e) => setAdditionalChargeTaxRate(e.target.value)}
                      className="border rounded p-2 text-sm"
                    >
                      <option value={0}>No Tax Applicable</option>
                      <option value={5}>GST @ 5%</option>
                      <option value={12}>GST @ 12%</option>
                      <option value={18}>GST @ 18%</option>
                      <option value={28}>GST @ 28%</option>
                    </select>
                  </div>
                </div>
              ) : (
                <button
                  className="text-blue-500 font-medium"
                  onClick={() => setShowAdditionalCharge(true)}
                >
                  + Add Additional Charges
                </button>
              )}

              <div className="flex justify-between items-center">
                <span>Taxable Amount</span>
                <span>
                  ₹ {Math.max(0, subtotal + taxTotal - discountTotal).toFixed(2)}
                </span>
              </div>

              {showDiscount ? (
                <div className="relative border p-2 rounded space-y-2">
                  <button
                    className="absolute -top-3 -right-4 text-gray-400 hover:text-gray-600 text-xl"
                    onClick={() => {
                      setShowDiscount(false);
                      setDiscountAfterTax(0);
                    }}
                  >
                    &times;
                  </button>
                  <label className="block text-sm font-medium">
                    Discount After Tax
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder={discountAfterTaxIsPercent ? "% 0" : "₹ 0"}
                      value={discountAfterTax}
                      onChange={(e) => setDiscountAfterTax(e.target.value)}
                      className="border rounded p-2 text-sm w-24 text-right"
                    />
                    <select
                      className="border rounded p-1 text-sm"
                      value={discountAfterTaxIsPercent ? "%" : "₹"}
                      onChange={(e) =>
                        setDiscountAfterTaxIsPercent(e.target.value === "%")
                      }
                    >
                      <option value="%">%</option>
                      <option value="₹">₹</option>
                    </select>
                  </div>
                </div>
              ) : (
                <button
                  className="text-blue-500 font-medium"
                  onClick={() => setShowDiscount(true)}
                >
                  + Add Discount
                </button>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={autoRoundOff}
                    onChange={(e) => setAutoRoundOff(e.target.checked)}
                  />
                  Auto Round Off
                </label>
                {autoRoundOff && (
                  <div className="flex items-center space-x-2">
                    <span>Add</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={roundOffValue}
                      onChange={(e) => setRoundOffValue(e.target.value)}
                      className="w-16 border rounded p-1 text-sm text-right"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-base">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold">₹ {grandTotal.toFixed(2)}</span>
              </div>

              <div className="text-red-600 text-sm"></div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="fullyPaid"
                  className="mr-1"
                  checked={markAsFullyPaid}
                  onChange={(e) => setMarkAsFullyPaid(e.target.checked)}
                />
                <label htmlFor="fullyPaid">Mark as fully paid</label>
              </div>

              <div className="flex justify-between items-center">
                <span>Balance Amount</span>
                <span
                  className={`font-semibold ${
                    markAsFullyPaid ? "text-green-600" : ""
                  }`}
                >
                  ₹ {balanceAmount.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 text-sm text-gray-500 border-t">
                Authorized signatory for <strong>Business Name</strong>
                <div className="mt-2 flex justify-end">
                  <div className="border border-dashed rounded w-32 h-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Add Bank Account */}
      {showNewAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Bank Account</h3>
              <button
                onClick={() => setShowNewAccountModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Account Name*
              </label>
              <input
                type="text"
                placeholder="ex: Personal Account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium block mb-1">
                  Opening Balance
                </label>
                <input
                  type="text"
                  placeholder="ex: ₹10,000"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium block mb-1">
                  As of Date
                </label>
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
            </div>
            <h4 className="text-md font-semibold mt-2">Add Bank Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Bank Account Number*
                </label>
                <input
                  type="text"
                  placeholder="ex: 123456789157950"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Re-Enter Bank Account Number*
                </label>
                <input
                  type="text"
                  placeholder="ex: 123456789157950"
                  value={reEnterBankAccountNumber}
                  onChange={(e) => setReEnterBankAccountNumber(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  IFSC Code*
                </label>
                <input
                  type="text"
                  placeholder="ex: HDFC0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Bank & Branch Name
                </label>
                <input
                  type="text"
                  placeholder="ex: HDFC, Old Madras"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Account Holders Name*
                </label>
                <input
                  type="text"
                  placeholder="ex: Elisa wolf"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">UPI ID</label>
                <input
                  type="text"
                  placeholder="ex: elisa@okhdfc"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowNewAccountModal(false)}
                className="px-4 py-2 bg-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Submitted new bank account");
                  setShowNewAccountModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Shipping Address */}
      {showChangeShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Shipping Address</h3>
              <button
                onClick={() => setShowChangeShippingModal(false)}
                className="text-xl text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            {shippingAddresses.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">
                No Shipping Addresses found.
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {shippingAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-2 border rounded flex items-center justify-between"
                  >
                    <div className="text-sm">
                      <div className="font-medium">
                        {addr.name || "Untitled"}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {addr.street ? addr.street : "No Address"}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditShippingAddress(addr)}
                        className="text-xs text-blue-600 border rounded px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleSelectShippingAddress(addr)}
                        className="text-xs text-blue-600 border rounded px-2 py-1"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleAddNewShippingAddress}
              className="text-sm text-blue-600 font-medium mb-4"
            >
              + Add New Shipping Address
            </button>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowChangeShippingModal(false)}
                className="px-4 py-2 bg-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDoneShipping}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit/Add Shipping Address */}
      {showEditShippingModal && editingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingAddress.id ? "Edit" : "Add"} Shipping Address
              </h3>
              <button
                onClick={() => setShowEditShippingModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Shipping Name*</label>
              <input
                type="text"
                placeholder="Business Name"
                value={editingAddress.name || ""}
                onChange={(e) =>
                  setEditingAddress({ ...editingAddress, name: e.target.value })
                }
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Street Address*</label>
              <input
                type="text"
                placeholder="Enter Street Address"
                value={editingAddress.street || ""}
                onChange={(e) =>
                  setEditingAddress({
                    ...editingAddress,
                    street: e.target.value,
                  })
                }
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-sm font-medium">State</label>
                <select
                  value={editingAddress.state || ""}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      state: e.target.value,
                    })
                  }
                  className="border rounded p-2 text-sm"
                >
                  <option value="">Select State</option>
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium">Pincode</label>
                <input
                  type="text"
                  placeholder="Enter pincode"
                  value={editingAddress.pincode || ""}
                  onChange={handlePincodeChange}
                  className="border rounded p-2 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">City</label>
              <input
                type="text"
                placeholder="Enter City"
                value={editingAddress.city || ""}
                onChange={(e) =>
                  setEditingAddress({
                    ...editingAddress,
                    city: e.target.value,
                  })
                }
                className="border rounded p-2 text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowEditShippingModal(false)}
                className="px-4 py-2 bg-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShippingAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Items */}
      {showAddItemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Items</h3>
              <button
                onClick={handleCloseAddItemsModal}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Search Items"
                  value={itemSearchTerm}
                  onChange={(e) => setItemSearchTerm(e.target.value)}
                  className="border rounded p-2 text-sm w-full md:w-1/2"
                />
                <select
                  value={itemCategoryFilter}
                  onChange={(e) => setItemCategoryFilter(e.target.value)}
                  className="border rounded p-2 text-sm"
                >
                  <option value="Select Category">Select Category</option>
                  {itemCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreateNewItem}
                className="text-blue-600 font-medium text-sm"
              >
                + Create New Item
              </button>
            </div>
            <div className="overflow-auto max-h-80 border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Item Code</th>
                    <th className="p-2 text-left">Sales Price</th>
                    <th className="p-2 text-left">Purchase Price</th>
                    <th className="p-2 text-left">Current Stock</th>
                    <th className="p-2 text-left">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModalItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-4 text-gray-500"
                      >
                        No items found
                      </td>
                    </tr>
                  ) : (
                    filteredModalItems.map((it, index) => {
                      const name = it.type === "product" ? it.name : it.name;
      const code = it.type === "product" ? it.item_code : it.item_code;
      const sales = it.sales_price || 0;
      const purchase = it.purchase_price || 0;
      const stock =
        it.type === "product" && it.current_stock
          ? `${it.current_stock} ${it.measuring_unit || ""}`
          : it.type === "service"
          ? "-"
          : "-";
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2">{name}</td>
                          <td className="p-2">{code}</td>
                          <td className="p-2">₹ {sales}</td>
                          <td className="p-2">₹ {purchase}</td>
                          <td className="p-2">
                            {parseFloat(it.current_stock || 0) <= 0 ? (
                              <span className="text-red-500">
                                {stock} (Insufficient Stock)
                              </span>
                            ) : (
                              <>{stock}</>
                            )}
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="border rounded w-16 p-1 text-right"
                              value={modalQuantities[index] || ""}
                              onChange={(e) =>
                                handleChangeModalQuantity(index, e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm">
                {
                  Object.values(modalQuantities).filter((q) => parseFloat(q) > 0)
                    .length
                }{" "}
                Items Selected
              </div>
              <div className="space-x-2">
                <button
                  onClick={handleCloseAddItemsModal}
                  className="px-4 py-2 bg-gray-300 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDoneAddingItems}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default CreateProformaInvoice;