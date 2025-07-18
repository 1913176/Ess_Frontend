import React from "react";
// import ManagerAttendanceSidebar from "./ManagerAttandanceSidebar";
import { Outlet } from "react-router-dom";
// import Sidebar from "../../../../components/Sidebar";
import Sidebar from "../../../components/Sidebar";
import { Home } from "lucide-react";

const KPISidebarLink = [
  {
    label: "Attendance",
    icon: <Home />,
    path: "/hr/attendance/attendance-table",
  },
  {
    label: "Leave Management",
    icon: <Home />,
    path: "/hr/attendance/leave",
  },
];

const HrAttendanceLayout = () => {
  return (
    <div className="flex w-full h-full">
      {/* <ManagerAttendanceSidebar /> */}
      <Sidebar NavPaths={KPISidebarLink} />
      <div className="w-full flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default HrAttendanceLayout;
