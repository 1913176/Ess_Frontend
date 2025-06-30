import React from "react";
import Sidebar from "../../../components/Sidebar";
import { Outlet } from "react-router-dom";
import { Calendar, UserCog, Users } from "lucide-react";

const ProgressLink = [
  {
    path: "/hr/process/schedule",
    label: "Schedule",
    icon: <Calendar />,
  },
  {
    path: "/hr/process/job",
    label: "Jobs",
    icon: <Users />,
  },
  {
    path: "/hr/process/event",
    label: "Event",
    icon: <Calendar />,
  },
];

const HRProgressLayout = () => {
  return (
    <div className="flex">
      <Sidebar NavPaths={ProgressLink} />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default HRProgressLayout;
