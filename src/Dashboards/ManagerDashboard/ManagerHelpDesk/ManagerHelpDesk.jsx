import { useState, useEffect } from "react";
import { Search, Edit, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import ManagerTickets from "./ManagerTickets";
import { GetManagerTicketList } from "@/api/ServerAction";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const apiBaseUrl = process.env.VITE_BASE_API;

// Status Progress Bar Component (used only for Closed Tickets)
const StatusProgressBar = ({ status }) => {
  const isApproved = status.toLowerCase() === "approved";
  const isReview = status.toLowerCase() === "review";
  const isRequest = status.toLowerCase() === "request";

  return (
    <div className="relative w-[140px]">
      <div className="absolute top-3 left-6 right-6 h-[3px] bg-gray-200 z-0">
        <div
          className={`h-full ${isApproved ? "bg-green-500" : isReview ? "bg-orange-500" : isRequest ? "bg-blue-500" : "bg-gray-300"}`}
          style={{
            width: isRequest
              ? "33%"
              : isReview
                ? "66%"
                : isApproved
                  ? "100%"
                  : "0%",
          }}
        ></div>
      </div>
      <div className="flex justify-between relative z-10">
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center 
            ${isRequest || isReview || isApproved ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <span className="text-white text-xs">1</span>
          </div>
          <span className="text-[10px] mt-1 text-gray-600">Request</span>
        </div>
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center 
            ${isReview || isApproved ? "bg-orange-500" : "bg-gray-300"}`}
          >
            <span className="text-white text-xs">{isApproved ? "✓" : "2"}</span>
          </div>
          <span className="text-[10px] mt-1 text-gray-600">Review</span>
        </div>
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center 
            ${isApproved ? "bg-green-500" : "bg-gray-300"}`}
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
    <div
      className={`${service.color} ${service.textColor} rounded-lg p-2 mb-2 w-full text-center`}
    >
      <p className="text-sm font-medium">{service.sublabel}</p>
    </div>
    <p className="text-gray-900 font-semibold text-center">{service.label}</p>
  </div>
);
const TicketForm = ({
  isOpen,
  onClose,
  selectedService,
  services,
  onSuccess,
}) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [recipientList, setRecipientList] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
  const [hasFetchedRecipients, setHasFetchedRecipients] = useState(false);
  const [error, setError] = useState("");

  const fetchRecipients = async () => {
    if (hasFetchedRecipients) return;

    try {
      let endpoint;
      let nameField;
      let idField;

      switch (selectedService) {
        case "admin":
        case "system":
        case "other":
          endpoint = "api/helpdesk/admin_list/";
          nameField = "username";
          idField = "user_id";
          break;
        case "hr":
          endpoint = "api/helpdesk/hr_list/";
          nameField = "hr_name";
          idField = "hr_id";
          break;
        case "supervisor":
          endpoint = "api/helpdesk/supervisor_list/";
          nameField = "supervisor_name";
          idField = "supervisor_id";
          break;
        default:
          endpoint = "api/helpdesk/admin_list/";
          nameField = "username";
          idField = "user_id";
      }

      const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
      const mappedRecipients = response.data
        .map((recipient) => {
          const value =
            recipient[idField] ||
            String(
              recipient[nameField] ||
                "unknown-" + Math.random().toString(36).substr(2, 9),
            );
          const label = recipient[nameField] || "Unknown";
          return { value, label };
        })
        .filter((recipient) => recipient.value && recipient.value !== "");

      setRecipientList(mappedRecipients);
      setHasFetchedRecipients(true);
    } catch (error) {
      console.error("Error fetching recipients:", error);
      setRecipientList([]);
      setError("Failed to load recipients. Please try again.");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSubject("");
      setDescription("");
      setServiceType("");
      setAttachment(null);
      setRecipientList([]);
      setSelectedRecipient("");
      setHasFetchedRecipients(false);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject) {
      setError("Subject is required.");
      return;
    }
    if (!description) {
      setError("Description is required.");
      return;
    }
    if (selectedService === "other" && !serviceType) {
      setError("Service type is required for Other tickets.");
      return;
    }
    if (selectedService !== "other" && !serviceType) {
      setError("Service type is required.");
      return;
    }
    if (!selectedRecipient) {
      setError("Recipient is required.");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("description", description);
    formData.append(
      "service_type",
      selectedService === "other" ? serviceType : serviceType || "other",
    );
    formData.append("raise_to", selectedRecipient);
    const userData = JSON.parse(localStorage.getItem("userdata"));
    const managerId = userData?.manager_id;
    if (managerId) {
      formData.append("manager_id", managerId);
    }
    if (attachment) formData.append("attachment", attachment);

    try {
      let endpoint;
      switch (selectedService) {
        case "admin":
          endpoint = "tickets/admin/";
          break;
        case "hr":
          endpoint = "tickets/hr/";
          break;
        case "supervisor":
          endpoint = "tickets/supervisor/";
          break;
        case "system":
          endpoint = "tickets/system/";
          break;
        default:
          endpoint = "tickets/other/";
      }

      const response = await axios.post(
        `${apiBaseUrl}/api/${endpoint}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.data.ticket_id) {
        alert(`Ticket submitted successfully! ID: ${response.data.ticket_id}`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError("Ticket submission failed. No ticket ID returned.");
      }
    } catch (error) {
      console.error("Submission error:", error.response?.data || error);
      setError(
        "Error submitting ticket: " +
          (error.response?.data?.raise_to?.[0] || "Unknown error"),
      );
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const service = services.find((s) => s.key === selectedService);

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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedService !== "other" && service?.options && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Service Type
                </label>
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

            {selectedService === "other" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Other Service
                </label>
                <Input
                  type="text"
                  placeholder="Enter service type (e.g., General Inquiry)"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                type="text"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Raise Ticket To
              </label>
              <Select
                value={selectedRecipient}
                onValueChange={setSelectedRecipient}
                onOpenChange={(open) => {
                  setIsRecipientDropdownOpen(open);
                  if (open && !hasFetchedRecipients) {
                    fetchRecipients();
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipientList.length === 0 && isRecipientDropdownOpen ? (
                    <div className="p-2 text-gray-500 text-sm">
                      {hasFetchedRecipients
                        ? "No recipients available"
                        : "Loading recipients..."}
                    </div>
                  ) : (
                    recipientList.map((recipient) => (
                      <SelectItem key={recipient.value} value={recipient.value}>
                        {recipient.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                rows={6}
                placeholder="Please describe your issue in detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">
                Attachment (Optional)
              </label>
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
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                style={{ width: "33%" }}
              ></div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Note: The support team will be notified about your ticket and will
            respond as soon as possible.
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
const ReplyTicketDialog = ({ isOpen, onClose, ticket }) => {
  const [replyText, setReplyText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/tickets/${ticket?.id}/reply/`,
        { reply_text: replyText },
        { headers: { "Content-Type": "application/json" } },
      );
      alert("Reply submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting reply:", error.response?.data || error);
      alert(
        "Failed to submit reply: " +
          (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Reply to Ticket
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p>
                <strong className="text-gray-700">Ticket ID:</strong>{" "}
                {ticket?.id || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Subject:</strong>{" "}
                {ticket?.subject || "N/A"}
              </p>
            </div>
            <div>
              <p>
                <strong className="text-gray-700">Created On:</strong>{" "}
                {ticket?.created_on || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">
                  Last Updated:
                </strong>{" "}
                {ticket?.last_updated || "N/A"}
              </p>
            </div>
          </div>

          <Textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Please enter your reply"
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

const EditTicketDialog = ({
  isOpen,
  onClose,
  ticket,
  setTicketData,
  setFilteredData,
}) => {
  const [subject, setSubject] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [error, setError] = useState("");

  // Service type options based on ticket category
  const serviceTypeOptions = (() => {
    if (!ticket?.id) return [];
    const ticketType = ticket.id.split("-")[1]; // e.g., TKT-ADM-1 -> ADM
    switch (ticketType) {
      case "ADM":
        return [
          { value: "password_change", label: "Password Change" },
          { value: "username_change", label: "Username Change" },
          { value: "location_change", label: "Location Change" },
          { value: "shift_change", label: "Shift Change" },
          { value: "team_related", label: "Team Related" },
          { value: "task_related", label: "Task Related" },
          { value: "project_related", label: "Project Related" },
          { value: "others", label: "Others" },
        ];
      case "HR":
        return [
          { value: "leave_policy", label: "Leave Policy" },
          { value: "leave_request_related", label: "Leave Request Related" },
          { value: "login_issue", label: "Login Issue" },
          { value: "salary_related", label: "Salary Related" },
          { value: "attendance_related", label: "Attendance Related" },
          { value: "training_conflicts", label: "Training Conflicts" },
          { value: "others", label: "Others" },
        ];
      case "SUP":
        return [
          { value: "reports_of_project", label: "Reports of Project" },
          { value: "reports_of_tasks", label: "Reports of Tasks" },
          { value: "team_conflicts", label: "Team Conflicts" },
          { value: "communication_issue", label: "Communication Issue" },
          { value: "performance_related", label: "Performance Related" },
          { value: "others", label: "Others" },
        ];
      case "SYS":
        return [
          { value: "slow_network", label: "Slow Network" },
          { value: "system_performance", label: "System Performance" },
          { value: "cyber_hacks", label: "Cyber Hacks" },
          { value: "data_loss", label: "Data Loss" },
          { value: "software_issue", label: "Software Compatibility Issues" },
          { value: "trouble_shoot", label: "Trouble Shoot" },
          { value: "hardware_issue", label: "Hardware Issue" },
          { value: "others", label: "Others" },
        ];
      case "OTH":
        return []; // No dropdown options for Other tickets
      default:
        return [];
    }
  })();

  useEffect(() => {
    if (ticket) {
      setSubject(ticket.subject || "");
      setServiceType(ticket.service_type || "");
      setError("");
    }
  }, [ticket]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {};
    if (subject && subject !== ticket.subject) payload.subject = subject;
    if (serviceType && serviceType !== ticket.service_type)
      payload.service_type = serviceType;

    if (Object.keys(payload).length === 0) {
      setError("No changes made.");
      return;
    }

    try {
      const response = await axios.patch(
        `${apiBaseUrl}/api/tickets/${ticket.id}/`,
        payload,
        { headers: { "Content-Type": "application/json" } },
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
            : t,
        ),
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
            : t,
        ),
      );

      alert("Ticket updated successfully!");
      onClose();
    } catch (err) {
      console.error(
        "Error updating ticket:",
        err.response?.data || err.message,
      );
      setError(
        err.response?.data?.error ||
          err.response?.data?.subject?.[0] ||
          err.response?.data?.service_type?.[0] ||
          "Failed to update ticket. Please try again.",
      );
    }
  };

  if (!isOpen) return null;

  const isOtherTicket = ticket?.id?.startsWith("TKT-OTH");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Ticket
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p>
                <strong className="text-gray-700">Ticket ID:</strong>{" "}
                {ticket?.id || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Created On:</strong>{" "}
                {ticket?.created_on || "N/A"}
              </p>
              <p>
                <strong className="text-gray-700">Last Updated:</strong>{" "}
                {ticket?.last_updated || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <label className="block text-sm font-medium mb-1 mt-4">
                Service Type
              </label>
              {isOtherTicket ? (
                <Input
                  type="text"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="Enter service type (e.g., General Inquiry)"
                  required
                />
              ) : (
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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

function ManagerHelpDeskComponent() {
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const queryClient = useQueryClient();

  const {
    data: positionRequestData,
    isError: isPositionRequestError,
    isFetching: isPositionRequestFetching,
  } = useQuery({
    queryKey: ["managerPositionRequests"],
    queryFn: async () => {
      const response = await axios.get(
        `${apiBaseUrl}/manpower/manager-position-requests/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.success) {
        return response.data.requests.map((request) => ({
          id: request.request_id,
          title: request.title,
          created_on: request.created_at,
          requested_by: request.requested_by_name || "N/A",
          hr_reviewer: request.hr_reviewer_name || "N/A",
          status:
            request.status === "hr_review"
              ? "In Review"
              : request.status === "approved"
                ? "Approved"
                : request.status === "rejected"
                  ? "Rejected"
                  : "Unknown",
          last_updated: request.created_at,
        }));
      }
      throw new Error(
        response.data.message || "Failed to fetch position requests.",
      );
    },
    placeholderData: [],
    staleTime: 1000,
  });

  const services = [
    {
      key: "admin",
      label: "Administrative Services",
      sublabel: "Admin",
      color: "bg-blue-100",
      textColor: "text-blue-800",
      options: [
        { value: "password_change", label: "Password change" },
        { value: "username_change", label: "Username change" },
        { value: "location_change", label: "Location change" },
        { value: "shift_change", label: "Shift change" },
        { value: "team_related", label: "Team related" },
        { value: "task_related", label: "Task related" },
        { value: "project_related", label: "Project related" },
        { value: "others", label: "Others" },
      ],
    },
    {
      key: "hr",
      label: "HR Services",
      sublabel: "HR",
      color: "bg-yellow-100",
      textColor: "text-yellow-800",
      options: [
        { value: "leave_policy", label: "Leave policy" },
        { value: "leave_request_related", label: "Leave request related" },
        { value: "login_issue", label: "Login issue" },
        { value: "salary_related", label: "Salary related" },
        { value: "attendance_related", label: "Attendance related" },
        { value: "training_conflicts", label: "Training conflicts" },
        { value: "others", label: "Others" },
      ],
    },
    {
      key: "supervisor",
      label: "Supervisor Services",
      sublabel: "Supervisor",
      color: "bg-purple-100",
      textColor: "text-purple-800",
      options: [
        { value: "reports_of_project", label: "Reports of project" },
        { value: "reports_of_tasks", label: "Reports of tasks" },
        { value: "team_conflicts", label: "Team conflicts" },
        { value: "communication_issue", label: "Communication issue" },
        { value: "performance_related", label: "Performance related" },
        { value: "others", label: "Others" },
      ],
    },
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
        { value: "trouble_shoot", label: "Trouble shoot" },
        { value: "hardware_issue", label: "Hardware issue" },
        { value: "others", label: "Others" },
      ],
    },
    {
      key: "other",
      label: "Other Services",
      sublabel: "Other",
      color: "bg-indigo-100",
      textColor: "text-indigo-800",
      options: [],
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const tickets = await GetManagerTicketList();
      if (tickets == null) {
        throw new Error("Failed to fetch tickets");
      }
      const mappedTickets = tickets.map((ticket) => ({
        id: ticket.ticket_id,
        subject: ticket.subject,
        created_on: new Date(ticket.created_on).toISOString().split("T")[0],
        assigned_to: ticket.raise_to || "Unassigned",
        status: ticket.status,
        mappedStatus: ticket.status,
        last_updated: new Date(ticket.last_updated).toISOString().split("T")[0],
        employee_name: ticket.manager_name || "N/A",
        service_type: ticket.service_type || "N/A",
        latest_reply: ticket.latest_reply?.reply_text || null,
      }));
      setTicketData(mappedTickets);
      setFilteredData(mappedTickets);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...ticketData];
    if (activeTab === "open") {
      filtered = filtered.filter((ticket) => ticket.status === "Request");
    } else if (activeTab === "closed") {
      filtered = filtered.filter(
        (ticket) => ticket.status === "Review" || ticket.status === "Approved",
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject?.toLowerCase().includes(term) ||
          ticket.id?.toString().includes(term) ||
          ticket.assigned_to?.toLowerCase().includes(term) ||
          ticket.service_type?.toLowerCase().includes(term),
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter(
        (ticket) =>
          ticket.mappedStatus?.toLowerCase() === selectedStatus.toLowerCase(),
      );
    }

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
  }, [
    searchTerm,
    startDate,
    endDate,
    selectedFilter,
    selectedStatus,
    ticketData,
    activeTab,
  ]);

  const calculateMetrics = () => {
    const today = new Date().toISOString().split("T")[0];

    const ticketsCreatedToday = ticketData.filter(
      (ticket) => ticket.created_on === today,
    ).length;

    const ticketsClosedToday = ticketData.filter(
      (ticket) => ticket.status === "Review" && ticket.last_updated === today,
    ).length;

    // Open Tickets (unchanged: count tickets with "Request" status)
    const openTickets = ticketData.filter(
      (ticket) => ticket.status === "Request",
    ).length;

    // Open Tickets Last 30 Days (unchanged: count tickets with "Request" status from last 30 days)
    const openTicketsLast30Days = ticketData.filter((ticket) => {
      const createdDate = new Date(ticket.created_on);
      const todayDate = new Date();
      const diffDays =
        (todayDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30 && ticket.status === "Request";
    }).length;

    // Total Closed Tickets (count tickets with status "Review" or "Approved")
    const totalClosedTickets = ticketData.filter(
      (ticket) => ticket.status === "Review" || ticket.status === "Approved",
    ).length;

    return {
      ticketsCreatedToday,
      ticketsClosedToday,
      openTickets,
      openTicketsLast30Days,
      totalClosedTickets,
      avgFirstResponseTime: "45.2", // Placeholder (unchanged)
      avgResolutionTime: "120.5", // Placeholder (unchanged)
    };
  };

  const {
    ticketsCreatedToday,
    ticketsClosedToday,
    openTickets,
    openTicketsLast30Days,
    totalClosedTickets,
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

  const handleRefresh = () => {
    queryClient.invalidateQueries(["managerPositionRequests"]);
  };

  const handleApproveRequest = async (id) => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/manpower/approve-position-request/${id}/`,
        { action: "approve" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        queryClient.setQueryData(["managerPositionRequests"], (oldData) =>
          oldData.map((request) =>
            request.id === id
              ? { ...request, status: "Approved", last_updated: new Date().toISOString().split("T")[0] }
              : request
          )
        );
        alert("Request approved successfully!");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request.");
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/manpower/approve-position-request/${id}/`,
        { action: "reject" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.success) {
        alert("Request rejected successfully!");
        queryClient.setQueryData(["managerPositionRequests"], (oldData) =>
          oldData.map((request) =>
            request.id === id
              ? { ...request, status: "Rejected", last_updated: new Date().toISOString().split("T")[0] }
              : request
          )
        );
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert(error.response?.data?.message || "Error rejecting request.");
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "In Review":
        return (
          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full">
            {status}
          </span>
        );
      case "Approved":
        return (
          <span className="bg-green-500 text-white px-2 py-1 rounded-full">
            {status}
          </span>
        );
      case "Rejected":
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

  const formatDate = (dateString) => {
    try {
      return dateString ? new Date(dateString).toLocaleDateString() : "N/A";
    } catch (error) {
      console.error("Date parsing error:", error);
      return "N/A";
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between p-4 gap-4">
          <div>
            <h5 className="font-semibold text-lg mb-1">
              Support Ticket Status
            </h5>
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
              <span className="text-sm text-gray-500 hidden sm:inline">
                Ticket Status
              </span>
            </div>
          </div>
        </div>
      </div>

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
            <CardTitle className="text-lg">
              Open Tickets (Last 30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{openTicketsLast30Days}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Closed Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalClosedTickets}</p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. First Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgFirstResponseTime} mins</p>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgResolutionTime} mins</p>
          </CardContent>
        </Card> */}
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-gray-100 py-2">
          <CardTitle className="text-center text-lg">Ticket Raise</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.key}
                service={service}
                onClick={() => handleServiceClick(service.key)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Support Tickets</CardTitle>
            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
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
                      <span className="font-semibold text-purple-600">
                        Date Filter
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDropdownOpen(false)}
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                    {[
                      "Last 7 days",
                      "This month",
                      "Last month",
                      "This year",
                      "Custom range",
                    ].map((option) => (
                      <div
                        key={option}
                        className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                          selectedFilter === option
                            ? "bg-gray-200 text-purple-600"
                            : ""
                        }`}
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
                            <label className="text-xs text-gray-500">
                              From
                            </label>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilter}
                          >
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
            <Tabs
              defaultValue="open"
              className="w-full"
              onValueChange={setActiveTab}
            >
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
          <div className="border rounded-lg overflow-x-auto">
            {loading && (
              <p className="text-center text-blue-500 my-4">
                Loading ticket data...
              </p>
            )}
            {error && <p className="text-center text-red-500 my-4">{error}</p>}
            {!loading && !error && filteredData.length === 0 && (
              <p className="text-center text-gray-500 my-4">
                No ticket data available for the selected criteria.
              </p>
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
                    <TableHead>SUBJECT</TableHead>
                    <TableHead>SERVICE TYPE</TableHead>
                    <TableHead>CREATED ON</TableHead>
                    <TableHead>ASSIGNED TO</TableHead>
                    {activeTab === "closed" && (
                      <TableHead>REPLY MESSAGE</TableHead>
                    )}
                    {activeTab === "open" && (
                      <TableHead className="w-20">ACTIONS</TableHead>
                    )}
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
                      <TableRow
                        key={ticket.id || index}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <input type="checkbox" className="rounded" />
                        </TableCell>
                        <TableCell>{ticket.id}</TableCell>
                        <TableCell>
                          {activeTab === "open" ? (
                            <span className="bg-yellow-100 text-yellow-800 w-24 text-center justify-center rounded inline-block px-2 py-0.5">
                              In Progress
                            </span>
                          ) : (
                            <StatusProgressBar
                              status={ticket.mappedStatus || "Request"}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-blue-600">
                            {ticket.subject}
                          </div>
                        </TableCell>
                        <TableCell>{ticket.service_type}</TableCell>
                        <TableCell>{ticket.created_on}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center mr-2`}
                            >
                              {avatarLetter}
                            </div>
                            <div>
                              <div className="font-medium">
                                {ticket.assigned_to}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        {activeTab === "closed" && (
                          <TableCell>
                            {ticket.latest_reply ? (
                              <div className="text-gray-600">
                                {ticket.latest_reply}
                              </div>
                            ) : (
                              <div className="text-gray-400">No reply</div>
                            )}
                          </TableCell>
                        )}
                        {activeTab === "open" && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(ticket)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {filteredData.length > 0 ? 1 : 0} to{" "}
              {Math.min(filteredData.length, rowsPerPage)} of{" "}
              {filteredData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows Per Page: {rowsPerPage}</span>
              <Button variant="outline" size="sm" className="text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Requests Section */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="p-4">
          <h5 className="font-semibold text-lg mb-4">Position Requests</h5>
          {positionRequestData?.length === 0 ? (
            <p className="text-gray-500 text-center">
              No position requests assigned to you.
            </p>
          ) : (
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">REQUEST ID</th>
                  <th className="px-4 py-2 text-left">TITLE</th>
                  <th className="px-4 py-2 text-left">CREATED ON</th>
                  <th className="px-4 py-2 text-left">REQUESTED BY</th>
                  <th className="px-4 py-2 text-left">ASSIGNED TO</th>
                  <th className="px-4 py-2 text-left">STATUS</th>
                  <th className="px-4 py-2 text-left">LAST UPDATED</th>
                  <th className="px-4 py-2 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {positionRequestData?.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{request.id}</td>
                    <td className="px-4 py-2">{request.title}</td>
                    <td className="px-4 py-2">
                      {formatDate(request.created_on)}
                    </td>
                    <td className="px-4 py-2">{request.requested_by}</td>
                    <td className="px-4 py-2">{request.hr_reviewer}</td>
                    <td className="px-4 py-2">
                      {renderStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-2">
                      {formatDate(request.last_updated)}
                    </td>
                    <td className="px-4 py-2">
                      {request.status === "In Review" ? (
                        <div className="flex space-x-2">
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          No actions available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <TicketForm
        isOpen={ticketPopup}
        onClose={() => setTicketPopup(false)}
        selectedService={selectedService}
        services={services}
        onSuccess={fetchData}
      />

      <ReplyTicketDialog
        isOpen={replyDialogOpen}
        onClose={() => setReplyDialogOpen(false)}
        ticket={selectedTicket}
      />
      <EditTicketDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        ticket={selectedTicket}
        setTicketData={setTicketData}
        setFilteredData={setFilteredData}
      />
    </div>
  );
}

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
      <div className="mb-6">
        <ManagerHelpDeskComponent />
      </div>
      <div>
        <ManagerTickets />
      </div>
    </div>
  );
}
