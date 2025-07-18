// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import { Search, X, Calendar as CalendarIcon, Eye, Edit3, Trash2, AlertTriangle, Target } from 'lucide-react';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { Link } from 'react-router-dom';
// import { ARManagementContext } from './AccountManagementLayout';

// // Initial employee data
// const initialEmployeeData = [
//   {
//     id: 'emp-1',
//     name: 'John Doe',
//     clients: [
//       { clientId: 'client-1', clientName: 'Acme Inc', totalAmount: 25000, collected: 15000, outstanding: 8000, overdue: 2000, billingDate: new Date('2025-05-01') },
//       { clientId: 'client-2', clientName: 'Global Corp', totalAmount: 32000, collected: 20000, outstanding: 7000, overdue: 5000, billingDate: new Date('2025-05-04') },
//     ],
//     targetCollection: 50000,
//     contactEmail: 'john.doe@company.com',
//     contactPhone: '555-0201',
//     notes: 'Highly effective in collections.',
//     addedDate: new Date('2025-01-15'),
//   },
//   {
//     id: 'emp-2',
//     name: 'Jane Smith',
//     clients: [
//       { clientId: 'client-3', clientName: 'Tech Ltd', totalAmount: 15000, collected: 10000, outstanding: 3000, overdue: 2000, billingDate: new Date('2025-06-01') },
//     ],
//     targetCollection: 20000,
//     contactEmail: 'jane.smith@company.com',
//     contactPhone: '555-0202',
//     notes: 'New employee, needs training.',
//     addedDate: new Date('2025-02-10'),
//   },
//   {
//     id: 'emp-3',
//     name: 'Alice Johnson',
//     clients: [
//       { clientId: 'client-4', clientName: 'Beta Group', totalAmount: 40000, collected: 30000, outstanding: 5000, overdue: 5000, billingDate: new Date('2025-04-20') },
//     ],
//     targetCollection: 45000,
//     contactEmail: 'alice.johnson@company.com',
//     contactPhone: '555-0203',
//     notes: 'Consistent performer.',
//     addedDate: new Date('2025-03-01'),
//   },
// ];

// // Helper functions
// const getCollectedPercentage = (collected, totalAmount) => {
//   if (totalAmount === 0 || !totalAmount) return '0%';
//   return `${((collected / totalAmount) * 100).toFixed(0)}%`;
// };

// const getTargetAchievement = (collected, target) => {
//   if (target === 0 || !target) return '0%';
//   return `${((collected / target) * 100).toFixed(0)}%`;
// };

// const formatDate = (date) => {
//   if (!date) return 'N/A';
//   return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
// };

// // Shared styling
// const commonModalInputClass = (hasError) => `block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`;
// const commonModalLabelClass = "block text-sm font-medium text-gray-700 mb-1";
// const commonModalErrorClass = "text-xs text-red-500 mt-1";

// // Shared Form Fields for Add/Edit Modals
// const EmployeeFormFields = ({ employeeData, handleChange, errors, handleDateChange }) => (
//   <>
//     <div>
//       <label htmlFor="name" className={commonModalLabelClass}>Employee Name</label>
//       <input type="text" name="name" id="name" value={employeeData.name} onChange={handleChange} className={commonModalInputClass(errors.name)} />
//       {errors.name && <p className={commonModalErrorClass}>{errors.name}</p>}
//     </div>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label htmlFor="targetCollection" className={commonModalLabelClass}>Target Collection ($)</label>
//         <input type="number" name="targetCollection" id="targetCollection" value={employeeData.targetCollection} onChange={handleChange} min="0" step="0.01" className={commonModalInputClass(errors.targetCollection)} />
//         {errors.targetCollection && <p className={commonModalErrorClass}>{errors.targetCollection}</p>}
//       </div>
//       <div>
//         <label htmlFor="contactEmail" className={commonModalLabelClass}>Contact Email</label>
//         <input type="email" name="contactEmail" id="contactEmail" value={employeeData.contactEmail} onChange={handleChange} className={commonModalInputClass(errors.contactEmail)} />
//         {errors.contactEmail && <p className={commonModalErrorClass}>{errors.contactEmail}</p>}
//       </div>
//     </div>
//     <div>
//       <label htmlFor="addedDate" className={commonModalLabelClass}>Added Date</label>
//       <div className="relative">
//         <DatePicker
//           selected={employeeData.addedDate}
//           onChange={handleDateChange}
//           dateFormat="MMMM d, yyyy"
//           placeholderText="Select added date"
//           className={commonModalInputClass(errors.addedDate) + ' pl-10'}
//           wrapperClassName="w-full"
//           popperPlacement="bottom-start"
//           maxDate={new Date()}
//         />
//         <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//       </div>
//       {errors.addedDate && <p className={commonModalErrorClass}>{errors.addedDate}</p>}
//     </div>
//     <div>
//       <label htmlFor="contactPhone" className={commonModalLabelClass}>Contact Phone</label>
//       <input type="tel" name="contactPhone" id="contactPhone" value={employeeData.contactPhone} onChange={handleChange} className={commonModalInputClass(false)} />
//     </div>
//     <div>
//       <label htmlFor="notes" className={commonModalLabelClass}>Notes</label>
//       <textarea name="notes" id="notes" value={employeeData.notes} onChange={handleChange} rows="3" className={commonModalInputClass(false) + " resize-none"}></textarea>
//     </div>
//   </>
// );

// // Form Validation Logic
// const validateEmployeeForm = (employeeData) => {
//   const newErrors = {};
//   if (!employeeData.name?.trim()) newErrors.name = 'Employee name is required.';
  
//   const validateNumericField = (field, fieldName) => {
//     const value = employeeData[field];
//     if (value === null || value === undefined || value === '') newErrors[field] = `${fieldName} is required.`;
//     else if (isNaN(parseFloat(value))) newErrors[field] = `Invalid ${fieldName.toLowerCase()} format.`;
//     else if (parseFloat(value) < 0) newErrors[field] = `${fieldName} cannot be negative.`;
//     else if (parseFloat(value) > 9999999999) newErrors[field] = `${fieldName} is too large.`;
//   };

//   validateNumericField('targetCollection', 'Target Collection');
//   if (employeeData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.contactEmail)) {
//     newErrors.contactEmail = 'Invalid email format.';
//   }
//   if (!employeeData.addedDate) newErrors.addedDate = 'Added date is required.';
//   else if (employeeData.addedDate > new Date()) newErrors.addedDate = 'Added date cannot be in the future.';
//   return newErrors;
// };

// // Add Employee Modal
// function AddEmployeeModal({ isOpen, onClose, onAddEmployee }) {
//   const initialNewEmployeeState = {
//     name: '',
//     targetCollection: '',
//     contactEmail: '',
//     contactPhone: '',
//     notes: '',
//     addedDate: null,
//   };
//   const [newEmployee, setNewEmployee] = useState(initialNewEmployeeState);
//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewEmployee((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
//   };

//   const handleDateChange = (date) => {
//     setNewEmployee((prev) => ({ ...prev, addedDate: date }));
//     if (errors.addedDate) setErrors((prev) => ({ ...prev, addedDate: null }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const formErrors = validateEmployeeForm(newEmployee);
//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       return;
//     }
//     const employeeToAdd = {
//       ...newEmployee,
//       id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//       targetCollection: parseFloat(newEmployee.targetCollection),
//       clients: [],
//       addedDate: newEmployee.addedDate,
//     };
//     onAddEmployee(employeeToAdd);
//     handleClose();
//   };

//   const handleClose = () => {
//     setNewEmployee(initialNewEmployeeState);
//     setErrors({});
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
//         <div className="flex justify-between items-center mb-6 border-b pb-3">
//           <h2 className="text-xl font-semibold text-gray-800">Add New Employee</h2>
//           <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <EmployeeFormFields
//             employeeData={newEmployee}
//             handleChange={handleChange}
//             handleDateChange={handleDateChange}
//             errors={errors}
//           />
//           <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
//             <button
//               type="button"
//               onClick={handleClose}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//             >
//               Add Employee
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // Edit Employee Modal
// function EditEmployeeModal({ isOpen, onClose, employeeToEdit, onUpdateEmployee }) {
//   const [editedEmployee, setEditedEmployee] = useState(null);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (employeeToEdit) {
//       setEditedEmployee({
//         ...employeeToEdit,
//         targetCollection: employeeToEdit.targetCollection?.toString() ?? '',
//         addedDate: employeeToEdit.addedDate ? new Date(employeeToEdit.addedDate) : null,
//       });
//     } else {
//       setEditedEmployee(null);
//     }
//     setErrors({});
//   }, [employeeToEdit]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setEditedEmployee((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
//   };

//   const handleDateChange = (date) => {
//     setEditedEmployee((prev) => ({ ...prev, addedDate: date }));
//     if (errors.addedDate) setErrors((prev) => ({ ...prev, addedDate: null }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!editedEmployee) return;
//     const formErrors = validateEmployeeForm(editedEmployee);
//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       return;
//     }
//     const updatedEmployeeData = {
//       ...editedEmployee,
//       targetCollection: parseFloat(editedEmployee.targetCollection),
//       addedDate: editedEmployee.addedDate,
//     };
//     onUpdateEmployee(updatedEmployeeData);
//     handleClose();
//   };

//   const handleClose = () => {
//     setErrors({});
//     onClose();
//   };

//   if (!isOpen || !editedEmployee) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
//         <div className="flex justify-between items-center mb-6 border-b pb-3">
//           <h2 className="text-xl font-semibold text-gray-800">Edit Employee: {employeeToEdit.name}</h2>
//           <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <EmployeeFormFields
//             employeeData={editedEmployee}
//             handleChange={handleChange}
//             handleDateChange={handleDateChange}
//             errors={errors}
//           />
//           <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
//             <button
//               type="button"
//               onClick={handleClose}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
//             >
//               Save Changes
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // View Employee Modal
// function ViewEmployeeModal({ isOpen, onClose, employee }) {
//   if (!isOpen || !employee) return null;
//   const detailItemClass = "py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0";
//   const labelClass = "text-sm font-medium text-gray-600";
//   const valueClass = "mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2";

//   const { totalAmount, collected, outstanding, overdue } = employee.clients.reduce(
//     (acc, client) => {
//       acc.totalAmount += client.totalAmount || 0;
//       acc.collected += client.collected || 0;
//       acc.outstanding += client.outstanding || 0;
//       acc.overdue += client.overdue || 0;
//       return acc;
//     },
//     { totalAmount: 0, collected: 0, outstanding: 0, overdue: 0 }
//   );

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
//         <div className="flex justify-between items-center mb-6 border-b pb-3">
//           <h2 className="text-xl font-semibold text-gray-800">Employee Details: {employee.name}</h2>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
//             <X size={24} />
//           </button>
//         </div>
//         <dl className="divide-y divide-gray-200">
//           {[
//             { label: "Employee Name", value: employee.name },
//             { label: "Added Date", value: formatDate(employee.addedDate) },
//             { label: "Total Amount", value: `$${totalAmount.toLocaleString()}`, className: "text-orange-600 font-medium" },
//             { label: "Collected Amount", value: `$${collected.toLocaleString()}`, className: "text-green-600 font-medium" },
//             { label: "Outstanding Amount", value: `$${outstanding.toLocaleString()}`, className: "text-blue-600 font-medium" },
//             { label: "Overdue Amount", value: `$${overdue.toLocaleString()}`, className: "text-red-600 font-medium" },
//             { label: "Target Collection", value: `$${employee.targetCollection.toLocaleString()}` },
//             { label: "Achievement", value: getTargetAchievement(collected, employee.targetCollection) },
//             { label: "Contact Email", value: employee.contactEmail || 'N/A' },
//             { label: "Contact Phone", value: employee.contactPhone || 'N/A' },
//             { label: "Assigned Clients", value: employee.clients.map(c => c.clientName).join(', ') || 'None' },
//             { label: "Notes", value: employee.notes || 'N/A', className: "whitespace-pre-wrap" },
//           ].map(item => (
//             <div className={detailItemClass} key={item.label}>
//               <dt className={labelClass}>{item.label}</dt>
//               <dd className={`${valueClass} ${item.className || ''}`}>{item.value}</dd>
//             </div>
//           ))}
//         </dl>
//         <div className="mt-6 pt-4 border-t flex justify-end">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Confirm Delete Modal
// function ConfirmDeleteModal({ isOpen, onClose, onConfirm, employeeName }) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-[60] flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out">
//         <div className="flex items-start">
//           <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//             <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
//           </div>
//           <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//             <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Employee</h3>
//             <div className="mt-2">
//               <p className="text-sm text-gray-500">
//                 Are you sure you want to delete the employee "<strong>{employeeName}</strong>"? This action cannot be undone.
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
//           <button
//             type="button"
//             className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
//             onClick={onConfirm}
//           >
//             Delete
//           </button>
//           <button
//             type="button"
//             className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function EmployeeDashboard() {
//   const { filterPeriod, dateRange, targets, clients, employees, addTarget } = useContext(ARManagementContext);
//   const [startDate, endDate] = dateRange;

//   const [allEmployees, setAllEmployees] = useState(() => 
//     initialEmployeeData.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
//   );
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredData, setFilteredData] = useState([]);
//   const [filteredTargets, setFilteredTargets] = useState([]);
//   const [summaryData, setSummaryData] = useState({ totalAmount: 0, collectedAmount: 0, outstandingDues: 0, overduePayments: 0 });

//   // Modal States
//   const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
//   const [isViewEmployeeModalOpen, setIsViewEmployeeModalOpen] = useState(false);
//   const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

//   // Data for Modals
//   const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
//   const [employeeToEdit, setEmployeeToEdit] = useState(null);
//   const [employeeToDelete, setEmployeeToDelete] = useState(null);

//   const calculateSummary = useCallback((data) => {
//     return data.reduce((acc, employee) => {
//       employee.clients.forEach(client => {
//         acc.totalAmount += client.totalAmount || 0;
//         acc.collectedAmount += client.collected || 0;
//         acc.outstandingDues += client.outstanding || 0;
//         acc.overduePayments += client.overdue || 0;
//       });
//       return acc;
//     }, { totalAmount: 0, collectedAmount: 0, outstandingDues: 0, overduePayments: 0 });
//   }, []);

//   const applyFilters = useCallback(() => {
//     let newFilteredData = [...allEmployees];
//     let newFilteredTargets = [...targets];
//     let filterStartDate = null;
//     let filterEndDate = null;

//     const today = new Date(2025, 4, 13); // May 13, 2025
//     today.setHours(0, 0, 0, 0);

//     switch (filterPeriod) {
//       case 'daily':
//         filterStartDate = new Date(today);
//         filterEndDate = new Date(today);
//         break;
//       case 'weekly':
//         filterStartDate = new Date(today);
//         filterStartDate.setDate(today.getDate() - today.getDay());
//         filterEndDate = new Date(filterStartDate);
//         filterEndDate.setDate(filterStartDate.getDate() + 6);
//         break;
//       case 'monthly':
//         filterStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
//         filterEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//         break;
//       case 'quarterly':
//         const quarter = Math.floor(today.getMonth() / 3);
//         filterStartDate = new Date(today.getFullYear(), quarter * 3, 1);
//         filterEndDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
//         break;
//       case 'half-yearly':
//         const half = today.getMonth() < 6 ? 0 : 6;
//         filterStartDate = new Date(today.getFullYear(), half, 1);
//         filterEndDate = new Date(today.getFullYear(), half + 6, 0);
//         break;
//       case 'yearly':
//         filterStartDate = new Date(today.getFullYear(), 0, 1);
//         filterEndDate = new Date(today.getFullYear(), 11, 31);
//         break;
//       case 'custom':
//         filterStartDate = startDate;
//         filterEndDate = endDate;
//         break;
//       default:
//         break;
//     }

//     if (filterStartDate && filterEndDate) {
//       newFilteredData = newFilteredData.filter((employee) => {
//         const employeeDate = new Date(employee.addedDate);
//         const employeeDayStart = new Date(employeeDate.getFullYear(), employeeDate.getMonth(), employeeDate.getDate());
//         const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
//         const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
//         return employeeDayStart >= rangeStart && employeeDayStart <= rangeEnd;
//       });
//       newFilteredTargets = newFilteredTargets.filter((target) => {
//         const targetStartDate = new Date(target.startDate);
//         const targetEndDate = new Date(target.endDate);
//         const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
//         const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
//         return (
//           (targetStartDate >= rangeStart && targetStartDate <= rangeEnd) ||
//           (targetEndDate >= rangeStart && targetEndDate <= rangeEnd) ||
//           (targetStartDate <= rangeStart && targetEndDate >= rangeEnd)
//         );
//       });
//     }

//     if (searchQuery) {
//       const lowerSearchQuery = searchQuery.toLowerCase();
//       newFilteredData = newFilteredData.filter((employee) =>
//         employee.name.toLowerCase().includes(lowerSearchQuery) ||
//         employee.clients.some((client) => client.clientName.toLowerCase().includes(lowerSearchQuery))
//       );
//       newFilteredTargets = newFilteredTargets.filter((target) => {
//         const employee = allEmployees.find((e) => e.id === target.employeeId);
//         return (
//           employee?.name.toLowerCase().includes(lowerSearchQuery) ||
//           employee?.clients.some((client) => client.clientName.toLowerCase().includes(lowerSearchQuery))
//         );
//       });
//     }

//     setFilteredData(newFilteredData);
//     setFilteredTargets(newFilteredTargets);
//     setSummaryData(calculateSummary(newFilteredData));
//   }, [allEmployees, targets, filterPeriod, startDate, endDate, searchQuery, calculateSummary]);

//   useEffect(() => {
//     applyFilters();
//   }, [applyFilters]);

//   const handleSearchChange = (e) => setSearchQuery(e.target.value);

//   // Add Employee Handlers
//   const handleOpenAddEmployeeModal = () => setIsAddEmployeeModalOpen(true);
//   const handleCloseAddEmployeeModal = () => setIsAddEmployeeModalOpen(false);
//   const handleAddEmployee = (newEmployee) => {
//     setAllEmployees((prev) => [...prev, newEmployee].sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate)));
//   };

//   // View Employee Handlers
//   const handleOpenViewEmployeeModal = (employee) => {
//     setSelectedEmployeeForView(employee);
//     setIsViewEmployeeModalOpen(true);
//   };
//   const handleCloseViewEmployeeModal = () => {
//     setIsViewEmployeeModalOpen(false);
//     setSelectedEmployeeForView(null);
//   };

//   // Edit Employee Handlers
//   const handleOpenEditEmployeeModal = (employee) => {
//     setEmployeeToEdit(employee);
//     setIsEditEmployeeModalOpen(true);
//   };
//   const handleCloseEditEmployeeModal = () => {
//     setIsEditEmployeeModalOpen(false);
//     setEmployeeToEdit(null);
//   };
//   const handleUpdateEmployee = (updatedEmployee) => {
//     setAllEmployees((prev) => 
//       prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e)
//           .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
//     );
//   };

//   // Delete Employee Handlers
//   const handleOpenDeleteModal = (employee) => {
//     setEmployeeToDelete(employee);
//     setIsDeleteModalOpen(true);
//   };
//   const handleCloseDeleteModal = () => {
//     setIsDeleteModalOpen(false);
//     setEmployeeToDelete(null);
//   };
//   const handleConfirmDelete = () => {
//     if (employeeToDelete) {
//       setAllEmployees((prev) => prev.filter(e => e.id !== employeeToDelete.id));
//       handleCloseDeleteModal();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 font-sans">
//       <div className="flex-1">
//         <main className="p-4 sm:p-6 max-w-full mx-auto">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
//             {[
//               {
//                 title: "Total Amount",
//                 value: summaryData.totalAmount,
//                 color: "orange",
//                 details: [
//                   { label: "Open:", value: (summaryData.totalAmount - summaryData.collectedAmount) },
//                   { label: "In Escrow:", value: 0 },
//                   { label: "Paid:", value: summaryData.collectedAmount, colorClass: "text-green-600" }
//                 ]
//               },
//               {
//                 title: "Collected Amount",
//                 value: summaryData.collectedAmount,
//                 color: "green",
//                 percentageOfTotal: summaryData.totalAmount > 0 ? (summaryData.collectedAmount / summaryData.totalAmount * 100) : 0
//               },
//               {
//                 title: "Outstanding Dues",
//                 value: summaryData.outstandingDues,
//                 color: "blue",
//                 note: "Next collection target: End of Month"
//               },
//               {
//                 title: "Overdue Payments",
//                 value: summaryData.overduePayments,
//                 color: "red",
//                 percentageOfTotal: summaryData.totalAmount > 0 && summaryData.overduePayments > 0 ? (summaryData.overduePayments / summaryData.totalAmount * 100) : 0
//               },
//             ].map(card => (
//               <div key={card.title} className={`bg-white p-5 rounded-xl border-l-4 border-${card.color}-500 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
//                 <div className="text-sm font-medium text-gray-500 mb-1">{card.title}</div>
//                 <div className={`text-3xl font-bold text-${card.color === 'orange' ? 'gray-800' : card.color + '-600'} mb-2`}>${card.value.toLocaleString()}</div>
//                 <div className="text-xs text-gray-400 italic">Filtered date range view</div>
//                 {card.details && (
//                   <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
//                     {card.details.map(detail => (
//                       <div key={detail.label}>
//                         <div className="text-gray-500">{detail.label}</div>
//                         <div className={`font-semibold ${detail.colorClass || 'text-gray-700'}`}>${detail.value.toLocaleString()}</div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 {card.percentageOfTotal !== undefined && (
//                   <div className="mt-4 text-sm text-gray-600">
//                     <span className="font-semibold">{card.percentageOfTotal.toFixed(1)}%</span>
//                     <span className="text-xs"> of total amount</span>
//                   </div>
//                 )}
//                 {card.note && <div className="mt-4 text-xs text-gray-600">{card.note}</div>}
//               </div>
//             ))}
//           </div>

//           <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-6">
//             <div className="p-4 border-b border-gray-200 bg-gray-50">
//               <div className="relative max-w-sm w-full">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={handleSearchChange}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
//                   placeholder="Search employee or client..."
//                 />
//               </div>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     {["Employee Name", "Total Amount", "Collected", "Outstanding", "Overdue", "Target Collection", "Clients", "Actions"].map(header => (
//                       <th
//                         key={header}
//                         className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
//                           header === "Total Amount" ? "text-orange-600" :
//                           header === "Collected" ? "text-green-600" :
//                           header === "Outstanding" ? "text-blue-600" :
//                           header === "Overdue" ? "text-red-600" : ""
//                         }`}
//                       >
//                         {header}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredData.length > 0 ? (
//                     filteredData.map((employee) => {
//                       const { totalAmount, collected, outstanding, overdue } = employee.clients.reduce(
//                         (acc, client) => {
//                           acc.totalAmount += client.totalAmount || 0;
//                           acc.collected += client.collected || 0;
//                           acc.outstanding += client.outstanding || 0;
//                           acc.overdue += client.overdue || 0;
//                           return acc;
//                         },
//                         { totalAmount: 0, collected: 0, outstanding: 0, overdue: 0 }
//                       );
//                       return (
//                         <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{employee.name}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${totalAmount.toLocaleString()}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">${collected.toLocaleString()}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">${outstanding.toLocaleString()}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">${overdue.toLocaleString()}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                             <div>${employee.targetCollection.toLocaleString()}</div>
//                             <div className="text-xs text-gray-400 mt-1">Achieved: {getTargetAchievement(collected, employee.targetCollection)}</div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                             <Link
//                               to={`/clients?employee=${employee.id}`}
//                               className="text-blue-600 hover:text-blue-800 hover:underline"
//                               title="View assigned clients"
//                             >
//                               {employee.clients.length} Client{employee.clients.length !== 1 ? 's' : ''}
//                             </Link>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1 flex items-center">
//                             <button
//                               onClick={() => handleOpenViewEmployeeModal(employee)}
//                               className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-100 rounded-md"
//                               title="View Employee Details"
//                             >
//                               <Eye size={18} />
//                             </button>
//                             <button
//                               onClick={() => handleOpenEditEmployeeModal(employee)}
//                               className="text-yellow-600 hover:text-yellow-800 transition-colors p-1 hover:bg-yellow-100 rounded-md"
//                               title="Edit Employee"
//                             >
//                               <Edit3 size={18} />
//                             </button>
//                             <button
//                               onClick={() => handleOpenDeleteModal(employee)}
//                               className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-100 rounded-md"
//                               title="Delete Employee"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan="8" className="px-6 py-16 text-center text-sm text-gray-500">
//                         <div className="flex flex-col items-center">
//                           <Search size={40} className="text-gray-400 mb-3" />
//                           <p className="font-semibold">No employees match your current filters.</p>
//                           <p className="text-xs text-gray-400">Try adjusting your search or date range.</p>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
//             <div className="p-4 border-b border-gray-200 bg-gray-50">
//               <h2 className="text-lg font-semibold text-gray-800">Employee Targets</h2>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     {["Employee Name", "Target Amount", "Collected", "Date Range", "Status"].map(header => (
//                       <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredTargets.length > 0 ? (
//                     filteredTargets.map((target) => {
//                       const employee = allEmployees.find((e) => e.id === target.employeeId);
//                       const collected = employee ? employee.clients.reduce((sum, c) => sum + (c.collected || 0), 0) : 0;
//                       const isCompleted = collected >= target.targetAmount;
//                       return (
//                         <tr key={target.id} className="hover:bg-gray-50 transition-colors duration-150">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{employee ? employee.name : 'Unknown'}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${target.targetAmount.toLocaleString()}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">${collected.toLocaleString()}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{`${formatDate(target.startDate)} - ${formatDate(target.endDate)}`}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm">
//                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                               {isCompleted ? 'Completed' : 'Pending'}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan="5" className="px-6 py-16 text-center text-sm text-gray-500">
//                         <div className="flex flex-col items-center">
//                           <Target size={40} className="text-gray-400 mb-3"/>
//                           <p className="font-semibold">No targets set for the current filters.</p>
//                           <p className="text-xs text-gray-400">Try setting a new target or adjusting your filters.</p>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </main>
//       </div>

//       <AddEmployeeModal isOpen={isAddEmployeeModalOpen} onClose={handleCloseAddEmployeeModal} onAddEmployee={handleAddEmployee} />
//       <ViewEmployeeModal isOpen={isViewEmployeeModalOpen} onClose={handleCloseViewEmployeeModal} employee={selectedEmployeeForView} />
//       <EditEmployeeModal isOpen={isEditEmployeeModalOpen} onClose={handleCloseEditEmployeeModal} employeeToEdit={employeeToEdit} onUpdateEmployee={handleUpdateEmployee} />
//       <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} employeeName={employeeToDelete?.name} />
//     </div>
//   );
// }