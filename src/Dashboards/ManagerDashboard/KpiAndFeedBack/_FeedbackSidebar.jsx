import { Home } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
const ManagerFeedbackLink = [
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
  // {
  //   label: "Manager Chart",
  //   icon: <Home />,
  //   path: "/manager/ManagerKpi/managerPerformanceChart",
  // },
  {
    label: "Training Certificate",
    icon: <Home />,
    path: "/manager/ManagerKpi/managerTrainingCertificate",
  },
];
const EmployeeFeedbackLink = [
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

const ManagerFeedbackSidebar = () => {
  return (
    <div className="border-r h-full">
      <ul className="grid gap-1 p-2 h-full">
        <p className="text-sm text-muted">Manager Feedback</p>
        {ManagerFeedbackLink.map((link) => (
          <Link
            to={link.path}
            key={link.label}
            className={`p-2 w-48 rounded-xl flex items-center gap-4 ${
              location.pathname === link.path
                ? "bg-blue-500 text-white font-medium"
                : "hover:bg-blue-200"
            }`}
          >
            {link.icon} {link.label}
          </Link>
        ))}
        <p className="text-sm text-muted mt-4">Employee Feedback</p>
        {EmployeeFeedbackLink.map((link) => (
          <Link
            to={link.path}
            key={link.label}
            className={`p-2 w-48 rounded-xl flex items-center gap-4 ${
              location.pathname === link.path
                ? "bg-blue-500 text-white font-medium"
                : "hover:bg-blue-200"
            }`}
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default ManagerFeedbackSidebar;
