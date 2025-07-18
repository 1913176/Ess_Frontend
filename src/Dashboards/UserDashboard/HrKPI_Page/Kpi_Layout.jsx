import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { Users } from "lucide-react";

const kpiLink = [
  {
    path: "/hr/kpi/program",
    label: "Program",
    icon: <Users />,
  },
  {
    path: "/hr/kpi/certificate",
    label: "certificate",
    icon: <Users />,
  },
  {
    path: "/hr/kpi/enroll",
    label: "Enroll",
    icon: <Users />,
  },
  {
    path: "/hr/kpi/Training",
    label: "Training",
    icon: <Users />,
  },
];

const Kpi_Layout = () => {
  return (
    <div className="EmployeeManagement flex w-full">
      <Sidebar NavPaths={kpiLink} />
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default Kpi_Layout;
