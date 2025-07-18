import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Search, X, Calendar as CalendarIcon, Eye, Edit3, Trash2, AlertTriangle, Target } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ARManagementContext } from './AccountManagementLayout';

const apiBaseUrl = process.env.VITE_BASE_API;

// Helper to calculate raised percentage
const getRaisedPercentage = (collected, totalAmount) => {
  if (totalAmount === 0 || !totalAmount) return '0%';
  return `${((collected / totalAmount) * 100).toFixed(0)}%`;
};

// Helper to format date string
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const commonModalInputClass = (hasError) => `block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`;
const commonModalLabelClass = "block text-sm font-medium text-gray-700 mb-1";
const commonModalErrorClass = "text-xs text-red-500 mt-1";

// Shared Form Fields for Add/Edit Modals
const ClientFormFields = ({ clientData, handleChange, handleDateChange, errors }) => (
  <>
    <div>
      <label htmlFor="name" className={commonModalLabelClass}>Client Name</label>
      <input type="text" name="name" id="name" value={clientData.name} onChange={handleChange} className={commonModalInputClass(errors.name)} />
      {errors.name && <p className={commonModalErrorClass}>{errors.name}</p>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="totalAmount" className={commonModalLabelClass}>Total Amount ($)</label>
        <input type="number" name="totalAmount" id="totalAmount" value={clientData.totalAmount} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.totalAmount)} />
        {errors.totalAmount && <p className={commonModalErrorClass}>{errors.totalAmount}</p>}
      </div>
      <div>
        <label htmlFor="collected" className={commonModalLabelClass}>Collected ($)</label>
        <input type="number" name="collected" id="collected" value={clientData.collected} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.collected)} />
        {errors.collected && <p className={commonModalErrorClass}>{errors.collected}</p>}
      </div>
      <div>
        <label htmlFor="outstanding" className={commonModalLabelClass}>Outstanding ($)</label>
        <input type="number" name="outstanding" id="outstanding" value={clientData.outstanding} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.outstanding)} />
        {errors.outstanding && <p className={commonModalErrorClass}>{errors.outstanding}</p>}
      </div>
      <div>
        <label htmlFor="overdue" className={commonModalLabelClass}>Overdue ($)</label>
        <input type="number" name="overdue" id="overdue" value={clientData.overdue} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.overdue)} />
        {errors.overdue && <p className={commonModalErrorClass}>{errors.overdue}</p>}
      </div>
    </div>
    {errors.financials && <p className="text-sm text-red-500 mt-2 text-center bg-red-50 p-2 rounded-md">{errors.financials}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="targetBilling" className={commonModalLabelClass}>Target Billing ($)</label>
        <input type="number" name="targetBilling" id="targetBilling" value={clientData.targetBilling} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.targetBilling)} />
        {errors.targetBilling && <p className={commonModalErrorClass}>{errors.targetBilling}</p>}
      </div>
      <div>
        <label htmlFor="assignedEmployee" className={commonModalLabelClass}>Assigned Employee</label>
        <input type="text" name="assignedEmployee" id="assignedEmployee" value={clientData.assignedEmployee} onChange={handleChange} className={commonModalInputClass(errors.assignedEmployee)} />
        {errors.assignedEmployee && <p className={commonModalErrorClass}>{errors.assignedEmployee}</p>}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="contactEmail" className={commonModalLabelClass}>Contact Email</label>
        <input type="email" name="contactEmail" id="contactEmail" value={clientData.contactEmail} onChange={handleChange} className={commonModalInputClass(errors.contactEmail)} />
        {errors.contactEmail && <p className={commonModalErrorClass}>{errors.contactEmail}</p>}
      </div>
      <div>
        <label htmlFor="contactPhone" className={commonModalLabelClass}>Contact Phone</label>
        <input type="tel" name="contactPhone" id="contactPhone" value={clientData.contactPhone} onChange={handleChange} className={commonModalInputClass(false)} />
      </div>
    </div>
    <div>
      <label htmlFor="address" className={commonModalLabelClass}>Address</label>
      <textarea name="address" id="address" value={clientData.address} onChange={handleChange} rows="2" className={commonModalInputClass(false) + " resize-none"}></textarea>
    </div>
    <div>
      <label htmlFor="billingDate" className={commonModalLabelClass}>Billing Date</label>
      <div className="relative">
        <DatePicker
          selected={clientData.billingDate ? new Date(clientData.billingDate) : null}
          onChange={handleDateChange}
          dateFormat="MMMM d, yyyy"
          placeholderText="Select billing date"
          className={`w-full pl-10 pr-3 py-2 border ${errors.billingDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          wrapperClassName="w-full"
          popperPlacement="bottom-start"
        />
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
      {errors.billingDate && <p className={commonModalErrorClass}>{errors.billingDate}</p>}
    </div>
    <div>
      <label htmlFor="notes" className={commonModalLabelClass}>Notes</label>
      <textarea name="notes" id="notes" value={clientData.notes} onChange={handleChange} rows="3" className={commonModalInputClass(false) + " resize-none"}></textarea>
    </div>
  </>
);

// Generic Form Validation Logic
const validateClientForm = (clientData) => {
  const newErrors = {};
  if (!clientData.name?.trim()) newErrors.name = 'Client name is required.';
  
  const validateNumericField = (field, fieldName, allowNegative = false) => {
    const value = clientData[field];
    if (value === null || value === undefined || value === '') newErrors[field] = `${fieldName} is required.`;
    else if (isNaN(parseFloat(value))) newErrors[field] = `Invalid ${fieldName.toLowerCase()} format.`;
    else if (!allowNegative && parseFloat(value) < 0) newErrors[field] = `${fieldName} cannot be negative.`;
    else if (parseFloat(value) > 9999999999) newErrors[field] = `${fieldName} is too large.`;
  };

  validateNumericField('totalAmount', 'Total Amount');
  validateNumericField('collected', 'Collected Amount');
  validateNumericField('outstanding', 'Outstanding Amount');
  validateNumericField('overdue', 'Overdue Amount');
  validateNumericField('targetBilling', 'Target Billing');

  if (parseFloat(clientData.collected) > parseFloat(clientData.totalAmount)) {
    newErrors.collected = 'Collected amount cannot exceed total amount.';
  }

  if (!clientData.assignedEmployee?.trim()) newErrors.assignedEmployee = 'Assigned employee is required.';
  if (!clientData.billingDate) newErrors.billingDate = 'Billing date is required.';
  if (clientData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.contactEmail)) {
    newErrors.contactEmail = 'Invalid email format.';
  }

  const totalFromParts = (parseFloat(clientData.collected) || 0) + (parseFloat(clientData.outstanding) || 0) + (parseFloat(clientData.overdue) || 0);
  if (clientData.totalAmount && Math.abs(totalFromParts - parseFloat(clientData.totalAmount)) > 0.01) {
    newErrors.financials = "The sum of Collected, Outstanding, and Overdue amounts must equal the Total Amount.";
  }
  return newErrors;
};

// Validation for Target Form
const validateTargetForm = (targetData) => {
  const newErrors = {};
  if (!targetData.clientId) newErrors.clientId = 'Client is required.';
  if (!targetData.employeeId) newErrors.employeeId = 'Employee is required.';
  if (!targetData.targetAmount) newErrors.targetAmount = 'Target amount is required.';
  else if (isNaN(parseFloat(targetData.targetAmount))) newErrors.targetAmount = 'Invalid target amount format.';
  else if (parseFloat(targetData.targetAmount) <= 0) newErrors.targetAmount = 'Target amount must be positive.';
  else if (parseFloat(targetData.targetAmount) > 9999999999) newErrors.targetAmount = 'Target amount is too large.';
  if (!targetData.startDate) newErrors.startDate = 'Start date is required.';
  if (!targetData.endDate) newErrors.endDate = 'End date is required.';
  else if (targetData.startDate && targetData.endDate && new Date(targetData.endDate) < new Date(targetData.startDate)) {
    newErrors.endDate = 'End date must be after start date.';
  }
  return newErrors;
};

// Modal Component for Adding a New Client
function AddClientModal({ isOpen, onClose, onAddClient }) {
  const initialNewClientState = {
    name: '', totalAmount: '', collected: '', outstanding: '', overdue: '',
    targetBilling: '', assignedEmployee: '', billingDate: null,
    contactEmail: '', contactPhone: '', address: '', notes: '',
  };
  const [newClient, setNewClient] = useState(initialNewClientState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
    if (name === 'totalAmount' || name === 'collected' || name === 'outstanding' || name ==='overdue') {
      if(errors.financials) setErrors(prev => ({...prev, financials: null}));
    }
  };

  const handleDateChange = (date) => {
    setNewClient((prev) => ({ ...prev, billingDate: date }));
    if (errors.billingDate) setErrors(prev => ({...prev, billingDate: null}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateClientForm(newClient);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const clientToAdd = {
      ...newClient,
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      totalAmount: parseFloat(newClient.totalAmount), collected: parseFloat(newClient.collected),
      outstanding: parseFloat(newClient.outstanding), overdue: parseFloat(newClient.overdue),
      targetBilling: parseFloat(newClient.targetBilling),
    };
    onAddClient(clientToAdd);
    handleClose(); 
  };

  const handleClose = () => {
    setNewClient(initialNewClientState);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Add New Client</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientFormFields clientData={newClient} handleChange={handleChange} handleDateChange={handleDateChange} errors={errors} />
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">Add Client</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component for Editing an Existing Client
function EditClientModal({ isOpen, onClose, clientToEdit, onUpdateClient }) {
  const [editedClient, setEditedClient] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clientToEdit) {
      const clientDataForForm = {
        ...clientToEdit,
        totalAmount: clientToEdit.totalAmount?.toString() ?? '',
        collected: clientToEdit.collected?.toString() ?? '',
        outstanding: clientToEdit.outstanding?.toString() ?? '',
        overdue: clientToEdit.overdue?.toString() ?? '',
        targetBilling: clientToEdit.targetBilling?.toString() ?? '',
        billingDate: clientToEdit.billingDate ? new Date(clientToEdit.billingDate) : null,
      };
      setEditedClient(clientDataForForm);
    } else {
      setEditedClient(null);
    }
    setErrors({});
  }, [clientToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedClient((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
    if (name === 'totalAmount' || name === 'collected' || name === 'outstanding' || name ==='overdue') {
      if(errors.financials) setErrors(prev => ({...prev, financials: null}));
    }
  };

  const handleDateChange = (date) => {
    setEditedClient((prev) => ({ ...prev, billingDate: date }));
    if (errors.billingDate) setErrors(prev => ({...prev, billingDate: null}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editedClient) return;
    const formErrors = validateClientForm(editedClient);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const updatedClientData = {
      ...editedClient,
      totalAmount: parseFloat(editedClient.totalAmount), collected: parseFloat(editedClient.collected),
      outstanding: parseFloat(editedClient.outstanding), overdue: parseFloat(editedClient.overdue),
      targetBilling: parseFloat(editedClient.targetBilling),
    };
    onUpdateClient(updatedClientData);
    handleClose();
  };
  
  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !editedClient) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Edit Client: {clientToEdit.name}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientFormFields clientData={editedClient} handleChange={handleChange} handleDateChange={handleDateChange} errors={errors} />
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component for Viewing Client Details
function ViewClientModal({ isOpen, onClose, client }) {
  if (!isOpen || !client) return null;
  const detailItemClass = "py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0";
  const labelClass = "text-sm font-medium text-gray-600";
  const valueClass = "mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Client Details: {client.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
        </div>
        <dl className="divide-y divide-gray-200">
          {[
            { label: "Client Name", value: client.name },
            { label: "Total Amount", value: `$${client.totalAmount?.toLocaleString()}` },
            { label: "Collected Amount", value: `$${client.collected?.toLocaleString()}`, className: "text-green-600 font-medium" },
            { label: "Outstanding Amount", value: `$${client.outstanding?.toLocaleString()}`, className: "text-blue-600 font-medium" },
            { label: "Overdue Amount", value: `$${client.overdue?.toLocaleString()}`, className: "text-red-600 font-medium" },
            { label: "Target Billing", value: `$${client.targetBilling?.toLocaleString()}` },
            { label: "Raised Percentage", value: getRaisedPercentage(client.collected, client.totalAmount) },
            { label: "Assigned Employee", value: client.assignedEmployee },
            { label: "Billing Date", value: formatDate(client.billingDate) },
            { label: "Contact Email", value: client.contactEmail || 'N/A' },
            { label: "Contact Phone", value: client.contactPhone || 'N/A' },
            { label: "Address", value: client.address || 'N/A' },
            { label: "Notes", value: client.notes || 'N/A', className: "whitespace-pre-wrap" },
          ].map(item => (
            <div className={detailItemClass} key={item.label}>
              <dt className={labelClass}>{item.label}</dt>
              <dd className={`${valueClass} ${item.className || ''}`}>{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// Modal Component for Confirming Deletion
function ConfirmDeleteModal({ isOpen, onClose, onConfirm, clientName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-[60] flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Delete Client
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete the client "<strong>{clientName}</strong>"? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { filterPeriod, dateRange, clients, employees, addTarget } = useContext(ARManagementContext);
  const [startDate, endDate] = dateRange;

  const [allClients, setAllClients] = useState([]);
  const [noParties, setNoParties] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [summaryData, setSummaryData] = useState({ totalSales: 0, receivedPayments: 0, outstandingPayments: 0, overduePayments: 0 });
  const [targets, setTargets] = useState([]);

  // Modal States
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isViewClientModalOpen, setIsViewClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Data for Modals
  const [selectedClientForView, setSelectedClientForView] = useState(null);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);

useEffect(() => {
  const fetchClientTargets = async () => {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
      const employeeId = userInfo?.employee_id;
      if (!employeeId) {
        setTargets([]);
        return;
      }

      const response = await fetch(`${apiBaseUrl}/client-targets/${employeeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const transformedTargets = data.map(target => ({
        id: target.id,
        clientId: target.client,
        targetAmount: parseFloat(target.target_amount),
        startDate: new Date(target.start_date),
        endDate: new Date(target.end_date),
        clientName: target.client_name, 
      }));
      setTargets(transformedTargets);
    } catch (error) {
      console.error("Error fetching client targets:", error);
      setTargets([]);
    }
  };

  fetchClientTargets();
}, []);

  useEffect(() => {
    const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

    const fetchPartiesAndInvoices = async () => {
      try {
        if (!userInfo || !userInfo.employee_id) {
          console.warn("employee_id not found");
          setNoParties(true);
          setAllClients([]);
          return;
        }

        // Step 1: Get salesperson ID from party API
        const partyRes = await fetch(`${apiBaseUrl}/pincode/employee-parties/${userInfo.employee_id}`);
        const parties = await partyRes.json();

        if (!parties || parties.length === 0 || !parties[0].sales_person) {
          console.warn("No parties or no salesperson found");
          setNoParties(true);
          setAllClients([]);
          return;
        }

        const mySalespersonId = parties[0].sales_person.id;
        console.log("My salesperson ID:", mySalespersonId);

        // Step 2: Fetch all invoices
        const invoiceRes = await fetch(`${apiBaseUrl}/saleinv/invoices/with-amounts/`);
        const invoiceData = await invoiceRes.json();

        const myInvoices = invoiceData.invoices.filter(
          (invoice) =>
            invoice.sales_person && invoice.sales_person.id === mySalespersonId
        );

        if (myInvoices.length === 0) {
          console.warn("No matching invoices found");
          setNoParties(true);
          setAllClients([]);
          return;
        }

        // Step 3: Transform and set data
        const transformedClients = myInvoices.map((inv, index) => ({
          id: `client-${index + 1}`,
          name: inv.party_name,
          totalAmount: parseFloat(inv.total_amount.total),
          collected: inv.payment_status === "paid" 
  ? parseFloat(inv.total_amount.total) 
  : inv.payment_status === "partially_paid" 
    ? parseFloat(inv.total_amount.total) - parseFloat(inv.balance_amount) 
    : parseFloat(inv.amount_paid),
          outstanding: parseFloat(inv.outstanding_amount),
          overdue: parseFloat(inv.overdue_amount),
          targetBilling: parseFloat(inv.total_amount.total),
          assignedEmployee: inv.sales_person.name,
          billingDate: inv.invoice_date,
          contactEmail: inv.sales_person.email,
          contactPhone: "",
          address: "",
          notes: "",
          raisedPercentage: getRaisedPercentage(
  inv.payment_status === "paid" 
    ? parseFloat(inv.total_amount.total) 
    : inv.payment_status === "partially_paid" 
      ? parseFloat(inv.total_amount.total) - parseFloat(inv.balance_amount) 
      : parseFloat(inv.amount_paid),
  parseFloat(inv.total_amount.total)
),
        }));

        setAllClients(transformedClients);
        setNoParties(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setNoParties(true);
      }
    };

    fetchPartiesAndInvoices();
  }, []);
  

  const calculateSummary = useCallback((data) => {
    return data.reduce((acc, client) => {
      acc.totalSales += client.totalAmount || 0;
      acc.receivedPayments += client.collected || 0;
      acc.outstandingPayments += client.outstanding || 0;
      acc.overduePayments += client.overdue || 0;
      return acc;
    }, { totalSales: 0, receivedPayments: 0, outstandingPayments: 0, overduePayments: 0 });
  }, []);

  const applyFilters = useCallback(() => {
    let newFilteredData = [...allClients];
    let newFilteredTargets = [...targets];
    let filterStartDate = null;
    let filterEndDate = null;

    const today = new Date(2025, 4, 13); // May 13, 2025
    today.setHours(0, 0, 0, 0);

    switch (filterPeriod) {
      case 'daily':
        filterStartDate = new Date(today);
        filterEndDate = new Date(today);
        break;
      case 'weekly':
        filterStartDate = new Date(today);
        filterStartDate.setDate(today.getDate() - today.getDay());
        filterEndDate = new Date(filterStartDate);
        filterEndDate.setDate(filterStartDate.getDate() + 6);
        break;
      case 'monthly':
        filterStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        filterEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        filterStartDate = new Date(today.getFullYear(), quarter * 3, 1);
        filterEndDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'half-yearly':
        const half = today.getMonth() < 6 ? 0 : 6;
        filterStartDate = new Date(today.getFullYear(), half, 1);
        filterEndDate = new Date(today.getFullYear(), half + 6, 0);
        break;
      case 'yearly':
        filterStartDate = new Date(today.getFullYear(), 0, 1);
        filterEndDate = new Date(today.getFullYear(), 11, 31);
        break;
      case 'custom':
        filterStartDate = startDate;
        filterEndDate = endDate;
        break;
      default:
        break;
    }

    if (filterStartDate && filterEndDate) {
      newFilteredData = newFilteredData.filter((client) => {
        const clientDate = new Date(client.billingDate);
        const clientDayStart = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate());
        const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
        const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
        return clientDayStart >= rangeStart && clientDayStart <= rangeEnd;
      });
      newFilteredTargets = newFilteredTargets.filter((target) => {
        const targetStartDate = new Date(target.startDate);
        const targetEndDate = new Date(target.endDate);
        const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
        const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
        return (
          (targetStartDate >= rangeStart && targetStartDate <= rangeEnd) ||
          (targetEndDate >= rangeStart && targetEndDate <= rangeEnd) ||
          (targetStartDate <= rangeStart && targetEndDate >= rangeEnd)
        );
      });
    }

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      newFilteredData = newFilteredData.filter((client) =>
        client.name.toLowerCase().includes(lowerSearchQuery) ||
        (client.assignedEmployee && client.assignedEmployee.toLowerCase().includes(lowerSearchQuery))
      );
      newFilteredTargets = newFilteredTargets.filter((target) => {
        return (
          target.clientName.toLowerCase().includes(lowerSearchQuery) ||
          (target.assignedEmployee && target.assignedEmployee.toLowerCase().includes(lowerSearchQuery))
        );
      });
    }

    setFilteredData(newFilteredData);
    setFilteredTargets(newFilteredTargets);
    setSummaryData(calculateSummary(newFilteredData));
  }, [allClients, targets, filterPeriod, startDate, endDate, searchQuery, calculateSummary]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Add Client Handlers
  const handleOpenAddClientModal = () => setIsAddClientModalOpen(true);
  const handleCloseAddClientModal = () => setIsAddClientModalOpen(false);
  const handleAddClient = (newClient) => {
    const clientWithCalculatedFields = { ...newClient, raisedPercentage: getRaisedPercentage(newClient.collected, newClient.totalAmount) };
    setAllClients((prevClients) => [clientWithCalculatedFields, ...prevClients].sort((a,b) => new Date(b.billingDate) - new Date(a.billingDate)));
  };

  // View Client Handlers
  const handleOpenViewClientModal = (client) => { setSelectedClientForView(client); setIsViewClientModalOpen(true); };
  const handleCloseViewClientModal = () => { setIsViewClientModalOpen(false); setSelectedClientForView(null); };

  // Edit Client Handlers
  const handleOpenEditClientModal = (client) => { setClientToEdit(client); setIsEditClientModalOpen(true); };
  const handleCloseEditClientModal = () => { setIsEditClientModalOpen(false); setClientToEdit(null); };
  const handleUpdateClient = (updatedClient) => {
    const clientWithCalculatedFields = { ...updatedClient, raisedPercentage: getRaisedPercentage(updatedClient.collected, updatedClient.totalAmount) };
    setAllClients((prevClients) => 
      prevClients.map(c => c.id === updatedClient.id ? clientWithCalculatedFields : c)
        .sort((a,b) => new Date(b.billingDate) - new Date(a.billingDate))
    );
  };

  // Delete Client Handlers
  const handleOpenDeleteModal = (client) => { setClientToDelete(client); setIsDeleteModalOpen(true); };
  const handleCloseDeleteModal = () => { setIsDeleteModalOpen(false); setClientToDelete(null); };
  const handleConfirmDelete = () => {
    if (clientToDelete) {
      setAllClients((prevClients) => prevClients.filter(c => c.id !== clientToDelete.id));
      handleCloseDeleteModal();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans"> 
      <div className="flex-1">
        <main className="p-4 sm:p-6 max-w-full mx-auto"> 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {[
              { title: "Total Sales", value: summaryData.totalSales, color: "orange" },
              { title: "Received Payments", value: summaryData.receivedPayments, color: "green" },
              { title: "Outstanding Payments", value: summaryData.outstandingPayments, color: "blue" },
              { title: "Overdue Payments", value: summaryData.overduePayments, color: "red" },
            ].map(card => (
              <div key={card.title} className={`bg-white p-5 rounded-xl border-l-4 border-${card.color}-500 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                <div className="text-sm font-medium text-gray-500 mb-1">{card.title}</div>
                <div className={`text-3xl font-bold text-${card.color === 'orange' ? 'gray-800' : card.color + '-600'} mb-2`}>${card.value.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                  placeholder="Search name..."
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Client Name",
                      "Total Amount",
                      "Collected",
                      "Outstanding",
                      "Overdue",
                      "Target Billing",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                          header === "Total Amount"
                            ? "text-orange-600"
                            : header === "Collected"
                            ? "text-green-600"
                            : header === "Outstanding"
                            ? "text-blue-600"
                            : header === "Overdue"
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((client) => (
                      <tr
                        key={client.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          {client.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          ${client.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          ${client.collected.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                          ${client.outstanding.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          ${client.overdue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div>${client.targetBilling.toLocaleString()}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Raised: {client.raisedPercentage}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1 flex items-center">
                          <button
                            onClick={() => handleOpenViewClientModal(client)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-100 rounded-md"
                            title="View Client Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenEditClientModal(client)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors p-1 hover:bg-yellow-100 rounded-md"
                            title="Edit Client"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(client)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-100 rounded-md"
                            title="Delete Client"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center">
                          <Search size={40} className="text-gray-400 mb-3" />
                          {noParties ? (
                            <>
                              <p className="font-semibold">No parties created yet.</p>
                              <p className="text-xs text-gray-400">You haven’t added any clients or invoices.</p>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold">No clients match your current filters.</p>
                              <p className="text-xs text-gray-400">Try adjusting your search or date range.</p>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Client Targets</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Client Name", "Target Amount", "Collected", "Date Range", "Status"].map(header => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTargets.length > 0 ? (
                    filteredTargets.map((target) => {
                      const client = allClients.find((c) => c.id === target.clientId);
                      const isCompleted = client && client.collected >= target.targetAmount;
                      return (
                        <tr key={target.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{target.clientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${target.targetAmount.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">${client ? client.collected.toLocaleString() : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{`${formatDate(target.startDate)} - ${formatDate(target.endDate)}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {isCompleted ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center">
                          <Target size={40} className="text-gray-400 mb-3"/>
                          <p className="font-semibold">No targets set for the current filters.</p>
                          <p className="text-xs text-gray-400">Try setting a new target or adjusting your filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <AddClientModal isOpen={isAddClientModalOpen} onClose={handleCloseAddClientModal} onAddClient={handleAddClient} />
      <ViewClientModal isOpen={isViewClientModalOpen} onClose={handleCloseViewClientModal} client={selectedClientForView} />
      <EditClientModal isOpen={isEditClientModalOpen} onClose={handleCloseEditClientModal} clientToEdit={clientToEdit} onUpdateClient={handleUpdateClient} />
      <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} clientName={clientToDelete?.name} />
    </div>
  );
}