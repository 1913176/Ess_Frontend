import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "axios";

axios.defaults.withCredentials = true;
const apiBaseUrl = process.env.VITE_BASE_API;
const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

function HrAttendanceChart() {
  const currentYear = new Date().getFullYear();

  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      height: 350,
    },
    series: [
      { name: "Work Hours", data: [] },
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

      const endpoint =
        viewType === "weekly"
          ? `${apiBaseUrl}/manager-weekly-attendance-chart/${userInfo.manager_id}/`
          : `${apiBaseUrl}/manager/monthly-attendance-chart/${userInfo.manager_id}/`;

      const params =
        viewType === "weekly"
          ? { week_offset: timeOffset }
          : { month_offset: timeOffset };

      const response = await axios.get(endpoint, { params });
      const data = response.data;

      if (viewType === "weekly") {
        const { labels = [], work_data = [], leave_data = [] } = data;

        if (labels.length === 0) {
          setError("No data available for the selected period.");
          setChartOptions((prevOptions) => ({
            ...prevOptions,
            series: [
              { name: "Work Hours", data: [] },
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
              { name: "Leave Days", data: leave_data },
            ],
            xaxis: { categories: labels },
            yaxis: {
              ...prevOptions.yaxis,
              max: Math.ceil(Math.max(...work_data, ...leave_data) + 5),
            },
          }));
        }
      } else if (viewType === "monthly") {
        const { month, total_hours, week_avg_data } = data;

        if (!week_avg_data || week_avg_data.length === 0) {
          setError("No weekly data available for the selected month.");
          setChartOptions((prevOptions) => ({
            ...prevOptions,
            series: [
              { name: "Work Hours", data: [] },
              { name: "Leave Days", data: [] },
            ],
            xaxis: { categories: [] },
          }));
        } else {
          setError("");

          // Process the weekly data for the monthly view
          const labels = week_avg_data.map((item) => item[0]); // ["Week 1", "Week 2", ...]
          const work_data = week_avg_data.map((item) => item[1]); // [0, 0, 0.04, ...]
          const leave_data = new Array(work_data.length).fill(0); // Assuming no leave data is provided for monthly, set as zero

          setChartOptions((prevOptions) => ({
            ...prevOptions,
            series: [
              { name: "Work Hours", data: work_data },
              { name: "Leave Days", data: leave_data },
            ],
            xaxis: { categories: labels },
            yaxis: {
              ...prevOptions.yaxis,
              max: Math.ceil(Math.max(...work_data) + 5),
            },
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError(
        err.response?.data?.message || "Failed to load attendance data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [viewType, timeOffset]);

  return (
    <div className="chart bg-white p-4 mt-3 ms-4 me-4 mb-4 rounded-lg shadow-md">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <p className="font-medium text-xl text-black">
            Attendance Comparison Chart
          </p>
          <p className="font-medium text-sm text-gray-500">{currentYear}</p>
        </div>
        <div className="flex gap-4">
          <button
            className={`btn rounded-lg transition ${
              viewType === "weekly" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setViewType("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition ${
              viewType === "monthly" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setViewType("monthly")}
          >
            Monthly
          </button>
          <button
            className="tn btn-primary rounded-lg transition"
            disabled={timeOffset <= -4} // Example: Prevent navigating too far back
            onClick={() => setTimeOffset((prev) => prev - 1)}
          >
            Previous
          </button>
          <button
            className="btn btn-primary rounded-lg transition"
            disabled={timeOffset >= 4} // Example: Prevent navigating too far ahead
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

export default HrAttendanceChart;
