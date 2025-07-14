import React, { useState, useEffect, useContext } from "react";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ARManagementContext } from './AccountManagementLayout';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const apiBaseUrl = process.env.VITE_BASE_API;

const peachFuzz = "#FFDAB9";
const lightGreen = "#90EE90";
const lightBlue = "#ADD8E6";
const lightRed = "#F08080";

// Helper to calculate raised percentage
const getRaisedPercentage = (collected, totalAmount) => {
  if (totalAmount === 0 || !totalAmount) return '0%';
  return `${((collected / totalAmount) * 100).toFixed(0)}%`;
};

const AccountReports = () => {
  const { filterPeriod, dateRange } = useContext(ARManagementContext);
  const [startDate, endDate] = dateRange;
  const [isFiltered, setIsFiltered] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filteredClientData, setFilteredClientData] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);
  const [noParties, setNoParties] = useState(false);
  const [targets, setTargets] = useState([]);

  // Fetch client data
  useEffect(() => {
    const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

    const fetchPartiesAndInvoices = async () => {
      try {
        if (!userInfo || !userInfo.employee_id) {
          console.warn("employee_id not found");
          setNoParties(true);
          setFilteredClientData([]);
          return;
        }

        // Step 1: Get salesperson ID from party API
        const partyRes = await fetch(`${apiBaseUrl}/pincode/employee-parties/${userInfo.employee_id}`);
        const parties = await partyRes.json();

        if (!parties || parties.length === 0 || !parties[0].sales_person) {
          console.warn("No parties or no salesperson found");
          setNoParties(true);
          setFilteredClientData([]);
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
          setFilteredClientData([]);
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
          assignedEmployee: inv.sales_person ? inv.sales_person.name : "Unassigned",
          billingDate: inv.invoice_date,
          contactEmail: inv.sales_person ? inv.sales_person.email : "",
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

        setFilteredClientData(transformedClients);
        setNoParties(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setNoParties(true);
      }
    };

    fetchPartiesAndInvoices();
  }, []);

  // Fetch client targets
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

  const applyFilters = () => {
    let filterStartDate = null;
    let filterEndDate = null;
    const today = new Date(2025, 4, 15); // May 15, 2025
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
      // Filter invoices
      const newFilteredInvoices = filteredClientData
        .map(client => ({
          id: `INV-${client.id}`,
          date: new Date(client.billingDate),
          amount: client.totalAmount,
          status: client.overdue > 0 ? "Overdue" : client.collected >= client.totalAmount ? "Paid" : client.collected > 0 ? "Inpayment" : "Open",
          dueDate: new Date(client.billingDate).toLocaleDateString(),
          paymentReceiveDate: client.collected > 0 ? new Date(client.billingDate).toLocaleDateString() : null,
          notifications: client.overdue > 0 ? "Overdue reminder sent" : "",
          remindersSent: client.overdue > 0 ? 1 : 0,
          feedback: "",
          assignedTo: client.assignedEmployee,
        }))
        .filter((invoice) => {
          const invoiceDate = new Date(invoice.date);
          invoiceDate.setHours(0, 0, 0, 0);
          const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
          const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
          return invoiceDate >= rangeStart && invoiceDate <= rangeEnd;
        });
      setFilteredInvoices(newFilteredInvoices);
      setIsFiltered(true);

      // Filter client data
      const newFilteredClientData = filteredClientData.filter((client) => {
        const billingDate = new Date(client.billingDate);
        billingDate.setHours(0, 0, 0, 0);
        const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
        const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
        return billingDate >= rangeStart && billingDate <= rangeEnd;
      });
      setFilteredClientData(newFilteredClientData);

      // Filter targets
      const newFilteredTargets = targets.filter((target) => {
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
      setTargets(newFilteredTargets);
    } else {
      setFilteredInvoices(filteredClientData.map(client => ({
        id: `INV-${client.id}`,
        date: new Date(client.billingDate),
        amount: client.totalAmount,
        status: client.overdue > 0 ? "Overdue" : client.collected >= client.totalAmount ? "Paid" : client.collected > 0 ? "Inpayment" : "Open",
        dueDate: new Date(client.billingDate).toLocaleDateString(),
        paymentReceiveDate: client.collected > 0 ? new Date(client.billingDate).toLocaleDateString() : null,
        notifications: client.overdue > 0 ? "Overdue reminder sent" : "",
        remindersSent: client.overdue > 0 ? 1 : 0,
        feedback: "",
        assignedTo: client.assignedEmployee,
      })));
      setIsFiltered(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filterPeriod, startDate, endDate, filteredClientData, targets]);

  const invoicesToUse = isFiltered ? filteredInvoices : filteredClientData.map(client => ({
    id: `INV-${client.id}`,
    date: new Date(client.billingDate),
    amount: client.totalAmount,
    status: client.overdue > 0 ? "Overdue" : client.collected >= client.totalAmount ? "Paid" : client.collected > 0 ? "Inpayment" : "Open",
    dueDate: new Date(client.billingDate).toLocaleDateString(),
    paymentReceiveDate: client.collected > 0 ? new Date(client.billingDate).toLocaleDateString() : null,
    notifications: client.overdue > 0 ? "Overdue reminder sent" : "",
    remindersSent: client.overdue > 0 ? 1 : 0,
    feedback: "",
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

  // Aggregated values for summary cards from filteredClientData
  const totalSales = filteredClientData.reduce((sum, client) => sum + client.totalAmount, 0);
  const receivedPayments = filteredClientData.reduce((sum, client) => sum + client.collected, 0);
  const outstandingPayments = filteredClientData.reduce((sum, client) => sum + client.outstanding, 0);
  const overduePayments = filteredClientData.reduce((sum, client) => sum + client.overdue, 0);

  // Calculate target and actual billing for charts using targetAmount from targets
  const targetBilling = targets.reduce((sum, target) => sum + target.targetAmount, 0);
  const actualBilling = totalSales;

  // Chart Data for Pie Chart
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

  // Client-wise Column Chart Data
  const clientChartData = {
    labels: filteredClientData.map(client => client.name),
    datasets: [
      {
        label: 'Collected ($)',
        data: filteredClientData.map(client => client.collected),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
      },
      {
        label: 'Outstanding ($)',
        data: filteredClientData.map(client => client.outstanding),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
      {
        label: 'Overdue ($)',
        data: filteredClientData.map(client => client.overdue),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
      },
    ],
  };

  // Billing Comparison Chart Data (Target vs Actual and Target vs Raised)
  const billingComparisonChartData = {
    targetVsActual: {
      labels: ['Target', 'Actual'],
      datasets: [
        {
          label: 'Billing ($)',
          data: [targetBilling,outstandingPayments],
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
          data: [targetBilling, totalSales],
          backgroundColor: ['#8884d8', '#a05195'],
          borderColor: ['#6b7280', '#6b7280'],
          borderWidth: 1,
        },
      ],
    },
  };

  // Chart Options
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
        min: 0,
        suggestedMax: Math.max(targetBilling, totalSales || 0) * 1.2 || 100, // Dynamic max to include both bars
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
        barThickness: 40,
      },
    },
  });

  // Report Generation Functions
  const exportToCSV = () => {
    const headers = Object.keys(invoicesToUse[0]).join(',');
    const rows = invoicesToUse.map(invoice => Object.values(invoice).join(',')).join('\n');
    const csvData = `${headers}\n${rows}`;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `invoices.csv`);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(invoicesToUse);
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
        ['Total Sales', `$${totalSales.toLocaleString()}`],
        ['Received Payments', `$${receivedPayments.toLocaleString()}`],
        ['Outstanding Payments', `$${outstandingPayments.toLocaleString()}`],
        ['Overdue Payments', `$${overduePayments.toLocaleString()}`],
        ['Target Billing', `$${targetBilling.toLocaleString()}`],
        ['Actual Billing', `$${actualBilling.toLocaleString()}`],
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: peachFuzzRGB, textColor: [50, 50, 50] },
      margin: { left: 10, right: 10 },
    });

    doc.setFont('helvetica', 'bold');
    doc.text('Invoices', 10, doc.lastAutoTable.finalY + 10);
    doc.setFont('helvetica', 'normal');

    const tableBody = invoicesToUse.map(invoice => {
      const inv = { ...invoice };
      inv.date = inv.date.toLocaleDateString();
      inv.dueDate = inv.dueDate;
      inv.paymentReceiveDate = inv.paymentReceiveDate ? inv.paymentReceiveDate : '';
      inv.amount = `$${inv.amount.toLocaleString()}`;
      return [
        inv.id,
        inv.date,
        inv.amount,
        inv.status,
        inv.dueDate,
        inv.paymentReceiveDate,
        inv.remindersSent,
        inv.assignedTo,
      ];
    });

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Chart Toggle */}
      <div className="mb-6 flex justify-end">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {[
          { title: "Total Sales", value: totalSales, color: "orange" },
          { title: "Received Payments", value: receivedPayments, color: "green" },
          { title: "Outstanding Payments", value: outstandingPayments, color: "blue" },
          { title: "Overdue Payments", value: overduePayments, color: "red" },
        ].map(card => (
          <div
            key={card.title}
            className={`bg-white p-5 rounded-xl border-l-4 border-${card.color}-500 shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="text-sm font-medium text-gray-500 mb-1">{card.title}</div>
            <div className={`text-3xl font-bold text-${card.color === 'orange' ? 'gray-800' : card.color + '-600'} mb-2`}>
              ${card.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Unified Chart Section */}
      {selectedChart && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
          <div className="w-full h-96">
            {selectedChart === 'pie' && (
              <Pie data={pieChartData} options={pieChartOptions} />
            )}
            {selectedChart === 'column' && (
              <div className="h-full">
                <Bar 
                  data={clientChartData} 
                  options={columnChartOptions('Client-wise Payment Details', 'Client')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Billing Comparison (Target vs Actual and Target vs Raised) */}
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
          <p>Target Billing: ${targetBilling.toLocaleString()}</p>
          <p>Raised Billing: ${actualBilling.toLocaleString()}</p>
          <p className="font-semibold">
            Difference: ${(targetBilling - actualBilling).toLocaleString()}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className={`h-4 rounded-full ${getProgressColor(
                actualBilling,
                targetBilling
              )}`}
              style={{
                width: `${Math.min(100, (actualBilling / targetBilling) * 100)}%`,
              }}
            ></div>
          </div>
          <p className="mt-2">
            ${actualBilling.toLocaleString()} of ${targetBilling.toLocaleString()} billed
          </p>
        </div>
      </div>

      {/* Invoices Table */}
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
              {invoicesToUse.length > 0 ? (
                invoicesToUse.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.amount.toLocaleString()}
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
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <p className="font-semibold">No invoices found.</p>
                      <p className="text-xs text-gray-400">Try adjusting your filters or adding new invoices.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountReports;