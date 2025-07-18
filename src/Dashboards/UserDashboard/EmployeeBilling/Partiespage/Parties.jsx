import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const baseurl=process.env.REACT_APP_BASEAPI;
const Parties = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
  const [parties, setParties] = useState(() => {
    return JSON.parse(localStorage.getItem("parties")) || [];
  });
  //sessionStorage.clear();
  

  const [categories, setCategories] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("partyCategories"));
    return stored ? stored : ["Select Categories"];
  });

  
  const [selectedCategory, setSelectedCategory] = useState("Select Categories");

  const [showModal, setShowModal] = useState(false);

  
  const [newCategory, setNewCategory] = useState("");

  
  const [dropdownOpen, setDropdownOpen] = useState(false);

  
  const [searchTerm, setSearchTerm] = useState("");

  
  const [editIndex, setEditIndex] = useState(null);
  
const allparties = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userdata'));
    const employeeId = userInfo?.employee_id;
    
    if (!employeeId) {
      console.error('Employee ID not found');
      return; 
    }
    const res = await axios.get(`${baseurl}/pincode/employee-parties/${employeeId}/`);
    setParties((prevParties) => {
      if (JSON.stringify(prevParties) !== JSON.stringify(res.data)) {
        return res.data;
      }
      return prevParties;
    });
  } catch (error) {
    console.error("Failed to fetch parties:", error);
    setParties([]); // clear parties from memory
    localStorage.removeItem("parties"); // clear from storage
  }
};

useEffect(() => {
  allparties(); // Call once on component mount
}, [])
  
  useEffect(() => {
    localStorage.setItem("partyCategories", JSON.stringify(categories));
  }, [categories]);

  
  useEffect(() => {
    localStorage.setItem("parties", JSON.stringify(parties));
  }, [parties]);

  
  const getPartyCountByCategory = (cat) => {
    return parties.filter((p) => p.party_category === cat).length;
  };

  
  const handleCreateCategory = () => {
    setEditIndex(null);       
    setNewCategory("");     
    setShowModal(true);       
    setDropdownOpen(false);   
  };

  const handleEditCategory = (index, e) => {
    e.stopPropagation();      
    setEditIndex(index);     
    setNewCategory(categories[index]); 
    setShowModal(true);       
    setDropdownOpen(false);   
  };

  
  const handleSaveCategory = () => {
    if (!newCategory.trim()) return; 

    if (editIndex !== null) {
     
      const updated = [...categories];
      updated[editIndex] = newCategory;
      setCategories(updated);
      localStorage.setItem("partyCategories", JSON.stringify(updated));
    } else {
    
      const updated = [...categories, newCategory];
      setCategories(updated);
      localStorage.setItem("partyCategories", JSON.stringify(updated));
    }

    
    setNewCategory("");
    setShowModal(false);
    setEditIndex(null);
  };

  
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setDropdownOpen(false);
  };

  
  const filteredParties = parties.filter((party) =>
    party.party_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // To Collect” & “To Pay” calculations
  // const totalToCollect = filteredParties.reduce(
  //   (acc, party) => (party.opening_balance_amount > 0 ? acc + party.opening_balance_amount: acc),
  //   0
  // );
  // const totalToPay = filteredParties.reduce(
  //   (acc, party) => (party.opening_balance_amount < 0 ? acc + Math.abs(party.opening_balance_amount) : acc),
  //   0
  // );
  const payFilters = filteredParties.filter(
    (party) => party.opening_balance === "to_pay"
  );
  
 const totalToPay = filteredParties.reduce(
  (total, party) => total + (parseFloat(party.opening_balance_to_pay || 0) > 0 ? parseFloat(party.opening_balance_to_pay) : 0),
  0
);
  
  const collectFilters = filteredParties.filter(
    (party) => party.opening_balance === "to_collect"
  );
  
const totalToCollect = filteredParties.reduce(
  (total, party) => total + (parseFloat(party.opening_balance_to_collect || 0) > 0 ? parseFloat(party.opening_balance_to_collect) : 0),
  0
);
  

  return (
    <div className="mx-auto max-w-7xl p-4 space-y-6">
     
      <h2 className="text-lg font-semibold">Parties</h2>

    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow p-4">
          <span className="text-gray-600">All Parties</span>
          <h3 className="text-xl font-bold">{filteredParties.length}</h3>
        </div>

        <div className="bg-white shadow p-4">
          <span className="text-gray-600">To Collect</span>
          <h3 className="text-lg font-semibold text-green-600 flex items-center">
            <span className="mr-1">&#8595;</span> &#8377; {totalToCollect}
          </h3>
        </div>

        <div className="bg-white shadow p-4">
          <span className="text-gray-600">To Pay</span>
          <h3 className="text-lg font-semibold text-red-600 flex items-center">
            <span className="mr-1">&#8593;</span> &#8377; {totalToPay}
          </h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-2/3">
          
          <div className="relative w-full md:w-1/2">
           
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 4a7 7 0 017 7c0 1.61-.57 3.09-1.52 4.25l3.34 3.34a1 1 0 01-1.42 1.42l-3.34-3.34A6.96 6.96 0 0111 18a7 7 0 110-14z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search Party"
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-none focus:outline-none w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

     
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="border border-gray-300 text-gray-600 rounded-none px-4 py-2 w-full md:w-auto flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#7B68EE] focus:border-transparent text-sm"
            >
              {selectedCategory}
             
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 bg-white border border-gray-200 shadow mt-1 w-full md:w-48">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    
                    <span
                      onClick={() => handleSelectCategory(category)}
                      className="cursor-pointer"
                    >
                      {category} ({getPartyCountByCategory(category)})
                    </span>

                
                    <span
                      onClick={(e) => handleEditCategory(index, e)}
                      className="text-[#7B68EE] hover:underline cursor-pointer"
                    >
                      Edit
                    </span>
                  </div>
                ))}

                
                <div
                  className="mx-2 mb-2 px-2 py-2 border-2 border-dashed border-gray-300 text-sm text-gray-600 text-center cursor-pointer"
                  onClick={handleCreateCategory}
                >
                  + Add Category
                </div>
              </div>
            )}
          </div>
        </div>

        
        <div className="flex gap-2">
          <button className="border border-gray-300 bg-white px-4 py-2 rounded-none hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#7B68EE] text-sm">
            Bulk Actions
          </button>
          <button
            className="bg-[#7B68EE] text-white px-4 py-2 rounded-none hover:brightness-90 focus:outline-none focus:ring-1 focus:ring-[#7B68EE] text-sm"
            onClick={() => navigate("/employee/billing/createparty")}
          >
            Create Party
          </button>
        </div>
      </div>

      {/* Parties Table */}
      <div className="overflow-x-auto bg-white shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-600">Party Name</th>
              <th className="px-4 py-2 font-medium text-gray-600">Category</th>
              <th className="px-4 py-2 font-medium text-gray-600">
                Mobile Number
              </th>
              <th className="px-4 py-2 font-medium text-gray-600">Party Type</th>
              <th className="px-4 py-2 font-medium text-gray-600">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No parties found
                </td>
              </tr>
            ) : (
              filteredParties.map((party, index) => (
                <tr
                  key={index}
                  onClick={() => navigate(`/employee/billing/partydetails/${party.id}`)}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2">{party.party_name}</td>
                  <td className="px-4 py-2">{party.party_category || "-"}</td>
                  <td className="px-4 py-2">{party.mobile_number || "-"}</td>
                  <td className="px-4 py-2">{party.party_type}</td>
                  <td className="px-4 py-2">
  {parseFloat(party.opening_balance_to_collect) > 0 ? (
    <span className="text-green-600 flex items-center">
      <span className="mr-1">↓</span>
      ₹ {party.opening_balance_to_collect}
    </span>
  ) : parseFloat(party.opening_balance_to_pay) > 0 ? (
    <span className="text-red-600 flex items-center">
      <span className="mr-1">↑</span>
      ₹ {party.opening_balance_to_pay}
    </span>
  ) : (
    <span className="text-gray-500">₹ 0.00</span>
  )}
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 shadow max-w-sm w-full">
            
            <h3 className="text-base font-semibold mb-4">
              {editIndex !== null ? "Edit Category" : "Create New Category"}
            </h3>

            <input
              type="text"
              placeholder="Ex: Snacks"
              className="border border-gray-300 rounded-none w-full px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#7B68EE] mb-4 text-sm"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-100 rounded-none hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
                onClick={() => {
                  setShowModal(false);
                  setEditIndex(null);
                  setNewCategory("");
                }}
              >
                Cancel
              </button>

              
              <button
                className={`px-4 py-2 text-white rounded-none focus:outline-none focus:ring-1 focus:ring-[#7B68EE] text-sm ${
                  newCategory.trim()
                    ? "bg-[#7B68EE] hover:brightness-90"
                    : "bg-[#7B68EE] opacity-50 cursor-not-allowed"
                }`}
                disabled={!newCategory.trim()}
                onClick={handleSaveCategory}
              >
                {editIndex !== null ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parties;