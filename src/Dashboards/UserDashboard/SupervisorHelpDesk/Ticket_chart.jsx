import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJs,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";

// Register necessary components
ChartJs.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// UI Card Components with TailwindCSS
const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded-lg mb-3">{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="flex justify-between items-center p-4 border-b">
    {children}
  </div>
);

const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const CardFooter = ({ children }) => (
  <div className="p-4 border-t">{children}</div>
);

const CardTitle = ({ children }) => (
  <h5 className="text-xl font-semibold">{children}</h5>
);

// Main Project Chart Component
const Ticket_chart = () => {
  const [view, setView] = useState("monthly"); // State to manage the selected option

  const chartData = [
    { month: "Jan", total_project: 104, completed_project: 80 },
    { month: "Feb", total_project: 120, completed_project: 99 },
    { month: "Mar", total_project: 99, completed_project: 88 },
    { month: "Apr", total_project: 67, completed_project: 55 },
    { month: "May", total_project: 147, completed_project: 130 },
    { month: "Jun", total_project: 99, completed_project: 62 },
    { month: "Jul", total_project: 40, completed_project: 26 },
    { month: "Aug", total_project: 100, completed_project: 100 },
    { month: "Sep", total_project: 120, completed_project: 104 },
    { month: "Oct", total_project: 120, completed_project: 104 },
    { month: "Nov", total_project: 33, completed_project: 26 },
    { month: "Dec", total_project: 99, completed_project: 80 },
  ];

  const data = {
    labels: chartData.map((item) => item.month),
    datasets: [
      {
        label: "Completed Project",
        data: chartData.map((item) => item.completed_project),
        backgroundColor: "hsla(230, 90%, 58%, 1)",
        borderRadius: 5, // Add border radius
      },
      {
        label: "Total Project",
        data: chartData.map((item) => item.total_project),
        backgroundColor: "hsla(251, 100%, 97%, 1)",
        borderRadius: 5, // Add border radius
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        min: 20,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Ticket Timelines</CardTitle>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div style={{ height: "300px", width: "100%" }}>
          <Bar data={data} options={options} />
        </div>
      </CardContent>
      <CardFooter>{/* You can add footer content here if needed */}</CardFooter>
    </Card>
  );
};

export default Ticket_chart;
