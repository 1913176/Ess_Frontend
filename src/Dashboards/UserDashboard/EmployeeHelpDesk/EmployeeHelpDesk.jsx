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
import EmployeeTickets from "./EmployeeTickets";
import { GetEmployeeTicketList } from "@/api/ServerAction";

const apiBaseUrl = process.env.VITE_BASE_API;

// Status Progress Bar Component
const StatusProgressBar = ({ status, type }) => {
  let isRequest, isReview, isApproved;
  if (type === "position_request") {
    isRequest = status.toLowerCase() === "pending";
    isReview = status.toLowerCase() === "hr_review";
    isApproved = status.toLowerCase() === "approved" || status.toLowerCase() === "rejected";
  } else {
    isRequest = status.toLowerCase() === "request";
    isReview = status.toLowerCase() === "review";
    isApproved = status.toLowerCase() === "approved";
  }

  const progressColor = isApproved
    ? status.toLowerCase() === "rejected" ? "bg-red-500" : "bg-green-500"
    : isReview ? "bg-orange-500"
    : isRequest ? "bg-blue-500"
    : "bg-gray-300";

  return (
    <div className="relative w-[140px]">
      <div className="absolute top-3 left-6 right-6 h-[3px] bg-gray-200 z-0">
        <div
          className={`h-full ${progressColor}`}
          style={{
            width: isRequest ? "33%" : isReview ? "66%" : isApproved ? "100%" : "0%",
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
            ${isApproved ? progressColor : "bg-gray-300"}`}
          >
            <span className="text-white text-xs">{isApproved ? "✓" : "3"}</span>
          </div>
          <span className="text-[10px] mt-1 text-gray-600">
            {status.toLowerCase() === "rejected" ? "Rejected" : "Approved"}
          </span>
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

// Ticket Form Component
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
        case "manager":
          endpoint = "api/helpdesk/manager_list/";
          nameField = "manager_name";
          idField = "manager_id";
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
    const employeeId = userData?.employee_id;
    if (employeeId) {
      formData.append("employee_id", employeeId);
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
        case "manager":
          endpoint = "tickets/manager/";
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
                <strong className="text-gray-700">Last Updated:</strong>{" "}
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

// Edit Ticket Dialog Component
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

  const serviceTypeOptions = (() => {
    if (!ticket?.id) return [];
    const ticketType = ticket.id.split("-")[1];
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
      case "MGR":
        return [
          { value: "task_late_submission", label: "Task Late Submission" },
          { value: "project_materials", label: "Project Materials" },
          { value: "team_conflicts", label: "Team Conflicts" },
          { value: "risk_management", label: "Risk Management" },
          { value: "project_deadline", label: "Project Deadline" },
          { value: "project_plan", label: "Project Plan" },
          { value: "resource_allocation", label: "Resource Allocation" },
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

function EmployeeHelpDeskComponent() {
  const [ticketData, setTicketData] = useState([]);
  const [positionRequests, setPositionRequests] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
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
  const [showHRMSForm, setShowHRMSForm] = useState(false);
  const [hrmsFormData, setHrmsFormData] = useState({
    title: "",
    location: "",
    experience: "",
    jobType: "",
    openings: "",
    role: "",
    hr_reviewer: "",
  });
  const [locations, setLocations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [formError, setFormError] = useState("");

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/admin/overall-location/`);
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setFormError("Failed to load locations.");
      }
    };
    fetchLocations();
  }, []);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/roles/list/`);
        setRoles(response.data.roles || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setFormError("Failed to load roles.");
      }
    };
    fetchRoles();
  }, []);

  // Fetch HRs on component mount
  useEffect(() => {
    const fetchHrs = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/hr_list/`);
        const hrData = response.data.hrs || response.data;
        setHrs(Array.isArray(hrData) ? hrData : []);
      } catch (error) {
        console.error("Error fetching HRs:", error);
        setFormError("Failed to load HR reviewers.");
      }
    };
    fetchHrs();
  }, []);

  // Fetch position requests
  useEffect(() => {
    const fetchPositionRequests = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/manpower/position-requests/`);
        const mappedRequests = response.data.requests.map((request) => ({
          id: request.request_id,
          subject: request.title,
          created_on: new Date(request.created_at).toISOString().split("T")[0],
          assigned_to: request.hr_reviewer_name || "Unassigned",
          status: request.status,
          mappedStatus: request.status === "pending" ? "Request" :
                        request.status === "hr_review" ? "Review" :
                        request.status === "approved" || request.status === "rejected" ? "Approved" : "Request",
          last_updated: new Date(request.created_at).toISOString().split("T")[0],
          employee_name: request.requested_by_name || "N/A",
          service_type: "Position Request",
          type: "position_request",
          latest_reply: null, // Position requests don't have replies
        }));
        setPositionRequests(mappedRequests);
      } catch (error) {
        console.error("Error fetching position requests:", error);
        setError("Failed to load position requests. Please try again later.");
      }
    };
    fetchPositionRequests();
  }, []);

  // Fetch tickets
  const fetchData = async () => {
    try {
      const tickets = await GetEmployeeTicketList();
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
        employee_name: ticket.employee_name || "N/A",
        service_type: ticket.service_type || "N/A",
        type: "ticket",
        latest_reply: ticket.latest_reply?.reply_text || null,
      }));
      setTicketData(mappedTickets);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets. Please try again later.");
    }
  };

  // Combine tickets and position requests
  useEffect(() => {
    setCombinedData([...ticketData, ...positionRequests]);
    setLoading(false);
  }, [ticketData, positionRequests]);

  // Filter combined data
  useEffect(() => {
    let filtered = [...combinedData];
    if (activeTab === "open") {
      filtered = filtered.filter((item) => item.mappedStatus === "Request" || item.status === "pending" || item.status === "hr_review");
    } else if (activeTab === "closed") {
      filtered = filtered.filter((item) => item.mappedStatus === "Review" || item.mappedStatus === "Approved" || item.status === "approved" || item.status === "rejected");
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.subject?.toLowerCase().includes(term) ||
          item.id?.toString().includes(term) ||
          item.assigned_to?.toLowerCase().includes(term) ||
          item.service_type?.toLowerCase().includes(term),
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter(
        (item) =>
          item.mappedStatus?.toLowerCase() === selectedStatus.toLowerCase(),
      );
    }

    const now = new Date();
    if (selectedFilter === "Last 7 days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter((item) => {
        if (!item.created_on) return false;
        const itemDate = new Date(item.created_on);
        return itemDate >= sevenDaysAgo && itemDate <= now;
      });
    } else if (selectedFilter === "This month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter((item) => {
        if (!item.created_on) return false;
        const itemDate = new Date(item.created_on);
        return itemDate >= firstDay && itemDate <= now;
      });
    } else if (selectedFilter === "Last month") {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      filtered = filtered.filter((item) => {
        if (!item.created_on) return false;
        const itemDate = new Date(item.created_on);
        return itemDate >= lastMonthStart && itemDate <= lastMonthEnd;
      });
    } else if (selectedFilter === "This year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter((item) => {
        if (!item.created_on) return false;
        const itemDate = new Date(item.created_on);
        return itemDate >= yearStart && itemDate <= now;
      });
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter((item) => {
        if (!item.created_on) return false;
        const itemDate = new Date(item.created_on);
        return itemDate >= start && itemDate <= end;
      });
    }

    setFilteredData(filtered);
  }, [
    searchTerm,
    startDate,
    endDate,
    selectedFilter,
    selectedStatus,
    combinedData,
    activeTab,
  ]);

  const handleHRMSClick = () => {
    setShowHRMSForm(true);
  };

  const handleHRMSFormChange = (e) => {
    const { name, value } = e.target;
    setHrmsFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHRMSSave = async () => {
    try {
      if (!hrmsFormData.title) {
        setFormError("Title is required.");
        return;
      }
      if (!hrmsFormData.location) {
        setFormError("Location is required.");
        return;
      }
      if (!hrmsFormData.experience) {
        setFormError("Experience level is required.");
        return;
      }
      if (!hrmsFormData.jobType) {
        setFormError("Job type is required.");
        return;
      }
      if (!hrmsFormData.openings || hrmsFormData.openings <= 0) {
        setFormError("Number of openings must be a positive integer.");
        return;
      }
      if (!hrmsFormData.role) {
        setFormError("Role is required.");
        return;
      }
      if (!hrmsFormData.hr_reviewer) {
        setFormError("HR reviewer is required.");
        return;
      }

      const userData = JSON.parse(localStorage.getItem("userdata"));
      const employeeId = userData?.employee_id;

      const payload = {
        title: hrmsFormData.title,
        location: hrmsFormData.location,
        experience_level: hrmsFormData.experience,
        job_types: hrmsFormData.jobType,
        opening_roles: parseInt(hrmsFormData.openings, 10),
        role: hrmsFormData.role,
        hr_reviewer: hrmsFormData.hr_reviewer,
        requested_by: employeeId,
      };

      const response = await axios.post(
        `${apiBaseUrl}/manpower/raise-position-request/`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.request_id) {
        alert(`Position request submitted successfully! ID: ${response.data.request_id}`);
        setShowHRMSForm(false);
        setHrmsFormData({
          title: "",
          location: "",
          experience: "",
          jobType: "",
          openings: "",
          role: "",
          hr_reviewer: "",
        });
        setFormError("");
        // Refresh position requests
        const fetchPositionRequests = async () => {
          try {
            const response = await axios.get(`${apiBaseUrl}/manpower/position-requests/`);
            console.log("response.data.requests", response.data.requests.hr_reviewer_username)
            const mappedRequests = response.data.requests.map((request) => ({
              id: request.request_id,
              subject: request.title,
              created_on: new Date(request.created_at).toISOString().split("T")[0],
              assigned_to: request.hr_reviewer_username,
              status: request.status,
              mappedStatus: request.status === "pending" ? "Request" :
                            request.status === "hr_review" ? "Review" :
                            request.status === "approved" || request.status === "rejected" ? "Approved" : "Request",
              last_updated: new Date(request.created_at).toISOString().split("T")[0],
              employee_name: request.requested_by_name || "N/A",
              service_type: "Position Request",
              type: "position_request",
              latest_reply: null,
            }));
            setPositionRequests(mappedRequests);
          } catch (error) {
            console.error("Error fetching position requests:", error);
            setError("Failed to load position requests. Please try again later.");
          }
        };
        fetchPositionRequests();
      } else {
        setFormError("Position request submission failed. No request ID returned.");
      }
    } catch (error) {
      console.error("Error submitting position request:", error.response?.data || error);
      setFormError(
        "Error submitting position request: " +
          (error.response?.data?.errors || "Unknown error")
      );
    }
  };

  const services = [
    {
      key: "hrms",
      label: "Manpower Planning Services",
      sublabel: "HRMS",
      color: "bg-green-100",
      textColor: "text-green-800",
      options: [
        { value: "leave_policy", label: "Leave Policy" },
        { value: "leave_request_related", label: "Leave Request Related" },
        { value: "login_issue", label: "Login Issue" },
        { value: "salary_related", label: "Salary Related" },
        { value: "attendance_related", label: "Attendance Related" },
        { value: "training_conflicts", label: "Training Conflicts" },
        { value: "others", label: "Others" },
      ],
    },
    {
      key: "admin",
      label: "Administrative Services",
      sublabel: "Admin",
      color: "bg-blue-100",
      textColor: "text-blue-800",
      options: [
        { value: "password_change", label: "Password Change" },
        { value: "username_change", label: "Username Change" },
        { value: "location_change", label: "Location Change" },
        { value: "shift_change", label: "Shift Change" },
        { value: "team_related", label: "Team Related" },
        { value: "task_related", label: "Task Related" },
        { value: "project_related", label: "Project Related" },
        { value: "others", label: "Others" },
      ],
    },
    {
      key: "hr",
      label: "HR Services",
      sublabel: "HR",
      color: "bg-green-100",
      textColor: "text-green-800",
      options: [
        { value: "leave_policy", label: "Leave Policy" },
        { value: "leave_request_related", label: "Leave Request Related" },
        { value: "login_issue", label: "Login Issue" },
        { value: "salary_related", label: "Salary Related" },
        { value: "attendance_related", label: "Attendance Related" },
        { value: "training_conflicts", label: "Training Conflicts" },
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
        { value: "reports_of_project", label: "Reports of Project" },
        { value: "reports_of_tasks", label: "Reports of Tasks" },
        { value: "team_conflicts", label: "Team Conflicts" },
        { value: "communication_issue", label: "Communication Issue" },
        { value: "performance_related", label: "Performance Related" },
        { value: "others", label: "Others" },
      ],
    },
    {
      key: "manager",
      label: "Manager Services",
      sublabel: "Manager",
      color: "bg-yellow-100",
      textColor: "text-yellow-800",
      options: [
        { value: "task_late_submission", label: "Task Late Submission" },
        { value: "project_materials", label: "Project Materials" },
        { value: "team_conflicts", label: "Team Conflicts" },
        { value: "risk_management", label: "Risk Management" },
        { value: "project_deadline", label: "Project Deadline" },
        { value: "project_plan", label: "Project Plan" },
        { value: "resource_allocation", label: "Resource Allocation" },
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
        { value: "slow_network", label: "Slow Network" },
        { value: "system_performance", label: "System Performance" },
        { value: "cyber_hacks", label: "Cyber Hacks" },
        { value: "data_loss", label: "Data Loss" },
        { value: "software_issue", label: "Software Compatibility Issues" },
        { value: "trouble_shoot", label: "Trouble Shoot" },
        { value: "hardware_issue", label: "Hardware Issue" },
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

  // Fetch tickets on mount
  useEffect(() => {
    fetchData();
  }, []);

  const calculateMetrics = () => {
    const today = new Date().toISOString().split("T")[0];

    const ticketsCreatedToday = combinedData.filter(
      (item) => item.created_on === today,
    ).length;

    const ticketsClosedToday = combinedData.filter(
      (item) => (item.mappedStatus === "Review" || item.status === "hr_review") && item.last_updated === today,
    ).length;

    const openTickets = combinedData.filter(
      (item) => item.mappedStatus === "Request" || item.status === "pending" || item.status === "hr_review",
    ).length;

    const openTicketsLast30Days = combinedData.filter((item) => {
      const createdDate = new Date(item.created_on);
      const todayDate = new Date();
      const diffDays =
        (todayDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30 && (item.mappedStatus === "Request" || item.status === "pending" || item.status === "hr_review");
    }).length;

    const totalClosedTickets = combinedData.filter(
      (item) => item.mappedStatus === "Review" || item.mappedStatus === "Approved" || item.status === "approved" || item.status === "rejected",
    ).length;

    return {
      ticketsCreatedToday,
      ticketsClosedToday,
      openTickets,
      openTicketsLast30Days,
      totalClosedTickets,
      avgFirstResponseTime: "45.2",
      avgResolutionTime: "120.5",
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
    setFilteredData(combinedData);
  };

  const handleServiceClick = (serviceKey) => {
    setSelectedService(serviceKey);
    setTicketPopup(true);
  };

  const handleEditClick = (item) => {
    if (item.type === "ticket") {
      setSelectedTicket(item);
      setEditDialogOpen(true);
    }
  };

  const handleReplyClick = (item) => {
    if (item.type === "ticket") {
      setSelectedTicket(item);
      setReplyDialogOpen(true);
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
                onClick={() =>
                  service.sublabel === "HRMS"
                    ? handleHRMSClick()
                    : handleServiceClick(service.key)
                }
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
                No ticket or position request data available for the selected criteria.
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
                  {filteredData.map((item, index) => {
                    const avatarColor = [
                      "bg-cyan-500",
                      "bg-blue-500",
                      "bg-orange-500",
                      "bg-green-500",
                      "bg-purple-500",
                    ][index % 5];
                    const avatarLetter = item.assigned_to?.charAt(0) || "U";

                    return (
                      <TableRow
                        key={item.id || index}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <input type="checkbox" className="rounded" />
                        </TableCell>
                        <TableCell>
                          {item.type === "position_request" ? (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              {item.id}
                            </span>
                          ) : (
                            item.id
                          )}
                        </TableCell>
                        <TableCell>
                          {activeTab === "open" && item.type === "ticket" ? (
                            <span className="bg-yellow-100 text-yellow-800 w-24 text-center justify-center rounded inline-block px-2 py-0.5">
                              In Progress
                            </span>
                          ) : (
                            <StatusProgressBar
                              status={item.status || "Request"}
                              type={item.type}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-blue-600">
                            {item.subject}
                          </div>
                        </TableCell>
                        <TableCell>{item.service_type}</TableCell>
                        <TableCell>{item.created_on}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center mr-2`}
                            >
                              {avatarLetter}
                            </div>
                            <div>
                              <div className="font-medium">
                                {item.assigned_to}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        {activeTab === "closed" && (
                          <TableCell>
                            {item.latest_reply ? (
                              <div className="text-gray-600">
                                {item.latest_reply}
                              </div>
                            ) : (
                              <div className="text-gray-400">No reply</div>
                            )}
                          </TableCell>
                        )}
                        {activeTab === "open" && (
                          <TableCell>
                            {item.type === "ticket" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
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

      {showHRMSForm && (
        <Dialog open={showHRMSForm} onOpenChange={setShowHRMSForm}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add HRMS Job Request</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  name="title"
                  value={hrmsFormData.title}
                  onChange={handleHRMSFormChange}
                  placeholder="Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Select
                  value={hrmsFormData.location}
                  onValueChange={(val) => setHrmsFormData((prev) => ({ ...prev, location: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.length === 0 ? (
                      <div className="p-2 text-gray-500 text-sm">No locations available</div>
                    ) : (
                      locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.location_name || "Unknown"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience Level</label>
                <Input
                  name="experience"
                  value={hrmsFormData.experience}
                  onChange={handleHRMSFormChange}
                  placeholder="Experience Level (e.g., 2-5 years)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Type</label>
                <Input
                  name="jobType"
                  value={hrmsFormData.jobType}
                  onChange={handleHRMSFormChange}
                  placeholder="Job Type (e.g., Full-Time, Remote)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Openings</label>
                <Input
                  name="openings"
                  type="number"
                  value={hrmsFormData.openings}
                  onChange={handleHRMSFormChange}
                  placeholder="Openings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Select
                  value={hrmsFormData.role}
                  onValueChange={(val) => setHrmsFormData((prev) => ({ ...prev, role: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.length === 0 ? (
                      <div className="p-2 text-gray-500 text-sm">No roles available</div>
                    ) : (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.role_name || "Unknown"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">HR Reviewer</label>
                <Select
                  value={hrmsFormData.hr_reviewer}
                  onValueChange={(val) => setHrmsFormData((prev) => ({ ...prev, hr_reviewer: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HR" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrs.length === 0 ? (
                      <div className="p-2 text-gray-500 text-sm">No HR reviewers available</div>
                    ) : (
                      hrs.map((hr) => (
                        <SelectItem key={hr.hr_id} value={hr.hr_id}>
                          {hr.hr_name || hr.name || "Unknown"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowHRMSForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleHRMSSave}>Save</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Dashboard</h1>
      <div className="mb-6">
        <EmployeeHelpDeskComponent />
      </div>
      <div>
        <EmployeeTickets />
      </div>
    </div>
  );
}