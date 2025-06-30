import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, UserCheck } from "lucide-react";

const EmployeeAttendanceLinks = [
  {
    label: "Attendance",
    icon: <Calendar className="w-5 h-5" />,
    path: "/manager/EmployeeAttendance/AttendanceManagement",
  },
  {
    label: "Leave Management",
    icon: <UserCheck className="w-5 h-5" />,
    path: "/manager/EmployeeAttendance/LeaveManagement",
  },
  {
    label: "Permission Hours",
    icon: <Clock className="w-5 h-5" />,
    path: "/manager/EmployeeAttendance/permissionHours",
  },
];

const EmployeeAttendanceSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="sm:hidden fixed top-4 left-4 z-20 p-2 bg-purple-600 text-white rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      <div
        className={`bg-white shadow-sm h-screen w-64 fixed top-0 left-0 z-10 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        <div className="p-4">
          <h5 className="font-semibold text-lg mb-4">Attendance Menu</h5>
          <ul className="space-y-2">
            {EmployeeAttendanceLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-all duration-200 ${
                    location.pathname === link.path
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default EmployeeAttendanceSidebar;