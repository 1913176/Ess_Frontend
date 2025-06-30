import React from "react";
import { Outlet } from "react-router-dom";
import Employeeheader from "./Employeeheader";

const EmployeeDashboardLayout = () => {
  return (
    <>
      <div className="flex flex-col w-full min-h-dvh">
        <Employeeheader />
        <div className="w-full flex-1">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboardLayout;
