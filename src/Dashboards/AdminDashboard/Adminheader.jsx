import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ess_logo from "../../assets/Images/ess_logo.png";
import {
  Calendar,
  ChevronDown,
  File,
  GroupIcon,
  LayoutDashboardIcon,
  LogOut,
  MapIcon,
  MessageCircle,
  HelpingHand,
  Search,
  User,
  UserCheck,
  Users,
  DollarSign,
  Users2,
  UserX,
  Package
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { Shop2 } from "@mui/icons-material";
const baseApi = process.env.VITE_BASE_API;
const UserInfo = JSON.parse(sessionStorage.getItem("userdata"));
const side_bar = [
  {
    link: "/admin",
    name: "Dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    link: "/admin/manager",
    name: "Managers",
    icon: <Users />,
  },
  {
    link: "/admin/hr-management",
    name: "HR-Management",
    icon: <Users />,
  },
  //{
  // link: "/admin/ar-management",
  //  name: "AR-Management",
  // icon: <Users />,
  // },
  {
    link: "/admin/employee",
    name: "Employee Management",
    icon: <Users />,
  },
  {
    link: "helpdesk",
    name: "Help Desk",
    icon: <HelpingHand />,
  },
  // {
  //   link: "/admin/supervisor",
  //   name: "Supervisor Management",
  //   icon: <Users />,
  // },
  {
    link: "/admin/projectManagement",
    name: "Project Management",
    icon: <File />,
  },
  {
    link: "/admin/kpi-employee",
    name: "KPI Employee",
    icon: <Users2 />,
  },
  {
    link: "/admin/training-programs",
    name: "Training & Development",
    icon: <Users2 />,
  },
  {
    link: "/admin/kpi-manager",
    name: "KPI Manager",
    icon: <Users2 />,
  },
  {
    link: "/admin/feedback",
    name: "FeedBack",
    icon: <MessageCircle />,
  },
  {
    link: "/admin/other",
    name: "Others",
    icon: <Users />,
  },
  {
    link: "inventory",
    name: "Inventory",
    icon: <Package />,
  },
  {
    link: "account-management",
    name: "Account Management",
    icon: <Users />,
  },
  {
    link: "/admin",
    name: "Store",
    icon: <Shop2 />,
  },
];


const Adminheader = () => {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const goPurchaseStore = () => {
    navigate("/admin");
  }

  const HandleLogOut = async () => {
    const res = await axios.post(`${baseApi}/admin/logout/`);
    localStorage.clear();
    toast("Logout so easy !!");
    navigate("/login");
  };

  const Picons = localStorage.getItem("purchasedFeatures")?.split(",") || [];

  const PurchasedIcons = side_bar.filter((i) => Picons.includes(i.name));

  return (
    <div className="header h-[50px] bg-white z-50 sticky top-0 left-0">
      <nav className="navbar flex justify-between items-center bg-white py-2 px-2 gap-6 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-3">
              <img src={ess_logo} alt="Ess Logo" width={25} height={25} />
            </Link>
            <div className="flex justify-between items-center sm:w-[100px] md:w-[200px] lg:w-[150px]">
              <strong className="leading-tight text-sm hidden md:block w-full">
                Employee <br /> Self Services
              </strong>
            </div>
          </div>
        </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="profile flex items-center gap-2 p-1 rounded-full">
                <User height={30} width={30} />
                <div className="flex justify-between gap-4 items-center">
                  <div className="flex-col leading-snug hidden md:flex">
                    <p className="text-sm font-bold capitalize">
                      {UserInfo?.username || "Unknown"}
                    </p>
                    <p className="text-[10px] font-normal">Administrator</p>
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
      <div
        className={`side_bar z-10 left-0 flex bg-white justify-center items-center transition-all overflow-hidden ease-in-out duration-300 h-screen ${isOpenSidebar ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 place-items-center">
          {side_bar.map((link) => (
            <NavLink
              to={link.link}
              key={link.name}
              className={({ isActive }) =>
                `flex flex-col justify-center items-center drop-shadow-lg
                h-24 w-24 rounded-lg gap-5 shadow-lg font-semibold bg-blue-600 text-white ${isActive ? "bg-blue-500 text-white" : ""
                }`
              }
              onClick={() => setIsOpenSidebar(false)}
            >
              <div>{link.icon}</div>
              <p className="text-sm text-center">{link.name}</p>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Adminheader;