import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { ChartArea, UserCheck, UserCog, Users } from "lucide-react";

const employeeLink = [
  {
    path: "./",
    label: "Employee",
    icon: <Users />,
  },
  {
    path: "./employee-hr-attendance",
    label: "Attendance",
    icon: <UserCheck />,
  },
  {
    path: "./employee-hr-attendanceReset",
    label: "Attendance Reset",
    icon: <UserCog />,
  },
  {
    path: "./employee-Chart",
    label: "Statistics",
    icon: <ChartArea />,
  },
  {
    path: "./hr-employee-leave-policies",
    label: "Employee Leave Policies",
    icon: <ChartArea />,
  },
  {
    path: "./hr-employee-leave",
    label: "Employee Leave",
    icon: <ChartArea />,
  },
  {
    path: "./hr-employee-salary",
    label: "Employee Salary",
    icon: <ChartArea />,
  },
  {
    path: "./hr-employee-payroll",
    label: "Employee Payroll",
    icon: <ChartArea />,
  },
];

const EmployeeHrManagement = () => {
  return (
    <>
      <div className="EmployeeManagement flex">
        <Sidebar NavPaths={employeeLink} />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default EmployeeHrManagement;
