import React, { useState, useEffect } from "react";
import axios from "axios";
const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
axios.defaults.withCredentials = true;
const apiBaseUrl = process.env.VITE_BASE_API;
const SpSupervisorRequest = () => {
  const [table, setTable] = useState([]);

  // Fetch data from the backend
  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/requests/supervisor/${userInfo.supervisor_id}/`)
      .then((response) => {
        setTable(response.data); // Assuming response.data is an array of requests
      })
      .catch((error) => {
        console.error("Error fetching requests:", error);
      });
  }, []);

  const handleActionClick = (id, action) => {
    const postData = {
      action: action,
      request_id: id,
    };

    axios
      .post(
        `${apiBaseUrl}/requests/supervisor/${userInfo.supervisor_id}/`,
        postData,
      )
      .then((response) => {
        console.log(response.data); // Log success message
        // Optionally, refresh the table data or update status in the table
        setTable((prevTable) =>
          prevTable.map((row) =>
            row.id === id ? { ...row, status: response.data.status } : row,
          ),
        );
      })
      .catch((error) => {
        console.error("Error performing action:", error);
      });
  };

  const ActionButton = ({ id, action }) => (
    <button
      className="bg-blue-500 text-white px-2 py-1 rounded m-1 hover:bg-blue-700"
      onClick={() => handleActionClick(id, action)}
    >
      {action}
    </button>
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Supervisor Dashboard</h1>
      <p className="text-sm text-gray-600 mb-4">All Assigned Requests</p>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Request Number</th>
            <th className="border px-4 py-2">Request ID</th>
            <th className="border px-4 py-2">Employee Name</th>
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Admin Status</th>
            <th className="border px-4 py-2">Request Receive Time</th>
            <th className="border px-4 py-2">Confirmation</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.id} className="border">
              <td className="border px-4 py-2">{row.number}</td>
              <td className="border px-4 py-2">{row.value}</td>
              <td className="border px-4 py-2">{row.name}</td>
              <td className="border px-4 py-2">{row.title}</td>
              <td className="border px-4 py-2">{row.description}</td>
              <td className="border px-4 py-2">{row.status}</td>
              <td className="border px-4 py-2">{row.adminstatus}</td>
              <td className="border px-4 py-2">{row.time}</td>
              <td className="border px-4 py-2">
                {row.confirmation.map((action) => (
                  <ActionButton key={action} id={row.id} action={action} />
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpSupervisorRequest;
