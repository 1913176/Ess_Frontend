import React from "react";
import Card from "./Card";
import Clock from "./Clock";
// import Task from "../../EmployeeDashboard/EmployeeDashboard/Task";
import News from "./News";
import AttendanceChart from "./AttendanceChart";

const SpSupervisorDashboard = () => {
  return (
    <div className="p-4 h-full">
      <div className="flex gap-4 p-2 flex-col lg:flex-row">
        <Card />
        <Clock />
      </div>
      {/* <Task/> */}
      <div className="flex gap-4 p-2 items-stretch w-full h-full lg:flex-row flex-col">
        <div className="w-3/4">
          <AttendanceChart />
        </div>
        <News />
      </div>
    </div>
  );
};

export default SpSupervisorDashboard;
