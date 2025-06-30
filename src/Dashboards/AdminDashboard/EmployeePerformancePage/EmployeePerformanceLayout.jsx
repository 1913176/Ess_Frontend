import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { ChartArea, UserCheck, UserCog, Users } from "lucide-react";

const employeeLink = [
  {
    path: "./",
    label: "Employee Performance Review",
    icon: <Users />,
  },
  {
    path: "./employee-goal",
    label: "Employee Goal",
    icon: <UserCheck />,
  },
  {
    path: "./employeefeedback",
    label: "Employee Feedback",
    icon: <UserCog />,
  },
];

const EmployeePerformanceLayout = () => {
  return (
    <div className="EmployeeManagement flex flex-col">
      <Sidebar NavPaths={employeeLink} />
      <Outlet />
    </div>
  );
};

export default EmployeePerformanceLayout;
