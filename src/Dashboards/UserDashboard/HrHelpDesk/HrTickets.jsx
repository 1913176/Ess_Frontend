"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HrTickets() {
  const [data, setData] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  

  const categories = ["Supervisor", "Manager", "Employee", "System"];
  const apiBaseUrl = import.meta.env.VITE_BASE_API;

  const renderStatusBadge = (status) => {
    const statusColor = {
      Request: "bg-transparent text-blue-800",
      Review: "text-orange-800",
      Approved: "bg-transparent text-green-800",
      Open: "bg-transparent text-yellow-800",
      Rejected: "text-red-800",
    };

    const color = statusColor[status] || "text-gray-800";
    return <span className={`${color} font-medium`}>{status}</span>;
  };

  const renderTicketTable = (category) => {
    const filteredTickets = data.filter(
      (ticket) => ticket.category === category,
    );

    return (
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            {category} Tickets ({filteredTickets.length})
          </h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>{ticket.created_on}</TableCell>
                  <TableCell>{ticket.service_type}</TableCell>
                  <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                  <TableCell>{ticket.last_updated}</TableCell>
                  <TableCell>{ticket.name}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-700"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setIsReplyOpen(true);
                      }}
                    >
                      Reply
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Requested Tickets</h2>
      {categories.map((category) => (
        <div key={category}>{renderTicketTable(category)}</div>
      ))}
      <ToastContainer />
    </div>
  );
}
