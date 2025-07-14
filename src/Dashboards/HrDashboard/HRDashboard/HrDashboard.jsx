import axios from "axios";
import { useEffect, useState } from "react";
import {
  Building,
  CheckCircle,
  IndianRupee,
  Newspaper,
  Timer,
  Users2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button"; // ShadCN UI Button
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // ShadCN UI Select
// import { ChevronLeft, ChevronRight } from "lucide-react"; // ShadCN UI Icons
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // Recharts
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import CounterCards from "../../../components/CounterCards";
import { Badge } from "@/components/ui/badge";
import Attendance from "./Attendance";
const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
const apiBaseUrl = process.env.VITE_BASE_API;
const HrDashboard = () => {
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

  const CounterDatas = [
    {
      title: "Total Project",
      logo: <CheckCircle />,
      count: projects.length,
    },
    { title: "Total Users", logo: <Users2 />, count: employee_count || 0 },
    {
      title: "Total Managers",
      logo: <Users2 />,
      count:
        employees.managers?.length +
          employees.employees?.length +
          employees.supervisors?.length || 0,
    },
    {
      title: "Total Employees",
      logo: <Users2 />,
      count: employees.employees?.length || 0,
    },
    {
      title: "Total Department",
      logo: <Building />,
      count: departments?.length || 0,
    },
    { title: "Total Shift", logo: <Timer />, count: shifts?.length || 0 },
    { title: "Total Team", logo: <Users2 />, count: teams?.length || 0 },
    { title: "Total Revenue", logo: <IndianRupee />, count: 0 },
  ];
  return (
    <div className=" h-full w-full space-y-4 p-4">
      <div className="w-full grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4 transition-all duration-300">
        {CounterDatas.map((counderData) => (
          <CounterCards {...counderData} key={counderData.title} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4  gap-4">
        <div className="lg:col-span-3 col-span-1 h-full">
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeTable />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 h-full">
          <Attendance />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 grid-cols-1  w-full gap-4">
        <div className="col-span-1">
          <AdminCalender />
        </div>
        <div className="lg:col-span-2 col-span-1">
          <AttendanceChart />
        </div>
        <div className="col-span-1">
          <NewsView />
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;

const NewsView = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState("");

  // Fetch news data from backend
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/news/view/`);
        setNews(response.data); // Set news data
      } catch (err) {
        setError("Failed to fetch news. Please try again later.");
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="news h-full shadow-md rounded-lg">
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Latest company news and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 overflow-y-auto h-[250px]">
          {news.map((item, index) => (
            <div className="grid space-y-2" key={index}>
              <Card className="p-4">
                <h3>{item.title}</h3>
                <p className="text-muted-foreground">{item.content}</p>
              </Card>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const baseApiUrl = import.meta.env.VITE_BASE_API; // Ensure your environment variable is set
        const response = await axios.get(`${baseApiUrl}/api/employee_list/`);
        const data = response.data.map((employee, index) => ({
          name: employee.employee_name || "Unknown",
          department: employee.department || "Unknown",
          age:
            new Date().getFullYear() - new Date(employee.dob).getFullYear() ||
            "Unknown",
          onTime: "09:00 AM", // Replace this with actual on-time data if available in API
          status: index % 2 === 0 ? "On-time" : "Late", // Dummy status, replace with actual status
          // image: [one, two, three][index % 3], // Alternate between dummy images
        }));
        setEmployees(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching employee data", err);
        setError("Failed to load employee data.");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const getBadgeClass = (status) => {
    switch (status) {
      case "On-time":
        return "bg-green-100 text-green-600";
      case "Late":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-4 h-full">
      {/* {loading && <p>Loading...</p>} */}
      {/* {error && <p className="text-red-500">{error}</p>} */}
      {!loading && !error && (
        <Table className="w-full h-full overflow-x-auto border rounded-md bg-background">
          <TableHeader>
            <TableRow>
              <TableCell className="text-left">Employee Name</TableCell>
              <TableCell className="text-left">Department</TableCell>
              <TableCell className="text-left">Age</TableCell>
              <TableCell className="text-left">On-time</TableCell>
              <TableCell className="text-center">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <div className="h-full overflow-y-auto">
              {employees.map((employee, index) => (
                <TableRow key={index} className="hover:bg-gray-100">
                  <TableCell className="text-left flex items-center">
                    {/* Replace with actual employee image */}
                    <img
                      src={employee.image}
                      alt={`${employee.name} logo`}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    {employee.name}
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.age}</TableCell>
                  <TableCell>{employee.onTime}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getBadgeClass(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </div>
          </TableBody>
        </Table>
      )}
    </div>
  );
};

const AdminCalender = () => {
  return (
    <div className="bg-background rounded h-full shadow">
      <LocalizationProvider dateAdapter={AdapterDayjs} className="w-full">
        <DateCalendar />
      </LocalizationProvider>
    </div>
  );
};

const AttendanceChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewType, setViewType] = useState("weekly"); // 'weekly' or 'monthly'
  const [timeOffset, setTimeOffset] = useState(0); // Offset for week or month navigation

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Determine API endpoint and parameters
      const endpoint =
        viewType === "weekly"
          ? `${apiBaseUrl}/hr-weekly-attendance-chart/${userInfo.hr_id}/`
          : `${apiBaseUrl}/hr/monthly-attendance-chart/${userInfo.hr_id}/`;

      const params =
        viewType === "weekly"
          ? { week_offset: timeOffset }
          : { month_offset: timeOffset };

      const response = await axios.get(endpoint, { params });
      const data = response.data;

      // Destructure response with fallbacks for optional data
      const {
        labels = [],
        work_data = [],
        permission_data = [],
        leave_data = [],
      } = data;

      if (labels.length === 0) {
        setError("No data available for the selected period.");
        setChartData([]);
      } else {
        setError("");
        setChartData(
          labels.map((label, index) => ({
            label,
            work_hours: work_data[index] || 0,
            permission_hours: permission_data[index] || 0,
            leave_days: leave_data[index] || 0,
          })),
        );
      }
    } catch (err) {
      setError("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [viewType, timeOffset]);

  // const CustomTooltip = ({ active, payload, label }) => {
  //   if (active && payload && payload.length) {
  //     return (
  //       <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
  //         <p className="font-semibold mb-2">{label}</p>
  //         {payload.map((entry, index) => (
  //           <div key={index} className="flex items-center gap-2 text-sm">
  //             <div
  //               className="w-3 h-3 rounded-full"
  //               style={{ backgroundColor: entry.color }}
  //             />
  //             <span className="capitalize">
  //               {entry.name.split("_").join(" ")}:
  //             </span>
  //             <span className="font-medium">
  //               {entry.value} {entry.name.includes("hours") ? "hrs" : "days"}
  //             </span>
  //           </div>
  //         ))}
  //       </div>
  //     );
  //   }
  //   return null;
  // };

  return (
    <div className="h-full w-full">
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between">
            <div className="flex items-center gap-4">
              <p className="font-medium text-black">
                Attendance Comparison Chart
              </p>
              <p className="font-medium text-sm text-gray-300">2024</p>
            </div>
            <div className="flex gap-4">
              <Select value={viewType} onValueChange={(e) => setViewType(e)}>
                <SelectTrigger>
                  <SelectValue>
                    {viewType === "weekly" ? "Week" : "Month"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Week</SelectItem>
                  <SelectItem value="monthly">Month</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                onClick={() => setTimeOffset((prev) => prev - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTimeOffset((prev) => prev + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading attendance data...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis
                  dataKey="label"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                {/* <Tooltip content={<CustomTooltip />} /> */}
                <Legend />
                <Line
                  type="monotone"
                  dataKey="work_hours"
                  stroke="#4CAF50"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  strokeWidth={2}
                  type="monotone"
                  dataKey="permission_hours"
                  stroke="#FF9800"
                />
                <Line
                  strokeWidth={2}
                  type="monotone"
                  dataKey="leave_days"
                  stroke="#F44336"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
