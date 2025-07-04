import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const apiBaseUrl = process.env.VITE_BASE_API;

const SupervisorChart = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState({ series: [], categories: [] });
  const [monthlyData, setMonthlyData] = useState({
    series: [],
    categories: [],
  });

 useEffect(() => {
  axios
    .get(`${apiBaseUrl}/api/supervisor_list/`)
    .then((response) => {
      let supList = [];

      if (Array.isArray(response.data)) {
        supList = response.data;
      } else if (response.data && Array.isArray(response.data.supervisors)) {
        supList = response.data.supervisors;
      } else {
        supList = [];
      }

      setSupervisors(supList);

      if (supList.length > 0) {
        setSelectedSupervisor(supList[0].supervisor_id);
      } else {
        setSelectedSupervisor("");
      }
    })
    .catch((error) => {
      console.error("Error fetching supervisors:", error);
      setSupervisors([]);
      setSelectedSupervisor("");
    });
}, []);


  useEffect(() => {
    if (selectedSupervisor) {
      fetchWeeklyChart(weekOffset);
      fetchMonthlyChart(monthOffset);
    }
  }, [selectedSupervisor, weekOffset, monthOffset]);

  const fetchWeeklyChart = (offset) => {
    if (!selectedSupervisor) return;
    axios
      .post(`${apiBaseUrl}/api/admin-supervisor-weekly-chart/`, {
        supervisor_id: selectedSupervisor,
        week_offset: offset,
      })
      .then((response) => {
        console.log("Weekly Data:", response.data);
        const { data, leave_data, labels } = response.data;
        setWeeklyData({
          series: [
            { name: "Work", data: data },
            { name: "Leave", data: leave_data },
          ],
          categories: labels,
        });
      })
      .catch((error) => console.error("Error fetching weekly data:", error));
  };

  const fetchMonthlyChart = (offset) => {
    if (!selectedSupervisor) return;
    axios
      .post(`${apiBaseUrl}/api/admin-supervisor-monthly-chart/`, {
        supervisor_id: selectedSupervisor,
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

  const handleSupervisorChange = (e) => {
    setSelectedSupervisor(e.target.value);
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
      categories: [], // Dynamically set in the response data
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
    <div className="supervisorChart p-4 h-full flex flex-col w-full gap-4">
      <div className="flex w-full justify-between items-center">
        <h3 className="text-h3">Supervisor Attendance Chart</h3>
        <select
          className="p-2"
          onChange={handleSupervisorChange}
          value={selectedSupervisor}
        >
          <option value="">Select Supervisor</option>
          {supervisors.map((supervisor) => (
            <option
              key={supervisor.supervisor_id}
              value={supervisor.supervisor_id}
            >
              {supervisor.supervisor_name}
            </option>
          ))}
        </select>
      </div>

      {/* Weekly Chart */}
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

export default SupervisorChart;
