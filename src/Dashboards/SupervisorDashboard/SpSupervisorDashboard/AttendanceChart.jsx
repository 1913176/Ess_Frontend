import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
axios.defaults.withCredentials = true;
const apiBaseUrl = process.env.VITE_BASE_API;
function AttendanceChart() {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      height: 350,
    },
    series: [
      { name: "Work Hours", data: [] },
      // { name: "Permission Hours", data: [] },
      { name: "Leave Days", data: [] },
    ],
    xaxis: { categories: [] },
    markers: { size: 5, colors: "white", strokeColors: "skyblue" },
    dataLabels: { enabled: false },
    yaxis: {
      min: 0,
      labels: {
        formatter: (value) => `${value} hrs`,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewType, setViewType] = useState("weekly"); // 'weekly' or 'monthly'
  const [timeOffset, setTimeOffset] = useState(0); // Offset for week or month navigation

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Determine API endpoint and parameters
      const endpoint =
        viewType === "weekly"
          ? `${apiBaseUrl}/supervisor/attendance/weekly/${userInfo.supervisor_id}/`
          : `${apiBaseUrl}/supervisor/monthly-attendance-chart/${userInfo.supervisor_id}/`;
      // : `${apiBaseUrl}/employee/yearly-attendance-chart/${userInfo.employee_id}/`;

      const params =
        viewType === "weekly"
          ? { week_offset: timeOffset }
          : { month_offset: timeOffset };

      const response = await axios.get(endpoint, { params });
      const data = response.data;

      // Destructure response with fallbacks for optional data
      const {
        labels = [],
        work_data = [],
        permission_data = [],
        leave_data = [],
      } = data;

      if (labels.length === 0) {
        setError("No data available for the selected period.");
        setChartOptions((prevOptions) => ({
          ...prevOptions,
          series: [
            { name: "Work Hours", data: [] },
            { name: "Permission Hours", data: [] },
            { name: "Leave Days", data: [] },
          ],
          xaxis: { categories: [] },
        }));
      } else {
        setError("");
        setChartOptions((prevOptions) => ({
          ...prevOptions,
          series: [
            { name: "Work Hours", data: work_data },
            { name: "Permission Hours", data: permission_data },
            { name: "Leave Days", data: leave_data },
          ],
          xaxis: { categories: labels },
          yaxis: {
            ...prevOptions.yaxis,
            max: Math.ceil(
              Math.max(...work_data, ...permission_data, ...leave_data) + 5,
            ),
          },
        }));
      }
    } catch (err) {
      setError("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [viewType, timeOffset]);

  return (
    <div className="chart bg-white p-4 mt-3 ms-4 me-4 mb-4 rounded-lg">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <p className="font-medium text-xl text-black">
            Attendance Comparison Chart
          </p>
          <p className="font-medium text-sm text-gray-300 items-center">2024</p>
        </div>
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              viewType === "weekly" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setViewType("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              viewType === "monthly" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setViewType("monthly")}
          >
            Monthly
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setTimeOffset((prev) => prev - 1)}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setTimeOffset((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
      {loading ? (
        <p>Loading attendance data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <Chart
          options={chartOptions}
          series={chartOptions.series}
          type="area"
          height={250}
        />
      )}
    </div>
  );
}

export default AttendanceChart;
