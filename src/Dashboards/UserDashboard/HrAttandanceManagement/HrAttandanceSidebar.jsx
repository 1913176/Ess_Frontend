import { Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
const KPISidebarLink = [
  {
    label: "Attendance",
    icon: <Home />,
    path: "/manager/ManagerAttendance",
  },
  {
    label: "Leave Management",
    icon: <Home />,
    path: "/manager/ManagerAttendance/LeaveManagement",
  },
  // {
  //   label: "Feedback",
  //   icon: <Home />,
  //   path: "/employee/kpi/feedback",
  // },
];
const HrAttendanceSidebar = () => {
  const location = useLocation();
  return (
    <div className="border-r">
      <ul className="grid gap-1 p-2">
        {KPISidebarLink.map((link) => (
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

export default HrAttendanceSidebar;
