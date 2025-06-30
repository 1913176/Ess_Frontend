import React from "react";
import ManagerFeedbackSidebar from "./_FeedbackSidebar";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { Home } from "lucide-react";

const FeedbackLink = [
  {
    label: "Manager Review",
    icon: <Home />,
    path: "/manager/ManagerKpi/managerReview",
  },
  {
    label: "Manager Goals",
    icon: <Home />,
    path: "/manager/ManagerKpi/managerGoals",
  },
  {
    label: "Manager Feedback",
    icon: <Home />,
    path: "/manager/ManagerKpi/managerFeedback",
  },
  {
    label: "Manager Chart",
    icon: <Home />,
    path: "/manager/ManagerKpi/managerPerformanceChart",
  },
  {
    label: "Training Certificate",
    icon: <Home />,
    path: "/manager/ManagerKpi/managerTrainingCertificate",
  },
  {
    label: "Employee Review",
    icon: <Home />,
    path: "/manager/ManagerKpi/employeeReview",
  },
  {
    label: "Employee Goals",
    icon: <Home />,
    path: "/manager/ManagerKpi/employeeGoals",
  },
  {
    label: "Employee Feedback",
    icon: <Home />,
    path: "/manager/ManagerKpi/employeeFeedback",
  },
];

const ManagerKpiLayout = () => {
  return (
    <div className="flex w-full min-h-dvh flex-col">
      {/* <ManagerFeedbackSidebar /> */}
      <Sidebar NavPaths={FeedbackLink} />
      <div className="w-full h-full flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default ManagerKpiLayout;
