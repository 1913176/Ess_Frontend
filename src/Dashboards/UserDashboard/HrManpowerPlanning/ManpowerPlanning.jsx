import React, { useState } from "react";
import { HiOutlinePlus } from "react-icons/hi";

const initialEmployees = [
  { id: 1, name: "Alice", jobTitle: "Developer", department: "IT", manager: "Bob", status: "Approved" },
  { id: 2, name: "John", jobTitle: "Designer", department: "Design", manager: "Sara", status: "Rejected" },
  { id: 3, name: "Ram", jobTitle: "Developer", department: "IT", manager: "Sam", status: "Forwardto"},

];

const ManpowerPlanning = () => {
  const [showForm, setShowForm] = useState(false);
  const [employees] = useState(initialEmployees);

  // Example options for dropdowns
  const locations = ["Chennai", "Bangalore", "Hyderabad"];
  const roles = ["Developer", "Designer", "Manager"];

  // State for form fields
  const [jobForm, setJobForm] = useState({
    title: "",
    location: "",
    experience: "",
    jobType: "",
    openings: "",
    role: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save logic here (API call or local update)
    setShowForm(false);
    // Optionally reset form
    setJobForm({
      title: "",
      location: "",
      experience: "",
      jobType: "",
      openings: "",
      role: "",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans relative">
     
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name, role, department..."
            className="border border-gray-300 rounded px-4 py-2 w-64"
          />
          <select className="border border-gray-300 rounded px-4 py-2">
            <option>All Departments</option>
            
          </select>
          <input
            type="date"
            className="border border-gray-300 rounded px-4 py-2"
          />
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow"
          onClick={() => setShowForm((prev) => !prev)}
        >
          <HiOutlinePlus className="text-lg" />
          New Position Request
        </button>
      </div>

      {/* Overlay and Centered Popup */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40"></div>
          <div
            className="fixed left-1/2 top-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow flex flex-col items-stretch"
            style={{ width: 483, height: 578 }}
          >
            <div className="text-xl font-bold mb-4">Add Job</div>
            <div className="mb-3">
              <input
                type="text"
                name="title"
                value={jobForm.title}
                onChange={handleFormChange}
                placeholder="Title"
                className="w-full border border-gray-300 rounded px-3 py-2 placeholder-gray-400"
              />
            </div>
            <div className="mb-3 relative">
              <select
                name="location"
                value={jobForm.location}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded px-3 py-2 appearance-none bg-white text-gray-700"
              >
                <option value="" disabled>
                  Location
                </option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">&#9662;</span>
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="experience"
                value={jobForm.experience}
                onChange={handleFormChange}
                placeholder="Experience Level"
                className="w-full border border-gray-300 rounded px-3 py-2 placeholder-gray-400"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="jobType"
                value={jobForm.jobType}
                onChange={handleFormChange}
                placeholder="Job Type"
                className="w-full border border-gray-300 rounded px-3 py-2 placeholder-gray-400"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="openings"
                value={jobForm.openings}
                onChange={handleFormChange}
                placeholder="Openings"
                className="w-full border border-gray-300 rounded px-3 py-2 placeholder-gray-400"
              />
            </div>
            <div className="mb-6 relative">
              <select
                name="role"
                value={jobForm.role}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded px-3 py-2 appearance-none bg-white text-gray-700"
              >
                <option value="" disabled>
                  Role
                </option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">&#9662;</span>
            </div>
            <button
              className="mt-auto bg-blue-600 text-white px-4 py-2 rounded shadow font-semibold hover:bg-blue-700 transition"
              style={{ width: "100%" }}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </>
      )}

      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold">NAME</th>
              <th className="px-6 py-3 font-semibold">JOB TITLE</th>
              <th className="px-6 py-3 font-semibold">DEPARTMENT</th>
              <th className="px-6 py-3 font-semibold">MANAGER</th>
              <th className="px-6 py-3 font-semibold">EMPLOYEE STATUS</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{emp.id}</td>
                <td className="px-6 py-4">{emp.name}</td>
                <td className="px-6 py-4">{emp.jobTitle}</td>
                <td className="px-6 py-4">{emp.department}</td>
                <td className="px-6 py-4">{emp.manager}</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {emp.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManpowerPlanning;
