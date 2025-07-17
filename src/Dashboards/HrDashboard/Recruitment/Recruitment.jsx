import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import axios from "axios";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const Recruitment = () => {
  const [activeTab, setActiveTab] = useState("job-alerts");
  const [jobAlerts, setJobAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [showAddJobAlertModal, setShowAddJobAlertModal] = useState(false);
  const [newJobAlert, setNewJobAlert] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    posted: "",
    applications: 0,
    status: "Active",
    job_id: null,
  });
  const [toast, setToast] = useState({ type: "", text: "" });

  // Get hr_id from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
  const hrId = userInfo?.hr_id;

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast.text) {
      const timer = setTimeout(() => {
        setToast({ type: "", text: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch job alerts
  useEffect(() => {
    const fetchJobAlerts = async () => {
      if (!hrId) {
        setError("User information not found. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${apiBaseUrl}/job_alerts/${hrId}/`);
        setJobAlerts(response.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch job alerts.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAlerts();
  }, [hrId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJobAlert((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission for adding a job alert
  const handleAddJobAlert = async (e) => {
    e.preventDefault();
    if (!hrId) {
      setError("User information not found. Please log in.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...newJobAlert,
        hr: hrId,
      };
      const response = await axios.post(
        `${apiBaseUrl}/job_alert/create/${hrId}/`,
        payload
      );
      setJobAlerts([...jobAlerts, response.data.data]);
      setShowAddJobAlertModal(false);
      setNewJobAlert({
        title: "",
        department: "",
        location: "",
        type: "",
        posted: "",
        applications: 0,
        status: "Active",
        job_id: null,
      });
      setError("");
      setToast({ type: "success", text: "Job Alert created successfully" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create job alert.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete job alert
  const handleDeleteJob = async (jobId) => {
    if (!hrId) {
      setError("User information not found. Please log in.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this job alert?")) return;

    setLoading(true);
    try {
      console.log("Deleting job alert with ID:", jobId);
      await axios.delete(`${apiBaseUrl}/job_alert/delete/${jobId}/`);
      setJobAlerts(jobAlerts.filter((job) => job.job_id !== jobId));
      setError("");
      setToast({ type: "success", text: "Job Alert deleted successfully" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete job alert.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit job alert (open modal with pre-filled data)
  const handleEditJob = (job) => {
    setNewJobAlert({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      posted: job.posted,
      applications: job.applications,
      status: job.status,
      job_id: job.job_id,
    });
    setShowAddJobAlertModal(true);
  };

  // Handle update job alert
  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!hrId) {
      setError("User information not found. Please log in.");
      return;
    }

    const { job_id } = newJobAlert;
    if (!job_id) {
      setError("No job selected for update.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...newJobAlert,
        hr: hrId,
      };
      const response = await axios.put(
        `${apiBaseUrl}/job_alert/update/${job_id}/`,
        payload
      );
      setJobAlerts(
        jobAlerts.map((job) =>
          job.job_id === job_id ? response.data.data : job
        )
      );
      setShowAddJobAlertModal(false);
      setNewJobAlert({
        title: "",
        department: "",
        location: "",
        type: "",
        posted: "",
        applications: 0,
        status: "Active",
        job_id: null,
      });
      setError("");
      setToast({ type: "success", text: "Job Alert updated successfully" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update job alert.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Paused":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter job alerts
  const filteredJobAlerts = jobAlerts.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const JobAlertsTab = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Job Alerts</h2>
          <button
            onClick={() => {
              setNewJobAlert({
                title: "",
                department: "",
                location: "",
                type: "",
                posted: "",
                applications: 0,
                status: "Active",
                job_id: null,
              });
              setShowAddJobAlertModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!hrId || loading}
          >
            <Plus size={16} />
            Add Job Alert
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={16} />
            Filter
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {toast.text && (
          <p className={`text-sm mt-2 ${toast.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {toast.text}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applications
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : !hrId ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  User information not found. Please log in.
                </td>
              </tr>
            ) : filteredJobAlerts.length > 0 ? (
              filteredJobAlerts.map((job) => (
                <tr key={job.job_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {job.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.posted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.applications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`View: ${job.title}`)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={loading}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditJob(job)}
                        className="text-gray-600 hover:text-gray-800"
                        disabled={loading}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.job_id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No job alerts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CandidatesTab = () => (
    <p>Candidates</p>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-600">Manage job alerts and candidates</p>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("job-alerts")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "job-alerts"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Job Alerts
              </button>
              <button
                onClick={() => setActiveTab("candidates")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "candidates"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Candidates
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "job-alerts" ? <JobAlertsTab /> : <CandidatesTab />}

        {showAddJobAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowAddJobAlertModal(false);
                  setNewJobAlert({
                    title: "",
                    department: "",
                    location: "",
                    type: "",
                    posted: "",
                    applications: 0,
                    status: "Active",
                    job_id: null,
                  });
                  setError("");
                }}
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {newJobAlert.job_id ? "Edit Job Alert" : "Add Job Alert"}
              </h2>
              <form
                className="space-y-4"
                onSubmit={(e) =>
                  newJobAlert.job_id ? handleUpdateJob(e) : handleAddJobAlert(e)
                }
              >
                <input
                  type="text"
                  name="title"
                  placeholder="Job Title"
                  value={newJobAlert.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={newJobAlert.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={newJobAlert.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <select
                  name="type"
                  value={newJobAlert.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship-full-time">
                    Internship (Full-time)
                  </option>
                  <option value="Internship-part-time">
                    Internship (Part-time)
                  </option>
                </select>
                <input
                  type="date"
                  name="posted"
                  value={newJobAlert.posted}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="number"
                  name="applications"
                  placeholder="Applications"
                  value={newJobAlert.applications}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  min="0"
                  required
                />
                <select
                  name="status"
                  value={newJobAlert.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Closed">Closed</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  disabled={loading || !hrId}
                >
                  {loading ? "Processing..." : newJobAlert.job_id ? "Update" : "Add"}
                </button>
              </form>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recruitment;