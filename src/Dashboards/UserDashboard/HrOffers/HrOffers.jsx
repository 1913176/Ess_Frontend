import React, { useState, useEffect } from "react";

import axios from "axios";
import profile from "../Hrimages/profile.png";
const apiBaseUrl = process.env.VITE_BASE_API;

const HrOffers = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [offers, setOffers] = useState({
    pending_offers: [],
    accepted_offers: [],
    rejected_offers: [],
  });
  const [newOffer, setNewOffer] = useState({
    name: "",
    position: "",
    email: "",
    status: "pending",
    date: new Date().toISOString().split("T")[0],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingOffer, setEditingOffer] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const fetchOffers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${apiBaseUrl}/api/offers/`);
      console.log("Fetched offers:", response.data);
      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setError("Error fetching offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const createOffer = async () => {
    console.log("Creating offer with data:", newOffer);
    try {
      const response = await axios.post(`${apiBaseUrl}/api/offers/`, newOffer);
      console.log("Created offer:", response.data);
      fetchOffers();
      setNewOffer({
        name: "",
        position: "",
        email: "",
        status: "pending",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      setError("Error creating offer");
    }
  };

  const updateOffer = async () => {
    if (!editingOffer) return;

    console.log("Updating offer with data:", editingOffer);
    try {
      const response = await axios.put(
        `${apiBaseUrl}/api/offers/${editingOffer.id}/update/`,
        editingOffer,
      );
      console.log("Updated offer:", response.data);
      setEditingOffer(null);
      fetchOffers();
    } catch (error) {
      console.error("Error updating offer:", error);
      setError("Error updating offer");
    }
  };

  const deleteOffer = async (offer) => {
    if (!offer) return;

    console.log("Attempting to delete offer:", offer);
    try {
      await axios.delete(`${apiBaseUrl}/api/offers/${offer.id}/delete/`);
      console.log("Deleted offer:", offer);
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      setError("Error deleting offer");
    }
  };

  const acceptOffer = async (id) => {
    const res = await axios.put(`${apiBaseUrl}/api/offers/${id}/update/`, {
      status: "accepted",
    });
    console.log(res);
    fetchOffers();
  };

  const rejectOffer = async (id) => {
    const res = await axios.put(`${apiBaseUrl}/api/offers/${id}/update/`, {
      status: "rejected",
    });
    console.log(res);
    fetchOffers();
  };

  const renderOffers = (offerList, tab) => (
    <div>
      <h6 className="font-bold mb-3">
        {tab.charAt(0).toUpperCase() + tab.slice(1)} Offers
      </h6>
      <div className="flex flex-wrap">
        {offerList.length === 0 ? (
          <p>No offers available.</p>
        ) : (
          offerList.map((offer, index) => (
            <div key={index} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 mb-3">
              <div className="flex p-4 border border-gray-300 rounded-lg shadow-md">
                <img
                  src={profile}
                  alt={offer.name}
                  className="rounded-full w-12 h-12 mr-4"
                />
                <div className="flex-grow">
                  <h6 className="font-semibold">{offer.name}</h6>
                  <p className="text-gray-500 text-sm">{offer.position}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(offer.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-3 flex items-center">
                  {activeTab === "pending" && (
                    <>
                      <button
                        className="bg-green-500 text-white text-xs px-3 py-1 rounded-md mr-2 hover:bg-green-600"
                        onClick={() => acceptOffer(offer.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-500 text-white text-xs px-3 py-1 rounded-md hover:bg-red-600"
                        onClick={() => rejectOffer(offer.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div>
          <div className="mb-4">
            <h3 className="text-2xl font-bold">
              {editingOffer ? "Update Offer" : "Create New Offer"}
            </h3>
            <input
              type="text"
              placeholder="Name"
              value={editingOffer ? editingOffer.name : newOffer.name}
              onChange={(e) => {
                if (editingOffer) {
                  setEditingOffer({ ...editingOffer, name: e.target.value });
                } else {
                  setNewOffer({ ...newOffer, name: e.target.value });
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
            <input
              type="text"
              placeholder="Position"
              value={editingOffer ? editingOffer.position : newOffer.position}
              onChange={(e) => {
                if (editingOffer) {
                  setEditingOffer({
                    ...editingOffer,
                    position: e.target.value,
                  });
                } else {
                  setNewOffer({ ...newOffer, position: e.target.value });
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={editingOffer ? editingOffer.email : newOffer.email}
              onChange={(e) => {
                if (editingOffer) {
                  setEditingOffer({ ...editingOffer, email: e.target.value });
                } else {
                  setNewOffer({ ...newOffer, email: e.target.value });
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md mt-2"
            />
            <button
              onClick={editingOffer ? updateOffer : createOffer}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              {editingOffer ? "Update Offer" : "Create Offer"}
            </button>
          </div>

          <ul className="flex border-b">
            {["pending", "accepted", "rejected"].map((tab) => (
              <li key={tab} className="mr-4">
                <button
                  className={`py-2 px-4 ${activeTab === tab ? "border-b-2 border-blue-500" : "text-gray-500"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Offers (
                  {offers[`${tab}_offers`]?.length || 0})
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {loading ? (
              <p>Loading...</p>
            ) : (
              renderOffers(offers[`${activeTab}_offers`] || [], activeTab)
            )}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrOffers;
