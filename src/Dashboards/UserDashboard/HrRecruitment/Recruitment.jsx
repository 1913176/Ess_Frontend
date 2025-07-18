import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const Recruitment = () => {
  const [activeTab, setActiveTab] = useState("job-alerts");
  const [jobAlerts, setJobAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showAddJobAlertModal, setShowAddJobAlertModal] = useState(false);

  const [candidateJobFilter, setCandidateJobFilter] = useState("");
  const [candidateStatusFilter, setCandidateStatusFilter] = useState("");

  const [candidateSearch, setCandidateSearch] = useState("");

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const jobMatch = candidateJobFilter
        ? candidate.jobTitle === candidateJobFilter
        : true;
      const statusMatch = candidateStatusFilter
        ? candidate.status === candidateStatusFilter
        : true;
      const searchMatch = candidateSearch
        ? candidate.name.toLowerCase().includes(candidateSearch.toLowerCase())
        : true;
      return jobMatch && statusMatch && searchMatch;
    });
  }, [candidates, candidateJobFilter, candidateStatusFilter, candidateSearch]);

  //Filter state for Job-Alerts tab
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("");
  const [jobAlertSearch, setJobAlertSearch] = useState(""); // Add search state

  //Filter function for Job-Alerts tab (search only by job title)
  const filteredJobAlerts = useMemo(() => {
    return jobAlerts.filter((job) => {
      const typeMatch = jobTypeFilter ? job.type === jobTypeFilter : true;
      const statusMatch = jobStatusFilter
        ? job.status === jobStatusFilter
        : true;
      const searchMatch = jobAlertSearch
        ? job.title.toLowerCase().includes(jobAlertSearch.toLowerCase())
        : true;
      return typeMatch && statusMatch && searchMatch;
    });
  }, [jobAlerts, jobTypeFilter, jobStatusFilter, jobAlertSearch]);

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

  const [candidateFormData, setCandidateFormData] = useState({
    c_id: "",
    name: "",
    phone: "",
    jobTitle: "",
    resume: "",
    status: "",
  });
  const [editingCandidateId, setEditingCandidateId] = useState(null);

  // Get hr_id from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
  const hrId = userInfo?.hr_id;

  // Fetch job alerts
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

  // Fetch candidates
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/candidates/${hrId}/`);
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates data:", error);
      toast.error("Failed to load candidates data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAlerts();
  }, [hrId]);

  useEffect(() => {
    if (activeTab === "job-alerts") {
      fetchJobAlerts();
    } else {
      fetchCandidates();
    }
  }, [activeTab]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJobAlert((prev) => ({ ...prev, [name]: value }));
  };

  const handleCandidateInputChange = (e) => {
    const { name, value } = e.target;
    setCandidateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
        payload,
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
      toast.success("Job Alert created successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create job alert.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSubmit = (e) => {
    e.preventDefault();
    if (editingCandidateId) {
      updateCandidate();
    } else {
      addCandidate();
    }
  };

  const addCandidate = async () => {
    try {
      const formData = new FormData();
      formData.append("hr", hrId);
      formData.append("name", candidateFormData.name);
      formData.append("phone", candidateFormData.phone);
      formData.append("jobTitle", candidateFormData.jobTitle);
      formData.append("status", candidateFormData.status);
      if (
        candidateFormData.resume &&
        typeof candidateFormData.resume !== "string"
      ) {
        formData.append("resume", candidateFormData.resume);
      }

      await axios.post(`${apiBaseUrl}/candidate/create/${hrId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Candidate added successfully");
      fetchCandidates();
      setShowAddCandidateModal(false);
    } catch (error) {
      toast.error("Error adding candidate");
      console.error("Add Error:", error);
    }
  };

  const updateCandidate = async () => {
    try {
      const formData = new FormData();
      formData.append("hr", hrId);
      formData.append("name", candidateFormData.name);
      formData.append("phone", candidateFormData.phone);
      formData.append("jobTitle", candidateFormData.jobTitle);
      formData.append("status", candidateFormData.status);

      // ✅ Only add resume if it's a new file
      if (
        candidateFormData.resume &&
        typeof candidateFormData.resume !== "string"
      ) {
        formData.append("resume", candidateFormData.resume);
      }

      await axios.put(
        `${apiBaseUrl}/candidate/update/${editingCandidateId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Candidate updated successfully");
      fetchCandidates();
      setShowAddCandidateModal(false);
      setEditingCandidateId(null);
    } catch (error) {
      toast.error("Error updating candidate");
      console.error("Update Error:", error);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      const response = await axios.delete(
        `${apiBaseUrl}/candidate/delete/${candidateId}/`,
      );
      if (response.status === 200 || response.status === 204) {
        toast.success("Candidate deleted successfully");
        fetchCandidates();
      } else {
        toast.error("Failed to delete candidate");
      }
    } catch (error) {
      toast.error("Error deleting candidate");
      console.error("Delete error:", error);
    }
  };

  // Handle delete job alert
  const handleDeleteJob = async (jobId) => {
    if (!hrId) {
      setError("User information not found. Please log in.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this job alert?"))
      return;

    setLoading(true);
    try {
      console.log("Deleting job alert with ID:", jobId);
      await axios.delete(`${apiBaseUrl}/job_alert/delete/${jobId}/`);
      setJobAlerts(jobAlerts.filter((job) => job.job_id !== jobId));
      setError("");
      toast.success("Job Alert deleted successfully");
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
        payload,
      );
      setJobAlerts(
        jobAlerts.map((job) =>
          job.job_id === job_id ? response.data.data : job,
        ),
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
      toast.success("Job Alert updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update job alert.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-600 bg-green-50";
      case "paused":
        return "text-yellow-600 bg-yellow-50";
      case "closed":
        return "text-red-600 bg-red-50";
      case "resume in review":
        return "text-blue-600 bg-blue-50";
      case "shortlisted":
        return "text-indigo-600 bg-indigo-50";
      case "interview - l1":
        return "text-purple-600 bg-purple-50";
      case "interview - l3":
        return "text-violet-600 bg-violet-50";
      case "welcome letter":
        return "text-green-600 bg-green-50";
      case "document collection":
        return "text-teal-600 bg-teal-50";
      case "offer letter":
        return "text-emerald-600 bg-emerald-50";
      case "onboarding":
        return "text-cyan-600 bg-cyan-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const JobAlertsTab = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Job Alerts</h2>
          <div className="flex gap-4 items-center">
            {/* Search column */}
            <input
              type="text"
              value={jobAlertSearch}
              onChange={e => setJobAlertSearch(e.target.value)}
              placeholder="Search by Job Title"
              className="px-3 py-2 border rounded-md text-sm text-gray-700 w-72"
              autoComplete="off"
              spellCheck={false}
            />
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm text-gray-700"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship-full-time">Internship (Full-time)</option>
              <option value="Internship-part-time">Internship (Part-time)</option>
            </select>
            <select
              value={jobStatusFilter}
              onChange={(e) => setJobStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Closed">Closed</option>
            </select>
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
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}
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
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Candidates</h2>
          <div className="flex gap-4 items-center">
            {/* Search column */}
            <input
              type="text"
              value={candidateSearch}
              onChange={e => setCandidateSearch(e.target.value)}
              placeholder="Search by Candidate Name"
              className="px-3 py-2 border rounded-md text-sm text-gray-700 w-64"
              autoComplete="off"
              spellCheck={false}
            />
            <select
              value={candidateJobFilter}
              onChange={(e) => setCandidateJobFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm text-gray-700"
            >
              <option value="">All Job Titles</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
            </select>
            <select
              value={candidateStatusFilter}
              onChange={(e) => setCandidateStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="Resume In Review">Resume In Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview - L1">Interview - L1</option>
              <option value="Interview - L2">Interview - L2</option>
              <option value="Interview - L3">Interview - L3</option>
              <option value="Welcome Letter">Welcome Letter</option>
              <option value="Document Collection">Document Collection</option>
              <option value="Offer Letter">Offer Letter</option>
              <option value="Onboarding">Onboarding</option>
            </select>
            <button
              onClick={() => {
                setCandidateFormData({
                  name: "",
                  phone: "",
                  jobTitle: "",
                  resume: "",
                  status: "",
                });
                setEditingCandidateId(null);
                setShowAddCandidateModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Candidate
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attachment Link
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
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Loading Candidates Data...
                </td>
              </tr>
            ) : filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => (
                <tr key={candidate.c_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.jobTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {candidate.resume ? (
                      <a
                        href={`${apiBaseUrl}/${candidate.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-800"
                      >
                        View Resume
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-gray-400">No Resume</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}
                    >
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => {
                          setCandidateFormData({
                            name: candidate.name,
                            phone: candidate.phone,
                            jobTitle: candidate.jobTitle,
                            resume: candidate.resume,
                            status: candidate.status,
                          });
                          setEditingCandidateId(candidate.c_id);
                          setShowAddCandidateModal(true);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this candidate?",
                            )
                          ) {
                            handleDeleteCandidate(candidate.c_id);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No candidates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
                  {loading
                    ? "Processing..."
                    : newJobAlert.job_id
                      ? "Update"
                      : "Add"}
                </button>
              </form>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>
        )}

        {showAddCandidateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddCandidateModal(false)}
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Add Candidate
              </h2>
              <form className="space-y-4" onSubmit={handleCandidateSubmit}>
                <input
                  name="name"
                  value={candidateFormData.name}
                  onChange={handleCandidateInputChange}
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <input
                  name="phone"
                  value={candidateFormData.phone}
                  onChange={handleCandidateInputChange}
                  type="text"
                  placeholder="Phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <select
                  name="jobTitle"
                  value={candidateFormData.jobTitle}
                  onChange={handleCandidateInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Job Title</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                </select>
                {/* Show existing uploaded resume if editing */}
                {editingCandidateId &&
                  typeof candidateFormData.resume === "string" && (
                    <div className="mb-2 text-sm text-blue-600">
                      <a
                        href={`${apiBaseUrl}/${candidateFormData.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        View Uploaded Resume <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                <input
                  name="resume"
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setCandidateFormData((prevData) => ({
                      ...prevData,
                      resume: e.target.files[0],
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />

                <select
                  name="status"
                  value={candidateFormData.status}
                  onChange={handleCandidateInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Status</option>
                  <option value="Resume In Review">Resume In Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview - L1">Interview - L1</option>
                  <option value="Interview - L2">Interview - L2</option>
                  <option value="Interview - L3">Interview - L3</option>
                  <option value="Welcome Letter">Welcome Letter</option>
                  <option value="Document Collection">
                    Document Collection
                  </option>
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Onboarding">Onboarding</option>
                </select>
                {editingCandidateId ? (
                  <button
                    type="button"
                    onClick={updateCandidate}
                    className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                  >
                    Update Candidate
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={addCandidate}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Candidate
                  </button>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recruitment;
