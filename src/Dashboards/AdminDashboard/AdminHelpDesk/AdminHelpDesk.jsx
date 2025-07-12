"use client"

import React, { useState, useEffect } from "react";
import { Search, Edit, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AdminTickets from "./AdminTickets";

// Status Progress Bar Component
const StatusProgressBar = ({ status }) => {
  const isApproved = status.toLowerCase() === "approved";
  const isReview = status.toLowerCase() === "review";
  const isRequest = status.toLowerCase() === "request";

  return (
    <div className="relative w-[140px]">
      {/* Progress Line */}
      <div className="absolute top-3 left-6 right-6 h-[3px] bg-gray-200 z-0">
        <div
          className={`h-full ${isApproved ? "bg-green-500" : isReview ? "bg-yellow-500" : isRequest ? "bg-blue-500" : "bg-gray-300"}`}
          style={{
            width: isRequest ? "33%" : isReview ? "66%" : isApproved ? "100%" : "0%",
          }}
        ></div>
      </div>

      {/* Steps */}
      <div className="flex justify-between relative z-10">
        {/* Request */}
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${isRequest || isReview || isApproved ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <span className="text-white text-xs">1</span>
          </div>
          <span className="text-[10px] mt-1 text-gray-600">Request</span>
        </div>

        {/* Review */}
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${isReview || isApproved ? "bg-yellow-500" : "bg-gray-300"}`}
          >
            <span className="text-white text-xs">{isApproved ? "✓" : "2"}</span>
          </div>
          <span className="text-[10px] mt-1 text-gray-600">Review</span>
        </div>

        {/* Approved */}
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${isApproved ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span className="text-white text-xs">{isApproved ? "✓" : "3"}</span>
          </div>
          <span className="text-[10px] mt-1 text-gray-600">Approved</span>
        </div>
      </div>
    </div>
  );
};

// Service Card Component
const ServiceCard = ({ service, onClick }) => (
  <div
    className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow"
    onClick={onClick}
  >
    <div className={`${service.color} ${service.textColor} rounded-lg p-2 mb-2 w-full text-center`}>
      <p className="text-sm font-medium">{service.sublabel}</p>
    </div>
    <p className="text-gray-900 font-semibold text-center">{service.label}</p>
  </div>
);

// Ticket Form Component
const TicketForm = ({
  isOpen,
  onClose,
  selectedService,
  services,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [attachment, setAttachment] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ title, description, serviceType, attachment });
    onClose();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const service = services.find((s) => s.key  === selectedService);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            New Ticket - {service?.label || "Service Request"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service?.options && (
              <div>
                <label className="block text-sm font-medium mb-1">Service Type</label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {service.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                type="text"
                placeholder="Brief description of your issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                rows={6}
                placeholder="Please describe your issue in detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Attachment (Optional)</label>
              <Input type="file" onChange={handleFileChange} />
              <p className="text-xs text-gray-500 mt-1">
                You can upload screenshots or documents related to your issue
              </p>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Request</span>
              <span>Review</span>
              <span>Approval</span>
            </div>
            <div className="relative h-1 bg-gray-200 rounded-full">
              <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: "33%" }}></div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Note: The support team will be notified about your ticket and will respond as soon as possible.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Reply Ticket Dialog Component
const ReplyTicketDialog = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const [replyText, setReplyText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle reply submission logic here
    console.log({ ticketId: ticket?.id, replyText });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Reply to Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p>
                <strong className="text-gray-700">Ticket ID:</strong> {ticket?.id || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Employee Name:</strong> {ticket?.employee_name || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Requested Ticket:</strong> {ticket?.title || "N/A"}
              </p>
            </div>
            <div>
              <p>
                <strong className="text-gray-700">Created On:</strong> {ticket?.created_on || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Last Updated:</strong> {ticket?.last_updated || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Status:</strong> {ticket?.status || "N/A"}
              </p>
            </div>
          </div>

          <Textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Please enter a reply"
            required
          />

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Reply</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Ticket Dialog Component
const EditTicketDialog = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || "");
      setStatus(ticket.status || "");
      setAssignedTo(ticket.assigned_to || "");
      setDepartment(ticket.department || "");
    }
  }, [ticket]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {};
  if (subject && subject !== ticket.subject) payload.subject = subject;
  if (serviceType && serviceType !== ticket.service_type) payload.service_type = serviceType;

  if (Object.keys(payload).length === 0) {
    setError("No changes made.");
    return;
  }

  try {
    const response = await axios.patch(
      `${apiBaseUrl}/api/tickets/${ticket.id}/`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    setTicketData((prevData) =>
      prevData.map((t) =>
        t.id === ticket.id
          ? {
              ...t,
              subject: response.data.subject,
              service_type: response.data.service_type,
              last_updated: response.data.last_updated,
            }
          : t
      )
    );
    setFilteredData((prevData) =>
      prevData.map((t) =>
        t.id === ticket.id
          ? {
              ...t,
              subject: response.data.subject,
              service_type: response.data.service_type,
              last_updated: response.data.last_updated,
            }
          : t
      )
    );

    alert("Ticket updated successfully!");
    onClose();
  } catch (err) {
    console.error("Error updating ticket:", err.response?.data || err.message);
    setError(
      err.response?.data?.error ||
      err.response?.data?.subject?.[0] ||
      err.response?.data?.service_type?.[0] ||
      "Failed to update ticket. Please try again."
    );
  }
};


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p>
                <strong className="text-gray-700">Ticket ID:</strong> {ticket?.id || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Created On:</strong> {ticket?.created_on || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Last Updated:</strong> {ticket?.last_updated || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Request">Request</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assigned To</label>
              <Input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

function AdminHelpDeskComponent() {
  const [ticketData, setTicketData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketPopup, setTicketPopup] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("Last 7 days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Services data
  const services = [
    {
      key: "system",
      label: "System Services",
      sublabel: "System",
      color: "bg-red-100",
      textColor: "text-red-800",
      options: [
        { value: "slow_network", label: "Slow network" },
        { value: "system_performance", label: "System performance" },
        { value: "cyber_hacks", label: "Cyber hacks" },
        { value: "data_loss", label: "Data loss" },
        { value: "software_issue", label: "Software compatibility issues" },
        { value: "troble_shoot", label: "Trouble shoot" },
        { value: "hardware_issue", label: "Hardware issue" },
        { value: "others", label: "Others" },
      ],
    },
  ];

  // Mock data for tickets
  useEffect(() => {
    // Simulate API call
    const fetchData = () => {
      setLoading(true);

      // Mock data
      const mockTickets = Array.from({ length: 20 }, (_, i) => {
        const statuses = ["Request", "Review", "Approved"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        return {
          id: `TKT-${1000 + i}`,
          title: `Support Request ${i + 1}`,
          created_on: date.toISOString().split("T")[0],
          assigned_to: ["John Doe", "Jane Smith", "Robert Johnson"][Math.floor(Math.random() * 3)],
          status: status,
          mappedStatus: status,
          last_updated: new Date().toISOString().split("T")[0],
          employee_name: ["Alex Chen", "Maria Garcia", "Sam Wilson"][Math.floor(Math.random() * 3)],
          department: ["IT", "Marketing", "Sales"][Math.floor(Math.random() * 3)],
        };
      });

      setTicketData(mockTickets);
      setFilteredData(mockTickets);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Filter tickets based on search, status, and date
  useEffect(() => {
    let filtered = [...ticketData];

    // Filter by tab (open/closed)
    if (activeTab === "open") {
      filtered = filtered.filter((ticket) => ticket.status === "Request" || ticket.status === "Review");
    } else if (activeTab === "closed") {
      filtered = filtered.filter((ticket) => ticket.status === "Approved");
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.title?.toLowerCase().includes(term) ||
          ticket.id?.toString().includes(term) ||
          ticket.assigned_to?.toLowerCase().includes(term),
      );
    }

    // Apply status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter((ticket) => ticket.mappedStatus?.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Apply date range filter based on selected filter
    const now = new Date();
    if (selectedFilter === "Last 7 days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter((ticket) => {
        if (!ticket.created_on) return false;
        const ticketDate = new Date(ticket.created_on);
        return ticketDate >= sevenDaysAgo && ticketDate <= now;
      });
    } else if (selectedFilter === "This month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter((ticket) => {
        if (!ticket.created_on) return false;
        const ticketDate = new Date(ticket.created_on);
        return ticketDate >= firstDay && ticketDate <= now;
      });
    } else if (selectedFilter === "Last month") {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      filtered = filtered.filter((ticket) => {
        if (!ticket.created_on) return false;
        const ticketDate = new Date(ticket.created_on);
        return ticketDate >= lastMonthStart && ticketDate <= lastMonthEnd;
      });
    } else if (selectedFilter === "This year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter((ticket) => {
        if (!ticket.created_on) return false;
        const ticketDate = new Date(ticket.created_on);
        return ticketDate >= yearStart && ticketDate <= now;
      });
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter((ticket) => {
        if (!ticket.created_on) return false;
        const ticketDate = new Date(ticket.created_on);
        return ticketDate >= start && ticketDate <= end;
      });
    }

    setFilteredData(filtered);
  }, [searchTerm, startDate, endDate, selectedFilter, selectedStatus, ticketData, activeTab]);

  // Calculate metrics
  const calculateMetrics = () => {
    const today = new Date().toISOString().split("T")[0];

    const ticketsCreatedToday = ticketData.filter((ticket) => ticket.created_on === today).length;

    const ticketsClosedToday = ticketData.filter(
      (ticket) => ticket.status === "Approved" && ticket.last_updated === today
    ).length;

    const openTickets = ticketData.filter((ticket) => ticket.status === "Request" || ticket.status === "Review").length;

    const openTicketsLast30Days = ticketData.filter((ticket) => {
      const createdDate = new Date(ticket.created_on);
      const todayDate = new Date();
      const diffDays = (todayDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30 && (ticket.status === "Request" || ticket.status === "Review");
    }).length;

    return {
      ticketsCreatedToday,
      ticketsClosedToday,
      openTickets,
      openTicketsLast30Days,
      avgFirstResponseTime: "45.2",
      avgResolutionTime: "120.5",
    };
  };

  const {
    ticketsCreatedToday,
    ticketsClosedToday,
    openTickets,
    openTicketsLast30Days,
    avgFirstResponseTime,
    avgResolutionTime,
  } = calculateMetrics();

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    if (filter !== "Custom range") {
      setStartDate("");
      setEndDate("");
    }
    setIsDropdownOpen(false);
  };

  const handleApplyCustomRange = () => {
    if (startDate && endDate) {
      setSelectedFilter("Custom range");
      setIsDropdownOpen(false);
    }
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setSelectedStatus("All");
    setSelectedFilter("Last 7 days");
    setFilteredData(ticketData);
  };

  const handleServiceClick = (serviceKey) => {
    setSelectedService(serviceKey);
    setTicketPopup(true);
  };

  const handleEditClick = (ticket) => {
    setSelectedTicket(ticket);
    setEditDialogOpen(true);
  };

  const handleReplyClick = (ticket) => {
    setSelectedTicket(ticket);
    setReplyDialogOpen(true);
  };

  return (
    <div className="w-full">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between p-4 gap-4">
          <div>
            <h5 className="font-semibold text-lg mb-1">Support Ticket Status</h5>
            <p className="text-gray-500 text-sm">Data from all departments</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="flex items-center">
              <div className="flex mr-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                  R
                </div>
                <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white -ml-2">
                  V
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white -ml-2">
                  A
                </div>
              </div>
              <span className="text-sm text-gray-500 hidden sm:inline">Ticket Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tickets Created Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ticketsCreatedToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tickets Closed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ticketsClosedToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{openTickets}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Open Tickets (Last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{openTicketsLast30Days}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. First Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgFirstResponseTime} mins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgResolutionTime} mins</p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Raise Section */}
      <Card className="mb-6">
        <CardHeader className="bg-gray-100 py-2">
          <CardTitle className="text-center text-lg">Ticket Raise</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.key} service={service} onClick={() => handleServiceClick(service.key)} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Support Tickets</CardTitle>
            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
              {/* Status Filter Dropdown */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Request">Request</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter Button */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2"
                >
                  Filter by Date
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-2 right-0 bg-white rounded-lg shadow-xl p-4 w-72">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-purple-600">Date Filter</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDropdownOpen(false)}
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </div>

                    {["Last 7 days", "This month", "Last month", "This year", "Custom range"].map((option) => (
                      <div
                        key={option}
                        className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedFilter === option ? "bg-gray-200 text-purple-600" : ""}`}
                        onClick={() => {
                          if (option !== "Custom range") {
                            handleFilterSelect(option);
                          } else {
                            setSelectedFilter(option);
                          }
                        }}
                      >
                        {option}
                      </div>
                    ))}

                    {selectedFilter === "Custom range" && (
                      <div className="mt-3">
                        <div className="flex gap-2">
                          <div>
                            <label className="text-xs text-gray-500">From</label>
                            <Input
                              type="date"
                              className="w-full text-sm"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">To</label>
                            <Input
                              type="date"
                              className="w-full text-sm"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between mt-3">
                          <Button variant="ghost" size="sm" onClick={handleResetFilter}>
                            Reset
                          </Button>
                          <Button size="sm" onClick={handleApplyCustomRange}>
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <Tabs defaultValue="open" className="w-full" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="open">Open Tickets</TabsTrigger>
                <TabsTrigger value="closed">Closed Tickets</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                className="pl-8"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Tickets Table */}
          <div className="border rounded-lg overflow-x-auto">
            {loading && <p className="text-center text-blue-500 my-4">Loading ticket data...</p>}
            {error && <p className="text-center text-red-500 my-4">{error}</p>}
            {!loading && !error && filteredData.length === 0 && (
              <p className="text-center text-gray-500 my-4">No ticket data available for the selected criteria.</p>
            )}

            {!loading && !error && filteredData.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-10">
                      <input type="checkbox" className="rounded" />
                    </TableHead>
                    <TableHead>TICKET NUMBER</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>TITLE</TableHead>
                    <TableHead>CREATED ON</TableHead>
                    <TableHead>ASSIGNED TO</TableHead>
                    <TableHead>DEPARTMENT</TableHead>
                    <TableHead className="w-20">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((ticket, index) => {
                    const avatarColor = [
                      "bg-cyan-500",
                      "bg-blue-500",
                      "bg-orange-500",
                      "bg-green-500",
                      "bg-purple-500",
                    ][index % 5];
                    const avatarLetter = ticket.assigned_to?.charAt(0) || "U";

                    return (
                      <TableRow key={ticket.id || index} className="hover:bg-gray-50">
                        <TableCell>
                          <input type="checkbox" className="rounded" />
                        </TableCell>
                        <TableCell>{ticket.id}</TableCell>
                        <TableCell>
                          <StatusProgressBar status={ticket.mappedStatus || "Request"} />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-blue-600">{ticket.title}</div>
                        </TableCell>
                        <TableCell>{ticket.created_on}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center mr-2`}
                            >
                              {avatarLetter}
                            </div>
                            <div>
                              <div className="font-medium">{ticket.assigned_to}</div>
                              <div className="text-xs text-gray-500">{ticket.department}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{ticket.department}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(ticket)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows Per Page: 10</span>
              <Button variant="outline" size="sm" className="text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Form Dialog */}
      <TicketForm
        isOpen={ticketPopup}
        onClose={() => setTicketPopup(false)}
        selectedService={selectedService}
        services={services}
      />

      {/* Reply Ticket Dialog */}
      <ReplyTicketDialog isOpen={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} ticket={selectedTicket} />

      {/* Edit Ticket Dialog */}
      <EditTicketDialog isOpen={editDialogOpen} onClose={() => setEditDialogOpen(false)} ticket={selectedTicket} />
    </div>
  );
};

// Main Page Component that includes all the Admin Help Desk functionality
export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin HelpDesk Dashboard</h1>
      <div className="mb-6">
        <AdminHelpDeskComponent />
      </div>
      <div>
        <AdminTickets />
      </div>
    </div>
  );
}