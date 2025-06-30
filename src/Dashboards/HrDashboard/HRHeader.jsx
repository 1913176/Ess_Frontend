import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import ess_logo from "../../assets/Images/ess_logo.png";
import { toast } from "react-toastify";
const UserInfo = JSON.parse(localStorage.getItem("userdata"));
import {
  ChevronDown,
  File,
  Folder,
  LayoutDashboardIcon,
  Menu,
  MessageCircle,
  Search,
  User,
  Users,
  Users2,
} from "lucide-react";
import ChatContext from "../../context/chatContext";
const side_bar = [
  {
    link: "/hr",
    name: "Dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    link: "/hr/process",
    name: "Process",
    icon: <User />,
  },
  {
    link: "/hr/onboarding",
    name: "onboarding",
    icon: <User />,
  },
  {
    link: "/hr/hrManager",
    name: "Manager Management",
    icon: <Users2 />, // Icon representing employees or people
  },
  {
    link: "/hr/hr-employee",
    name: "Employee Management",
    icon: <User />,
  },
  {
    link: "/hr/hrsupervisor",
    name: "Supervisor Management",
    icon: <Users2 />, // Icon representing employees or people
  },
  // {
  //   link: "/hr/employees",
  //   name: "Employees",
  //   icon: <User />,
  // },
  {
    link: "/hr/LeaveManagement",
    name: "Leave Management",
    icon: <User />,
  },
  // {
  //   link: "/hr/hrsupervisor",
  //   name: "Supervisor",
  //   icon: <Users2 />, // Icon representing employees or people
  // },
  // {
  //   link: "/hr/hrManager",
  //   name: "Manager",
  //   icon: <Users2 />, // Icon representing employees or people
  // },
  {
    link: "/hr/attendance",
    name: "Attendance",
    icon: <User />,
  },
  {
    link: "/hr/shift",
    name: "Shift",
    icon: <User />,
  },
  {
    link: "/hr/Offers",
    name: "Offers",
    icon: <User />,
  },
  {
    link: "/hr/helpDesk",
    name: "HelpDesk",
    icon: <User />,
  },
  // {
  //   link: "/hr/payroll",
  //   name: "Pay Roll",
  //   icon: <User />,
  // },
  {
    link: "/hr/tickets",
    name: "Tickets",
    icon: <User />,
  },
  {
    link: "/hr/ManagerPerformance",
    name: "Manager Performance",
    icon: <User />,
  },
  {
    link: "/hr/EmployeePerformance",
    name: "Employee Performance",
    icon: <User />,
  },
  // {
  //   link: "/hr/kpi",
  //   name: "Kpi",
  //   icon: <User />,
  // },
];

const baseApi = process.env.VITE_BASE_API;

const HRHeader = () => {
  const { setIsOpenChat } = useContext(ChatContext);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  // const UserInfo = JSON.parse(localStorage.getItem("userdata"));
  const navigate = useNavigate();

  const HandleLogOut = async () => {
    const res = await axios.post(`${baseApi}/admin/logout/`);
    localStorage.clear();
    toast("Logout so easy !!");
    navigate("/login");
  };

  return (
    <>
      <div className="header h-[50px] bg-white z-50 sticky top-0 left-0">
        <nav className="navbar flex justify-between items-center w-full top-0 left-0 z-20 bg-white py-2 px-2 gap-6 shadow-md relative">
          {/* nav logo start */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link onClick={() => setIsOpenSidebar(!isOpenSidebar)}>
                <img src={ess_logo} alt="Ess Logo" width={25} height={25} />
              </Link>

              <div className="flex justify-between items-center sm:w-[100px] md:w-[200px] lg:w-[150px]">
                <strong className="leading-tight text-sm hidden md:block w-full">
                  Employee <br /> Self Services
                </strong>
                {/* <img
                  src="/images/icons8-hamburger-menu.svg"
                  alt="menu"
                  height={24}
                  width={24}
                  className="cursor-pointer"
                  onClick={() => setisOpenSidebar(!isOpenSidebar)}
                /> */}
                {/* <Menu
                  height={24}
                  width={24}
                  className="cursor-pointer"
                  onClick={() => setIsOpenSidebar(!isOpenSidebar)}
                /> */}
              </div>
            </div>
          </div>
          {/* nav logo end */}

          <div className="flex justify-end lg:justify-between w-full">
            <form
              action=""
              className="bg-blue-50 px-4 rounded-md flex items-center"
            >
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
                className=" hover:bg-blue-100 p-2 py-3 rounded-full cursor-pointer"
                onClick={() => setIsOpenChat((prev) => !prev)}
              >
                <MessageCircle height={15} />
              </div>
              {/* profile start */}
              <div className="profile flex items-center gap-2 p-1 rounded-full">
                {/* <img
                src="/images/johnsmith.png"
                alt="Avator"
                className="avator-img"
                height={30}
                width={30}
              /> */}
                <User height={30} width={30} />
                <div className="flex justify-between gap-4 items-center">
                  <div className="flex-col leading-snug hidden md:flex">
                    <p className="text-sm font-bold capitalize">
                      {UserInfo.hr_name || "User"}
                    </p>
                    <p className="text-[10px] font-normal">Hr Manager</p>
                  </div>
                  <ChevronDown />
                </div>
              </div>
            </div>
            {/* profile end */}
          </div>
        </nav>

        <div
          className={`side_bar z-10 left-0 flex bg-white justify-center items-center transition-all overflow-hidden ease-in-out duration-300 h-screen ${
            isOpenSidebar ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4  place-items-center ">
            {side_bar.map((link) => {
              return (
                <>
                  <NavLink
                    to={link.link}
                    key={link.name}
                    className={({ isActive }) =>
                      `flex flex-col justify-center items-center drop-shadow-lg
                h-24 w-24 rounded-lg gap-5 shadow-lg font-semibold bg-blue-600 text-white ${
                  isActive ? "bg-blue-500 text-white" : ""
                }`
                    }
                    onClick={() => setIsOpenSidebar(!isOpenSidebar)}
                  >
                    {/* <img
                    src={link.icon}
                    alt={link.name}
                    height={100}
                    width={100}
                    className="drop-shadow-lg shadow-lg rounded-lg p-4"
                    /> */}
                    <div className="">{link.icon}</div>
                    <p className="text-sm text-center">{link.name}</p>
                  </NavLink>
                </>
              );
            })}
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
    </>
  );
};

export default HRHeader;
