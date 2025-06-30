import React, { useState, useEffect, useContext } from "react";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ARManagementContext } from './AccountManagementLayout';
import axios from "axios";

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const apiBaseUrl = process.env.VITE_BASE_API;

const peachFuzz = "#FFDAB9";
const lightGreen = "#90EE90";
const lightBlue = "#ADD8E6";
const lightRed = "#F08080";

// Helper to format currency safely
const formatCurrency = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? '$0.00' : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper to format date string
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const AccountReports = () => {
  const { filterPeriod, dateRange } = useContext(ARManagementContext);
  const [startDate, endDate] = dateRange;
  const [isFiltered, setIsFiltered] = useState(false);
  const [allClients, setAllClients] = useState([]);
  const [allTargets, setAllTargets] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filteredClientData, setFilteredClientData] = useState([]);
  const [filteredEmployeeData, setFilteredEmployeeData] = useState([]);
  const [allSalesPersons, setAllSalesPersons] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);
  const [columnChartType, setColumnChartType] = useState('client');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [summaryData, setSummaryData] = useState({ totalSales: 0, receivedPayments: 0, outstandingPayments: 0, overduePayments: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  // Fetch all sales invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await axios.get(`${apiBaseUrl}/saleinv/sales-invoices/`);
        const invoices = response.data.map(invoice => ({
          id: invoice.id,
          name: invoice.party_name,
          totalAmount: invoice.total_amount?.total || 0,
          collected: invoice.payment_status === "paid" ? invoice.total_amount?.total : 0,
          outstanding: invoice.outstanding_amount || 0,
          overdue: invoice.overdue_amount || 0,
          targetBilling: invoice.target_billing || 0,
          assignedEmployee: invoice.sales_person?.name || 'N/A',
          billingDate: invoice.invoice_date ? new Date(invoice.invoice_date) : null,
          contactEmail: invoice.party_email || invoice.party?.email || 'N/A',
          contactPhone: invoice.party_mobile_number || invoice.party?.mobile_number || 'N/A',
          address: invoice.shipping_address || (invoice.party?.shipping_address 
            ? `${invoice.party.shipping_address.street}, ${invoice.party.shipping_address.city}, ${invoice.party.shipping_address.state}, ${invoice.party.shipping_address.pincode}`
            : 'No Shipping Address'),
          notes: invoice.notes || '',
          payment_status: invoice.payment_status || 'unpaid',
        })).sort((a, b) => new Date(b.billingDate) - new Date(a.billingDate));
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
        const validTargets = response.data.filter(target => target.client !== null).map(target => ({
          id: target.id,
          client: target.client,
          target_amount: target.target_amount,
          start_date: target.start_date ? new Date(target.start_date) : null,
          end_date: target.end_date ? new Date(target.end_date) : null,
        }));
        setAllTargets(validTargets);
        setFetchError(null);
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

  // Fetch all salespersons and their totals
  useEffect(() => {
    const fetchSalesPersons = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/saleinv/sales-persons/totals/`);
        setAllSalesPersons(response.data.data);
        setFetchError(null);
      } catch (error) {
        console.error('Failed to fetch salespersons:', error);
        let errorMessage = 'Unable to load salesperson data. Please try again later.';
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`;
        } else if (error.request) {
          errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
        }
        setFetchError(errorMessage);
      }
    };
    fetchSalesPersons();
  }, []);

  // Construct employee data from clients (for compatibility with existing filters)
  useEffect(() => {
    const employeeMap = {};
    allClients.forEach(client => {
      const empName = client.assignedEmployee || 'Unassigned';
      if (!employeeMap[empName]) {
        employeeMap[empName] = {
          id: `emp-${empName.toLowerCase().replace(/\s+/g, '-')}`,
          name: empName,
          clients: [],
          targetCollection: 0,
          contactEmail: `${empName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          contactPhone: `555-02${Object.keys(employeeMap).length + 1}`,
          notes: empName === 'Unassigned' ? 'No employee assigned' : 'Auto-generated employee data',
          addedDate: new Date('2025-01-01'),
        };
      }
      employeeMap[empName].clients.push({
        clientId: client.id,
        clientName: client.name,
        totalAmount: client.totalAmount,
        collected: client.collected,
        outstanding: client.outstanding,
        overdue: client.overdue,
        billingDate: client.billingDate,
      });
      employeeMap[empName].targetCollection += client.targetBilling;
    });
    setFilteredEmployeeData(Object.values(employeeMap));
  }, [allClients]);

  const applyFilters = () => {
    let filterStartDate = null;
    let filterEndDate = null;
    const today = new Date(2025, 5, 25); // Updated to current date
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

    let newFilteredClientData = allClients;
    let newFilteredEmployeeData = filteredEmployeeData;
    let newFilteredInvoices = allClients.map(client => ({
      id: client.id,
      date: client.billingDate,
      amount: client.totalAmount,
      status: client.collected >= client.totalAmount ? 'Paid' : 
              client.collected > 0 ? 'Inpayment' : 
              client.overdue > 0 ? 'Overdue' : 'Open',
      dueDate: client.billingDate ? new Date(client.billingDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A',
      paymentReceiveDate: client.collected >= client.totalAmount ? client.billingDate?.toLocaleDateString() : null,
      notifications: client.overdue > 0 ? `Overdue reminder sent` : client.collected > 0 ? `Payment received` : 'Pending',
      remindersSent: client.overdue > 0 ? 1 : 0,
      feedback: client.notes || '',
      assignedTo: client.assignedEmployee,
    }));
    let newFilteredTargets = allTargets;

    if (filterStartDate && filterEndDate) {
      newFilteredClientData = allClients.filter((client) => {
        const billingDate = new Date(client.billingDate);
        billingDate.setHours(0, 0, 0, 0);
        const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
        const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
        return billingDate >= rangeStart && billingDate <= rangeEnd;
      });

      newFilteredInvoices = newFilteredInvoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.date);
        invoiceDate.setHours(0, 0, 0, 0);
        const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
        const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
        return invoiceDate >= rangeStart && invoiceDate <= rangeEnd;
      });

      newFilteredEmployeeData = filteredEmployeeData.map(emp => ({
        ...emp,
        clients: emp.clients.filter(client => {
          const billingDate = new Date(client.billingDate);
          billingDate.setHours(0, 0, 0, 0);
          const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
          const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
          return billingDate >= rangeStart && billingDate <= rangeEnd;
        }),
      })).filter(emp => emp.clients.length > 0);

      newFilteredTargets = allTargets.filter(target => {
        const targetStartDate = new Date(target.start_date);
        const targetEndDate = new Date(target.end_date);
        targetStartDate.setHours(0, 0, 0, 0);
        targetEndDate.setHours(0, 0, 0, 0);
        const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
        const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
        return targetEndDate >= rangeStart && targetStartDate <= rangeEnd;
      });
    }

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      newFilteredClientData = newFilteredClientData.filter(client =>
        client.name.toLowerCase().includes(searchLower)
      );

      newFilteredEmployeeData = newFilteredEmployeeData.map(emp => ({
        ...emp,
        clients: emp.clients.filter(client =>
          client.clientName.toLowerCase().includes(searchLower)
        ),
      })).filter(emp => emp.clients.length > 0);

      newFilteredInvoices = newFilteredInvoices.filter(invoice =>
        invoice.assignedTo.toLowerCase().includes(searchLower) ||
        newFilteredClientData.some(client => client.id === invoice.id && client.name.toLowerCase().includes(searchLower))
      );

      newFilteredTargets = newFilteredTargets.filter(target => {
        const client = allClients.find(c => c.id === target.client);
        return client && client.name.toLowerCase().includes(searchLower);
      });
    }

    const summary = newFilteredClientData.reduce((acc, client) => {
      acc.totalSales += parseFloat(client.totalAmount || 0);
      acc.receivedPayments += client.payment_status === "paid" ? parseFloat(client.totalAmount || 0) : 0;
      acc.outstandingPayments += parseFloat(client.outstanding || 0);
      acc.overduePayments += parseFloat(client.overdue || 0);
      return acc;
    }, { totalSales: 0, receivedPayments: 0, outstandingPayments: 0, overduePayments: 0 });

    setSummaryData(summary);
    setFilteredClientData(newFilteredClientData);
    setFilteredEmployeeData(newFilteredEmployeeData);
    setFilteredInvoices(newFilteredInvoices);
    setIsFiltered(filterStartDate || searchQuery.trim());
  };

  useEffect(() => {
    applyFilters();
  }, [filterPeriod, startDate, endDate, searchQuery, allClients, allTargets]);

  const invoicesToUse = isFiltered ? filteredInvoices : allClients.map(client => ({
    id: client.id,
    date: client.billingDate,
    amount: client.totalAmount,
    status: client.collected >= client.totalAmount ? 'Paid' : 
            client.collected > 0 ? 'Inpayment' : 
            client.overdue > 0 ? 'Overdue' : 'Open',
    dueDate: client.billingDate ? new Date(client.billingDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A',
    paymentReceiveDate: client.collected >= client.totalAmount ? client.billingDate?.toLocaleDateString() : null,
    notifications: client.overdue > 0 ? `Overdue reminder sent` : client.collected > 0 ? `Payment received` : 'Pending',
    remindersSent: client.overdue > 0 ? 1 : 0,
    feedback: client.notes || '',
    assignedTo: client.assignedEmployee,
  }));

  const openInvoicesAmount = invoicesToUse
    .filter((inv) => inv.status === "Open")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const inPaymentInvoicesAmount = invoicesToUse
    .filter((inv) => inv.status === "Inpayment")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoicesAmount = invoicesToUse
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const overdueInvoicesAmount = invoicesToUse
    .filter((inv) => inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalSales = summaryData.totalSales;
  const receivedPayments = summaryData.receivedPayments;
  const outstandingPayments = summaryData.outstandingPayments;
  const overduePayments = summaryData.overduePayments;

  const totalTargetBilling = allTargets.reduce((sum, target) => {
    const targetStartDate = new Date(target.start_date);
    const targetEndDate = new Date(target.end_date);
    const filterStart = startDate ? new Date(startDate) : null;
    const filterEnd = endDate ? new Date(endDate) : null;
    
    if (filterPeriod === 'custom' && (filterStart && filterEnd)) {
      filterStart.setHours(0, 0, 0, 0);
      filterEnd.setHours(0, 0, 0, 0);
      targetStartDate.setHours(0, 0, 0, 0);
      targetEndDate.setHours(0, 0, 0, 0);
      if (targetEndDate >= filterStart && targetStartDate <= filterEnd) {
        return sum + parseFloat(target.target_amount || 0);
      }
      return sum;
    }
    return sum + parseFloat(target.target_amount || 0);
  }, 0);

  const pieChartData = {
    labels: ['Received Payments', 'Outstanding Payments', 'Overdue Payments'],
    datasets: [
      {
        label: 'Payment Details ($)',
        data: [
          receivedPayments,
          outstandingPayments,
          overduePayments,
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
        borderColor: ['#059669', '#2563EB', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  const clientChartData = {
    labels: filteredClientData
      .slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage)
      .map(client => client.name),
    datasets: [
      {
        label: 'Collected ($)',
        data: filteredClientData
          .slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage)
          .map(client => client.collected),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
      },
      {
        label: 'Outstanding ($)',
        data: filteredClientData
          .slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage)
          .map(client => client.outstanding),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
      {
        label: 'Overdue ($)',
        data: filteredClientData
          .slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage)
          .map(client => client.overdue),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
      },
    ],
  };

  const employeeChartData = {
    labels: allSalesPersons.map(emp => emp.name),
    datasets: [
      {
        label: 'Collected ($)',
        data: allSalesPersons.map(emp => emp.total_collected || 0),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
      },
      {
        label: 'Outstanding ($)',
        data: allSalesPersons.map(emp => emp.total_outstanding || 0),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
      {
        label: 'Overdue ($)',
        data: allSalesPersons.map(emp => emp.total_overdue || 0),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
      },
    ],
  };

  const billingComparisonChartData = {
    targetVsActual: {
      labels: ['Target', 'Actual'],
      datasets: [
        {
          label: 'Billing ($)',
          data: [
            totalTargetBilling,
            summaryData.outstandingPayments,
          ],
          backgroundColor: ['#8884d8', '#a05195'],
          borderColor: ['#6b7280', '#6b7280'],
          borderWidth: 1,
        },
      ],
    },
    targetVsRaised: {
      labels: ['Target', 'Raised'],
      datasets: [
        {
          label: 'Billing ($)',
          data: [
            totalTargetBilling,
            filteredClientData.reduce((sum, client) => sum + client.collected, 0),
          ],
          backgroundColor: ['#8884d8', '#a05195'],
          borderColor: ['#6b7280', '#6b7280'],
          borderWidth: 1,
        },
      ],
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Payment Details Overview',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed || context.raw;
            return `${context.label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  const columnChartOptions = (title, xAxisLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: xAxisLabel,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y || context.raw;
            return `${context.dataset.label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    elements: {
      bar: {
        barThickness: 15,
      },
    },
  });

  const billingComparisonChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Category',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y || context.raw;
            return `${context.dataset.label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    elements: {
      bar: {
        barThickness: 15,
      },
    },
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Amount', 'Status', 'Due Date', 'Payment Date', 'Reminders', 'Assigned To'].join(',');
    const rows = invoicesToUse.map(invoice => [
      invoice.id,
      invoice.date?.toLocaleDateString() || 'N/A',
      invoice.amount,
      invoice.status,
      invoice.dueDate,
      invoice.paymentReceiveDate || '',
      invoice.remindersSent,
      invoice.assignedTo,
    ].join(',')).join('\n');
    const csvData = `${headers}\n${rows}`;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `invoices.csv`);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(invoicesToUse.map(invoice => ({
      ID: invoice.id,
      Date: invoice.date?.toLocaleDateString() || 'N/A',
      Amount: invoice.amount,
      Status: invoice.status,
      'Due Date': invoice.dueDate,
      'Payment Date': invoice.paymentReceiveDate || '',
      Reminders: invoice.remindersSent,
      'Assigned To': invoice.assignedTo,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `invoices.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    const peachFuzzRGB = [255, 218, 185];

    doc.setFillColor(...peachFuzzRGB);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(50, 50, 50);
    doc.text(`Invoice Report`, 10, 12);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 230, 12);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 10, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    autoTable(doc, {
      startY: 35,
      head: [['Metric', 'Amount']],
      body: [
        ['Total Sales', formatCurrency(totalSales)],
        ['Received Payments', formatCurrency(receivedPayments)],
        ['Outstanding Payments', formatCurrency(outstandingPayments)],
        ['Overdue Payments', formatCurrency(overduePayments)],
        ['Target Billing', formatCurrency(totalTargetBilling)],
        ['Actual Billing', formatCurrency(filteredClientData.reduce((sum, client) => sum + client.totalAmount, 0))],
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: peachFuzzRGB, textColor: [50, 50, 50] },
      margin: { left: 10, right: 10 },
    });

    doc.setFont('helvetica', 'bold');
    doc.text('Invoices', 10, doc.lastAutoTable.finalY + 10);
    doc.setFont('helvetica', 'normal');

    const tableBody = invoicesToUse.map(invoice => [
      invoice.id,
      invoice.date?.toLocaleDateString() || 'N/A',
      formatCurrency(invoice.amount),
      invoice.status,
      invoice.dueDate,
      invoice.paymentReceiveDate || '',
      invoice.remindersSent,
      invoice.assignedTo,
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['ID', 'Date', 'Amount', 'Status', 'Due Date', 'Payment Date', 'Reminders', 'Assigned To']],
      body: tableBody,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: peachFuzzRGB,
        textColor: [50, 50, 50],
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
        7: { cellWidth: 30 },
      },
      margin: { left: 10, right: 10 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, 280, 200);
    }

    doc.save(`Invoice_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const getProgressColor = (actual, target) => {
    const percentage = (actual / target) * 100;
    if (percentage < 50) return "bg-red-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'Inpayment':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(filteredClientData.length / clientsPerPage);
  const paginatedClientData = filteredClientData.slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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
                axios.get(`${apiBaseUrl}/saleinv/sales-invoices/`),
                axios.get(`${apiBaseUrl}/targets/`),
                axios.get(`${apiBaseUrl}/saleinv/sales-persons/totals/`)
              ])
                .then(([invoicesResponse, targetsResponse, salesPersonsResponse]) => {
                  const invoices = invoicesResponse.data.map(invoice => ({
                    id: invoice.id,
                    name: invoice.party_name,
                    totalAmount: invoice.total_amount?.total || 0,
                    collected: invoice.payment_status === "paid" ? invoice.total_amount?.total : 0,
                    outstanding: invoice.outstanding_amount || 0,
                    overdue: invoice.overdue_amount || 0,
                    targetBilling: invoice.target_billing || 0,
                    assignedEmployee: invoice.sales_person?.name || 'N/A',
                    billingDate: invoice.invoice_date ? new Date(invoice.invoice_date) : null,
                    contactEmail: invoice.party_email || invoice.party?.email || 'N/A',
                    contactPhone: invoice.party_mobile_number || invoice.party?.mobile_number || 'N/A',
                    address: invoice.shipping_address || (invoice.party?.shipping_address 
                      ? `${invoice.party.shipping_address.street}, ${invoice.party.shipping_address.city}, ${invoice.party.shipping_address.state}, ${invoice.party.shipping_address.pincode}`
                      : 'No Shipping Address'),
                    notes: invoice.notes || '',
                    payment_status: invoice.payment_status || 'unpaid',
                  })).sort((a, b) => new Date(b.billingDate) - new Date(a.billingDate));
                  setAllClients(invoices);
                  const validTargets = targetsResponse.data.filter(target => target.client !== null).map(target => ({
                    id: target.id,
                    client: target.client,
                    target_amount: target.target_amount,
                    start_date: target.start_date ? new Date(target.start_date) : null,
                    end_date: target.end_date ? new Date(target.end_date) : null,
                  }));
                  setAllTargets(validTargets);
                  setAllSalesPersons(salesPersonsResponse.data.data);
                  setFetchError(null);
                })
                .catch(error => {
                  let errorMessage = 'Unable to load data. Please try again later.';
                  if (error.response) {
                    errorMessage = `Server error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`;
                  } else if (error.request) {
                    errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
                  }
                  setFetchError(errorMessage);
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
            className="ml-4 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div className="w-64">
          <input
            type="text"
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search by client name"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedChart('pie')}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
              selectedChart === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label="Show Pie Chart"
          >
            Pie Chart
          </button>
          <button
            onClick={() => setSelectedChart('column')}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
              selectedChart === 'column' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label="Show Column Chart"
          >
            Column Chart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {[
          { 
            title: "Total Sales", 
            value: totalSales, 
            color: "orange", 
          },
          { 
            title: "Received Payments", 
            value: receivedPayments, 
            color: "green", 
            totalPaid: paidInvoicesAmount 
          },
          { 
            title: "Outstanding Payments", 
            value: outstandingPayments, 
            color: "blue", 
          },
          { 
            title: "Overdue Payments", 
            value: overduePayments, 
            color: "red", 
          },
        ].map(card => (
          <div key={card.title} className={`bg-white p-5 rounded-xl border-l-4 border-${card.color}-500 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
            <div className="text-sm font-medium text-gray-500 mb-1">{card.title}</div>
            <div className={`text-3xl font-bold text-${card.color === 'orange' ? 'gray-800' : card.color + '-600'} mb-2`}>{formatCurrency(card.value)}</div>
            
          </div>
        ))}
      </div>

      {selectedChart && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
          <div className="w-full" style={{ height: '400px' }}>
            {selectedChart === 'pie' && filteredClientData.length > 0 && (
              <Pie data={pieChartData} options={pieChartOptions} />
            )}
            {selectedChart === 'column' && (
              <div className="h-full">
                <div className="flex justify-start mb-4">
                  <button
                    onClick={() => setColumnChartType('client')}
                    className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors mr-2 ${
                      columnChartType === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    aria-label="Show Client-wise Payment Details"
                  >
                    Client-wise
                  </button>
                  <button
                    onClick={() => setColumnChartType('employee')}
                    className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
                      columnChartType === 'employee' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    aria-label="Show Employee-wise Payment Details"
                  >
                    Employee-wise
                  </button>
                </div>
                {columnChartType === 'client' && filteredClientData.length === 0 && (
                  <div className="text-center text-gray-500">No client data available</div>
                )}
                {columnChartType === 'employee' && allSalesPersons.length === 0 && (
                  <div className="text-center text-gray-500">No salesperson data available</div>
                )}
                {(columnChartType === 'client' ? filteredClientData.length > 0 : allSalesPersons.length > 0) && (
                  <Bar 
                    data={columnChartType === 'client' ? clientChartData : employeeChartData} 
                    options={columnChartOptions(
                      columnChartType === 'client' ? 'Client-wise Payment Details' : 'Employee-wise Payment Details',
                      columnChartType === 'client' ? 'Client' : 'Employee'
                    )}
                  />
                )}
                {columnChartType === 'client' && totalPages > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Billing Comparison</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
          <div className="h-full">
            <Bar
              data={billingComparisonChartData.targetVsActual}
              options={billingComparisonChartOptions('Target vs Actual Billing')}
            />
          </div>
          <div className="h-full">
            <Bar
              data={billingComparisonChartData.targetVsRaised}
              options={billingComparisonChartOptions('Target vs Raised Billing')}
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Target Billing: {formatCurrency(totalTargetBilling)}</p>
          <p>Raised Billing: {formatCurrency(filteredClientData.reduce((sum, client) => sum + client.collected, 0))}</p>
          <p className="font-semibold">
            Difference: {formatCurrency(totalTargetBilling - filteredClientData.reduce((sum, client) => sum + client.collected, 0))}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className={`h-4 rounded-full ${getProgressColor(
                filteredClientData.reduce((sum, client) => sum + client.collected, 0),
                totalTargetBilling
              )}`}
              style={{
                width: `${Math.min(100, (
                  filteredClientData.reduce((sum, client) => sum + client.collected, 0) /
                  totalTargetBilling
                ) * 100)}%`,
              }}
            ></div>
          </div>
          <p className="mt-2">
            {formatCurrency(filteredClientData.reduce((sum, client) => sum + client.collected, 0))} of {formatCurrency(totalTargetBilling)} billed
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Invoices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoicesToUse.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.date?.toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.paymentReceiveDate || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.remindersSent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.assignedTo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountReports;