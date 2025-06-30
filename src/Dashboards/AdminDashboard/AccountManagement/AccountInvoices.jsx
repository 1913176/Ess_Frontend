// import { useState } from 'react';
// import { Search } from 'lucide-react';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// export default function ClientDashboard() {
//   const [activeTab, setActiveTab] = useState('Clients');
//   const [dateRange, setDateRange] = useState([null, null]);
//   const [startDate, endDate] = dateRange;
//   const [isFiltered, setIsFiltered] = useState(false);
//   const [filteredData, setFilteredData] = useState([]);

//   const clientData = [
//     {
//       name: 'Acme Inc',
//       totalAmount: '$25,000',
//       collected: '$15,000',
//       outstanding: '$8,000',
//       overdue: '$2,000',
//       targetBilling: '$30,000',
//       raisedPercentage: '83%',
//       assignedEmployee: 'John Doe',
//       billingDate: new Date('2025-05-01'), // Example date
//     },
//     {
//       name: 'Global Corp',
//       totalAmount: '$32,000',
//       collected: '$20,000',
//       outstanding: '$7,000',
//       overdue: '$5,000',
//       targetBilling: '$35,000',
//       raisedPercentage: '91%',
//       assignedEmployee: 'Jane Smith',
//       billingDate: new Date('2025-05-04'), // Example date
//     },
//     {
//       name: 'Tech Ltd',
//       totalAmount: '$15,000',
//       collected: '$10,000',
//       outstanding: '$3,000',
//       overdue: '$2,000',
//       targetBilling: '$20,000',
//       raisedPercentage: '75%',
//       assignedEmployee: 'Alice Johnson',
//       billingDate: new Date('2025-06-01'), // Example date outside range
//     },
//   ];

//   const handleShowFilter = () => {
//     if (startDate && endDate) {
//       const newFilteredData = clientData.filter((client) => {
//         const clientDate = client.billingDate;
//         return clientDate >= startDate && clientDate <= endDate;
//       });
//       setFilteredData(newFilteredData);
//       setIsFiltered(true);
//     } else {
//       // If no valid range, show all data
//       setFilteredData(clientData);
//       setIsFiltered(false);
//     }
//   };

//   const handleDateRangeChange = (update) => {
//     setDateRange(update);
//     // Reset filter when date range changes before showing
//     if (isFiltered) {
//       setFilteredData([]);
//       setIsFiltered(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Main Content */}
//       <div className="flex-1">
//         {/* Dashboard Content */}
//         <main className="p-6 max-w-7xl mx-auto">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
//             <div className="flex items-center space-x-4">
//               <div className="flex space-x-2">
//                 {/* DatePicker for Range */}
//                 <div className="relative">
//                   <DatePicker
//                     selectsRange={true}
//                     startDate={startDate}
//                     endDate={endDate}
//                     onChange={handleDateRangeChange}
//                     placeholderText={
//                       startDate && endDate
//                         ? `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`
//                         : 'Select date range'
//                     }
//                     className="pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
//                     popperClassName="z-50"
//                     wrapperClassName="w-full"
//                     calendarClassName="text-sm p-2"
//                     showPopperArrow={false}
//                     minDate={new Date(2000, 0, 1)}
//                     maxDate={new Date(2030, 11, 31)}
//                   />
//                 </div>
//                 {/* Show Button */}
//                 <button
//                   onClick={handleShowFilter}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                   disabled={!startDate || !endDate}
//                 >
//                   Show
//                 </button>
//               </div>
//               <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
//                 Add Client
//               </button>
//             </div>
//           </div>

//           {/* Stat Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//             {/* Total Sales */}
//             <div className="bg-white p-6 rounded-lg border-l-4 border-orange-400 shadow-sm">
//               <div className="text-sm text-gray-500 mb-1">Total Sales</div>
//               <div className="text-2xl font-bold text-gray-900 mb-2">$125,000</div>
//               <div className="text-xs text-gray-500">Date range view</div>
//               <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
//                 <div>
//                   <div className="text-gray-500">Open:</div>
//                   <div className="font-medium">$25,000</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">In Payment:</div>
//                   <div className="font-medium">$40,000</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">Paid:</div>
//                   <div className="font-medium">$60,000</div>
//                 </div>
//               </div>
//             </div>

//             {/* Received Payments */}
//             <div className="bg-white p-6 rounded-lg border-l-4 border-green-500 shadow-sm">
//               <div className="text-sm text-gray-500 mb-1">Received Payments</div>
//               <div className="text-2xl font-bold text-green-600 mb-2">$60,000</div>
//               <div className="text-xs text-gray-500">Date range view</div>
//               <div className="mt-4 text-xs text-gray-600">48% of total sales</div>
//             </div>

//             {/* Outstanding Payments */}
//             <div className="bg-white p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
//               <div className="text-sm text-gray-500 mb-1">Outstanding Payments</div>
//               <div className="text-2xl font-bold text-blue-600 mb-2">$40,000</div>
//               <div className="text-xs text-gray-500">Date range view</div>
//               <div className="mt-4 text-xs text-gray-600">Expected payment: Jun 30, 2025</div>
//             </div>

//             {/* Overdue Payments */}
//             <div className="bg-white p-6 rounded-lg border-l-4 border-red-500 shadow-sm">
//               <div className="text-sm text-gray-500 mb-1">Overdue Payments</div>
//               <div className="text-2xl font-bold text-red-600 mb-2">$25,000</div>
//               <div className="text-xs text-gray-500">Date range view</div>
//               <div className="mt-4 text-xs text-gray-600">20% of total sales</div>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="bg-white rounded-lg overflow-hidden border border-gray-200 mb-6">
//             <div className="flex border-b border-gray-200">
//               <button
//                 className={`px-6 py-3 text-sm font-medium ${
//                   activeTab === 'Clients'
//                     ? 'text-blue-600 border-b-2 border-blue-600'
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//                 onClick={() => setActiveTab('Clients')}
//               >
//                 Clients
//               </button>
//               <button
//                 className={`px-6 py-3 text-sm font-medium ${
//                   activeTab === 'Employees'
//                     ? 'text-blue-600 border-b-2 border-blue-600'
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//                 onClick={() => setActiveTab('Employees')}
//               >
//                 Employees
//               </button>
//             </div>

//             {/* Search and Filter */}
//             <div className="p-4 flex justify-between items-center">
//               <input
//                 type="text"
//                 className="px-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Search clients..."
//               />
//               <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors">
//                 Filter
//               </button>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Client Name
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
//                       Total Amount
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">
//                       Collected
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
//                       Outstanding
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
//                       Overdue
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Target Billing
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Assigned Employee
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {(isFiltered ? filteredData : clientData).map((client, index) => (
//                     <tr key={index}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {client.name}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {client.totalAmount}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
//                         {client.collected}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
//                         {client.outstanding}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
//                         {client.overdue}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         <div>{client.targetBilling}</div>
//                         <div className="text-xs text-gray-400">
//                           Raised: $25,000 ({client.raisedPercentage})
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {client.assignedEmployee}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <button className="text-blue-600 hover:text-blue-800">View</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }