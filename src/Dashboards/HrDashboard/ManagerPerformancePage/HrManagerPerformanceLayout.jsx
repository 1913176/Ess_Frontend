import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { ChartArea, UserCheck, UserCog, Users } from "lucide-react";

const managerLink = [
  {
    path: "./",
    label: "Manager Performance Review",
    icon: <Users />,
  },
  {
    path: "./manager-goal",
    label: "Manager Goal",
    icon: <UserCheck />,
  },
  {
    path: "./managerfeedback",
    label: "Manager Feedback",
    icon: <UserCog />,
  },
];

const HrManagerPerformanceLayout = () => {
  return (
    <div className="ManagerManagement flex">
      <Sidebar NavPaths={managerLink} />
      <Outlet />
    </div>
  );
};

export default HrManagerPerformanceLayout;
