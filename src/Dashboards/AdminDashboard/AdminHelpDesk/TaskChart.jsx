import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TaskChart = ({ activeTab }) => {
  // Sample data
  const data = [
    { name: "Jan", value: 60 },
    { name: "Feb", value: 80 },
    { name: "Mar", value: 70 },
    { name: "Apr", value: 50 },
    { name: "May", value: 60 },
    { name: "Jun", value: 90 },
    { name: "Jul", value: 80 },
    { name: "Aug", value: 100 },
    { name: "Sep", value: 70 },
    { name: "Oct", value: 60 },
    { name: "Nov", value: 80 },
    { name: "Dec", value: 90 },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#352CFD" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#352CFD" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#352CFD"
            strokeWidth={2}
            fill="url(#colorGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskChart;
