import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import ess_logo from "../../assets/Images/ess_logo.png";
import { toast } from "react-toastify";
import {
  ChevronDown,
  File,
  Folder,
  LayoutDashboardIcon,
  MessageCircle,
  Search,
  User,
  HelpingHand,
  Users,
  CreditCard,
} from "lucide-react";
import ChatContext from "../../context/chatContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const side_bar = [
  { link: "/manager", name: "Dashboard", icon: <LayoutDashboardIcon /> },
  { link: "/manager/projectManagement", name: "Project Management", icon: <Folder /> },
  { link: "/manager/ManagerTask", name: "Manager Task", icon: <File /> },
  { link: "/manager/EmployeeTask", name: "Employee Task", icon: <File /> },
  { link: "/manager/ManagerAttendance", name: "Attendance", icon: <Users /> },
  { link: "/manager/EmployeeAttendance", name: "Employee Attendance", icon: <Users /> },
  { link: "/manager/projectTeamMembers", name: "Project Team Member", icon: <Users /> },
  { link: "helpdesk", name: "Help Desk", icon: <HelpingHand /> },
  { link: "/manager/ManagerKpi", name: "Manager Kpi", icon: <Users /> },
  { link: "/manager/ManagerProfile", name: "Profile", icon: <Users /> },
  { link: "billing", name: "Billing", icon: <CreditCard /> },
];

const baseApi = process.env.VITE_BASE_API;

const ManagerHeader = () => {
  const { setIsOpenChat } = useContext(ChatContext);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [userData, setUserData] = useState({});
  const [purchasedIcons, setPurchasedIcons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userdata") || "{}");
    setUserData(storedUser);
    const accessibleFeatures = Object.keys(storedUser?.streams || {});
    const filteredIcons = side_bar.filter((item) =>
      accessibleFeatures.includes(item.name)
    );
    setPurchasedIcons(filteredIcons);
  }, []);

  const HandleLogOut = async () => {
    await axios.post(`${baseApi}/admin/logout/`);
    localStorage.clear();
    toast("Logout so easy !!");
    navigate("/login");
  };

  return (
    <div className="header bg-white z-50 sticky top-0 left-0">
      <nav className="navbar w-full flex justify-between items-center bg-white py-2 px-2 gap-6 shadow-md">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Link onClick={() => setIsOpenSidebar(!isOpenSidebar)}>
              <img src={ess_logo} alt="Ess Logo" width={25} height={25} />
            </Link>
            <div className="flex justify-between items-center sm:w-[100px] md:w-[200px] lg:w-[150px]">
              <strong className="leading-tight text-sm hidden md:block w-full">
                Employee <br /> Self Services
              </strong>
            </div>
          </div>
        </div>

        {/* Search and Profile */}
        <div className="flex justify-end lg:justify-between w-full">
          <form className="bg-blue-50 px-4 rounded-md flex items-center">
            <input
              type="text"
              name="search"
              id="search"
              className="bg-blue-50 outline-none text-sm tracking-wider px-4"
            />
            <Search height={15} width={15} />
          </form>

          <div className="flex items-center gap-2">
            <div
              className="hover:bg-blue-100 p-2 py-3 rounded-full cursor-pointer"
              onClick={() => setIsOpenChat((prev) => !prev)}
            >
              <MessageCircle height={15} />
            </div>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="profile flex items-center gap-2 p-1 rounded-full">
                  <img
                    src={`${baseApi}${userData?.manager_image || ""}`}
                    alt={userData?.username || "user"}
                    className="rounded-full h-10 w-10 object-cover content-center"
                  />
                  <div className="flex justify-between gap-4 items-center">
                    <div className="flex-col leading-snug hidden md:flex">
                      <p className="text-sm font-bold capitalize">
                        {userData?.username || "User"}
                      </p>
                      <p className="text-[10px] font-normal">Manager</p>
                    </div>
                    <ChevronDown />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link to="/manager/ManagerProfile">View Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-red-600 hover:text-white"
                  onClick={HandleLogOut}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`side_bar absolute z-10 left-0 right-0 h-[calc(100vh-50px)] flex bg-white justify-center items-center transition-all overflow-hidden ease-in-out duration-300 ${
          isOpenSidebar ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 place-items-center">
          {purchasedIcons.map((link) => (
            <NavLink
              to={link.link}
              key={link.name}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-center
                 h-28 w-28 rounded-2xl gap-2 p-4 shadow-md transition-all duration-300
                 font-medium ${
                   isActive
                     ? "bg-blue-500 text-white"
                     : "bg-white text-blue-600 hover:bg-blue-100"
                 }`
              }
              onClick={() => setIsOpenSidebar(false)}
            >
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow">
                {link.icon}
              </div>
              <p className="text-sm font-semibold leading-tight">{link.name}</p>
            </NavLink>
          ))}

          {/* Logout Shortcut */}
          <a
            className="flex flex-col justify-center items-center drop-shadow-lg
              h-24 w-24 rounded-lg gap-5 shadow-lg font-semibold bg-blue-600 text-white"
            onClick={HandleLogOut}
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  );
};

export default ManagerHeader;
