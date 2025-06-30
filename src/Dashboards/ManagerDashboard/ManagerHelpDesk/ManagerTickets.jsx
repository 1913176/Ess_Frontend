"use client"

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { GetManagerTicketRequestList } from "@/api/ServerAction";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManagerTickets() {
  const [data, setData] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ["Employee", "System"];
  const apiBaseUrl = process.env.VITE_BASE_API;

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);

      try {
        const tickets = await GetManagerTicketRequestList();
        if (!tickets) {
          throw new Error("No tickets returned");
        }
        const mappedTickets = tickets.map((ticket) => ({
          
            id: ticket.ticket_id,
            title: ticket.subject,
            created_on: ticket.created_on.split("T")[0],
            assigned_to: ticket.raise_to || "N/A",
            status: ticket.status,
            last_updated: ticket.last_updated.split("T")[0],
            name:ticket.employee_id ? ticket.employee_name || "N/A" :
                "N/A",
            description: ticket.description || "No description provided.",
            service_type: ticket.service_type || "Others",
            category: ticket.employee_id ? "Employee" :
                      ticket.system_id ? "System" :
                      null,
          
        }));
        setData(mappedTickets);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets. Check the server or network.");
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setIsReplyOpen(true);
  };
const handleReplySubmit = async () => {
  try {
    await axios.post(
      `${apiBaseUrl}/api/tickets/${selectedTicket.id}/reply/`,
      {
        reply_text: replyText,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Update state only after successful API call
    const updatedData = data.map((ticket) => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          status: "Review",
          last_updated: new Date().toISOString().split("T")[0],
        };
      }
      return ticket;
    });

    setData(updatedData);
    setReplyText("");
    setIsReplyOpen(false);
    toast.success("Reply submitted successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } catch (err) {
    console.error("Error submitting reply:", err.response?.data || err.message);
    toast.error("Failed to submit reply. Please try again.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Request":
        return <Badge className="bg-blue-100 text-blue-800 w-24 text-center justify-center">{status}</Badge>;
      case "Review":
        return <Badge className="bg-orange-100 text-orange-800 w-24 text-center justify-center">{status}</Badge>;
      case "Approved":
        return <Badge className="bg-green-100 text-green-800 w-24 text-center justify-center">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 w-24 text-center justify-center">Unknown</Badge>;
    }
  };

  const renderTicketTable = (category) => {
    const filteredTickets = data.filter((ticket) => ticket.category === category);

    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h3 className="font-bold mb-4">
            {category.toUpperCase()} TICKETS <span className="text-blue-600">({filteredTickets.length})</span>
          </h3>

          {loading && <p className="text-center py-4">Loading tickets...</p>}
          {error && <p className="text-center text-red-500 py-4">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TICKET NUMBER</TableHead>
                    <TableHead>SUBJECT</TableHead>
                    <TableHead>CREATED ON</TableHead>
                    <TableHead>SERVICE TYPE</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>LAST UPDATED</TableHead>
                    <TableHead>NAME</TableHead>
                    <TableHead>ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No tickets found for {category}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-gray-50">
                        <TableCell>{ticket.id}</TableCell>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{ticket.created_on}</TableCell>
                        <TableCell>{ticket.service_type}</TableCell>
                        <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{ticket.last_updated}</TableCell>
                        <TableCell>{ticket.name}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleTicketSelect(ticket)}>
                            Reply
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-semibold mb-4">Requested Tickets</h2>
        {categories.map((category) => (
          <div key={category}>{renderTicketTable(category)}</div>
        ))}
      </div>

      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
       <DialogContent className="max-w-2xl">
  <DialogHeader>
    <DialogTitle>Reply to Ticket</DialogTitle>
  </DialogHeader>

  {selectedTicket && (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Prevent default form submission
        handleReplySubmit(); // Call existing submit function
      }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p><strong className="text-gray-700">Ticket ID:</strong> {selectedTicket.id}</p>
            <p><strong className="text-gray-700">Name:</strong> {selectedTicket.name || "N/A"}</p>
            <p><strong className="text-gray-700">Subject:</strong> {selectedTicket.title}</p>
          </div>
          <div>
            <p><strong className="text-gray-700">Created On:</strong> {selectedTicket.created_on}</p>
            <p><strong className="text-gray-700">Last Updated:</strong> {selectedTicket.last_updated}</p>
            <p><strong className="text-gray-700">Status:</strong> {renderStatusBadge(selectedTicket.status)}</p>
          </div>
        </div>

        <div>
          <strong className="text-gray-700">Description:</strong>
          <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
            {selectedTicket.description || "No description provided."}
          </p>
        </div>

        <Textarea
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Please enter your reply..."
          className="w-full"
          required
          onInvalid={(e) => e.target.setCustomValidity("Please fill out this field")} // Custom validation message
          onInput={(e) => e.target.setCustomValidity("")} // Clear message when typing
        />
      </div>

      <DialogFooter className="mt-6">
        <Button type="submit" variant="outline" onClick={() => setIsReplyOpen(false)}>
          Cancel
        </Button>
        <Button type="submit">Send Reply</Button>
      </DialogFooter>
    </form>
  )}
</DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
}