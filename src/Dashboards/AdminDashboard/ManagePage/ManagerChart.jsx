import React, { useState, useEffect } from "react";
import axios from "axios";
import ApexCharts from "react-apexcharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerChart = () => {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0]);
  const [monthlyData, setMonthlyData] = useState([0, 0, 0, 0]);

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/manager_list/`)
      .then((response) => {
        setManagers(response.data);
      })
      .catch((error) => console.error("Error fetching managers:", error));
  }, []);

  useEffect(() => {
    if (selectedManager) {
      fetchWeeklyChart(weekOffset);
      fetchMonthlyChart(monthOffset);
    }
  }, [selectedManager, weekOffset, monthOffset]);

  const fetchWeeklyChart = (offset) => {
    if (!selectedManager) return;
    axios
      .post(`${apiBaseUrl}/api/admin-manager-weekly-chart/`, {
        manager_id: selectedManager,
        week_offset: offset,
      })
      .then((response) => {
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
    if (!selectedManager) return;
    axios
      .post(`${apiBaseUrl}/api/admin-manager-monthly-chart/`, {
        manager_id: selectedManager,
        month_offset: offset,
      })
      .then((response) => {
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

  const handleManagerChange = (e) => {
    setSelectedManager(e.target.value);
    setWeekOffset(0);
    setMonthOffset(0);
    fetchWeeklyChart(0);
    fetchMonthlyChart(0);
  };

  return (
    <div className="managerChart p-4 h-full flex flex-col w-full gap-4 bg-slate-100">
      {/* Employee Selection */}
      <div className="flex w-full justify-between items-center">
        <h3 className="text-h3">Manager Attendance Chart</h3>
        <select
          className="p-2"
          onChange={handleManagerChange}
          value={selectedManager}
        >
          <option value="">Select Manager</option>
          {managers.map((manager) => (
            <option key={manager.manager_id} value={manager.manager_id}>
              {manager.manager_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        {/* Weekly Chart */}
        <div className="weekly w-full h-full flex flex-col gap-4">
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

          {/* ApexCharts for Weekly */}
          <div className="bg-white h-[70vh]">
            {weeklyData.length > 0 && (
              <ApexCharts
                options={{
                  chart: {
                    type: "line",
                    height: "100%",
                    zoom: {
                      enabled: false,
                    },
                  },
                  xaxis: {
                    categories: weeklyData.map((data) => data.date),
                  },
                  yaxis: {
                    title: {
                      text: "Hours",
                    },
                  },
                  tooltip: {
                    shared: true,
                    intersect: false,
                  },
                  colors: ["#008FFB", "#FF4560"], // Blue for work, Red for leave
                }}
                series={[
                  {
                    name: "Work Hours",
                    data: weeklyData.map((data) => data.work_data),
                  },
                  {
                    name: "Leave Hours",
                    data: weeklyData.map((data) => data.leave_data),
                  },
                ]}
                type="line"
                height="100%"
              />
            )}
          </div>
        </div>

        {/* Monthly Chart */}
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

          {/* ApexCharts for Monthly */}
          <div className="bg-white h-[70vh]">
            {monthlyData.length > 0 && (
              <ApexCharts
                options={{
                  chart: {
                    type: "line",
                    height: "100%",
                    zoom: {
                      enabled: false,
                    },
                  },
                  xaxis: {
                    categories: monthlyData.map((data) => data.date),
                  },
                  yaxis: {
                    title: {
                      text: "Hours",
                    },
                  },
                  tooltip: {
                    shared: true,
                    intersect: false,
                  },
                  colors: ["#008FFB", "#FF4560"], // Blue for work, Red for leave
                }}
                series={[
                  {
                    name: "Work Hours",
                    data: monthlyData.map((data) => data.work_data),
                  },
                  {
                    name: "Leave Hours",
                    data: monthlyData.map((data) => data.leave_data),
                  },
                ]}
                type="line"
                height="100%"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerChart;
