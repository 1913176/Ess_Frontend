import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

const TopNav = () => {
  const navItems = [
    {
      to: "/admin/other/RoleCreation",
      label: "Roles",
      icon: <User className="w-5 h-5" />,
    },
    {
      to: "/admin/other/department",
      label: "Department",
      icon: <User className="w-5 h-5" />,
    },
    {
      to: "/admin/other/news",
      label: "News",
      icon: <User className="w-5 h-5" />,
    },
    {
      to: "/admin/other/location",
      label: "Location",
      icon: <User className="w-5 h-5" />,
    },
    {
      to: "/admin/other/shift",
      label: "Shift",
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Admin Other Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Admin User</span>
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

const AdminOtherLayout = () => {
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

export default AdminOtherLayout;