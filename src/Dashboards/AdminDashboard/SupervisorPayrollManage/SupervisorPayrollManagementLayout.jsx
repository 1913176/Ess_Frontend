import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { ChartArea, UserCheck, UserCog, Users } from "lucide-react";

const supervisorLink = [
  {
    path: "./",
    label: "Supervisor Salary",
    icon: <Users />,
  },
  {
    path: "./supervisor-payroll",
    label: "Supervisor Payroll",
    icon: <UserCheck />,
  },
];

const SupervisorPayrollManagementLayout = () => {
  return (
    <>
      <div className="SupervisorPayrollManagement flex">
        <Sidebar NavPaths={supervisorLink} />
        <Outlet />
      </div>
    </>
  );
};

export default SupervisorPayrollManagementLayout;
