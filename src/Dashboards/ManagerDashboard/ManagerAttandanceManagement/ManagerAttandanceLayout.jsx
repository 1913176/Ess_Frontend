import React from "react";
import { Outlet } from "react-router-dom";
import ManagerAttendanceSidebar from "./ManagerAttandanceSidebar";


const ManagerAttendanceLayout = () => {
  return (
    <div className="flex min-h-screen">
      <ManagerAttendanceSidebar />
      <div className="flex-1 ml-64 p-2 sm:p-4 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ManagerAttendanceLayout;