import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ess_logo from "../../assets/Images/ess_logo.png";
import {
  ChevronDown,
  File,
  Folder,
  LayoutDashboardIcon,
  HelpingHand,
  Newspaper,
  Search,
  User,
  Users,
  LogOut,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const baseApi = process.env.VITE_BASE_API;

const side_bar = [
  {
    link: "",
    name: "Dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    link: "/supervisor/Attendance",
    name: "Attendance",
    icon: <Users />,
  },
  {
    link: "/supervisor/LeaveManagement",
    name: "Leave Management",
    icon: <User />,
  },
  {
    link: "helpdesk",
    name: "Help Desk",
    icon: <HelpingHand />,
  },
  {
    link: "/supervisor/Todo",
    name: "Todo",
    icon: <User />,
  },
  {
    link: "/supervisor/Profile",
    name: "Profile",
    icon: <User />,
  },
  {
    link: "/supervisor/viewRequest",
    name: "View Requests",
    icon: <Newspaper />,
  },
  {
    link: "/supervisor/News",
    name: "News",
    icon: <Newspaper />,
  },
  {
    name: "Logout",
    icon: <LogOut />,
    action: "logout",
  },
];

const SupervisorHeader = () => {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [userData, setUserData] = useState({});
  const [purchasedIcons, setPurchasedIcons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("userdata") || "{}");
    setUserData(storedUser);

    const Picons = Object.keys(storedUser.streams || {});
    const filtered = side_bar.filter(
      (item) =>
        item.name === "Dashboard" ||
        item.name === "Logout" ||
        Picons.includes(item.name)
    );

    const uniqueIcons = Array.from(
      new Map(filtered.map((item) => [item.name, item])).values()
    );

    setPurchasedIcons(uniqueIcons);
  }, []);

  const HandleLogOut = async () => {
    await axios.post(`${baseApi}/admin/logout/`);
    toast("Logout so easy !!");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div className="header h-[50px] bg-white z-50 sticky top-0 left-0">
        <nav className="navbar flex justify-between items-center w-full bg-white py-2 px-2 gap-6 shadow-md relative">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link onClick={() => setIsOpenSidebar(!isOpenSidebar)}>
                <img src={ess_logo} alt="Ess Logo" width={25} height={25} />
              </Link>
              <div className="flex justify-between items-center sm:w-[100px] md:w-[200px] lg:w-[150px]">
                <strong className="leading-tight text-sm hidden md:block w-full">
                  Supervisor <br /> Self Services
                </strong>
              </div>
            </div>
          </div>

          {/* Search & Profile */}
          <div className="flex justify-end w-full">
            <form className="bg-blue-50 px-4 rounded-md flex items-center">
              <input
                type="text"
                name="search"
                id="search"
                className="bg-blue-50 outline-none text-sm tracking-wider px-4"
              />
              <Search height={15} width={15} />
            </form>

            {/* Profile */}
            <DropdownMenu>
                          <DropdownMenuTrigger>
            <div className="profile flex items-center gap-2 p-1 rounded-full">
              <User height={30} width={30} />
              <div className="flex justify-between gap-4 items-center">
                <div className="flex-col leading-snug hidden md:flex">
                  <p className="text-sm font-bold capitalize">
                    {userData.username || "User"}
                  </p>
                  <p className="text-[10px] font-normal">Supervisor</p>
                </div>
                <ChevronDown />
              </div>
            </div>
            </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="hover:bg-red-600 hover:text-white"
                  onClick={() => HandleLogOut()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Sidebar */}
        <div
          className={`side_bar z-10 left-0 flex bg-white justify-center items-center transition-all overflow-hidden ease-in-out duration-300 h-screen ${
            isOpenSidebar ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 place-items-center p-4">
            {purchasedIcons.map((link, index) =>
              link.action === "logout" ? (
                <div
                  key={`logout-${index}`}
                  onClick={HandleLogOut}
                  className="h-44 w-44 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 cursor-pointer transform"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
                      {link.icon}
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 text-center leading-tight mb-3">
                      {link.name}
                    </h4>
                    <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Exit
                    </span>
                  </div>
                </div>
              ) : (
                <NavLink
                  to={link.link}
                  key={`${link.name}-${index}`}
                  className="h-44 w-44 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 cursor-pointer transform"
                  onClick={() => setIsOpenSidebar(false)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
                      {link.icon}
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 text-center leading-tight mb-3">
                      {link.name}
                    </h4>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                </NavLink>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SupervisorHeader;
