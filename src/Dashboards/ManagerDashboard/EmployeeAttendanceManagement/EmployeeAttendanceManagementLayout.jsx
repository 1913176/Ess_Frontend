import React from "react";
import { Outlet } from "react-router-dom";
import EmployeeAttendanceSidebar from "./EmployeeAttendanceSidebar";

const EmployeeAttendanceManagementLayout = () => {
  return (
    <div className="flex min-h-screen">
      <EmployeeAttendanceSidebar />
      <div className="flex-1 sm:ml-64 p-2 sm:p-4 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceManagementLayout;