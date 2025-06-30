import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Search, X, Calendar as CalendarIcon, Eye, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ARManagementContext } from './AccountManagementLayout';
import axios from 'axios';

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

// Helper to format currency safely
const formatCurrency = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? '$0' : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper to format shipping address
const formatAddress = (address) => {
  if (!address || address === "No Shipping Address" || address === null) return "N/A";
  if (typeof address === 'object' && address !== null) {
    // Handle case where address might be a nested object (e.g., { street, city, state, pincode })
    const { street, city, state, pincode } = address;
    return street && city && state && pincode ? `${street}, ${city}, ${state} ${pincode}` : "N/A";
  }
  // Handle case where address is a string
  const parts = address.split(", ");
  if (parts.length < 4) return address; // Fallback if format is unexpected
  const [street, city, state, pincode] = parts;
  return (
    <>
      {street}
      <br />
      {city}, {state} {pincode}
    </>
  );
};

// Common modal classes
const commonModalInputClass = (hasError) => `block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`;
const commonModalLabelClass = "block text-sm font-medium text-gray-700 mb-1";
const commonModalErrorClass = "text-xs text-red-500 mt-1";

// Shared Form Fields for Edit Modal
const ClientFormFields = ({ clientData, handleChange, handleDateChange, errors }) => (
  <>
    <div>
      <label htmlFor="party_name" className={commonModalLabelClass}>Client Name</label>
      <input type="text" name="party_name" id="party_name" value={clientData.party_name} onChange={handleChange} className={commonModalInputClass(errors.party_name)} />
      {errors.party_name && <p className={commonModalErrorClass}>{errors.party_name}</p>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="total_amount" className={commonModalLabelClass}>Total Amount ($)</label>
        <input type="number" name="total_amount" id="total_amount" value={clientData.total_amount} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.total_amount)} />
        {errors.total_amount && <p className={commonModalErrorClass}>{errors.total_amount}</p>}
      </div>
      <div>
        <label htmlFor="total_paid_amount" className={commonModalLabelClass}>Collected ($)</label>
        <input type="number" name="total_paid_amount" id="total_paid_amount" value={clientData.total_paid_amount} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.total_paid_amount)} />
        {errors.total_paid_amount && <p className={commonModalErrorClass}>{errors.total_paid_amount}</p>}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="outstanding_amount" className={commonModalLabelClass}>Outstanding Amount ($)</label>
        <input type="number" name="outstanding_amount" id="outstanding_amount" value={clientData.outstanding_amount} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.outstanding_amount)} />
        {errors.outstanding_amount && <p className={commonModalErrorClass}>{errors.outstanding_amount}</p>}
      </div>
      <div>
        <label htmlFor="overdue_amount" className={commonModalLabelClass}>Overdue Amount ($)</label>
        <input type="number" name="overdue_amount" id="overdue_amount"  value={clientData.overdue_amount} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.overdue_amount)} />
        {errors.overdue_amount && <p className={commonModalErrorClass}>{errors.overdue_amount}</p>}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="target_billing" className={commonModalLabelClass}>Target Billing ($)</label>
        <input type="number" name="target_billing" id="target_billing" value={clientData.target_billing} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.target_billing)} />
        {errors.target_billing && <p className={commonModalErrorClass}>{errors.target_billing}</p>}
      </div>
      <div>
        <label htmlFor="sales_person" className={commonModalLabelClass}>Assigned Employee</label>
        <input
          type="text"
          name="sales_person"
          id="sales_person"
          value={clientData.sales_person?.name || 'N/A'}
          readOnly
          className={commonModalInputClass(false) + " bg-gray-100"}
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="party_email" className={commonModalLabelClass}>Contact Email</label>
        <input type="email" name="party_email" id="party_email" value={clientData.party_email} onChange={handleChange} className={commonModalInputClass(errors.party_email)} />
        {errors.party_email && <p className={commonModalErrorClass}>{errors.party_email}</p>}
      </div>
      <div>
        <label htmlFor="party_mobile_number" className={commonModalLabelClass}>Contact Phone</label>
        <input type="tel" name="party_mobile_number" id="party_mobile_number" value={clientData.party_mobile_number} onChange={handleChange} className={commonModalInputClass(false)} />
      </div>
    </div>
    <div>
      <label htmlFor="shipping_address" className={commonModalLabelClass}>Address</label>
      <textarea
        name="shipping_address"
        id="shipping_address"
        value={clientData.shipping_address}
        onChange={handleChange}
        rows="2"
        readOnly
        className={commonModalInputClass(false) + " resize-none bg-gray-100"}
      />
    </div>
    <div>
      <label htmlFor="invoice_date" className={commonModalLabelClass}>Invoice Date</label>
      <div className="relative">
        <DatePicker
          selected={clientData.invoice_date ? new Date(clientData.invoice_date) : null}
          onChange={handleDateChange}
          dateFormat="MMMM d, yyyy"
          placeholderText="Select invoice date"
          className={`w-full pl-10 pr-3 py-2 border ${errors.invoice_date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          wrapperClassName="w-full"
          popperPlacement="bottom-start"
        />
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
      {errors.invoice_date && <p className={commonModalErrorClass}>{errors.invoice_date}</p>}
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
  if (!clientData.party_name?.trim()) newErrors.party_name = 'Client name is required.';

  const validateNumericField = (field, fieldName, allowNegative = false) => {
    const value = clientData[field];
    if (value === null || value === undefined || value === '') newErrors[field] = `${fieldName} is required.`;
    else if (isNaN(parseFloat(value))) newErrors[field] = `Invalid ${fieldName.toLowerCase()} format.`;
    else if (!allowNegative && parseFloat(value) < 0) newErrors[field] = `${fieldName} cannot be negative.`;
    else if (parseFloat(value) > 9999999999) newErrors[field] = `${fieldName} is too large.`;
  };

  validateNumericField('total_amount', 'Total Amount');
  validateNumericField('total_paid_amount', 'Collected Amount');
  validateNumericField('outstanding_amount', 'Outstanding Amount');
  validateNumericField('overdue_amount', 'Overdue Amount');
  validateNumericField('target_billing', 'Target Billing');

  if (parseFloat(clientData.total_paid_amount) > parseFloat(clientData.total_amount)) {
    newErrors.total_paid_amount = 'Collected amount cannot exceed total amount.';
  }

  if (clientData.party_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.party_email)) {
    newErrors.party_email = 'Invalid email format.';
  }

  if (!clientData.invoice_date) newErrors.invoice_date = 'Invoice date is required.';

  return newErrors;
};

// Modal Component for Editing an Existing Client
function EditClientModal({ isOpen, onClose, clientToEdit, onUpdateClient }) {
  const [editedClient, setEditedClient] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clientToEdit) {
      setEditedClient({
        ...clientToEdit,
        total_amount: clientToEdit.total_amount?.total?.toString() ?? '0',
        total_paid_amount: clientToEdit.total_paid_amount?.toString() ?? '0',
        outstanding_amount: clientToEdit.outstanding_amount?.toString() ?? '0',
        overdue_amount: clientToEdit.overdue_amount?.toString() ?? '0',
        target_billing: clientToEdit.target_billing?.toString() ?? '0',
        party_email: clientToEdit.party_email || clientToEdit.party?.email || '',
        party_mobile_number: clientToEdit.party_mobile_number || clientToEdit.party?.mobile_number || '',
        shipping_address: clientToEdit.shipping_address || (clientToEdit.party?.shipping_address ? `${clientToEdit.party.shipping_address.street}, ${clientToEdit.party.shipping_address.city}, ${clientToEdit.party.shipping_address.state}, ${clientToEdit.party.shipping_address.pincode}` : 'No Shipping Address'),
        notes: clientToEdit.notes || '',
        invoice_date: clientToEdit.invoice_date ? new Date(clientToEdit.invoice_date) : null,
        sales_person: clientToEdit.sales_person || { id: null, name: 'N/A' },
      });
    } else {
      setEditedClient(null);
    }
    setErrors({});
  }, [clientToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedClient((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (['total_amount', 'total_paid_amount', 'outstanding_amount', 'overdue_amount', 'target_billing'].includes(name)) {
      if (errors.financials) setErrors(prev => ({ ...prev, financials: null }));
    }
  };

  const handleDateChange = (date) => {
    setEditedClient((prev) => ({ ...prev, invoice_date: date }));
    if (errors.invoice_date) setErrors(prev => ({ ...prev, invoice_date: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editedClient) return;
    const formErrors = validateClientForm(editedClient);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      // Update SalesInvoice
      const salesInvoicePayload = {
        party: editedClient.party.id,
        invoice_date: editedClient.invoice_date.toISOString().split('T')[0],
        sales_person: editedClient.sales_person?.id || null,
        total_paid_amount: parseFloat(editedClient.total_paid_amount) || 0,
        payment_status:
          parseFloat(editedClient.total_paid_amount) >= parseFloat(editedClient.total_amount)
            ? 'paid'
            : parseFloat(editedClient.total_paid_amount) > 0
            ? 'partially paid'
            : 'unpaid',
        shipping_address: editedClient.shipping_address,
        total_amount: { total: parseFloat(editedClient.total_amount) || 0 },
        outstanding_amount: parseFloat(editedClient.outstanding_amount) || 0,
        overdue_amount: parseFloat(editedClient.overdue_amount) || 0,
        target_billing: parseFloat(editedClient.target_billing) || 0,
        notes: editedClient.notes,
      };

      const salesInvoiceResponse = await axios.put(
        `${apiBaseUrl}/saleinv/sales-invoice/update/${editedClient.id}/`,
        salesInvoicePayload
      );

      // Update Party details
      const partyPayload = {
        party_name: editedClient.party_name,
        email: editedClient.party_email,
        mobile_number: editedClient.party_mobile_number,
      };

      await axios.put(
        `${apiBaseUrl}/party/update/${editedClient.party.id}/`,
        partyPayload
      );

      // Update local state
      onUpdateClient(salesInvoiceResponse.data);
      handleClose();
    } catch (error) {
      console.error('Update error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setErrors({ api: error.response?.data?.error || 'Failed to update client. Please try again.' });
    }
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
          <h2 className="text-xl font-semibold text-gray-800">Edit Client: {clientToEdit.party_name}</h2>
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

  // Debug log for the client object
  useEffect(() => {
    if (client) {
      console.log('Client Data in ViewClientModal:', client);
    }
  }, [client]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Client Details: {client.party_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
        </div>
        <dl className="divide-y divide-gray-200">
          {[
            { label: "Client Name", value: client.party_name },
            { label: "Total Amount", value: formatCurrency(client.total_amount?.total) },
            { label: "Collected Amount", value: client.payment_status === "paid" ? formatCurrency(client.total_amount?.total) : formatCurrency(0), className: "text-green-600 font-medium" },
            { label: "Outstanding Amount", value: formatCurrency(client.outstanding_amount), className: "text-blue-600 font-medium" },
            { label: "Overdue Amount", value: formatCurrency(client.overdue_amount), className: "text-red-600 font-medium" },
            { label: "Target Billing", value: formatCurrency(client.target_billing) },
            { label: "Raised Percentage", value: getRaisedPercentage(client.payment_status === "paid" ? client.total_amount?.total : 0, client.total_amount?.total) },
            { label: "Assigned Employee", value: client.sales_person?.name || 'N/A' },
            { label: "Invoice Date", value: formatDate(client.invoice_date) },
            { label: "Contact Email", value: client.party_email || client.party?.email || 'N/A' },
            { label: "Contact Phone", value: client.party_mobile_number || client.party?.mobile_number || 'N/A' },
            { label: "Address", value: formatAddress(client.shipping_address || client.party?.shipping_address), className: "whitespace-pre-wrap" },
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
  const { filterPeriod, dateRange, targets, addTarget } = useContext(ARManagementContext);
  const [startDate, endDate] = dateRange;
  const [allClients, setAllClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [summaryData, setSummaryData] = useState({ totalSales: 0, receivedPayments: 0, outstandingPayments: 0, overduePayments: 0 });
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isViewClientModalOpen, setIsViewClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Data for Modals
  const [selectedClientForView, setSelectedClientForView] = useState(null);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Fetch all sales invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await axios.get(`${apiBaseUrl}/saleinv/sales-invoices/`);
        console.log('API Response:', response.data); // Debug log to check full response
        const invoices = response.data.map(invoice => {
          let shippingAddress = invoice.shipping_address || 'No Shipping Address';
          if (invoice.party?.shipping_address) {
            shippingAddress = `${invoice.party.shipping_address.street}, ${invoice.party.shipping_address.city}, ${invoice.party.shipping_address.state}, ${invoice.party.shipping_address.pincode}`;
          }
          return {
            ...invoice,
            sales_person: invoice.sales_person || { id: null, name: 'N/A' },
            total_amount: invoice.total_amount || { total: 0 },
            total_paid_amount: invoice.total_paid_amount || 0,
            outstanding_amount: invoice.outstanding_amount || 0,
            overdue_amount: invoice.overdue_amount || 0,
            target_billing: invoice.target_billing || 0,
            party_email: invoice.party?.email || invoice.party_email || '',
            party_mobile_number: invoice.party?.mobile_number || invoice.party_mobile_number || '',
            shipping_address: shippingAddress,
            notes: invoice.notes || '',
            raisedPercentage: getRaisedPercentage(invoice.payment_status === "paid" ? invoice.total_amount?.total : 0, invoice.total_amount?.total || 0)
          };
        }).sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date));
        setAllClients(invoices);
        setFetchError(null);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
        let errorMessage = 'Unable to load client data. Please try again later.';
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`;
        } else if (error.request) {
          errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
        }
        setFetchError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Fetch all client targets
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/targets/`);
        // Filter out targets where client is null
        const validTargets = response.data.filter(target => target.client !== null);
        setFilteredTargets(validTargets);
      } catch (error) {
        console.error('Failed to fetch targets:', error);
        let errorMessage = 'Unable to load target data. Please try again later.';
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`;
        } else if (error.request) {
          errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
        }
        setFetchError(errorMessage);
      }
    };
    fetchTargets();
  }, []);

  const calculateSummary = useCallback((data) => {
    return data.reduce((acc, client) => {
      acc.totalSales += parseFloat(client.total_amount?.total || 0);
      acc.receivedPayments += client.payment_status === "paid" ? parseFloat(client.total_amount?.total || 0) : 0;
      acc.outstandingPayments += parseFloat(client.outstanding_amount || 0);
      acc.overduePayments += parseFloat(client.overdue_amount || 0);
      return acc;
    }, { totalSales: 0, receivedPayments: 0, outstandingPayments: 0, overduePayments: 0 });
  }, []);

  const applyFilters = useCallback(() => {
    let newFilteredData = [...allClients];
    let filterStartDate = null;
    let filterEndDate = null;

    const today = new Date(2025, 5, 17); // June 17, 2025, 11:16 AM IST
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
        const clientDate = new Date(client.invoice_date);
        const clientDayStart = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate());
        const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
        const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
        return clientDayStart >= rangeStart && clientDayStart <= rangeEnd;
      });
    }

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      newFilteredData = newFilteredData.filter((client) =>
        client.party_name.toLowerCase().includes(lowerSearchQuery) ||
        (client.sales_person?.name && client.sales_person.name.toLowerCase().includes(lowerSearchQuery))
      );
    }

    setFilteredData(newFilteredData);
    setSummaryData(calculateSummary(newFilteredData));
  }, [allClients, filterPeriod, startDate, endDate, searchQuery, calculateSummary]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // View Client Handlers
  const handleOpenViewClientModal = (client) => { setSelectedClientForView(client); setIsViewClientModalOpen(true); };
  const handleCloseViewClientModal = () => { setIsViewClientModalOpen(false); setSelectedClientForView(null); };

  // Edit Client Handlers
  const handleOpenEditClientModal = (client) => { setClientToEdit(client); setIsEditClientModalOpen(true); };
  const handleCloseEditClientModal = () => { setIsEditClientModalOpen(false); setClientToEdit(null); };
  const handleUpdateClient = (updatedClient) => {
    const clientWithCalculatedFields = { ...updatedClient, raisedPercentage: getRaisedPercentage(updatedClient.payment_status === "paid" ? updatedClient.total_amount?.total : 0, updatedClient.total_amount?.total) };
    setAllClients((prevClients) =>
      prevClients.map(c => c.id === updatedClient.id ? clientWithCalculatedFields : c)
        .sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date))
    );
  };

  // Delete Client Handlers
  const handleOpenDeleteModal = (client) => { setClientToDelete(client); setIsDeleteModalOpen(true); };
  const handleCloseDeleteModal = () => { setIsDeleteModalOpen(false); setClientToDelete(null); };
  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      try {
        await axios.delete(`${apiBaseUrl}/saleinv/sales-invoice/delete/${clientToDelete.id}/`);
        setAllClients((prevClients) => prevClients.filter(c => c.id !== clientToDelete.id));
        handleCloseDeleteModal();
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="flex-1">
        <main className="p-4 sm:p-6 max-w-full mx-auto">
          {isLoading && (
            <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-md flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Loading client data...
            </div>
          )}
          {fetchError && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {fetchError}
              <button
                onClick={() => {
                  setFetchError(null);
                  setIsLoading(true);
                  Promise.all([
                    axios.get('https://ess-backend-fg6m.onrender.com/saleinv/sales-invoices/').catch(e => { throw e; }),
                    axios.get('https://ess-backend-fg6m.onrender.com/targets/').catch(e => { throw e; })
                  ]).then(([invoicesResponse, targetsResponse]) => {
                    const invoices = invoicesResponse.data.map(invoice => {
                      let shippingAddress = invoice.shipping_address || 'No Shipping Address';
                      if (invoice.party?.shipping_address) {
                        shippingAddress = `${invoice.party.shipping_address.street}, ${invoice.party.shipping_address.city}, ${invoice.party.shipping_address.state}, ${invoice.party.shipping_address.pincode}`;
                      }
                      return {
                        ...invoice,
                        sales_person: invoice.sales_person || { id: null, name: 'N/A' },
                        total_amount: invoice.total_amount || { total: 0 },
                        total_paid_amount: invoice.total_paid_amount || 0,
                        outstanding_amount: invoice.outstanding_amount || 0,
                        overdue_amount: invoice.overdue_amount || 0,
                        target_billing: invoice.target_billing || 0,
                        party_email: invoice.party?.email || invoice.party_email || '',
                        party_mobile_number: invoice.party?.mobile_number || invoice.party_mobile_number || '',
                        shipping_address: shippingAddress,
                        notes: invoice.notes || '',
                        raisedPercentage: getRaisedPercentage(invoice.payment_status === "paid" ? invoice.total_amount?.total : 0, invoice.total_amount?.total || 0)
                      };
                    }).sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date));
                    setAllClients(invoices);
                    // Filter out targets where client is null
                    const validTargets = targetsResponse.data.filter(target => target.client !== null);
                    setFilteredTargets(validTargets);
                    setFetchError(null);
                  }).catch(error => {
                    let errorMessage = 'Unable to load data. Please try again later.';
                    if (error.response) {
                      errorMessage = `Server error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`;
                    } else if (error.request) {
                      errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
                    }
                    setFetchError(errorMessage);
                  }).finally(() => {
                    setIsLoading(false);
                  });
                }}
                className="ml-4 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {[
              { title: "Total Sales", value: summaryData.totalSales, color: "orange" },
              { title: "Received Payments", value: summaryData.receivedPayments, color: "green" },
              { title: "Outstanding Payments", value: summaryData.outstandingPayments, color: "blue" },
              { title: "Overdue Payments", value: summaryData.overduePayments, color: "red" },
            ].map(card => (
              <div key={card.title} className={`bg-white p-5 rounded-xl border-l-4 border-${card.color}-500 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                <div className="text-sm font-medium text-gray-500 mb-1">{card.title}</div>
                <div className={`text-3xl font-bold text-${card.color === 'orange' ? 'gray-800' : card.color + '-600'} mb-2`}>{formatCurrency(card.value)}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input type="text" value={searchQuery} onChange={handleSearchChange} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm" placeholder="Search name or employee..." />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Client Name", "Total Amount", "Collected", "Outstanding", "Overdue", "Assigned To", "Actions"].map(header => (
                      <th key={header} className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                        header === "Total Amount" ? "text-orange-600" :
                        header === "Collected" ? "text-green-600" :
                        header === "Outstanding" ? "text-blue-600" :
                        header === "Overdue" ? "text-red-600" : ""
                      }`}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{client.party_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(client.total_amount?.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{client.payment_status === "paid" ? formatCurrency(client.total_amount?.total) : formatCurrency(0)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{formatCurrency(client.outstanding_amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(client.overdue_amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.sales_person?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1 flex items-center">
                          <button onClick={() => handleOpenViewClientModal(client)} className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-100 rounded-md" title="View Client Details"><Eye size={18} /></button>
                          {/* <button onClick={() => handleOpenEditClientModal(client)} className="text-yellow-600 hover:text-yellow-800 transition-colors p-1 hover:bg-yellow-100 rounded-md" title="Edit Client"><Edit3 size={18} /></button> */}
                          <button onClick={() => handleOpenDeleteModal(client)} className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-100 rounded-md" title="Delete Client"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center">
                          <Search size={40} className="text-gray-400 mb-3"/>
                          <p className="font-semibold">No clients match your current filters.</p>
                          <p className="text-xs text-gray-400">Try adjusting your search or date range.</p>
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
                    {["Client Name", "Target Amount", "Collected", "Date Range", "Status", "Actions"].map(header => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTargets.length > 0 ? (
                    filteredTargets.map((target) => {
                      const client = allClients.find((c) => c.id == target.client);
                      const isCompleted = client && client.total_paid_amount >= target.target_amount;
                      return (
                        <tr key={target.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{client ? client.party_name : 'Unknown'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(target.target_amount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{client ? formatCurrency(client.payment_status === "paid" ? client.total_amount?.total : 0) : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{`${formatDate(target.start_date)} - ${formatDate(target.end_date)}`}</td>
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
                          <Search size={40} className="text-gray-400 mb-3"/>
                          <p className="font-semibold">No targets available.</p>
                          <p className="text-xs text-gray-400">Try setting a new target.</p>
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

      <ViewClientModal isOpen={isViewClientModalOpen} onClose={handleCloseViewClientModal} client={selectedClientForView} />
      <EditClientModal isOpen={isEditClientModalOpen} onClose={handleCloseEditClientModal} clientToEdit={clientToEdit} onUpdateClient={handleUpdateClient} />
      <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} clientName={clientToDelete?.party_name} />
    </div>
  );
}