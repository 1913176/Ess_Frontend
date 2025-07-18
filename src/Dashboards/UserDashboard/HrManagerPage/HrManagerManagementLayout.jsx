import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import {
  ChartArea,
  UserCheck,
  UserCog,
  Users,
  IndianRupee,
} from "lucide-react";

const managerLink = [
  {
    path: "./",
    label: "Manager",
    icon: <Users />,
  },
  {
    path: "./attendance",
    label: "Attendance",
    icon: <UserCheck />,
  },
  {
    path: "./attendanceReset",
    label: "Attendance Reset",
    icon: <UserCog />,
  },
  {
    path: "./Chart",
    label: "Statistics",
    icon: <ChartArea />,
  },
  {
    path: "./manager-leave-policies",
    label: "Manager Leave Policies",
    icon: <ChartArea />,
  },
  {
    path: "./manager-leave",
    label: "Manager Leave",
    icon: <ChartArea />,
  },
  {
    path: "./manager-salary",
    label: "Manager Salary",
    icon: <IndianRupee />,
  },
  {
    path: "./manager-payroll",
    label: "Manager Payroll",
    icon: <IndianRupee />,
  },
];

const HrManagerManagementLayout = () => {
  return (
    <div className="ManagerManagement flex">
      <Sidebar NavPaths={managerLink} />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default HrManagerManagementLayout;
