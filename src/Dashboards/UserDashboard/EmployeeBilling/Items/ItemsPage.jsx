import React, { useState, useEffect,useRef  } from "react";
import { Link, useLocation } from "react-router-dom"; // existing import (not removed)
import { Info, Layout, LayoutGrid, Barcode, Search } from "lucide-react";
// NEW: Import jsPDF and autoTable for PDF generation
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import id from "faker/lib/locales/id_ID";
import { useNavigate } from "react-router-dom"


const baseurl = process.env.REACT_APP_BASEAPI;


const MeasuringUnits = [
  "UNT","UGS","KGS","LTR","AAN","ACS","AC","AMP","BAG","BAL","BALL","BAR","BOU","BLISTER","BOLUS","BK","BOR","BTL","BOX","BRASS","BRICK","BCK","BKL","BUN","BDL","CAN","CAP","CPS","CT","CTS","CARD","CTN","CASE","CMS","CNT","CHAIN","CHOKA","CHUDI","CLT","COIL","CONT","COPY","COURSE","CRT","CRM","CCM","CUFT","CFM","CFT","CBM","CUP","CV","DAILY","DANGLER","DAY","DEZ","DOZ","DROP","DRM","EA","EACH","FT","FT2","FIT","FLD","FREE","FTS","GEL","GLS","GMS","GGR","GRS","GYD","HF","HEGAR","HA","HMT","HRS","INJECTION","IN","ITEM ID","JAR","JL","JO","JHL","JOB","KT","KGS","KLR","KME","KMS","KVA","KW","KIT","LAD","LENG","LBS","LTR","LOT","LS","MAN-DAY","MRK","MBPS","MTR","MMBTU","MTON","MG","M/C","MLG","MLT","MM","MINS","MONTH","MON","MORA","NIGHT","NONE","NOS","OINT","OTH","OR","PKG","PKT","PAC","PAD","PADS","PAGE","PAIR","PRS","PATTA","PAX","PER","PWP","PERSON","PET","PHILE","PCS","PLT","PT","PRT","POCH","QUAD","QTY","QTL","RTI","REAM","REEL","RIM","ROL","ROOM","RFT","RMT","RS","SAC","SEC","SEM","SSN","SET","SHEET","SKINS","SLEVES","SPRAY","SQCM","SQF","SQY","SARAM","STICKER","STONE","STRP","SYRP","TBS","TGM","TKT","TIN","TON","TRY","TRIP","TRK","TUB","UNT","UGS","VIAL","W","WEEK","YDS","YRS"
];

// ----------------------
// Excel and PDF utilities
// ----------------------
const handleDownloadExcel = (reportData) => {
  if (!reportData || !reportData.length) {
    alert("No data to download.");
    return;
  }

  
  const headers = Object.keys(reportData[0]);
  const csvRows = [];
  csvRows.push(headers.join(","));
  reportData.forEach((row) => {
    const values = headers.map((header) => {
      let val = row[header];
      if (typeof val === "string") {
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      }
      return val;
    });
    csvRows.push(values.join(","));
  });
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "report.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

const handleDownloadPDF = (reportData) => {
  if (!reportData || !reportData.length) {
    alert("No data to download.");
    return;
  }
  const doc = new jsPDF("p", "pt", "a4");
  doc.setFontSize(12);
  doc.text("Business Name", 40, 40);
  doc.text("Phone no: 7010738782", 40, 60);
  doc.setFontSize(14);
  doc.text("Rate List", 400, 40);
  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Date: ${currentDate}`, 400, 60);
  doc.text(`Total Items: ${reportData.length}`, 40, 80);

  const startYPosition = 100;
  const customHead = [["Name", "Code", "MRP", "Price"]];
  const customBody = reportData.map((item) => {
    const normalizedType = item.type?.toLowerCase() || "";
    const name =
      normalizedType === "product"
        ? item.itemName || item.item_name || "-"
        : item.serviceName || item.service_name || "-";
    const code =
      normalizedType === "product"
        ? item.itemCode || item.item_code || "-"
        : item.serviceCode || item.service_code || "SRV";
    const mrp = item.mrp || 0.0;
    const price =
      item.salesPrice ||
      item.sales_price_with_tax ||
      item.sales_price_without_tax ||
      0.0;
    return [name, code, mrp, price];
  });

  autoTable(doc, {
    startY: startYPosition,
    head: customHead,
    body: customBody,
    theme: "grid",
    headStyles: { fillColor: [220, 220, 220], textColor: 0 },
    margin: { left: 40, right: 40 },
  });

  const headers = [Object.keys(reportData[0])];
  const data = reportData.map((item) => Object.values(item));
  autoTable(doc, {
    head: headers,
    body: data,
    startY: doc.lastAutoTable.finalY + 50,
    margin: { left: 9999, right: 9999 },
  });
  doc.save("report.pdf");
};

// ------------------------------------------------
// Helper functions to safely extract item data
// ------------------------------------------------
function getItemName(item) {
  if (!item) return "";
  const normalizedType = item.type?.toLowerCase() || "";
  if (normalizedType === "product") {
    return item.itemName || item.item_name || "";
  } else if (normalizedType === "service") {
    return item.serviceName || item.service_name || "";
  }
  return "";
}

function getItemStockQty(item) {
  if (!item) return 0;
  const normalizedType = item.type?.toLowerCase() || "";
  if (normalizedType === "product") {
    const stockVal = item.openingStock ?? item.opening_stock;
    const parsed = parseFloat(stockVal);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

const ItemsPage = () => {
  // ------------------------------------------------
  // 1) Items from localStorage => "items"
  // ------------------------------------------------
  const navigate = useNavigate();

  const handleRowClick = (index, id) => {
    navigate(`/employee/billing/itemdetails/${id}`);
  };
  
  const [items, setItems] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ------------------------------------------------
  // 2) Categories from localStorage => "itemCategories"
  // ------------------------------------------------
  const [categories, setCategories] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("itemCategories")) || [];
    let finalCats = stored.map((c) =>
      typeof c === "string" ? { name: c, isPlaceholder: false } : c
    );
    if (!finalCats.some((cat) => cat.isPlaceholder)) {
      finalCats = [{ name: "Select Category", isPlaceholder: true }, ...finalCats];
    }
    return finalCats;
  });

  useEffect(() => {
    const withoutPlaceholder = categories.filter((c) => !c.isPlaceholder);
    localStorage.setItem("itemCategories", JSON.stringify(withoutPlaceholder));
  }, [categories]);

  const updateCategories = (newCats) => {
    setCategories(newCats);
  };

  // ------------------------------------------------
  // 3) Fetch items from API (product-service-items)
  // ------------------------------------------------
const hasHandledEdit = useRef(false);

useEffect(() => {
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${baseurl}/item/api/product-service-items/`);
      if (Array.isArray(response.data)) {
        setListItems(response.data);
      } else {
        console.error("❌ API response data is not an array.", response.data);
        setListItems([]);
      }
    } catch (error) {
      console.error("❌ Error fetching items:", error.message);
      setListItems([]);
    }
  };

  fetchItems();
}, [baseurl]);

useEffect(() => {
  if (hasHandledEdit.current) return;

  const storedEditId = localStorage.getItem("editItemId");
  console.log("📦 Stored Edit ID:", storedEditId);

  if (storedEditId && listItems.length > 0) {
    const itemToEdit = listItems.find((it) => String(it.id) === String(storedEditId));
    if (itemToEdit) {
      setIsEditing(true);
      setEditItemIndex(listItems.findIndex((it) => String(it.id) === String(storedEditId)));
      setItemType(itemToEdit.type === "service" ? "Service" : "Product");
      setShowCreateItemModal(true);

      if (itemToEdit.type === "service") {
        setServiceName(itemToEdit.service_name || "");
        setServiceCode(itemToEdit.service_code || "");
        setSalesPrice(itemToEdit.sales_price_with_tax || itemToEdit.sales_price_without_tax || "");
        setGstTaxRate(itemToEdit.gst_tax_rate || "None");
        setDescription(itemToEdit.description || "");
        setMeasuringUnit(itemToEdit.measuring_unit || "");
      } else {
        setItemName(itemToEdit.item_name || "");
        setItemCode(itemToEdit.product_code || "");
        setSalesPrice(itemToEdit.sales_price_with_tax || itemToEdit.sales_price_without_tax || "");
        setPurchasePrice(itemToEdit.purchase_price || "");
        setHsnCode(itemToEdit.hsn_code || "");
        setStockDescription(itemToEdit.description || "");
        setOpeningStock(itemToEdit.opening_stock || "");
        setAsOfDate(itemToEdit.as_of_date || "");
        setGstTaxRate(itemToEdit.gst_tax || "None");
        setMeasuringUnit(itemToEdit.measuring_unit || "");
      }

      hasHandledEdit.current = true;
      localStorage.removeItem("editItemId");
    }
  }
}, [listItems]);


  

  // ------------------------------------------------
  // 4) Edit Category Modal
  // ------------------------------------------------
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const handleEditCategory = (index) => {
    setEditingCategoryIndex(index);
    setEditCategoryName(categories[index].name);
    setSearchCatDropdownOpen(false);
    setCreateItemCatDropdownOpen(false);
  };

 const handleUpdateCategory = async () => {
  if (editingCategoryIndex !== null && editCategoryName.trim()) {
    const category = categories[editingCategoryIndex];
    const categoryId = category.id;
    const updatedCategory = {
      name: editCategoryName,
      isPlaceholder: false,
    };

    let updateUrl = "";
    if (category.type === "product") {
      updateUrl = `${baseurl}/item/product-item/${categoryId}/update/`;
    } else if (category.type === "service") {
      updateUrl = `${baseurl}/item/service-item/${categoryId}/update/`;
    } else {
      console.error("Unknown category type:", category.type);
      return;
    }

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await axios.put(
        updateUrl,
        updatedCategory,
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );

      const updated = [...categories];
      updated[editingCategoryIndex] = response.data; // use updated data
      updateCategories(updated);

      setEditingCategoryIndex(null);
      setEditCategoryName("");
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("Category update failed.");
    }
  }
};


  // ------------------------------------------------
  // 5) Search row category dropdown
  // ------------------------------------------------
  const [searchCatDropdownOpen, setSearchCatDropdownOpen] = useState(false);
  const [searchSelectedCategory, setSearchSelectedCategory] = useState("Select Category");

  const handleToggleSearchCatDropdown = () => {
    setSearchCatDropdownOpen(!searchCatDropdownOpen);
  };

  const handleSelectSearchCategory = (catName) => {
    setSearchSelectedCategory(catName);
    setSearchCatDropdownOpen(false);
  };

  const [showAddCatModalGlobal, setShowAddCatModalGlobal] = useState(false);
  const [newCatNameGlobal, setNewCatNameGlobal] = useState("");

  const handleOpenAddCatModalGlobal = () => {
    setShowAddCatModalGlobal(true);
    setNewCatNameGlobal("");
    setSearchCatDropdownOpen(false);
  };

  const handleCloseAddCatModalGlobal = () => {
    setShowAddCatModalGlobal(false);
    setNewCatNameGlobal("");
  };

  const handleSaveNewCatGlobal = () => {
    if (newCatNameGlobal.trim()) {
      const newCat = { name: newCatNameGlobal };
      const updated = [...categories, newCat];
      updateCategories(updated);
      setSearchSelectedCategory(newCatNameGlobal);
      setNewCatNameGlobal("");
      setShowAddCatModalGlobal(false);
    }
  };

  // ------------------------------------------------
  // 6) Create Item Modal
  // ------------------------------------------------
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [itemType, setItemType] = useState("Product");
  const [createItemCatDropdownOpen, setCreateItemCatDropdownOpen] = useState(false);
  const [itemCat, setItemCat] = useState("Select Category");

  // Basic details: Product vs. Service
  const [itemName, setItemName] = useState("");
  const [openingStock, setOpeningStock] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [showOnline, setShowOnline] = useState(false);
  const [salesPrice, setSalesPrice] = useState("");
  const [withTax, setWithTax] = useState(true);
  const [gstTaxRate, setGstTaxRate] = useState("");
  const [getTax, setGettax] = useState([]); 
  const [measuringUnit, setMeasuringUnit] = useState("");
  const [withoutTax, setWithoutTax] = useState(true);

  // Product => Stock
  const [itemCode, setItemCode] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [enableLowStockWarning, setEnableLowStockWarning] = useState(false);
  const [asOfDate, setAsOfDate] = useState("");
  const [stockDescription, setStockDescription] = useState("");
  const [stockFile, setStockFile] = useState(null);
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);
  const [barcodeImageUrl, setBarcodeImageUrl] = useState("");

  // Product => Pricing
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseWithTax, setPurchaseWithTax] = useState(true);

  // Service => Other
  const [sacCode, setSacCode] = useState("");
  const [description, setDescription] = useState("");

  // Nested “Add Category” modal inside Create Item
  const [showAddCatModalInCreateItem, setShowAddCatModalInCreateItem] = useState(false);
  const [newCatNameCreateItem, setNewCatNameCreateItem] = useState("");

  const handleOpenAddCatModalInCreateItem = () => {
    setShowAddCatModalInCreateItem(true);
    setNewCatNameCreateItem("");
    setCreateItemCatDropdownOpen(false);
  };
  const handleCloseAddCatModalInCreateItem = () => {
    setShowAddCatModalInCreateItem(false);
    setNewCatNameCreateItem("");
  };
  const handleSaveNewCatInCreateItem = () => {
    if (newCatNameCreateItem.trim()) {
      const newCat = { name: newCatNameCreateItem };
      const updated = [...categories, newCat];
      updateCategories(updated);
      setItemCat(newCatNameCreateItem);
      setNewCatNameCreateItem("");
      setShowAddCatModalInCreateItem(false);
    }
  };

  
  const [isEditing, setIsEditing] = useState(false);
  const [editItemIndex, setEditItemIndex] = useState(null);

  const handleOpenCreateItem = () => {
    setShowCreateItemModal(true);
    setActiveTab(0);
    setItemType("Product");
    setItemCat("Select Category");
    setItemName("");
    setOpeningStock("");
    setServiceName("");
    setServiceCode("");
    setShowOnline(false);
    setSalesPrice("");
    setWithTax(true);
    setGstTaxRate("None");
    setMeasuringUnit("PCS");
    setItemCode("");
    setHsnCode("");
    setEnableLowStockWarning(false);
    setAsOfDate("");
    setStockDescription("");
    setStockFile(null);
    setPurchasePrice("");
    setPurchaseWithTax(true);
    setSacCode("");
    setDescription("");
    setIsEditing(false);
    setEditItemIndex(null);
  };

  const handleCloseCreateItem = () => {
    setShowCreateItemModal(false);
    setIsEditing(false);
    setEditItemIndex(null);
  };

  // ------------------------------------------------
  // Updated handleEditItem:
  // Now it remains in the same “detail view” and simply opens the edit form
  // (create-item modal) without requiring the user to press “Back.”
  // ------------------------------------------------
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return undefined;
  }

  const generateBarcode = async () => {
    try {
      const response = await fetch(`${baseurl}/item/generate-barcode/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorData}`);
      }
      const data = await response.json();
      setBarcodeImageUrl(data.barcode_image_url);
      setBarcodeGenerated(true);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  useEffect(() => {
    const fetch_GST_TAX_CHOICES = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASEAPI}/item/gst-taxes/`);
        const data = res.data;

        const formatted = data.map((item) => ({
          label: item.name,
          value: item.id,
          rate: parseFloat(item.gst_rate),
          cess_rate: parseFloat(item.cess_rate) || 0,
        }));

        setGettax(formatted);
      } catch (error) {
        console.error("Failed to fetch tax options:", error);
      }
    };

    fetch_GST_TAX_CHOICES();
  }, []);

 const handleSaveItem = async () => {
  const finalCat = typeof itemCat === "object" ? itemCat.name : itemCat;
  const salesPriceWithTax = withTax ? salesPrice : null;
  const salesPriceWithoutTax = !withTax ? salesPrice : null;
  const formattedAsOfDate = asOfDate ? asOfDate.split("T")[0] : null;

  try {
    const csrfToken = getCookie("csrftoken");
    const jsonHeaders = csrfToken
      ? { "X-CSRFToken": csrfToken, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };

    if (isEditing) {
      const id = localStorage.getItem("editItemId");
      console.log("📝 Retrieved editItemId before saving:", id);

      if (!id) {
        console.error("Item ID not found for editing.");
        alert("Something went wrong. Item not found for editing.");
        return;
      }

      if (itemType === "Service") {
        const serviceData = {
          service_name: serviceName,
          gst_tax_rate: gstTaxRate,
          measuring_unit: measuringUnit,
          service_code: serviceCode,
          sales_price_with_tax: salesPriceWithTax,
          sales_price_without_tax: salesPriceWithoutTax,
          sac_code: sacCode,
          description,
        };

        await axios.put(
          `${baseurl}/item/service-item/${id}/update/`,
          serviceData,
          { headers: jsonHeaders }
        );

        const updatedItems = items.map(item =>
          String(item.id) === String(id)
            ? { ...item, ...serviceData, type: "service" }
            : item
        );
        setItems(updatedItems);

      } else if (itemType === "Product") {
        const formData = new FormData();
        formData.append("item_name", itemName);
        formData.append("product_code", itemCode);
        formData.append("gst_tax", gstTaxRate);
        formData.append("measuring_unit", measuringUnit);
        formData.append("opening_stock", openingStock);
        formData.append("stock_threshold", 0);
        formData.append("low_stock_warning", enableLowStockWarning);
        formData.append("description", stockDescription);
        formData.append("as_of_date", formattedAsOfDate);
        formData.append("purchase_price", purchasePrice);
        formData.append("sales_price_with_tax", salesPriceWithTax || "");
        formData.append("sales_price_without_tax", salesPriceWithoutTax || "");
        formData.append("final_total", salesPriceWithTax || salesPriceWithoutTax);
        formData.append("hsn_code", hsnCode);
        if (stockFile) {
          formData.append("barcode_image", stockFile);
        }

        await axios.put(
          `${baseurl}/item/product-item/${id}/update/`,
          formData,
          {
            headers: {
              "X-CSRFToken": csrfToken,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        const updatedItems = items.map(item =>
          String(item.id) === String(id)
            ? {
                ...item,
                item_name: itemName,
                product_code: itemCode,
                gst_tax: gstTaxRate,
                measuring_unit: measuringUnit,
                opening_stock: openingStock,
                stock_threshold: 0,
                low_stock_warning: enableLowStockWarning,
                description: stockDescription,
                as_of_date: formattedAsOfDate,
                purchase_price: purchasePrice,
                sales_price_with_tax: salesPriceWithTax || "",
                sales_price_without_tax: salesPriceWithoutTax || "",
                final_total: salesPriceWithTax || salesPriceWithoutTax,
                hsn_code: hsnCode,
                barcode_image: stockFile || null,
                type: "product",
              }
            : item
        );
        setItems(updatedItems);
      }

      // ✅ Clear ID after successful update
      localStorage.removeItem("editItemId");

    } else {
      // Create Mode
      if (itemType === "Service") {
        const serviceData = {
          service_name: serviceName,
          gst_tax_rate: gstTaxRate,
          measuring_unit: measuringUnit,
          service_code: serviceCode,
          sales_price_with_tax: salesPriceWithTax,
          sales_price_without_tax: salesPriceWithoutTax,
          sac_code: sacCode,
          description,
        };

        const response = await axios.post(
          `${baseurl}/item/service-item/create/`,
          serviceData,
          { headers: jsonHeaders }
        );

        const newService = response.data;
        setItems((prev) => [...prev, { ...newService, type: "service" }]);

      } else if (itemType === "Product") {
        const formData = new FormData();
        formData.append("item_name", itemName);
        formData.append("product_code", itemCode);
        formData.append("gst_tax", gstTaxRate);
        formData.append("measuring_unit", measuringUnit);
        formData.append("opening_stock", openingStock);
        formData.append("stock_threshold", 0);
        formData.append("low_stock_warning", enableLowStockWarning);
        formData.append("description", stockDescription);
        formData.append("as_of_date", formattedAsOfDate);
        formData.append("purchase_price", purchasePrice);
        formData.append("sales_price_with_tax", salesPriceWithTax || "");
        formData.append("sales_price_without_tax", salesPriceWithoutTax || "");
        formData.append("final_total", salesPriceWithTax || salesPriceWithoutTax);
        formData.append("hsn_code", hsnCode);
        if (stockFile) {
          formData.append("barcode_image", stockFile);
        }

        const response = await axios.post(
          `${baseurl}/item/product-item/create/`,
          formData,
          {
            headers: {
              "X-CSRFToken": csrfToken,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        const newProduct = response.data;
        setItems((prev) => [...prev, { ...newProduct, type: "product" }]);
      }
    }

    handleCloseCreateItem(); // ✅ Close modal after save
  } catch (error) {
    if (error.response) {
      alert(`Error: ${error.response.status} - ${error.response.data.message || "An error occurred."}`);
    } else if (error.request) {
      alert("Request failed. Please check your connection and try again.");
    } else {
      alert("Unexpected error. Please try again later.");
    }
    console.error(error);
  }
};

  // ------------------------------------------------
  // Left column => tabs for Create Item Modal
  // ------------------------------------------------
  const renderLeftColumn = () => {
    const baseButtonClasses =
      "w-full text-left py-2 px-4 rounded-lg transition-colors duration-200";
    const activeButtonClasses = "bg-[#7B68EE] text-white";
    const inactiveButtonClasses = "bg-gray-100 text-gray-600 hover:bg-gray-200";

    if (itemType === "Product") {
      return (
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <button
            className={`${baseButtonClasses} ${
              activeTab === 0 ? activeButtonClasses : inactiveButtonClasses
            }`}
            onClick={() => setActiveTab(0)}
          >
            Basic Details
          </button>
          <div className="text-xs text-gray-400 px-4">* Advance Details</div>
          <button
            className={`${baseButtonClasses} ${
              activeTab === 1 ? activeButtonClasses : inactiveButtonClasses
            }`}
            onClick={() => setActiveTab(1)}
          >
            Stock Details
          </button>
          <button
            className={`${baseButtonClasses} ${
              activeTab === 2 ? activeButtonClasses : inactiveButtonClasses
            }`}
            onClick={() => setActiveTab(2)}
          >
            Pricing Details
          </button>
          <button
            className={`${baseButtonClasses} ${
              activeTab === 3 ? activeButtonClasses : inactiveButtonClasses
            }`}
            onClick={() => setActiveTab(3)}
          >
            Party Wise Rates
          </button>
          <button
            className={`${baseButtonClasses} ${
              activeTab === 4 ? activeButtonClasses : inactiveButtonClasses
            }`}
            onClick={() => setActiveTab(4)}
          >
            Custom Fields
          </button>
        </div>
      );
    } else {
      return (
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <button
            className={`${baseButtonClasses} ${
              activeTab === 0 ? activeButtonClasses : inactiveButtonClasses
            }`}
            onClick={() => setActiveTab(0)}
          >
            Basic Details
          </button>
          <div className="text-xs text-gray-400 px-4">* Advance Details</div>
          <button
            className={`${baseButtonClasses} ${
              activeTab === 1 ? activeButtonClasses : inactiveButtonClasses
            }`}
            onClick={() => setActiveTab(1)}
          >
            Other Details
          </button>
          <button
            className={`${baseButtonClasses} ${
              activeTab === 2 ? activeButtonClasses : inactiveButtonClasses
            }`}
            onClick={() => setActiveTab(2)}
          >
            Party Wise Rates
          </button>
          <button
            className={`${baseButtonClasses} ${
              activeTab === 3 ? activeButtonClasses : inactiveButtonClasses
            }`}
            onClick={() => setActiveTab(3)}
          >
            Custom Fields
          </button>
        </div>
      );
    }
  };

  // ------------------------------------------------
  // Right column => content for Create Item Modal
  // ------------------------------------------------
  const renderBasicDetailsForProduct = () => {
    return (
      <div className="space-y-6">
        {/* Row 1: Item Type & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Type *</label>
            <div className="flex space-x-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="itemType"
                  value="Product"
                  checked={itemType === "Product"}
                  onChange={() => {
                    setItemType("Product");
                    setActiveTab(0);
                  }}
                  className="mr-1"
                />
                Product
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="itemType"
                  value="Service"
                  checked={itemType === "Service"}
                  onChange={() => {
                    setItemType("Service");
                    setActiveTab(0);
                  }}
                  className="mr-1"
                />
                Service
              </label>
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Category</label>
            <button
              className="w-full border rounded p-2 text-left text-sm"
              onClick={() => setCreateItemCatDropdownOpen(!createItemCatDropdownOpen)}
            >
              {typeof itemCat === "object" ? itemCat.name : itemCat}
            </button>
            {createItemCatDropdownOpen && (
              <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
                {categories.map((cat, idx) => (
                  <li
                    key={idx}
                    className="p-2 text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setItemCat(cat);
                      setCreateItemCatDropdownOpen(false);
                    }}
                  >
                    {cat.name}
                  </li>
                ))}
                <li
                  className="p-2 text-sm cursor-pointer font-semibold text-[#7B68EE] hover:bg-gray-100"
                  onClick={handleOpenAddCatModalInCreateItem}
                >
                  + Add Category
                </li>
              </ul>
            )}
          </div>
        </div>
        {/* Row 2: Item Name & Show Online */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Name *</label>
            <input
              type="text"
              placeholder="ex: Maggie 20gm"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
            {!itemName.trim() && (
              <span className="text-xs text-red-500">Please enter the item name</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Show Item in Online Store
            </label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                checked={showOnline}
                onChange={(e) => setShowOnline(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="ml-2 text-sm">Enable</span>
            </div>
          </div>
        </div>
        {/* NEW Row 2.5: Opening Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Opening Stock</label>
            <input
              type="number"
              placeholder="Enter opening stock"
              value={openingStock}
              onChange={(e) => setOpeningStock(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>
        {/* Row 2.6: Measuring Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-medium mb-1">Measuring Unit</label>
          <select
            value={measuringUnit}
            onChange={(e) => setMeasuringUnit(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          >
            {MeasuringUnits.map((unit, index) => (
              <option key={index} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
        {/* Row 3: Sales Price */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sales Price *</label>
            <div className="flex border rounded">
              <span className="flex items-center px-2 text-sm">₹</span>
              <input
                type="text"
                placeholder="200"
                value={salesPrice}
                onChange={(e) => setSalesPrice(e.target.value)}
                className="w-full p-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex space-x-4 mt-1 text-sm">
          <label className="flex items-center">
            <input
              type="radio"
              checked={withTax}
              onChange={() => setWithTax(true)}
              className="mr-1"
            />
            With Tax
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={!withTax}
              onChange={() => setWithTax(false)}
              className="mr-1"
            />
            No Tax
          </label>
        </div>
        <div>
      <label className="block text-sm font-medium mb-1">GST Tax Rate (%)</label>
      <select
        value={gstTaxRate}
        onChange={(e) => setGstTaxRate(e.target.value)}
        className="w-full border rounded p-2 text-sm"
      >
        <option value="">None</option>
        {getTax.map((tax) => (
          <option key={tax.value} value={tax.value}>
            {tax.label}
          </option>
        ))}
      </select>
    </div>
      </div>
    );
  };

  const renderStockDetailsForProduct = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Item Code</label>
            <input
              type="text"
              placeholder="ex: ITM12549"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
            <button
              onClick={generateBarcode}
              className="absolute right-2 bottom-2 border rounded px-2 py-1 text-xs flex items-center space-x-1 hover:bg-gray-100"
            >
              <Barcode size={14} />
              <span>{barcodeGenerated ? "Show Barcode" : "Generate"}</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">HSN code</label>
            <input
              type="text"
              placeholder="ex: 4010"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">As of Date</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <div className="flex items-center">
            <label className="block text-sm font-medium mb-1 mr-2">
              Low stock warning
            </label>
            <input
              type="checkbox"
              checked={enableLowStockWarning}
              onChange={(e) => setEnableLowStockWarning(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Enter Description"
            rows={3}
            value={stockDescription}
            onChange={(e) => setStockDescription(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload Image</label>
          <input
            type="file"
            onChange={(e) => setStockFile(e.target.files[0] || null)}
            className="block text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Max 5 images, PNG/JPEG, up to 5 MB
          </p>
        </div>
        {barcodeGenerated && barcodeImageUrl && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Generated Barcode:</h3>
            <img src={barcodeImageUrl} alt="Barcode" className="w-32 h-32" />
          </div>
        )}
      </div>
    );
  };

  const renderPricingDetailsForProduct = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sales Price</label>
            <div className="flex border rounded">
              <span className="flex items-center px-2 text-sm">₹</span>
              <input
                type="text"
                placeholder="200"
                value={salesPrice}
                onChange={(e) => setSalesPrice(e.target.value)}
                className="w-full p-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      <div>
      <label className="block text-sm font-medium mb-1">GST Tax Rate (%)</label>
      <select
        value={gstTaxRate}
        onChange={(e) => setGstTaxRate(e.target.value)}
        className="w-full border rounded p-2 text-sm"
      >
        <option value="">None</option>
        {getTax.map((tax) => (
          <option key={tax.value} value={tax.value}>
            {tax.label}
          </option>
        ))}
      </select>
    </div>
      </div>
    );
  };

  const renderPartyWiseForProduct = () => (
    <div className="text-sm p-4">Party Wise Rates (Product) content here...</div>
  );
  const renderCustomForProduct = () => (
    <div className="text-sm p-4">Custom Fields (Product) content here...</div>
  );

  // Service detail tabs
  const renderBasicDetailsForService = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Type *</label>
            <div className="flex space-x-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="itemType"
                  value="Product"
                  checked={itemType === "Product"}
                  onChange={() => {
                    setItemType("Product");
                    setActiveTab(0);
                  }}
                  className="mr-1"
                />
                Product
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="itemType"
                  value="Service"
                  checked={itemType === "Service"}
                  onChange={() => {
                    setItemType("Service");
                    setActiveTab(0);
                  }}
                  className="mr-1"
                />
                Service
              </label>
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Category</label>
            <button
              className="w-full border rounded p-2 text-left text-sm"
              onClick={() => setCreateItemCatDropdownOpen(!createItemCatDropdownOpen)}
            >
              {typeof itemCat === "object" ? itemCat.name : itemCat}
            </button>
            {createItemCatDropdownOpen && (
              <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
                {categories.map((cat, idx) => (
                  <li
                    key={idx}
                    className="p-2 text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setItemCat(cat);
                      setCreateItemCatDropdownOpen(false);
                    }}
                  >
                    {cat.name}
                  </li>
                ))}
                <li
                  className="p-2 text-sm cursor-pointer font-semibold text-[#7B68EE] hover:bg-gray-100"
                  onClick={handleOpenAddCatModalInCreateItem}
                >
                  + Add Category
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Name *</label>
            <input
              type="text"
              placeholder="ex: Mobile service"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
            {!serviceName.trim() && (
              <span className="text-xs text-red-500">Please enter the service name</span>
            )}
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Service Code *</label>
            <input
              type="text"
              placeholder="ex: SRV_0001"
              value={serviceCode}
              onChange={(e) => setServiceCode(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Show Item in Online Store
            </label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                checked={showOnline}
                onChange={(e) => setShowOnline(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="ml-2 text-sm">Enable</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sales Price *</label>
            <input
              type="text"
              placeholder="ex: ₹200"
              value={salesPrice}
              onChange={(e) => setSalesPrice(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
            <div className="flex space-x-4 mt-1 text-sm">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={withTax}
                  onChange={() => setWithTax(true)}
                  className="mr-1"
                />
                With Tax
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!withTax}
                  onChange={() => setWithTax(false)}
                  className="mr-1"
                />
                No Tax
              </label>
            </div>
          </div>
          <div>
      <label className="block text-sm font-medium mb-1">GST Tax Rate (%)</label>
      <select
        value={gstTaxRate}
        onChange={(e) => setGstTaxRate(e.target.value)}
        className="w-full border rounded p-2 text-sm"
      >
        <option value="">None</option>
        {getTax.map((tax) => (
          <option key={tax.value} value={tax.value}>
            {tax.label}
          </option>
        ))}
      </select>
    </div>
        </div>
      </div>
    );
  };

  const renderOtherDetailsForService = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SAC code</label>
            <input
              type="text"
              placeholder="ex: 9983"
              value={sacCode}
              onChange={(e) => setSacCode(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button className="px-2 py-1 border rounded text-sm flex items-center space-x-1 hover:bg-gray-100">
              <Search size={14} />
              <span>Find SAC Code</span>
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Enter Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
        </div>
      </div>
    );
  };

  const renderPartyWiseForService = () => (
    <div className="text-sm p-4">Party Wise Rates (Service) content here...</div>
  );
  const renderCustomForService = () => (
    <div className="text-sm p-4">Custom Fields (Service) content here...</div>
  );

  const renderRightContent = () => {
    if (itemType === "Product") {
      switch (activeTab) {
        case 0:
          return renderBasicDetailsForProduct();
        case 1:
          return renderStockDetailsForProduct();
        case 2:
          return renderPricingDetailsForProduct();
        case 3:
          return renderPartyWiseForProduct();
        case 4:
          return renderCustomForProduct();
        default:
          return null;
      }
    } else {
      switch (activeTab) {
        case 0:
          return renderBasicDetailsForService();
        case 1:
          return renderOtherDetailsForService();
        case 2:
          return renderPartyWiseForService();
        case 3:
          return renderCustomForService();
        default:
          return null;
      }
    }
  };

  // ------------------------------------------------
  // 8) Pagination on main table (12 items per page)
  // ------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalItems = listItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTableData = listItems.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // ------------------------------------------------
  // 9) The original main table + filters
  // ------------------------------------------------
  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState("");

  const renderMainContent = () => {
    return (
      <div className="h-screen overflow-auto">
        <div className="max-w-7xl mx-auto p-4 space-y-6 font-sans">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Items</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setReportsOpen(!reportsOpen)}
                  className="px-3 py-1 bg-[#7B68EE] text-white rounded text-sm hover:bg-[#6959CD]"
                >
                  Reports
                </button>
                {reportsOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow text-sm">
                    <button
                      className="block w-full text-left px-4 py-2 text-[#7B68EE] hover:bg-[#7B68EE] hover:text-white"
                      onClick={() => {
                        setSelectedReport("rate-list");
                        setReportsOpen(false);
                      }}
                    >
                      Rate List
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#7B68EE] hover:bg-[#7B68EE] hover:text-white"
                      onClick={() => {
                        setSelectedReport("stock-summary");
                        setReportsOpen(false);
                      }}
                    >
                      Stock Summary
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#7B68EE] hover:bg-[#7B68EE] hover:text-white"
                      onClick={() => {
                        setSelectedReport("low-stock-summary");
                        setReportsOpen(false);
                      }}
                    >
                      Low Stock Summary
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#7B68EE] hover:bg-[#7B68EE] hover:text-white"
                      onClick={() => {
                        setSelectedReport("item-sales-summary");
                        setReportsOpen(false);
                      }}
                    >
                      Item Sales Summary
                    </button>
                  </div>
                )}
              </div>
              <button className="p-2 border rounded">
                <Layout size={16} />
              </button>
              <button className="p-2 border rounded">
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 border rounded p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock Value</span>
                <Info size={16} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold">₹ 0</h3>
            </div>
            <div className="flex-1 border rounded p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Low Stock</span>
                <Info size={16} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold">0</h3>
            </div>
          </div>

          {/* Search / Filters */}
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search item"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded p-2 text-sm"
              />
              <div className="relative">
                <button
                  className="border rounded p-2 text-sm"
                  onClick={handleToggleSearchCatDropdown}
                >
                  {searchSelectedCategory}
                </button>
                {searchCatDropdownOpen && (
                  <ul className="absolute z-10 mt-1 w-48 bg-white border rounded shadow">
                    {categories.map((cat, idx) => (
                      <li
                        key={idx}
                        className="p-2 text-sm cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                        onClick={() => handleSelectSearchCategory(cat.name)}
                      >
                        {cat.name}
                        {!cat.isPlaceholder && (
                          <button
                            className="text-xs text-[#7B68EE] ml-2 hover:text-[#6959CD]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(idx);
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </li>
                    ))}
                    <li
                      className="p-2 text-sm cursor-pointer font-semibold text-[#7B68EE] hover:text-[#6959CD] hover:bg-gray-100"
                      onClick={handleOpenAddCatModalGlobal}
                    >
                      + Add Category
                    </li>
                  </ul>
                )}
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="lowStockCheck" className="mr-1" />
                <label htmlFor="lowStockCheck" className="text-sm">
                  Show Low Stock
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 border rounded text-sm hover:bg-gray-100">
                Bulk Actions
              </button>
              <button
                className="px-4 py-2 bg-[#7B68EE] text-white rounded text-sm hover:bg-[#6959CD]"
                onClick={handleOpenCreateItem}
              >
                Create Item
              </button>
            </div>
          </div>

          {/* Main Table (with pagination) */}
          <div className="border rounded p-4 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Item Name</th>
                  <th className="p-2 text-left">Item Code</th>
                  <th className="p-2 text-left">Stock QTY</th>
                  <th className="p-2 text-left">Selling Price</th>
                  <th className="p-2 text-left">Purchase Price</th>
                </tr>
              </thead>
              <tbody>
  {currentTableData.length === 0 ? (
    <tr>
      <td colSpan="5" className="text-center text-gray-500">
        No items found
      </td>
    </tr>
  ) : (
    currentTableData
      .filter((it) => {
        const normalizedName =
          it.type?.toLowerCase() === "product"
            ? it.item_name
            : it.service_name;
            

        const matchesSearch = normalizedName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesCategory =
          searchSelectedCategory === "Select Category" ||
          searchSelectedCategory === "All Categories" ||
          it.category === searchSelectedCategory;

        return matchesSearch && matchesCategory;
      })
      .map((it, i) => {
        const normalizedType = it.type?.toLowerCase() || "";
        const displayName =
          normalizedType === "product"
            ? it.item_name
            : it.service_name;

        const itemCodeVal =
          normalizedType === "service"
            ? it.service_code || "SRV"
            : it.product_code || "ITM";

        const stockQty =
            normalizedType === "product" || normalizedType === "service"
              ? `${it.opening_stock || "0"} ${it.measuring_unit || ""}`
              : "-";
          

        let priceLabel = "-";
        if (it.sales_price_with_tax) {
          priceLabel = `₹ ${it.sales_price_with_tax} (Tax Included)`;
        } else if (it.sales_price_without_tax) {
          priceLabel = `₹ ${it.sales_price_without_tax}`;
        }

        const purchasePriceLabel = it.purchase_price
          ? `₹ ${it.purchase_price}`
          : "-";

        const categoryName = it.category || "-";
        const rowKey = startIndex + i;

        return (
          <tr
            key={rowKey}
            className="border-b cursor-pointer hover:bg-gray-50"
            onClick={() => handleRowClick(startIndex + i,it.id)}
          >
            <td className="p-2">
              {displayName || "(unnamed)"}
              {categoryName && (
                <div className="text-xs text-gray-500">{categoryName}</div>
              )}
            </td>
            <td className="p-2">{itemCodeVal}</td>
            <td className="p-2">{stockQty}</td>
            <td className="p-2">{priceLabel}</td>
            <td className="p-2">{purchasePriceLabel}</td>
          </tr>
        );
      })
  )}
</tbody>

            </table>

            {/* Pagination Controls */}
            {currentTableData.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === 1
                        ? "cursor-not-allowed bg-gray-200 text-gray-400"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Prev
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === totalPages
                        ? "cursor-not-allowed bg-gray-200 text-gray-400"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Global Add Category Modal */}
          {showAddCatModalGlobal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow w-80">
                <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
                <input
                  type="text"
                  placeholder="Ex: Snacks"
                  value={newCatNameGlobal}
                  onChange={(e) => setNewCatNameGlobal(e.target.value)}
                  className="w-full p-2 border rounded mb-4 text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCloseAddCatModalGlobal}
                    className="px-3 py-2 bg-gray-300 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewCatGlobal}
                    disabled={!newCatNameGlobal.trim()}
                    className="px-3 py-2 bg-[#7B68EE] text-white rounded text-sm hover:bg-[#6959CD]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Editing Category Modal */}
          {editingCategoryIndex !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow w-80">
                <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
                <input
                  type="text"
                  placeholder="Enter new category name"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full p-2 border rounded mb-4 text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingCategoryIndex(null)}
                    className="px-3 py-2 bg-gray-300 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCategory}
                    disabled={!editCategoryName.trim()}
                    className="px-3 py-2 bg-[#7B68EE] text-white rounded text-sm hover:bg-[#6959CD]"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Item Modal */}
          {showCreateItemModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded shadow w-[900px] h-[600px] overflow-hidden">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-xl font-semibold">
                      {isEditing ? "Edit Item" : "Create New Item"}
                    </h2>
                    <button
                      onClick={handleCloseCreateItem}
                      className="text-2xl text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
                    <div className="w-full md:w-1/4 border-r p-4 overflow-y-auto">
                      {renderLeftColumn()}
                    </div>
                    <div className="w-full md:w-3/4 p-4 overflow-y-auto">
                      {renderRightContent()}
                    </div>
                  </div>
                  <div className="flex justify-end border-t p-4 space-x-2">
                    <button
                      className="px-4 py-2 bg-[#7B68EE] text-white rounded hover:bg-[#6959CD]"
                      onClick={handleSaveItem}
                      disabled={
                        itemType === "Product" ? !itemName.trim() : !serviceName.trim()
                      }
                    >
                      {isEditing ? "Update" : "Save"}
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={handleCloseCreateItem}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                {showAddCatModalInCreateItem && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                    <div className="bg-white p-6 rounded shadow w-80">
                      <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
                      <input
                        type="text"
                        placeholder="Ex: Snacks"
                        value={newCatNameCreateItem}
                        onChange={(e) => setNewCatNameCreateItem(e.target.value)}
                        className="w-full p-2 border rounded mb-4 text-sm"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleCloseAddCatModalInCreateItem}
                          className="px-3 py-2 bg-gray-300 rounded text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNewCatInCreateItem}
                          className="px-3 py-2 bg-[#7B68EE] text-white rounded text-sm hover:bg-[#6959CD]"
                          disabled={!newCatNameCreateItem.trim()}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ------------------------------------------------
  // 10) REPORT SELECTION & REPORT PAGES (unchanged)
  // ------------------------------------------------
  function RenderReportView({ route, items, categories, onBack }) {
    let reportComponent = null;
    switch (route) {
      case "rate-list":
        reportComponent = <RateList items={items} categories={categories} />;
        break;
      case "stock-summary":
        reportComponent = <StockSummary items={items} categories={categories} />;
        break;
      case "low-stock-summary":
        reportComponent = <LowStockSummary items={items} categories={categories} />;
        break;
      case "item-sales-summary":
        reportComponent = <ItemSalesSummary items={items} categories={categories} />;
        break;
      default:
        reportComponent = null;
    }
    return (
      <div className="max-w-7xl mx-auto p-4">
        <button
          onClick={onBack}
          className="mb-4 px-3 py-1 border rounded text-sm hover:bg-gray-100"
        >
          &larr; Back to Items
        </button>
        {reportComponent}
      </div>
    );
  }

  function RateList({ items, categories }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");

    const filteredItems = items.filter((it) => {
      const name =
        it.type?.toLowerCase() === "product" ? it.itemName : it.serviceName;
      const catMatch =
        selectedCategory === "All Categories" || it.category === selectedCategory;
      return name?.toLowerCase().includes("") && catMatch;
    });

    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6 font-sans">
        <h2 className="text-2xl font-bold mb-4">Rate List Report</h2>
        <div className="flex flex-wrap gap-4 bg-white rounded shadow p-4">
          <div className="flex space-x-2 items-center">
            <label className="text-sm">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded p-2 text-sm"
            />
          </div>
          <div className="flex space-x-2 items-center">
            <label className="text-sm">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded p-2 text-sm"
            />
          </div>
          <div className="flex space-x-2 items-center">
            <label className="text-sm">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded p-2 text-sm"
            >
              <option>All Categories</option>
              {categories
                .filter((c) => !c.isPlaceholder)
                .map((cat, idx) => (
                  <option key={idx} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex space-x-2 items-center ml-auto">
            <button
              onClick={() => handleDownloadExcel(filteredItems)}
              className="px-3 py-2 border rounded text-sm hover:bg-[#7B68EE] hover:text-white bg-[#7B68EE] text-white"
            >
              Download Excel
            </button>
            <button
              onClick={() => handleDownloadPDF(filteredItems)}
              className="px-3 py-2 border rounded text-sm hover:bg-[#7B68EE] hover:text-white bg-[#7B68EE] text-white"
            >
              Print PDF
            </button>
          </div>
        </div>
        <div className="border rounded p-4 overflow-auto bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Item Code</th>
                <th className="p-2 text-left">MRP</th>
                <th className="p-2 text-left">Selling Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500">
                    No data available for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((it, i) => {
                  const normalizedType = it.type?.toLowerCase() || "";
                  const itemName =
                    normalizedType === "product" ? it.itemName : it.serviceName;
                  const itemCode =
                    normalizedType === "product"
                      ? it.itemCode || it.item_code
                      : it.serviceCode || it.service_code || "SRV";
                  return (
                    <tr key={i} className="border-b">
                      <td className="p-2">{itemName}</td>
                      <td className="p-2">{itemCode}</td>
                      <td className="p-2">₹ {it.mrp || "-"}</td>
                      <td className="p-2">
                        ₹{" "}
                        {it.salesPrice ||
                          it.sales_price_with_tax ||
                          it.sales_price_without_tax ||
                          "-"}
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
  }

  function StockSummary({ items, categories }) {
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const filteredItems = items.filter((it) => {
      return (
        selectedCategory === "All Categories" || it.category === selectedCategory
      );
    });
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6 font-sans">
        <h2 className="text-2xl font-bold mb-4">Stock Summary Report</h2>
        <div className="flex items-center gap-4 bg-white rounded shadow p-4">
          <div className="flex space-x-2 items-center">
            <label className="text-sm">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded p-2 text-sm"
            >
              <option>All Categories</option>
              {categories
                .filter((c) => !c.isPlaceholder)
                .map((cat, idx) => (
                  <option key={idx} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex space-x-2 items-center ml-auto">
            <button
              onClick={() => handleDownloadExcel(filteredItems)}
              className="px-3 py-2 border rounded text-sm hover:bg-[#7B68EE] hover:text-white bg-[#7B68EE] text-white"
            >
              Download Excel
            </button>
            <button
              onClick={() => handleDownloadPDF(filteredItems)}
              className="px-3 py-2 border rounded text-sm hover:bg-[#7B68EE] hover:text-white bg-[#7B68EE] text-white"
            >
              Print PDF
            </button>
          </div>
        </div>
        <div className="border rounded p-4 overflow-auto bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Item Name</th>
                <th className="p-2 text-left">Item Code</th>
                <th className="p-2 text-left">Purchase Price</th>
                <th className="p-2 text-left">Selling Price</th>
                <th className="p-2 text-left">Stock Qty</th>
                <th className="p-2 text-left">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500">
                    No data available.
                  </td>
                </tr>
              ) : (
                filteredItems.map((it, i) => {
                  const normalizedType = it.type?.toLowerCase() || "";
                  const name = normalizedType === "product" ? it.itemName : it.serviceName;
                  const code =
                    normalizedType === "product"
                      ? it.itemCode || it.item_code
                      : it.serviceCode || it.service_code || "SRV";
                  return (
                    <tr key={i} className="border-b">
                      <td className="p-2">{name}</td>
                      <td className="p-2">{code}</td>
                      <td className="p-2">
                        ₹{" "}
                        {it.purchasePrice ||
                          (it.pricing_details && it.pricing_details.purchase_price) ||
                          "-"}
                      </td>
                      <td className="p-2">
                        ₹{" "}
                        {it.salesPrice ||
                          it.sales_price_with_tax ||
                          it.sales_price_without_tax ||
                          "-"}
                      </td>
                      <td className="p-2">
                        {normalizedType === "product"
                          ? `${it.openingStock || it.opening_stock || 0} ${
                              it.measuringUnit || it.measuring_unit || ""
                            }`
                          : "-"}
                      </td>
                      <td className="p-2">₹ {it.stockValue || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function LowStockSummary({ items, categories }) {
    const lowStockItems = items.filter((it) => {
      if (it.type?.toLowerCase() === "product") {
        const val = parseFloat(it.openingStock ?? it.opening_stock ?? 0);
        return val < 10;
      }
      return false;
    });
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6 font-sans">
        <h2 className="text-2xl font-bold mb-4">Low Stock Summary Report</h2>
        <div className="flex items-center justify-end gap-4 bg-white rounded shadow p-4">
          <button
            onClick={() => handleDownloadExcel(lowStockItems)}
            className="px-3 py-2 border rounded text-sm hover:bg-[#7B68EE] hover:text-white bg-[#7B68EE] text-white"
          >
            Download Excel
          </button>
          <button
            onClick={() => handleDownloadPDF(lowStockItems)}
            className="px-3 py-2 border rounded text-sm hover:bg-[#7B68EE] hover:text-white bg-[#7B68EE] text-white"
          >
            Print PDF
          </button>
        </div>
        <div className="border rounded p-4 overflow-auto bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Item Name</th>
                <th className="p-2 text-left">Item Code</th>
                <th className="p-2 text-left">Stock Qty</th>
                <th className="p-2 text-left">Low Stock Level</th>
                <th className="p-2 text-left">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500">
                    All items have sufficient stock.
                  </td>
                </tr>
              ) : (
                lowStockItems.map((it, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{it.item_name || it.itemName}</td>
                    <td className="p-2">{it.item_code || it.itemCode || "No Code"}</td>
                    <td className="p-2">{it.opening_stock || it.openingStock || 0}</td>
                    <td className="p-2">10</td>
                    <td className="p-2">₹ {it.stockValue || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function ItemSalesSummary({ items, categories }) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6 font-sans">
        <h2 className="text-2xl font-bold mb-4">Item Sales & Purchase Summary Report</h2>
        <div className="flex items-center justify-end gap-4 bg-white rounded shadow p-4">
          <button
            onClick={() => handleDownloadExcel(items)}
            className="px-3 py-2 border rounded text-sm hover:bg-[#7B68EE] hover:text-white bg-[#7B68EE] text-white"
          >
            Download Excel
          </button>
          <button
            onClick={() => handleDownloadPDF(items)}
            className="px-3 py-2 border rounded text-sm hover:bg-[#7B68EE] hover:text-white bg-[#7B68EE] text-white"
          >
            Print PDF
          </button>
        </div>
        <div className="border rounded p-4 overflow-auto bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Item Name</th>
                <th className="p-2 text-left">Sales Qty</th>
                <th className="p-2 text-left">Purchase Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500">
                    No sales/purchase data available.
                  </td>
                </tr>
              ) : (
                items.map((it, i) => {
                  const normalizedType = it.type?.toLowerCase() || "";
                  const name =
                    normalizedType === "product" ? it.itemName : it.serviceName;
                  return (
                    <tr key={i} className="border-b">
                      <td className="p-2">{name}</td>
                      <td className="p-2">{it.salesQty || 0}</td>
                      <td className="p-2">{it.purchaseQty || 0}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Finally, decide if we are showing a report or the main content
  if (selectedReport) {
    return (
      <RenderReportView
        route={selectedReport}
        items={items}
        categories={categories}
        onBack={() => setSelectedReport("")}
      />
    );
  }
  return renderMainContent();

};

export default ItemsPage;