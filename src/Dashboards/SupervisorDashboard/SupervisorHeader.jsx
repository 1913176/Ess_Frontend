import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ess_logo from "../../assets/Images/ess_logo.png";
import { toast } from "react-toastify";
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
} from "lucide-react";
import axios from "axios";

const baseApi = process.env.VITE_BASE_API;

const side_bar = [
  {
    link: "/supervisor",
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
    name: "profile",
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
];

const SupervisorHeader = () => {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [userData, setUserData] = useState({});
  const [purchasedIcons, setPurchasedIcons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userdata") || "{}");
    setUserData(storedUser);
    const Picons = Object.keys(storedUser.streams || {});
    const filtered = side_bar.filter((i) => Picons.includes(i.name));
    setPurchasedIcons(filtered);
  }, []);

  const HandleLogOut = async () => {
    await axios.post(`${baseApi}/admin/logout/`);
    toast("Logout so easy !!");
    localStorage.clear();
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
          </div>
        </nav>

        {/* Sidebar */}
        <div
          className={`side_bar z-10 left-0 flex bg-white justify-center items-center transition-all overflow-hidden ease-in-out duration-300 h-screen ${
            isOpenSidebar ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 place-items-center">
            {purchasedIcons.map((link) => (
              <NavLink
                to={link.link}
                key={link.name}
                className={({ isActive }) =>
                  `flex flex-col justify-center items-center drop-shadow-lg
              h-24 w-24 rounded-lg gap-5 shadow-lg font-semibold ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`
                }
                onClick={() => setIsOpenSidebar(false)}
              >
                <div>{link.icon}</div>
                <p className="text-sm text-center">{link.name}</p>
              </NavLink>
            ))}

            <a
              className="flex flex-col justify-center items-center drop-shadow-lg
                h-24 w-24 rounded-lg gap-5 shadow-lg font-semibold bg-blue-600 text-white cursor-pointer"
              onClick={HandleLogOut}
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupervisorHeader;
