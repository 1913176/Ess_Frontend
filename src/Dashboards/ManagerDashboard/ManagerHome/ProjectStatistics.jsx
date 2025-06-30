import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
ChartJs.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

import {
  Chart as ChartJs,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
  // scales,
} from "chart.js";

export default function ProjectStatistics({ data }) {
  return (
    <div className="bg-white h-full rounded-lg p-4">
      <div>
        <h1>Project Statistics</h1>
      </div>
      <Project_chart c_data={data} />
    </div>
  );
}

const Project_chart = ({ c_data }) => {
  const data = {
    labels: c_data.map((value) => value.month),
    datasets: [
      {
        label: "Completed Project",
        data: c_data.map((value) => value.completed_project),
        backgroundColor: "hsla(230, 90%, 58%, 1)",
      },
      {
        label: "Total Project",
        data: c_data.map((value) => value.total_project),
        backgroundColor: "hsla(251, 100%, 97%, 1)",
      },
    ],
  };
  const options = {
    // responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
        min: 20,
        Ticks: {
          stepSize: 20,
        },
      },
    },
  };
  return (
    <div className="h-[200px]">
      <Bar data={data} options={options} />
    </div>
  );
};
