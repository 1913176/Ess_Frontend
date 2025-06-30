import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Users, UserCheck, UserCog, ChartArea, IndianRupee, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const TopNav = () => {
  const navItems = [
    { to: ".", label: "Supervisor", icon: <Users className="w-5 h-5" />, end: true },
    { to: "attendance", label: "Attendance", icon: <UserCheck className="w-5 h-5" /> },
    { to: "attendanceReset", label: "Attendance Reset", icon: <UserCog className="w-5 h-5" /> },
    { to: "Chart", label: "Statistics", icon: <ChartArea className="w-5 h-5" /> },
    { to: "supervisor-leave-policies", label: "Supervisor Leave Policies", icon: <Calendar className="w-5 h-5" /> },
    { to: "supervisor-leave", label: "Supervisor Leave", icon: <Briefcase className="w-5 h-5" /> },
    { to: "supervisor-salary", label: "Supervisor Salary", icon: <IndianRupee className="w-5 h-5" /> },
    { to: "late-login-reason", label: "Supervisor Late Login", icon: <Briefcase className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Supervisor Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Supervisor Admin</span>
          <Button
            variant="ghost"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </Button>
        </div>
      </div>
      <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-4 py-2 space-x-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

const SupervisorManagementLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm p-4 min-h-[calc(100vh-10rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SupervisorManagementLayout;