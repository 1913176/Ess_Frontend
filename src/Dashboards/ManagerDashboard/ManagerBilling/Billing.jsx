
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Billing = () => {
  return (
    <div className="flex flex-col h-screen">
      <Sidebar />
      <div className="flex-1 p-4 overflow-auto">
        <Outlet /> {/* Renders child routes defined in App.jsx */}
      </div>
    </div>
  );
};

export default Billing;