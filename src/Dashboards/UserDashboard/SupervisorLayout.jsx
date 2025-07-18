import React from "react";
import { Outlet } from "react-router-dom";
import SupervisorHeader from "./SupervisorHeader";

const SupervisorLayout = () => {
  return (
    <div className="flex w-full min-h-dvh">
      {/* <AdminSideBar /> */}
      <div className="w-full relative">
        {/* <AdminHeader {...user} /> */}
        <SupervisorHeader />
        <Outlet />
      </div>
    </div>
  );
};

export default SupervisorLayout;
