import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const baseurl = process.env.REACT_APP_BASEAPI;

console.log(baseurl);

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu", "Delhi", "Jammu and Kashmir",
  "Lakshadweep", "Puducherry"
];

const CreateParty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get("editId");
  const manageShipping = searchParams.get("manageShipping");

  // Controlled form fields
  const [partyId, setPartyId] = useState(null);
  const [partyName, setPartyName] = useState("");
  const [partyMobile, setPartyMobile] = useState("");
  const [partyEmail, setPartyEmail] = useState("");
  const [openingBalanceAmount, setOpeningBalanceAmount] = useState(""); // Store numeric amount
  const [balanceType, setBalanceType] = useState("to_collect"); // "to_collect" or "to_pay"
  const [gstin, setGstin] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [partyType, setPartyType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Select Categories");
  const [creditPeriod, setCreditPeriod] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Validation errors
  const [partyNameError, setPartyNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [gstinError, setGstinError] = useState("");
  const [panError, setPanError] = useState("");

  // localStorage key "partyCategories"
  const [categories, setCategories] = useState(() => {
    return JSON.parse(localStorage.getItem("partyCategories")) || ["Select Categories"];
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Billing Address Modal
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingStreet, setBillingStreet] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPincode, setBillingPincode] = useState("");
  const [billingCity, setBillingCity] = useState("");

  // Shipping Address Modal
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [shippingCity, setShippingCity] = useState("");

  // Custom Fields (Party Settings)
  const [customFields, setCustomFields] = useState([]);
  const [tempFieldName, setTempFieldName] = useState("");
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);

  // Load categories and (if editing) party data from localStorage
  useEffect(() => {
    const savedCats = JSON.parse(localStorage.getItem("partyCategories")) || ["Select Categories"];
    setCategories(savedCats);
  
    if (editId) {
      const parties = JSON.parse(localStorage.getItem("parties")) || [];
      let found = parties.find((p) => String(p.id) === editId);
  
      if (!found) {
        const idx = parseInt(editId, 10);
        if (!isNaN(idx) && parties[idx]) {
          found = parties[idx];
        }
      }
  
      if (found) {
        setPartyId(found.id);
        setPartyName(found.name || "");
        setPartyMobile(found.mobile || "");
        setPartyEmail(found.email || "");
        setSelectedCategory(found.category || "Select Categories");
        setGstin(found.gstin || "");
        setPanNumber(found.pan || "");
        setPartyType(found.type || "Customer");
        setBillingAddress(found.billing || "");
        setShippingAddress(found.shipping || "");
        setCreditPeriod(String(found.creditPeriod || ""));
        setCreditLimit(String(found.creditLimit || ""));
        setCustomFields(found.customFields || []);
  
        // ✅ Load Opening Balance Correctly
        if (found.balanceType === "to_pay") {
          setBalanceType("to_pay");
        } else {
          setBalanceType("to_collect");
        }
        setOpeningBalanceAmount(String(found.balanceAmount || "0.00"));
      }
    }
  }, [editId]);
  

  useEffect(() => {
    if (manageShipping) {
      setShowShippingModal(true);
    }
  }, [manageShipping]);

  // Validation Handlers
  const handlePartyNameChange = (e) => {
    const val = e.target.value;
    if (/^[A-Za-z ]*$/.test(val)) {
      setPartyName(val);
      setPartyNameError("");
    } else {
      setPartyNameError("Please enter alphabets only.");
    }
  };

  const handleMobileChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setPartyMobile(val);
      setMobileError("");
    } else {
      setMobileError("Please enter numbers only.");
    }
  };

  const handleEmailBlur = (e) => {
    const val = e.target.value;
    const pattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (val && !pattern.test(val)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleGSTINBlur = (e) => {
    const val = e.target.value;
    const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (val && !pattern.test(val)) {
      setGstinError("Please enter a valid GSTIN (15 characters).");
    } else {
      setGstinError("");
    }
  };

  const handlePANBlur = (e) => {
    const val = e.target.value;
    const pattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (val && !pattern.test(val)) {
      setPanError("Please enter a valid PAN (10 characters).");
    } else {
      setPanError("");
    }
  };

  const handleCreditPeriodChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCreditPeriod(val);
  };

  const handleCreditLimitChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCreditLimit(val);
  };

  // Category Dropdown Handlers
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setDropdownOpen(false);
  };

  const handleCreateCategory = () => {
    setShowCategoryModal(true);
    setDropdownOpen(false);
  };

  const handleSaveCategory = () => {
    if (newCategory.trim()) {
      const updated = [...categories, newCategory];
      setCategories(updated);
      localStorage.setItem("partyCategories", JSON.stringify(updated));
      setNewCategory("");
      setShowCategoryModal(false);
      setSelectedCategory(newCategory);
    }
  };

  // Billing Address Modal Handlers
  const openBillingModal = () => setShowBillingModal(true);
  const closeBillingModal = () => setShowBillingModal(false);
  const handleBillingPincodeChange = async (e) => {
    const pin = e.target.value;
    setBillingPincode(pin);
    if (pin.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0].Status === "Success") {
          const cityName = data[0].PostOffice[0].District || "";
          setBillingCity(cityName);
        }
      } catch (err) {
        console.log("Error fetching city:", err);
      }
    }
  };

  // Shipping Address Modal Handlers
  const openShippingModal = () => {
    if (!sameAsBilling) {
      setShowShippingModal(true);
    }
  };
  const closeShippingModal = () => setShowShippingModal(false);
  const handleShippingPincodeChange = async (e) => {
    const pin = e.target.value;
    setShippingPincode(pin);
    if (pin.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0].Status === "Success") {
          const cityName = data[0].PostOffice[0].District || "";
          setShippingCity(cityName);
        }
      } catch (err) {
        console.log("Error fetching city:", err);
      }
    }
  };

 // Handle "Same as Billing" Checkbox
 const handleSameAsBilling = (e) => {
  const checked = e.target.checked;
  setSameAsBilling(checked);
  if (checked) {
    const fullBillingAddress = `${billingStreet}, ${billingCity}, ${billingState}, ${billingPincode}`;
    setShippingAddress(fullBillingAddress);
    setShippingStreet(billingStreet);
    setShippingState(billingState);
    setShippingPincode(billingPincode);
    setShippingCity(billingCity);
  } else {
    setShippingAddress("");
    setShippingStreet("");
    setShippingState("");
    setShippingPincode("");
    setShippingCity("");
  }
};

  // Custom Fields Handlers
  const handleOpenCustomFields = () => setShowCustomFieldsModal(true);
  const handleCloseCustomFields = () => {
    setShowCustomFieldsModal(false);
    setTempFieldName("");
  };
  const handleAddCustomField = () => {
    if (tempFieldName.trim() !== "") {
      const newField = { id: Date.now(), label: tempFieldName, value: "" };
      setCustomFields([...customFields, newField]);
      setTempFieldName("");
    }
  };
  const handleRemoveField = (id) => {
    const updated = customFields.filter((f) => f.id !== id);
    setCustomFields(updated);
  };
  const handleUpdateCustomFieldValue = (id, newValue) => {
    const updated = customFields.map((f) => (f.id === id ? { ...f, value: newValue } : f));
    setCustomFields(updated);
  };
  const handleSaveCustomFields = () => {
    setShowCustomFieldsModal(false);
  };

  console.log(balanceType, partyType);

 // Function to "save" billing address (UI only, no API call)
const saveBillingAddress = () => {
  if (!billingStreet || !billingState || !billingPincode || !billingCity) {
    alert("Please fill in all the billing address fields.");
    return;
  }

  // Store billing address in the state
  setBillingStreet(billingStreet);
  setBillingState(billingState);
  setBillingPincode(billingPincode);
  setBillingCity(billingCity);

  // Close the modal
  setShowBillingModal(false);
};

// Function to "save" shipping address (UI only, no API call)
const saveShippingAddress = () => {
  if (!shippingStreet || !shippingState || !shippingPincode || !shippingCity) {
    alert("Please fill in all the shipping address fields.");
    return;
  }

  // Store shipping address in the state
  setShippingStreet(shippingStreet);
  setShippingState(shippingState);
  setShippingPincode(shippingPincode);
  setShippingCity(shippingCity);

  // Close the modal
  setShowShippingModal(false);
};


const [salesperson, setSalespersons] = useState([]);
const [selectedSalesperson, setSelectedSalesperson] = useState("");

useEffect(() => {
  const fetchSalespersons = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASEAPI}/salesref/salespersons/`);
      setSalespersons(res.data);
    } catch (error) {
      console.error("Error fetching salespersons:", error);
    }
  };

  fetchSalespersons(); // ✅ Now it's defined in the same scope
}, []);

const handleSaveAndNew = async () => {
  if (partyNameError || mobileError || emailError || gstinError || panError) {
    alert("Please fix errors before saving.");
    return;
  }

  const partyData = {
    party: {
      party_name: partyName.trim(),
      mobile_number: partyMobile.trim(),
      email: partyEmail.trim(),
      opening_balance: balanceType, // ✅ "to_collect" or "to_pay"
      opening_balance_amount: parseFloat(openingBalanceAmount) || 0.00, // ✅ Numeric balance
      party_category: selectedCategory.trim(),
      gstin: gstin.trim(),
      pan_number: panNumber.trim(),
      party_type: partyType.trim(),
      credit_period_days: parseInt(creditPeriod, 10) || 0,
      credit_limit_rupees: parseInt(creditLimit, 10) || 0,
      sales_person: selectedSalesperson ? Number(selectedSalesperson) : null,
    },
    billing_address: billingStreet && billingState && billingPincode && billingCity ? {
      street: billingStreet.trim(),
      state: billingState.trim(),
      pincode: billingPincode.trim(),
      city: billingCity.trim(),
    } : null,
    shipping_address: shippingStreet && shippingState && shippingPincode && shippingCity ? {
      street: shippingStreet.trim(),
      state: shippingState.trim(),
      pincode: shippingPincode.trim(),
      city: shippingCity.trim(),
      is_same_as_billing_address: sameAsBilling,
    } : null,
  };

  try {
    const response = await axios.post(`${baseurl}/pincode/api/add-party-address/`, partyData);

    if (response.status === 201 || response.status === 200) {
      alert("Party, Billing Address, and Shipping Address saved successfully!");
      resetForm();
    }
  } catch (error) {
    alert("Failed to save party and addresses. Please try again.");
  }
};

  
  // Reset the form fields after saving the data
  const resetForm = () => {
    setPartyId(null);
    setPartyName("");
    setPartyMobile("");
    setPartyEmail("");
    setOpeningBalanceAmount("");
    setBalanceType("To Collect");
    setGstin("");
    setPanNumber("");
    setPartyType("Customer");
    setSelectedCategory("Select Categories");
    setCreditPeriod("");
    setCreditLimit("");
    setBillingStreet("");
    setBillingState("");
    setBillingPincode("");
    setBillingCity("");
    setShippingStreet("");
    setShippingState("");
    setShippingPincode("");
    setShippingCity("");
    setSameAsBilling(false);
    setCustomFields([]);
  };
  

  // Function to save Party details (with optional address)
  const handleSaveParty = async () => {
    // Client-side validation before sending data
    if (!partyName.trim() || !partyMobile.trim() || !partyEmail.trim() || !gstin.trim() || !panNumber.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
  
    // Validate PAN Format (e.g., ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber.trim())) {
      alert("Invalid PAN format. Example: ABCDE1234F");
      return;
    }
  
    // Ensure opening_balance is a valid number
    const balance = parseFloat(openingBalanceAmount);
    if (isNaN(balance) || balance < 0) {
      alert("Opening balance must be a valid positive number.");
      return;
    }
  
    // Construct the request payload
    const partyData = {
      party: {
        party_name: partyName.trim(),
        mobile_number: partyMobile.trim(),
        email: partyEmail.trim(),
        opening_balance: balanceType, // "to_collect" or "to_pay"
        opening_balance_amount: parseFloat(openingBalanceAmount) || 0.00, // Numeric balance
        party_category: selectedCategory.trim(),
        gstin: gstin.trim(),
        pan_number: panNumber.trim(),
        party_type: partyType.trim(),
        credit_period_days: parseInt(creditPeriod, 10) || 0,
        credit_limit_rupees: parseInt(creditLimit, 10) || 0,
        sales_person: selectedSalesperson ? Number(selectedSalesperson) : null,
      },
      billing_address: billingStreet && billingState && billingPincode && billingCity ? {
        street: billingStreet.trim(),
        state: billingState.trim(),
        pincode: billingPincode.trim(),
        city: billingCity.trim(),
      } : null,
      shipping_address: shippingStreet && shippingState && shippingPincode && shippingCity ? {
        street: shippingStreet.trim(),
        state: shippingState.trim(),
        pincode: shippingPincode.trim(),
        city: shippingCity.trim(),
        is_same_as_billing_address: sameAsBilling,
      } : null,
    };
  
    // Remove null values
    Object.keys(partyData).forEach((key) => {
      if (partyData[key] === null) delete partyData[key];
    });
  
    console.log("🔹 Sending Request Data:", JSON.stringify(partyData, null, 2));
  
    try {
      let response;
      if (editId) {
        // If editing an existing party, use PUT
        response = await axios.put(
          `${baseurl}/pincode/party-address/update/${editId}/`,  // Update endpoint
          partyData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        // If creating a new party, use POST
        response = await axios.post(
          `${baseurl}/pincode/api/add-party-address/`, // Create endpoint
          partyData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      if (response.status === 200 || response.status === 201) {
        alert(editId ? "✅ Party updated successfully!" : "✅ Party details saved successfully!");
        resetForm();
      } else {
        console.error("❌ Unexpected Response:", response);
        alert("Failed to save party details. Please try again.");
      }
    } catch (error) {
      console.error("🚨 API Error:", error.response?.data || error.message);
  
      const apiErrorData = error.response?.data;
      if (apiErrorData) {
        let errorMessage = "Validation errors:\n";
        Object.keys(apiErrorData).forEach((key) => {
          errorMessage += `${key}: ${apiErrorData[key].join(", ")}\n`;
        });
        alert(`Failed to save party details.\n${errorMessage}`);
      } else {
        alert(`Failed to save party details. Error: ${error.message}`);
      }
    }
  };
  
  
  return (
    <div className="mx-auto max-w-6xl p-4 space-y-4">
      {/* Top Bar (Title & Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3">
        <h2 className="text-xl font-semibold">
          {editId ? "Edit Party" : "Create Party"}
        </h2>
        <div className="mt-3 sm:mt-0 flex space-x-2">
          <button
            className="px-4 py-2 bg-gray-100 rounded border hover:bg-gray-200"
            onClick={handleOpenCustomFields}
          >
            Party Settings
          </button>
          <button
               className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100"
                onClick={handleSaveAndNew}               
                  > Save & New</button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSaveParty}
          >
            Save
          </button>
        </div>
      </div>

      {/* General Details */}
      <h3 className="font-semibold">General Details</h3>
      {/* 1st Row: Party Name, Mobile Number, Email, Opening Balance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Party Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Party Name*</label>
          <input
            type="text"
            placeholder="Enter name"
            value={partyName}
            onChange={handlePartyNameChange}
            onBlur={handlePartyNameChange}
            pattern="[A-Za-z ]+"
            title="Please enter alphabets only."
            required
            className="border rounded p-2 text-sm"
          />
          {partyNameError && (
            <span className="text-red-500 text-xs">{partyNameError}</span>
          )}
        </div>
        {/* Mobile Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Mobile Number</label>
          <input
            type="tel"
            placeholder="Enter mobile number"
            value={partyMobile}
            onChange={handleMobileChange}
            onBlur={handleMobileChange}
            pattern="[0-9]{10}"
            title="Please enter a 10-digit mobile number."
            className="border rounded p-2 text-sm"
          />
          {mobileError && (
            <span className="text-red-500 text-xs">{mobileError}</span>
          )}
        </div>
        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={partyEmail}
            onChange={(e) => setPartyEmail(e.target.value)}
            onBlur={handleEmailBlur}
            className="border rounded p-2 text-sm"
          />
          {emailError && (
            <span className="text-red-500 text-xs">{emailError}</span>
          )}
        </div>
        {/* Opening Balance */}
<div className="flex flex-col">
  <label className="text-sm font-medium mb-1">Opening Balance</label>
  <div className="flex border rounded overflow-hidden">
    {/* Currency Symbol */}
    <div className="flex items-center px-2 border-r text-sm text-gray-700">₹</div>

    {/* Input Field for Amount */}
    <input
      type="text"
      placeholder="0"
      value={openingBalanceAmount}
      onChange={(e) =>
        setOpeningBalanceAmount(e.target.value.replace(/[^0-9.]/g, "")) // Allow numbers and decimals
      }
      className="p-2 w-full text-sm focus:outline-none"
    />

    {/* Balance Type Selector */}
    <select
      value={balanceType}
      onChange={(e) => setBalanceType(e.target.value)}
      className="p-2 bg-white border-l text-sm"
    >
      <option value="">Select method</option>
      <option value="to_collect">To Collect</option>
      <option value="to_pay">To Pay</option>
    </select>
  </div>
</div>

      </div>
      

      {/* 2nd Row: GSTIN, Get Details, PAN Number */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      {/* <div className="flex flex-col">
  <label className="text-sm font-medium mb-1">Sales Person*</label>
  <select
    value={selectedSalesperson}
    onChange={(e) => setSelectedSalesperson(e.target.value)}  // Update the selected salesperson
    required
    className="border rounded p-2 text-sm"
  >
    <option value="">Select Salesperson</option>
    {salesperson.map((person) => (
      <option key={person.id} value={person.id}>
        {person.name}
      </option>
    ))}
  </select>
</div> */}
        {/* GSTIN */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">GSTIN</label>
          <input
            type="text"
            placeholder="ex: 29XXXXX9438X1XX"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            onBlur={handleGSTINBlur}
            pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
            title="Enter valid GSTIN (15 characters)"
            className="border rounded p-2 text-sm"
          />
          {gstinError && (
            <span className="text-red-500 text-xs">{gstinError}</span>
          )}
        </div>
        {/* Get Details Button */}
        <div className="flex flex-col md:pt-0">
          <button className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
            Get Details
          </button>
        </div>
        {/* PAN Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">PAN Number</label>
          <input
            type="text"
            placeholder="Enter party PAN Number"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            onBlur={handlePANBlur}
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            title="Enter valid PAN (10 characters)"
            className="border rounded p-2 text-sm"
          />
          {panError && (
            <span className="text-red-500 text-xs">{panError}</span>
          )}
        </div>
        {/* (Optional empty cell) */}
        <div />
      </div>

      {/* 3rd Row: Party Type, Party Category */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Party Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Party Type*</label>
          <select
            value={partyType}
            onChange={(e) => setPartyType(e.target.value)}
            className="border rounded p-2 text-sm"
          >
            <option value="">Select party</option>
            <option value="customer">Customer</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>
        {/* Party Category */}
        <div className="flex flex-col relative">
          <label className="text-sm font-medium mb-1">Party Category</label>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="border rounded p-2 text-left text-sm"
          >
            {selectedCategory}
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-lg z-10 mt-1">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectCategory(cat)}
                >
                  {cat}
                </div>
              ))}
              <div
                className="p-2 text-blue-600 font-semibold text-sm hover:bg-gray-100 cursor-pointer"
                onClick={handleCreateCategory}
              >
                + Create Category
              </div>
            </div>
          )}
        </div>
        {/* Empty cells to balance layout */}
        <div />
        <div />
      </div>

      {/* Address */}
      <h3 className="font-semibold">Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Billing Address */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Billing Address</label>
          <textarea
            placeholder="Enter billing address"
            onClick={() => setShowBillingModal(true)}
            readOnly
            value={billingAddress}
            className="border rounded p-2 text-sm h-24 resize-none cursor-pointer"
          />
        </div>
        {/* Shipping Address */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 flex justify-between items-center">
            Shipping Address
            <span className="text-xs flex items-center">
              <input
                type="checkbox"
                id="sameAsBilling"
                checked={sameAsBilling}
                onChange={handleSameAsBilling}
                className="mr-1"
              />
              <label htmlFor="sameAsBilling">Same as Billing</label>
            </span>
          </label>
          <textarea
            placeholder="Enter shipping address"
            onClick={() => setShowShippingModal(true)}
            readOnly
            value={shippingAddress}
            disabled={sameAsBilling}
            className="border rounded p-2 text-sm h-24 resize-none cursor-pointer"
          />
        </div>
      </div>

      {/* Credit Period & Credit Limit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credit Period */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Credit Period</label>
          <div className="flex border rounded overflow-hidden">
            <input
              type="text"
              placeholder="30"
              value={creditPeriod}
              onChange={handleCreditPeriodChange}
              className="p-2 w-full text-sm focus:outline-none"
            />
            <div className="p-2 bg-white border-l text-sm text-gray-700">
              Days
            </div>
          </div>
        </div>
        {/* Credit Limit */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Credit Limit</label>
          <input
            type="text"
            placeholder="₹ 0"
            value={creditLimit}
            onChange={handleCreditLimitChange}
            className="border rounded p-2 text-sm"
          />
        </div>
      </div>

      {/* Custom Fields (if any) */}
      {customFields.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Custom Fields</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customFields.map((field) => (
              <div key={field.id} className="flex flex-col">
                <label className="text-sm font-medium mb-1">{field.label}</label>
                <input
                  type="text"
                  placeholder={`Enter ${field.label}`}
                  value={field.value || ""}
                  onChange={(e) => handleUpdateCustomFieldValue(field.id, e.target.value)}
                  className="border rounded p-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
            <input
              type="text"
              placeholder="Ex: Snacks"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-3 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!newCategory.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

     {/* Billing Address Modal */}
{showBillingModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
      <h3 className="text-lg font-semibold mb-4">Add Billing Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Street Address*</label>
          <input
            type="text"
            placeholder="Enter Street Address"
            value={billingStreet}
            onChange={(e) => setBillingStreet(e.target.value)}
            className="p-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">State</label>
          <select
            value={billingState}
            onChange={(e) => setBillingState(e.target.value)}
            className="p-2 border border-gray-300 rounded text-sm"
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
          <label className="font-medium text-sm mb-1">Pincode</label>
          <input
            type="text"
            placeholder="Enter pin code"
            value={billingPincode}
            onChange={handleBillingPincodeChange}
            className="p-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">City</label>
          <input
            type="text"
            placeholder="Enter City"
            value={billingCity}
            onChange={(e) => setBillingCity(e.target.value)}
            className="p-2 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowBillingModal(false)}
          className="px-3 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
         onClick={saveBillingAddress}
          className="px-3 py-2 bg-blue-500 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

{/* Shipping Address Modal */}
{showShippingModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
      <h3 className="text-lg font-semibold mb-4">Add Shipping Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Street Address*</label>
          <input
            type="text"
            placeholder="Enter Street Address"
            value={shippingStreet}
            onChange={(e) => setShippingStreet(e.target.value)}
            disabled={sameAsBilling}
            className="p-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">State</label>
          <select
            value={shippingState}
            onChange={(e) => setShippingState(e.target.value)}
            disabled={sameAsBilling}
            className="p-2 border border-gray-300 rounded text-sm"
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
          <label className="font-medium text-sm mb-1">Pincode</label>
          <input
            type="text"
            placeholder="Enter pin code"
            value={shippingPincode}
            onChange={handleShippingPincodeChange}
            disabled={sameAsBilling}
            className="p-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">City</label>
          <input
            type="text"
            placeholder="Enter City"
            value={shippingCity}
            onChange={(e) => setShippingCity(e.target.value)}
            disabled={sameAsBilling}
            className="p-2 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowShippingModal(false)}
          className="px-3 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          onClick={saveShippingAddress}
          className="px-3 py-2 bg-blue-500 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}



      {/* Custom Fields Modal */}
      {showCustomFieldsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Party Custom Fields</h3>
            <div className="space-y-2 mb-4">
              <label className="font-medium text-sm">Field Name</label>
              <input
                type="text"
                placeholder="Ex: License Number"
                value={tempFieldName}
                onChange={(e) => setTempFieldName(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full text-sm"
              />
            </div>
            <button
              className="mb-4 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition text-sm"
              onClick={handleAddCustomField}
            >
              + Add New Field
            </button>
            {customFields.length > 0 && (
              <div className="border border-gray-200 p-3 rounded bg-gray-50 mb-4 max-h-60 overflow-y-auto">
                {customFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex justify-between items-center mb-2 text-sm"
                  >
                    <span>{field.label}</span>
                    <button
                      className="text-red-500"
                      onClick={() => handleRemoveField(field.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseCustomFields}
                className="px-3 py-2 bg-gray-300 rounded text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSaveCustomFields}
                className="px-3 py-2 bg-blue-500 text-white rounded text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};
export default CreateParty;
