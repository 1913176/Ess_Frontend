import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { Home } from "lucide-react";

const KPISidebarLink = [
  {
    label: "Performance",
    icon: <Home />,
    path: "/employee/kpi/performance",
  },
  {
    label: "Goal Setting",
    icon: <Home />,
    path: "/employee/kpi/goal",
  },
  {
    label: "Feedback",
    icon: <Home />,
    path: "/employee/kpi/feedback",
  },
];
const KPILayout = () => {
  return (
    <div className="flex min-h-dvh">

      {/* <KpiSidebar /> */}
      <Sidebar NavPaths={KPISidebarLink} />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default KPILayout;
