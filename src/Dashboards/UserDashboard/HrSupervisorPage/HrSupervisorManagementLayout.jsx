import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { ChartArea, UserCheck, UserCog, Users } from "lucide-react";

const supervisorLink = [
  {
    path: "./",
    label: "Supervisor",
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
    path: "./supervisor-leave",
    label: "Supervisor Leave",
    icon: <ChartArea />,
  },
  {
    path: "./supervisor-leave-policies",
    label: "Supervisor Leave Policies",
    icon: <ChartArea />,
  },
  {
    path: "./supervisor-salary",
    label: "Supervisor Salary",
    icon: <ChartArea />,
  },
  {
    path: "./supervisor-payroll",
    label: "Supervisor Payroll",
    icon: <ChartArea />,
  },
];

const HrSupervisorManagementLayout = () => {
  return (
    <>
      <div className="SupervisorManagement flex">
        <Sidebar NavPaths={supervisorLink} />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default HrSupervisorManagementLayout;
