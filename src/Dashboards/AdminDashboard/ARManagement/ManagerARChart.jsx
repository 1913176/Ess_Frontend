import React, { useState, useEffect } from "react";
import axios from "axios";
import ApexCharts from "react-apexcharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerARChart = () => {
  const [ars, setHrs] = useState([]);
  const [selectedHr, setSelectedHr] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0]);
  const [monthlyData, setMonthlyData] = useState([0, 0, 0, 0]);

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/ar_list/`)
      .then((response) => {
        setHrs(response.data);
      })
      .catch((error) => console.error("Error fetching ars:", error));
  }, []);

  useEffect(() => {
    if (selectedHr) {
      fetchWeeklyChart(weekOffset);
      fetchMonthlyChart(monthOffset);
    }
  }, [selectedHr, weekOffset, monthOffset]);

  const fetchWeeklyChart = (offset) => {
    if (!selectedHr) return;
    axios
      .post(`${apiBaseUrl}/api/admin-ar-weekly-chart/`, {
        ar_id: selectedHr,
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
    if (!selectedHr) return;
    axios
      .post(`${apiBaseUrl}/api/admin-ar-monthly-chart/`, {
        ar_id: selectedHr,
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

  const handleHrChange = (e) => {
    setSelectedHr(e.target.value);
    setWeekOffset(0);
    setMonthOffset(0);
    fetchWeeklyChart(0);
    fetchMonthlyChart(0);
  };

  return (
    <div className="employeeChart p-4 h-full flex flex-col w-full gap-4">
      {/* AR Selection */}
      <div className="flex w-full justify-between items-center">
        <h3 className="text-h3">AR Attendance Chart</h3>
        <select className="p-2" onChange={handleHrChange} value={selectedHr}>
          <option value="">Select AR</option>
          {ars.map((ar) => (
            <option key={ar.ar_id} value={ar.ar_id}>
              {ar.ar_name}
            </option>
          ))}
        </select>
      </div>
      {/* Weekly Chart */}

      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <h3 className="text-h3">Weekly Attendance Chart</h3>
            <div className="flex items-center space-x-2">
              <Button
                className="primary-btn-sm"
                onClick={() => {
                  setWeekOffset(weekOffset - 1);
                  fetchWeeklyChart(weekOffset - 1);
                }}
              >
                <ChevronLeft />
              </Button>
              <Button
                className="primary-btn-sm"
                onClick={() => {
                  setWeekOffset(weekOffset + 1);
                  fetchWeeklyChart(weekOffset + 1);
                }}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white/80" style={{ height: "300px" }}>
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
        </CardContent>
      </Card>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
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
        </CardHeader>
        <CardContent>
          <div className="bg-white/80" style={{ height: "300px" }}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerARChart;
