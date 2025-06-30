import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, UserCheck } from "lucide-react";

const ManagerAttendanceLinks = [
  {
    label: "Attendance",
    icon: <Calendar className="w-5 h-5" />,
    path: "/manager/ManagerAttendance",
  },
  {
    label: "Leave Management",
    icon: <UserCheck className="w-5 h-5" />,
    path: "/manager/ManagerAttendance/LeaveManagement",
  },
];

const ManagerAttendanceSidebar = () => {
  const location = useLocation();

  return (
    <div className="bg-white shadow-sm h-screen w-64 fixed top-0 left-0 z-10">
      <div className="p-4">
        <h5 className="font-semibold text-lg mb-4">Manager Attendance</h5>
        <ul className="space-y-2">
          {ManagerAttendanceLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.path}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManagerAttendanceSidebar;