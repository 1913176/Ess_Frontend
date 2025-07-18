import React, { createContext, useState, useEffect, useCallback } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Users, ChartArea, Target, Send, Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

// API base URL
const apiBaseUrl = process.env.VITE_BASE_API;

// Context for shared state
export const ARManagementContext = createContext();

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

// Shared styling
const commonModalInputClass = (hasError) =>
  `block w-full px-3 py-2 border ${hasError ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`;
const commonModalLabelClass = "block text-sm font-medium text-gray-700 mb-1";
const commonModalErrorClass = "text-xs text-red-500 mt-1";

// Set Target Modal
function SetTargetModal({ isOpen, onClose, onAddTarget, parties }) {
  const initialTargetState = {
    partyId: "",
    targetAmount: "",
    startDate: null,
    endDate: null,
  };
  const [newTarget, setNewTarget] = useState(initialTargetState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTarget((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDateChange = (date, field) => {
    setNewTarget((prev) => ({ ...prev, [field]: date }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateTargetForm = (targetData) => {
    const newErrors = {};
    if (!targetData.partyId) {
      newErrors.partyId = "Party selection is required.";
    }
    if (!targetData.targetAmount) newErrors.targetAmount = "Target amount is required.";
    else if (isNaN(parseFloat(targetData.targetAmount))) newErrors.targetAmount = "Invalid target amount format.";
    else if (parseFloat(targetData.targetAmount) <= 0) newErrors.targetAmount = "Target amount must be positive.";
    else if (parseFloat(targetData.targetAmount) > 9999999999) newErrors.targetAmount = "Target amount is too large.";
    if (!targetData.startDate) newErrors.startDate = "Start date is required.";
    if (!targetData.endDate) newErrors.endDate = "End date is required.";
    else if (targetData.startDate && targetData.endDate && new Date(targetData.endDate) < new Date(targetData.startDate)) {
      newErrors.endDate = "End date must be after start date.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateTargetForm(newTarget);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const targetToAdd = {
      id: `target-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      partyId: newTarget.partyId,
      targetAmount: parseFloat(newTarget.targetAmount),
      startDate: newTarget.startDate,
      endDate: newTarget.endDate,
    };
    onAddTarget(targetToAdd);
    handleClose();
  };

  const handleClose = () => {
    setNewTarget(initialTargetState);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Set New Target</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="partyId" className={commonModalLabelClass}>Client</label>
            <select
              name="partyId"
              id="partyId"
              value={newTarget.partyId}
              onChange={handleChange}
              className={commonModalInputClass(errors.partyId)}
            >
              <option value="">Select a Client</option>
              {parties.map((party) => (
                <option key={party.id} value={party.id}>{party.party_name}</option>
              ))}
            </select>
            {errors.partyId && <p className={commonModalErrorClass}>{errors.partyId}</p>}
          </div>
          <div>
            <label htmlFor="targetAmount" className={commonModalLabelClass}>Target Amount ($)</label>
            <input
              type="number"
              name="targetAmount"
              id="targetAmount"
              value={newTarget.targetAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={commonModalInputClass(errors.targetAmount)}
            />
            {errors.targetAmount && <p className={commonModalErrorClass}>{errors.targetAmount}</p>}
          </div>
          <div>
            <label htmlFor="startDate" className={commonModalLabelClass}>Start Date</label>
            <div className="relative">
              <DatePicker
                selected={newTarget.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select start date"
                className={commonModalInputClass(errors.startDate) + " pl-10"}
                wrapperClassName="w-full"
                popperPlacement="bottom-start"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.startDate && <p className={commonModalErrorClass}>{errors.startDate}</p>}
          </div>
          <div>
            <label htmlFor="endDate" className={commonModalLabelClass}>End Date</label>
            <div className="relative">
              <DatePicker
                selected={newTarget.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select end date"
                className={commonModalInputClass(errors.endDate) + " pl-10"}
                wrapperClassName="w-full"
                popperPlacement="bottom-start"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.endDate && <p className={commonModalErrorClass}>{errors.endDate}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Set Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Send Reminder Modal
function SendReminderModal({ isOpen, onClose, parties }) {
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [minAmount, setMinAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [reminders, setReminders] = useState([]);
  const [showReminders, setShowReminders] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);

  useEffect(() => {
    const fetchReminders = async () => {
      const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
      const employeeId = userInfo?.employee_id;
      if (!employeeId) return;
      try {
        const response = await axios.get(`${apiBaseUrl}/reminders/list/${employeeId}/`);
        setReminders(response.data);
      } catch (error) {
        console.error("Error fetching reminders:", error);
      }
    };
    fetchReminders();
  }, []);

  const validateInputs = () => {
    const newErrors = {};
    if (!selectedPartyId) newErrors.partyId = "Client selection is required.";
    if (!startDate) newErrors.startDate = "Start date is required.";
    if (!endDate) newErrors.endDate = "End date is required.";
    if (startDate && endDate && endDate < startDate) {
      newErrors.dateRange = "End date must be after start date.";
    }
    if (minAmount && (isNaN(parseFloat(minAmount)) || parseFloat(minAmount) < 0)) {
      newErrors.minAmount = "Minimum amount must be a non-negative number.";
    }
    return newErrors;
  };

  const handleAddReminder = async () => {
    const formErrors = validateInputs();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
    const employeeId = userInfo?.employee_id;

    try {
      const response = await axios.post(`${apiBaseUrl}/reminders/create/`, {
        employee_id: employeeId,
        client_id: selectedPartyId,
        start_date: startDate.toLocaleDateString("en-CA"),
        end_date: endDate.toLocaleDateString("en-CA"),
        min_amount: parseFloat(minAmount) || 0,
      });

      setReminders([response.data, ...reminders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      alert("Reminder added successfully!");
      resetForm();
    } catch (error) {
      console.error("Error adding reminder:", error);
      alert("Failed to add reminder.");
    }
  };

  const handleEditReminder = (reminder) => {
    setEditingReminderId(reminder.id);
    setSelectedPartyId(reminder.client_id);
    setDateRange([new Date(reminder.start_date), new Date(reminder.end_date)]);
    setMinAmount(reminder.min_amount.toString());
    setShowReminders(false);
  };

  const handleSaveEdit = async () => {
    const formErrors = validateInputs();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await axios.put(`${apiBaseUrl}/reminders/update/${editingReminderId}/`, {
        start_date: startDate.toLocaleDateString("en-CA"),
        end_date: endDate.toLocaleDateString("en-CA"),
        min_amount: parseFloat(minAmount) || 0,
      });

      setReminders(
        reminders
          .map((r) => (r.id === editingReminderId ? response.data : r))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
      alert("Reminder updated successfully!");
      resetForm();
    } catch (error) {
      console.error("Error updating reminder:", error);
      alert("Failed to update reminder.");
    }
  };

  const handleShowReminders = () => {
    setShowReminders(true);
  };

  const resetForm = () => {
    setSelectedPartyId("");
    setDateRange([null, null]);
    setMinAmount("");
    setErrors({});
    setShowReminders(false);
    setEditingReminderId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePartyChange = (e) => {
    setSelectedPartyId(e.target.value);
    if (errors.partyId) setErrors((prev) => ({ ...prev, partyId: null }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-[60] flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">{showReminders ? "Saved Reminders" : "Send Payment Reminders"}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {showReminders ? (
          <div>
            {reminders.length > 0 ? (
              <div className="border rounded-md overflow-y-auto max-h-64">
                <table className="w-full text-sm text-gray-800">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Client</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Amount ($)</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Date Range</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reminders.map((reminder) => (
                      <tr key={reminder.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                          {parties.find((p) => p.id === reminder.client_id)?.party_name || "Unknown"}
                        </td>
                        <td className="px-4 py-2">${reminder.min_amount.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          {formatDate(reminder.start_date)} - {formatDate(reminder.end_date)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleEditReminder(reminder)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Reminder"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">No reminders found.</p>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowReminders(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="partyId" className={commonModalLabelClass}>Client</label>
                <select
                  name="partyId"
                  id="partyId"
                  value={selectedPartyId}
                  onChange={handlePartyChange}
                  className={`${commonModalInputClass(errors.partyId)} ${editingReminderId ? 'appearance-none' : ''}`}
                  disabled={editingReminderId !== null}
                >
                  <option value="">Select a Client</option>
                  {parties.map((party) => (
                    <option key={party.id} value={party.id}>{party.party_name}</option>
                  ))}
                </select>
                {errors.partyId && <p className={commonModalErrorClass}>{errors.partyId}</p>}
              </div>
              <div>
                <label htmlFor="dateRange" className={commonModalLabelClass}>Date Range</label>
                <div className="relative">
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      setDateRange(update);
                      if (errors.dateRange) setErrors((prev) => ({ ...prev, dateRange: null }));
                    }}
                    placeholderText="Select date range"
                    className={commonModalInputClass(errors.dateRange) + " pl-10"}
                    wrapperClassName="w-full"
                    popperClassName="z-[70]"
                    showPopperArrow={false}
                    dateFormat="MMM d, yyyy"
                    isClearable={true}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.dateRange && <p className={commonModalErrorClass}>{errors.dateRange}</p>}
              </div>
              <div>
                <label htmlFor="minAmount" className={commonModalLabelClass}>Minimum Outstanding Amount ($)</label>
                <input
                  type="number"
                  id="minAmount"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                    if (errors.minAmount) setErrors((prev) => ({ ...prev, minAmount: null }));
                  }}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 1000"
                  className={commonModalInputClass(errors.minAmount)}
                />
                {errors.minAmount && <p className={commonModalErrorClass}>{errors.minAmount}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Enter 0 or leave blank to include all outstanding amounts.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleShowReminders}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Show
              </button>
              {editingReminderId ? (
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddReminder}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Add
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const TopNav = () => {
  const navItems = [
    { to: ".", label: "Client Dashboard", icon: <Users className="w-5 h-5" />, end: true },
    { to: "reports", label: "Reports", icon: <ChartArea className="w-5 h-5" /> },
  ];

  return (
    <ARManagementContext.Consumer>
      {({ filterPeriod, setFilterPeriod, dateRange, setDateRange, openSetTargetModal, openSendReminderModal }) => {
        const [startDate, endDate] = dateRange;

        const handleFilterPeriodChange = (e) => {
          setFilterPeriod(e.target.value);
          if (e.target.value !== "custom") {
            setDateRange([null, null]);
          }
        };

        return (
          <nav className="bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b gap-4">
              <div className="flex items-center gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      }`
                    }
                    aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterPeriod}
                  onChange={handleFilterPeriodChange}
                  className="px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48 text-sm"
                >
                  <option value="" disabled hidden>
                    Filter by period
                  </option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half-yearly">Half-Yearly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
                {filterPeriod === "custom" && (
                  <div className="relative w-full sm:w-72">
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={setDateRange}
                      placeholderText={
                        startDate && endDate
                          ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                          : "Select date range"
                      }
                      className="pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
                      popperClassName="z-50 react-datepicker-popper"
                      wrapperClassName="w-full"
                      calendarClassName="text-sm p-2 border rounded-md shadow-lg bg-white"
                      showPopperArrow={false}
                      minDate={new Date(2000, 0, 1)}
                      maxDate={new Date(2030, 11, 31)}
                      isClearable={true}
                      dateFormat="MMM d, yyyy"
                    />
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                )}
                <button
                  onClick={openSetTargetModal}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors shadow-sm text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <Target size={18} />
                  <span>Set Target</span>
                </button>
                <button
                  onClick={openSendReminderModal}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors shadow-sm text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <Send size={18} />
                  <span>Send Reminder</span>
                </button>
              </div>
            </div>
          </nav>
        );
      }}
    </ARManagementContext.Consumer>
  );
};

const ARManagementLayout = () => {
  const [filterPeriod, setFilterPeriod] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [targets, setTargets] = useState([]);
  const [employeeParties, setEmployeeParties] = useState([]);
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);
  const [isSendReminderModalOpen, setIsSendReminderModalOpen] = useState(false);

  useEffect(() => {
    const fetchEmployeeParties = async () => {
      const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
      const employeeId = userInfo?.employee_id;
      if (!employeeId) {
        console.error("No employee ID found in localStorage");
        return;
      }

      try {
        const res = await axios.get(`${apiBaseUrl}/pincode/employee-parties/${employeeId}/`);
        setEmployeeParties(res.data);
      } catch (error) {
        console.error("Error fetching employee parties:", error);
        setEmployeeParties([]);
      }
    };
    fetchEmployeeParties();
  }, []);

  const handleAddTarget = useCallback(
    async (newTarget) => {
      const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
      const employeeId = userInfo?.employee_id;

      try {
        const response = await axios.post(`${apiBaseUrl}/client-targets/create/`, {
          employee_id: employeeId || null,
          client: newTarget.partyId,
          target_amount: newTarget.targetAmount,
          start_date: newTarget.startDate.toLocaleDateString("en-CA"),
          end_date: newTarget.endDate.toLocaleDateString("en-CA"),
        });

        setTargets((prev) => [
          {
            id: response.data.id,
            partyId: response.data.client,
            targetAmount: parseFloat(response.data.target_amount),
            startDate: new Date(response.data.start_date),
            endDate: new Date(response.data.end_date),
          },
          ...prev,
        ].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));

        alert("Target successfully saved!");
      } catch (err) {
        console.error("Error saving target:", err);
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.non_field_errors?.[0] ||
          "Failed to save target.";
        alert(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const openSetTargetModal = () => setIsSetTargetModalOpen(true);
  const closeSetTargetModal = () => setIsSetTargetModalOpen(false);
  const openSendReminderModal = () => setIsSendReminderModalOpen(true);
  const closeSendReminderModal = () => setIsSendReminderModalOpen(false);

  const contextValue = {
    filterPeriod,
    setFilterPeriod,
    dateRange,
    setDateRange,
    targets,
    parties: employeeParties,
    addTarget: handleAddTarget,
    openSetTargetModal,
    openSendReminderModal,
  };

  return (
    <ARManagementContext.Provider value={contextValue}>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <TopNav />
        <main className="flex-1 p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-[calc(100vh-10rem)]">
            <Outlet />
          </div>
        </main>
        <SetTargetModal
          isOpen={isSetTargetModalOpen}
          onClose={closeSetTargetModal}
          onAddTarget={handleAddTarget}
          parties={employeeParties}
        />
        <SendReminderModal
          isOpen={isSendReminderModalOpen}
          onClose={closeSendReminderModal}
          parties={employeeParties}
        />
      </div>
    </ARManagementContext.Provider>
  );
};

export default ARManagementLayout;