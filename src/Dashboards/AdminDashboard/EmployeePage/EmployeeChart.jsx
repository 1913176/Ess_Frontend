import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

const EmployeeChart = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState({ series: [], categories: [] });
  const [monthlyData, setMonthlyData] = useState({
    series: [],
    categories: [],
  });

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
        const workData = data.map((d) => ({ name: "Work", data: d }));
        const leaveData = leave_data.map((d) => ({ name: "Leave", data: d }));
        setWeeklyData({
          series: [
            { name: "Work", data: workData },
            { name: "Leave", data: leaveData },
          ],
          categories: labels,
        });
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
        setMonthlyData({
          series: [
            { name: "Work", data: work_data },
            { name: "Leave", data: leave_data },
          ],
          categories: labels,
        });
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

  const chartOptions = {
    chart: {
      id: "attendance-chart",
      height: "100%",
      width: "100%",
    },
    xaxis: {
      categories: [],
    },
    stroke: {
      curve: "smooth",
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
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
          {weeklyData.series.length > 0 && (
            <ReactApexChart
              options={{
                ...chartOptions,
                xaxis: { categories: weeklyData.categories },
              }}
              series={weeklyData.series}
              type="line"
              height="100%"
            />
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
          {monthlyData.series.length > 0 && (
            <ReactApexChart
              options={{
                ...chartOptions,
                xaxis: { categories: monthlyData.categories },
              }}
              series={monthlyData.series}
              type="line"
              height="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeChart;
