import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const HrTickets = () => {
  const [data, setData] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [ticketId, setTicketId] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const baseApiUrl = import.meta.env.VITE_BASE_API;
        if (!baseApiUrl) {
          throw new Error(
            "Base API URL is not defined in environment variables.",
          );
        }

        const apiUrl = `${baseApiUrl}/tickets/`;
        const response = await axios.get(apiUrl);
        setData(response.data);
      } catch (error) {
        setError(error);
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTicket();
  }, []);

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleTicketSelect = (id) => {
    setTicketId(id);
  };

  const handleReplySubmit = async () => {
    if (!ticketId || !replyText) {
      toast.error("Please select a ticket and enter a reply.");
      return;
    }

    try {
      const baseApiUrl = import.meta.env.VITE_BASE_API;
      const apiUrl = `${baseApiUrl}/tickets/add/`;
      const response = await axios.post(apiUrl, {
        ticketId,
        replyText,
      });

      if (response.status === 200) {
        toast.success("Reply added successfully!");
        setReplyText(""); // Clear the reply input after success
        setTicketId(null); // Reset ticket ID
      }
    } catch (error) {
      toast.error("Error adding reply. Please try again.");
      console.error("Error posting reply:", error);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return (
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full">
            {status}
          </span>
        );
      case "In Progress":
        return (
          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full">
            {status}
          </span>
        );
      case "Close":
        return (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full">
            {status}
          </span>
        );
      default:
        return (
          <span className="bg-gray-500 text-white px-2 py-1 rounded-full">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 bg-gray-100 p-6">
        <div className="space-y-6">
          {/* Ticket Table */}
          <div>
            <h6 className="text-xl font-semibold mb-4">Requested Ticket</h6>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h6 className="font-bold mb-4">
                  TICKET INBOX{" "}
                  <span className="text-blue-600">({data.length})</span>
                </h6>
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">TICKET NUMBER</th>
                      <th className="px-4 py-2 text-left">TITLE</th>
                      <th className="px-4 py-2 text-left">CREATED ON</th>
                      <th className="px-4 py-2 text-left">ASSIGNED TO</th>
                      <th className="px-4 py-2 text-left">STATUS</th>
                      <th className="px-4 py-2 text-left">LAST UPDATED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => handleTicketSelect(ticket.id)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{ticket.id}</td>
                        <td className="px-4 py-2">
                          <a href="#" className="text-blue-600">
                            {ticket.title}
                          </a>
                        </td>
                        <td className="px-4 py-2">
                          {new Date(ticket.created_on).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{ticket.Reciver}</td>
                        <td className="px-4 py-2">
                          {renderStatusBadge(ticket.status)}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(ticket.last_updated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Reply Ticket Section */}
          <div>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h6 className="font-bold text-xl mb-4">Reply Ticket</h6>
                {/* Ticket details (you can replace the static text with dynamic content) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p>
                      <strong className="text-gray-700">Ticket ID:</strong>{" "}
                      00001
                    </p>
                    <p>
                      <strong className="text-gray-700">Employee Name:</strong>{" "}
                      Arun
                    </p>
                    <p>
                      <strong className="text-gray-700">
                        Requested Ticket:
                      </strong>{" "}
                      Full Access
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong className="text-gray-700">Created On:</strong> Nov
                      22, 2024
                    </p>
                    <p>
                      <strong className="text-gray-700">Last Updated:</strong>{" "}
                      Nov 25, 2024
                    </p>
                  </div>
                </div>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-md mb-4"
                  rows="4"
                  value={replyText}
                  onChange={handleReplyChange}
                  placeholder="Please enter a reply"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    className="bg-gray-400 text-white py-2 px-6 rounded-md"
                    onClick={() => setReplyText("")}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-500 text-white py-2 px-6 rounded-md"
                    onClick={handleReplySubmit}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Toast Container for Notifications */}
      <ToastContainer />
    </div>
  );
};

export default HrTickets;
