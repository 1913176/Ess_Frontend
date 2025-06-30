import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getItemName, getItemStockQty } from "./itemHelpers"

const baseurl = process.env.REACT_APP_BASEAPI;

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listItems, setListItems] = useState([]);
  const [detailTab, setDetailTab] = useState(0);
  const [detailSearchTerm, setDetailSearchTerm] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${baseurl}/item/api/product-service-items/`);
        setListItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Error fetching items:", e);
      }
    })();
  }, [id]); // 👈 important fix
  

  

  const currentItem = listItems.find((it) => String(it.id) === String(id));

  
  
  if (!listItems.length) {
    return <div className="p-4">Loading items...</div>;
  }
  
  if (!currentItem) {
    return <div className="p-4 text-gray-500">Item not found for ID {id}.</div>;
  }
  


  if (!currentItem) return <div>Loading...</div>;

  const stockQty = getItemStockQty(currentItem);
  const isOutOfStock = stockQty <= 0;
  const itemLabel = getItemName(currentItem) || "(unnamed)";

  const handleDelete = () => setShowDeleteConfirmation(true);
  const confirmDelete = async () => {
    try {
      await axios.delete(`${baseurl}/item/${currentItem.type}-item/${id}/delete/`);
      navigate("/employee/billing/items");
    } catch (e) {
      console.error("Delete failed:", e);
      setShowDeleteConfirmation(false);
    }
  };

  const filtered = listItems.filter((it) =>
    getItemName(it).toLowerCase().includes(detailSearchTerm.toLowerCase())
  );

  const renderRightTab = () => {
    switch (detailTab) {
      case 0:
        return (
          <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded shadow">
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">General Details</h3>
              <p><strong>Item Name:</strong> {itemLabel}</p>
              <p><strong>Item Code:</strong> {currentItem.product_code || currentItem.service_code || "-"}</p>
              <p><strong>Stock:</strong> {stockQty > 0 ? `${stockQty} ${currentItem.measuring_unit}` : "-"}</p>
              <p><strong>Low Stock:</strong> {currentItem.low_stock_warning || currentItem.enableLowStockWarning ? "Enabled" : "Disabled"}</p>
              <p><strong>Description:</strong> {currentItem.description || "-"}</p>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">Pricing Details</h3>
              <p><strong>Sales Price:</strong> ₹ {currentItem.sales_price_with_tax || currentItem.sales_price_without_tax || "-"}</p>
              <p><strong>Purchase Price:</strong> ₹ {currentItem.purchase_price || "-"}</p>
              <p><strong>HSN Code:</strong> {currentItem.hsn_code || currentItem.hsnCode || "-"}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6 bg-white rounded shadow text-center text-gray-500">
            No data for this tab.
          </div>
        );
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4 space-y-4">
        <input
          type="text"
          placeholder="Search Item"
          value={detailSearchTerm}
          onChange={(e) => setDetailSearchTerm(e.target.value)}
          className="border rounded p-2 w-full text-sm"
        />
        <div className="overflow-y-auto max-h-[70vh] space-y-2">
          {filtered.map((it) => (
            <div
              key={it.id}
              onClick={() => navigate(`/employee/billing/itemdetails/${it.id}`)}
              className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${it.id == id ? "bg-gray-200" : ""}`}
            >
              <div className="font-medium">{getItemName(it)}</div>
              <div className="text-xs text-gray-500">
                {getItemStockQty(it)} {it.measuring_unit || ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold">{itemLabel}</h2>
            {isOutOfStock ? (
              <span className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded">Out of Stock</span>
            ) : (
              <span className="px-2 py-1 text-sm bg-green-100 text-green-600 rounded">In Stock</span>
            )}
          </div>
          <div className="space-x-2">
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">Adjust Stock</button>
            {/* <button onClick={() => navigate(`/items/edit/${id}`)} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">Edit</button> */}
            <button
  onClick={() => {
    localStorage.setItem("editItemId", id); // store current ID
    console.log(id);
    
    navigate("/employee/billing/itemspage"); // go back to ItemsPage
  }}
  className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
>
  Edit
</button>

            <button onClick={handleDelete} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">Delete</button>
            <button onClick={() => navigate("/employee/billing/itemspage")} className="px-3 py-1 bg-gray-300 text-sm rounded">Close</button>
          </div>
        </div>
        <div className="flex space-x-6 px-4 py-2 bg-white border-b">
          {["Item Details", "Stock Details", "Party Wise Report", "Party Wise Prices"].map((label, idx) => (
            <button
              key={idx}
              onClick={() => setDetailTab(idx)}
              className={`text-sm pb-2 ${detailTab === idx ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 p-4 overflow-auto">{renderRightTab()}</div>

        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow w-80">
              <h3 className="text-lg font-semibold mb-4">Delete {itemLabel}?</h3>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowDeleteConfirmation(false)} className="px-3 py-1 bg-gray-300 rounded text-sm">Cancel</button>
                <button onClick={confirmDelete} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailsPage;
