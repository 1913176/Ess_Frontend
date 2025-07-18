import React from "react";
import Task from "../../UserDashboard/EmployeeDashboard/Task";
import Clock from "../../UserDashboard/EmployeeDashboard/Clock";
import Card from "../../UserDashboard/EmployeeDashboard/Card";
import News from "../../UserDashboard/EmployeeDashboard/News";
import AttendanceChart from "../../UserDashboard/EmployeeDashboard/AttendanceChart";

const EmployeeDashboard = () => {
  return (
    <div className="p-3 grid gap-3 grid-cols-1 w-full h-full overflow-y-auto">
      {/* Top Row: Clock (left) and Card (right) */}
      <div className="grid lg:grid-cols-4 gap-3">
        <div className="lg:col-span-1 col-span-1">
          <Clock />
        </div>
        <div className="lg:col-span-3 col-span-1">
          <Card />
        </div>
      </div>

      {/* Middle Row: AttendanceChart (full width) */}
      <div className="grid lg:grid-cols-1 gap-3">
        <AttendanceChart />
      </div>

      {/* Bottom Row: Task (left) and News (right) */}
      <div className="grid lg:grid-cols-2 gap-3">
        <div className="col-span-1">
          <Task />
        </div>
        <div className="col-span-1">
          <News />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;