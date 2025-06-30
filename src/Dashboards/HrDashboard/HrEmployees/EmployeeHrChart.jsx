// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
// const apiBaseUrl = process.env.VITE_BASE_API;
// const EmployeeChart = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [weekOffset, setWeekOffset] = useState(0);
//   const [monthOffset, setMonthOffset] = useState(0);
//   const [weeklyData, setWeeklyData] = useState(null);
//   const [monthlyData, setMonthlyData] = useState(null);

//   useEffect(() => {
//     axios.get(`${apiBaseUrl}/api/employee_list/`)
//       .then((response) => {
//         setEmployees(response.data);
//       })
//       .catch((error) => console.error("Error fetching employees:", error));
//   }, []);

//   const fetchWeeklyChart = (offset) => {
//     if (!selectedEmployee) return;
//     axios.post(`${apiBaseUrl}/api/admin-weekly-chart/`, {
//       employee_id: selectedEmployee,
//       week_offset: offset,
//     })
//       .then((response) => {
//         setWeeklyData(response.data);
//       })
//       .catch((error) => console.error("Error fetching weekly data:", error));
//   };

//   const fetchMonthlyChart = (offset) => {
//     if (!selectedEmployee) return;
//     axios.post(`${apiBaseUrl}/api/admin-monthly-chart/`, {
//       employee_id: selectedEmployee,
//       month_offset: offset,
//     })
//       .then((response) => {
//         setMonthlyData(response.data);
//       })
//       .catch((error) => console.error("Error fetching monthly data:", error));
//   };

//   const handleEmployeeChange = (e) => {
//     setSelectedEmployee(e.target.value);
//     setWeekOffset(0);
//     setMonthOffset(0);
//     fetchWeeklyChart(0);
//     fetchMonthlyChart(0);
//   };

//   return (
//     <div className="managerChart p-4 h-full flex flex-col w-full gap-4">
//       {/* Employee Selection */}
//       <div className="flex w-full justify-between items-center">
//         <h3 className="text-h3">Employee Attendance Chart</h3>
//         <select className="p-2" onChange={handleEmployeeChange} value={selectedEmployee}>
//           <option value="">Select Employee</option>
//           {employees.map((emp) => (
//             <option key={emp.employee_id} value={emp.employee_id}>
//               {emp.employee_name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Weekly Chart */}
//       <div className="weekly min-h-1/2 w-full flex flex-col gap-4">
//         <div className="flex w-full justify-between items-center">
//           <h3 className="text-h3">Weekly Attendance Chart</h3>
//           <div>
//             <button className="btn-secondary mx-2" onClick={() => {
//               setWeekOffset(weekOffset - 1);
//               fetchWeeklyChart(weekOffset - 1);
//             }}>Previous</button>
//             <button className="btn-secondary" onClick={() => {
//               setWeekOffset(weekOffset + 1);
//               fetchWeeklyChart(weekOffset + 1);
//             }}>Next</button>
//           </div>
//         </div>
//         <div className="h-[40dvh] bg-white">
//           {weeklyData && <Bar data={{
//             labels: weeklyData.labels,
//             datasets: [
//               { label: "Work Hours", data: weeklyData.data, backgroundColor: "blue" },
//               { label: "Leave Hours", data: weeklyData.leave_data, backgroundColor: "red" }
//             ]
//           }} />}
//         </div>
//       </div>

//       {/* Monthly Chart */}
//       <div className="monthly h-1/2 w-full flex flex-col gap-4">
//         <div className="flex w-full justify-between items-center">
//           <h3 className="text-h3">Monthly Attendance Chart</h3>
//           <div>
//             <button className="btn-secondary mx-2" onClick={() => {
//               setMonthOffset(monthOffset - 1);
//               fetchMonthlyChart(monthOffset - 1);
//             }}>Previous</button>
//             <button className="btn-secondary" onClick={() => {
//               setMonthOffset(monthOffset + 1);
//               fetchMonthlyChart(monthOffset + 1);
//             }}>Next</button>
//           </div>
//         </div>
//         <div className="h-[40dvh] bg-white">
//           {monthlyData && <Bar data={{
//             labels: monthlyData.labels,
//             datasets: [
//               { label: "Work Hours", data: monthlyData.work_data, backgroundColor: "blue" },
//               { label: "Leave Days", data: monthlyData.leave_data, backgroundColor: "red" }
//             ]
//           }} />}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeChart;

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

const EmployeeHrChart = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0]);
  const [monthlyData, setMonthlyData] = useState([0, 0, 0, 0]);

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/employee_list/`)
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchWeeklyChart(weekOffset);
      fetchMonthlyChart(monthOffset);
    }
  }, [selectedEmployee, weekOffset, monthOffset]);

  const fetchWeeklyChart = (offset) => {
    if (!selectedEmployee) return;
    axios
      .post(`${apiBaseUrl}/api/admin-weekly-chart/`, {
        employee_id: selectedEmployee,
        week_offset: offset,
      })
      .then((response) => {
        console.log("Weekly Data:", response.data);
        const { data, leave_data, labels } = response.data;
        const formattedData = labels.map((label, index) => ({
          date: label,
          work_data: data[index],
          leave_data: leave_data[index],
        }));
        setWeeklyData(formattedData);
      })
      .catch((error) => console.error("Error fetching weekly data:", error));
  };

  const fetchMonthlyChart = (offset) => {
    if (!selectedEmployee) return;
    axios
      .post(`${apiBaseUrl}/api/admin-monthly-chart/`, {
        employee_id: selectedEmployee,
        month_offset: offset,
      })
      .then((response) => {
        console.log("Monthly Data:", response.data);
        const { work_data, leave_data, labels } = response.data;
        const formattedData = labels.map((label, index) => ({
          date: label,
          work_data: work_data[index],
          leave_data: leave_data[index],
        }));
        setMonthlyData(formattedData);
      })
      .catch((error) => console.error("Error fetching monthly data:", error));
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
    setWeekOffset(0);
    setMonthOffset(0);
    fetchWeeklyChart(0);
    fetchMonthlyChart(0);
  };

  return (
    <div className="employeeChart p-4 h-full flex flex-col w-full gap-4">
      <div className="flex w-full justify-between items-center">
        <h3 className="text-h3">Employee Attendance Chart</h3>
        <select
          className="p-2"
          onChange={handleEmployeeChange}
          value={selectedEmployee}
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.employee_id} value={employee.employee_id}>
              {employee.employee_name}
            </option>
          ))}
        </select>
      </div>

      <div className="weekly w-full flex flex-col gap-4">
        <div className="flex w-full justify-between items-center">
          <h3 className="text-h3">Weekly Attendance Chart</h3>
          <div className="flex items-center space-x-2">
            <button
              className="primary-btn-sm"
              onClick={() => {
                setWeekOffset(weekOffset - 1);
                fetchWeeklyChart(weekOffset - 1);
              }}
            >
              <ChevronLeft />
            </button>
            <button
              className="primary-btn-sm"
              onClick={() => {
                setWeekOffset(weekOffset + 1);
                fetchWeeklyChart(weekOffset + 1);
              }}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
        <div className="bg-white/80" style={{ height: "300px" }}>
          {weeklyData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="work_data" stroke="blue" />
                <Line type="monotone" dataKey="leave_data" stroke="red" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="monthly w-full flex flex-col gap-4">
        <div className="flex w-full justify-between items-center">
          <h3 className="text-h3">Monthly Attendance Chart</h3>
          <div className="flex space-x-2">
            <button
              className="primary-btn-sm"
              onClick={() => {
                setMonthOffset(monthOffset - 1);
                fetchMonthlyChart(monthOffset - 1);
              }}
            >
              <ChevronLeft />
            </button>
            <button
              className="primary-btn-sm"
              onClick={() => {
                setMonthOffset(monthOffset + 1);
                fetchMonthlyChart(monthOffset + 1);
              }}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
        <div className="bg-white/80" style={{ height: "300px" }}>
          {monthlyData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="work_data" stroke="blue" />
                <Line type="monotone" dataKey="leave_data" stroke="red" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHrChart;
