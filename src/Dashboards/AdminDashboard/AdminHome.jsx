import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Building,
  CalendarHeart,
  ChartArea,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Eye,
  Folder,
  IndianRupee,
  MapPin,
  Megaphone,
  Newspaper,
  Speaker,
  Tally1,
  Timer,
  UserCheck,
  Users2,
} from "lucide-react";
import CounterCards from "../../components/CounterCards";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  CheckedInUsers,
  GetNews,
  GetProjects,
  UserDetails,
} from "@/api/ServerAction";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Announcement } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartContainer } from "@/components/ui/chart";
const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const AdminHome = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);

  const FetchData = async () => {
    const project_res = await axios.get(`${apiBaseUrl}/projects/`);
    const department_res = await axios.get(
      `${apiBaseUrl}/admin/overall-departments/`,
    );
    const employee_res = await axios.get(`${apiBaseUrl}/api/details/`);
    const shift_res = await axios.get(`${apiBaseUrl}/admin/show-shift/`);
    const team_res = await axios.get(`${apiBaseUrl}/teams/`);

    setProjects(project_res.data.projects);
    setEmployees(employee_res.data);
    setShifts(shift_res.data);
    setTeams(team_res.data.teams);
    setDepartments(department_res.data);
  };
  useEffect(() => {
    FetchData();
  }, []);

  const employee_count =
    employees.admins?.length +
    employees.managers?.length +
    employees.supervisors?.length +
    employees.hrs?.length +
    employees.employees?.length;

  // start counter cards
  const CounterDatas = [
    { title: "Total Users", logo: <Users2 />, count: employee_count || 0 },
    {
      title: "Total Managers",
      logo: <Users2 />,
      count:
        employees.managers?.length +
          employees.employees?.length +
          employees.supervisors?.length || 0,
      link: "/admin/manager",
    },
    {
      title: "Total Employees",
      logo: <Users2 />,
      count: employees.employees?.length || 0,
      link: "/admin/employee",
    },
    {
      title: "Total Project",
      logo: <CheckCircle />,
      count: projects.length,
      link: "/admin/projectManagement",
    },
    {
      title: "Total Department",
      logo: <Building />,
      count: departments?.length || 0,
      link: "/admin/other/department",
    },
    {
      title: "Total Shift",
      logo: <Timer />,
      count: shifts?.length || 0,
      link: "/admin/other/shift",
    },
    {
      title: "Total Team",
      logo: <Users2 />,
      count: teams?.length || 0,
      link: "/admin/projectManagement/teamCreation",
    },
    { title: "Total Revenue", logo: <IndianRupee />, count: 0 },
  ];
  // end counter cards

  return (
    <div className="h-full grid grid-cols-1 gap-4 p-4 bg-slate-100">
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 col-span-1">
          <div className="h-full grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4 justify-center items-center transition-all duration-300">
            {CounterDatas.map((counderData) => (
              <CounterCards {...counderData} key={counderData.title} />
            ))}
          </div>
        </div>
        <div className="col-span-1">
          <CheckedInChart />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 justify-center">
        <div className="col-span-1">
          <ProfitChart />
        </div>
        <div className="col-span-1">
          <ProfitChart />
        </div>
        <div className="col-span-1">
          <ProfitChart />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 justify-center">
        <div className="col-span-1 lg:col-span-2 h-full">
          <ViewProjects projects={projects} />
        </div>
        <div className="col-span-1">
          <LocationMap />
        </div>
        <div className="col-span-1">
          <NewsView />
        </div>
      </div>
    </div>
  );
};

export default AdminHome;

// calender start
// const AdminCalender = () => {
//   return (
//     <div className="bg-white h-full rounded shadow">
//       <LocalizationProvider dateAdapter={AdapterDayjs} className="w-full">
//         <DateCalendar />
//       </LocalizationProvider>
//     </div>
//   );
// };
// calender end

// news start
const NewsView = () => {
  const [error, setError] = useState("");

  const { data: newses } = useQuery({
    queryKey: ["news"],
    queryFn: GetNews,
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });
  // console.log(data);

  // const [news, setNews] = useState(data);

  return (
    <div className="news rounded-lg">
      <Card className="border-none shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>
              <p className="flex items-center gap-2">
                <Megaphone /> <span>What Happens</span>
              </p>
            </CardDescription>
            <CardTitle>
              <Link to={"/admin/other/news"}>
                <span className="hover:underline">Announcements</span>
              </Link>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72 overflow-hidden">
            {newses?.map((item, index) => (
              <div
                className="flex items-start justify-start space-y-2 gap-3  border-slate-200"
                key={index}
              >
                <div className="flex flex-col items-end">
                  <div className="flex gap-2">
                    <CardDescription>{"16th"}</CardDescription>
                    <CalendarHeart className="h-6 text-primary" />
                  </div>
                  <Tally1 className="h-14" />
                </div>
                <div className="flex flex-col justify-center items-start gap-1">
                  <CardTitle className="truncate max-w-[250px]">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="truncate max-w-[150px]">
                    {item.content}
                  </CardDescription>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

const ViewProjects = () => {
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectPerPage, setProjectPerPage] = useState(5);

  const IndexOfLastproject = currentPage * projectPerPage;
  const IndexOfFirstproject = IndexOfLastproject - projectPerPage;

  const { data: projects } = useQuery({
    queryKey: ["projects", page],
    queryFn: async () => {
      const res = await axios.get(`${apiBaseUrl}/get_projects`);
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });

  const CurrentProjects = projects?.slice(
    IndexOfFirstproject,
    IndexOfLastproject,
  );

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            <p className="flex items-center gap-2">
              <Folder className="h-6" />
              Projects
            </p>
          </CardTitle>
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </Button>
            {currentPage}
            <Button
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={IndexOfLastproject > CurrentProjects?.length} // Disable if less than 5 items
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border">
          <Table className="relative">
            <TableHeader className="sticky top-0">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="max-h-50 overflow-y-scroll">
              {CurrentProjects?.map((project) => (
                <TableRow key={project.project_id}>
                  <TableCell>{project.project_id}</TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.deadline}</TableCell>
                  <TableCell>
                    {project.project_status === "not_started" ? (
                      <span className="p-1 bg-blue-100 text-blue-600 rounded-md">
                        Started
                      </span>
                    ) : project.project_status === "in_progress" ? (
                      <span className="p-1 bg-orange-100 text-orange-600 rounded-md">
                        In Progress
                      </span>
                    ) : (
                      <span className="p-1 bg-green-100 text-green-600 rounded-md">
                        Completed
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger>
                        <Eye className="hover:text-primary hover:bg-primary-foreground size-6" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Project Details</DialogTitle>
                        </DialogHeader>
                        <div className="">
                          <div className="space-y-10">
                            <div className="">
                              <DialogDescription>Title</DialogDescription>
                              <DialogTitle>{project.name}</DialogTitle>
                            </div>
                            <div className="">
                              <DialogDescription>Description</DialogDescription>
                              <DialogTitle>{project.description}</DialogTitle>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="">
                                <DialogDescription>
                                  Start Date
                                </DialogDescription>
                                <DialogTitle>{project.start_date}</DialogTitle>
                              </div>
                              <div className="">
                                <DialogDescription>Due Date</DialogDescription>
                                <DialogTitle>{project.deadline}</DialogTitle>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <DialogTitle>Status</DialogTitle>
                              <div className="flex justify-between items-center">
                                <p className="flex flex-col items-center font-medium tracking-wide leading-7">
                                  <span className="flex size-10 bg-green-100 text-green-700 border-2 border-green-700 rounded-full justify-center items-center ">
                                    {project.project_status === "not_started" ||
                                    "in_progress" ||
                                    "completed" ? (
                                      <span>
                                        <Check />
                                      </span>
                                    ) : (
                                      <span>
                                        <Ellipsis />
                                      </span>
                                    )}
                                  </span>
                                  Started
                                </p>

                                <span
                                  className={`border-x-2 border border-green-600 w-28 ${
                                    project.project_status === "in_progress" ||
                                    "completed"
                                      ? "border-green-600"
                                      : "border-slate-600"
                                  }`}
                                />

                                <p className="flex flex-col items-center font-medium tracking-wide leading-7">
                                  <span
                                    className={`flex size-10 border-2 rounded-full justify-center items-center ${
                                      project.project_status ===
                                        "in_progress" ||
                                      project.project_status === "completed"
                                        ? "bg-green-100 text-green-700 border-green-700"
                                        : "bg-red-100 text-red-700 border-red-700"
                                    }`}
                                  >
                                    {project.project_status === "in_progress" ||
                                    project.project_status === "completed" ? (
                                      <span>
                                        <Check />
                                      </span>
                                    ) : (
                                      <span>
                                        <Ellipsis />
                                      </span>
                                    )}
                                  </span>
                                  Progress
                                </p>
                                <span
                                  className={`border-x-2 border border-green-600 w-28 ${
                                    project.project_status === "completed"
                                      ? "border-green-600"
                                      : "border-slate-600"
                                  }`}
                                />

                                <p className="flex flex-col items-center font-medium tracking-wide leading-7">
                                  <span
                                    className={`flex size-10 bg-green-100 text-green-700 border-2 border-green-700 rounded-full justify-center items-center ${
                                      project.project_status === "completed"
                                        ? "bg-green-100 text-green-700 border-green-700"
                                        : "bg-red-100 text-red-700 border-red-700"
                                    }`}
                                  >
                                    {project.project_status === "completed" ? (
                                      <span>
                                        <Check />
                                      </span>
                                    ) : (
                                      <span>
                                        <Ellipsis />
                                      </span>
                                    )}
                                  </span>
                                  Completed
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose>
                            <Button variant="secondary">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
const CheckedInChart = () => {
  const {
    data: checkedInUsers,
    isLoading: isCheckedInLoading,
    error: checkedInError,
  } = useQuery({
    queryKey: ["checkedInUsers"],
    queryFn: CheckedInUsers,
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });

  const {
    data: users,
    isLoading: isUsersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: UserDetails,
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });

  // if (isCheckedInLoading || isUsersLoading) {
  //   return <div>Loading...</div>; // Show a loading indicator or message
  // }

  // if (checkedInError || usersError) {
  //   return <div>Error loading data.</div>; // Show an error message
  // }

  const users_count =
    users?.admins?.length +
    users?.managers?.length +
    users?.supervisors?.length +
    users?.hrs?.length +
    users?.employees?.length;

  console.log(checkedInUsers?.checked_in_users.length);

  const chartData = [
    {
      name: "Present",
      value: checkedInUsers?.checked_in_users.length || 0,
      fill: "#2563eb",
    },
    {
      name: "Total",
      value: users_count || 0,
      fill: "#60a5fa",
    },
  ];

  const chartConfig = {
    visitors: {
      label: "Values",
    },
    TotalUsers: {
      label: "Total Users",
      color: "#60a5fa",
    },
    Present: {
      label: "Present Users",
      color: "#2563eb",
    },
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>
          <p className="flex items-center gap-2">
            <UserCheck /> Checked In
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={50}
                outerRadius={80}
                // paddingAngle={5}
                label>
                {chartData.map((item, index) => (
                  <Cell key={item.value} fill={item.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div> */}
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[170px]"
        >
          <PieChart>
            <Tooltip />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({ outerRadius = 0, ...props }) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            />
          </PieChart>
          {/* <PieChart>
            <Pie
              data={chartData}
              innerRadius={50}
              outerRadius={80}
              // paddingAngle={5}
              label>
              {chartData.map((item, index) => (
                <Cell key={item.value} fill={item.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart> */}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const LocationMap = () => {
  const LocationData = [
    {
      name: "Chennai",
      Employees: 4,
      color: "#9333ea",
    },
    {
      name: "Salem",
      Employees: 16,
      color: "#2563eb",
    },
    {
      name: "Namakkal",
      Employees: 7,
      color: "#2563eb",
    },
    {
      name: "Kanyakumari",
      Employees: 5,
      color: "#2563eb",
    },
  ];
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>
          <p className="flex items-center gap-2">
            <MapPin className="h-6" /> Location
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer height={"100%"} width={"100%"}>
            <BarChart data={LocationData}>
              {/* Adding X and Y axes */}
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={3}
                tickSize={4}
                axisLine={false}
                // tick={false}
                fontSize={12}
              />
              {/* <YAxis /> */}
              <Tooltip />
              <Legend />
              {/* Rendering Bars */}
              <Bar
                dataKey={"Employees"}
                fill={LocationData[1].color}
                radius={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const ProfitChart = () => {
  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ];

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
    mobile: {
      label: "Mobile",
      color: "#60a5fa",
    },
  };

  // const LocationRef = useRef();
  // const LocationMap = L.map(LocationRef.current).setView([51.505, -0.09], 13);
  return (
    <div className="bg-white p-6 flex flex-col gap-6 rounded-xl">
      <h3 className="flex items-center gap-2">
        <ChartArea /> <span>Profit</span>
      </h3>
      <ChartContainer config={chartConfig} className="h-48 w-full">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          {/* <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            /> */}
          <defs>
            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            dataKey="mobile"
            type="natural"
            fill="url(#fillMobile)"
            fillOpacity={0.4}
            stroke="var(--color-mobile)"
            stackId="a"
          />
          <Area
            dataKey="desktop"
            type="natural"
            fill="url(#fillDesktop)"
            fillOpacity={0.4}
            stroke="var(--color-desktop)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};
