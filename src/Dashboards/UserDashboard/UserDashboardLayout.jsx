import React from "react";
import { Outlet } from "react-router-dom";
import UserHeader from "./UserHeader";

const UserDashboardLayout = () => {
  return (
    <>
      <div className="flex flex-col w-full min-h-dvh">
        <UserHeader />
        <div className="w-full flex-1">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboardLayout;
