import { useEffect, useState } from "react";
import Attendance from "./Attendance";
import { ChartBarBig, Newspaper } from "lucide-react";
import axios from "axios";
import Chart from "react-apexcharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DataGrid } from "@mui/x-data-grid";
import CounterCards from "../../../components/CounterCards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
axios.defaults.withCredentials = true;
const apiBaseUrl = process.env.VITE_BASE_API;

const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetProjects, GetProjects_status } from "@/api/ServerAction";

// const MangerHome = () => {
//   return (
//     <div className="min-h-screen h-full w-full p-4 gap-4 flex flex-col bg-slate-100 overflow-hidden">
//       {/* First Section: Counter Cards and Attendance */}
//       <div className="flex flex-col md:flex-row gap-4">
//         <div className="md:w-3/4">
//           <TotalCounterCards />
//         </div>
//         <div className="md:w-1/4     hover:scale-[102%] transition-all duration-500">
//           <Attendance />
//         </div>
//       </div>

//       {/* Second Section: Project Table, Attendance Chart, and News View */}
//       <div className="flex flex-col lg:flex-row gap-4 h-full w-full">
//         <div className="lg:w-1/2 hover:scale-[102%] transition-all duration-500 h-full">
//           <ProjectTable />
//         </div>

//         <div className="lg:w-1/4 hover:scale-[102%] transition-all duration-500 h-full">
//           <AttendanceChart />
//         </div>

//         <div className="lg:w-1/4 hover:scale-[102%] transition-all duration-500 h-full">
//           <NewsView />
//         </div>
//       </div>
//     </div>
//   );
// };

const MangerHome = () => {
  return (
    <div className="h-full w-full p-4 gap-4 flex flex-col bg-slate-100">
      {/* First Section: Counter Cards and Attendance */}
      <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[50%]">
        <div className="md:w-3/4">
          <TotalCounterCards />
        </div>
        <div className="md:w-1/4 transform transition-all duration-500 hover:scale-[102%]">
          <Attendance />
        </div>
      </div>

      {/* Second Section: Project Table, Attendance Chart, and News View */}
      <div className="grid lg:grid-cols-4 gap-4 h-full w-full items-stretch justify-stretch">
        <div className="lg:col-span-2 transform transition-all duration-500 hover:scale-[102%] h-full">
          <ProjectTable />
        </div>

        <div className="lg:col-span-1 transform transition-all duration-500 hover:scale-[102%] h-full">
          <AttendanceChart />
        </div>

        <div className="lg:col-span-1 transform transition-all duration-500 hover:scale-[102%] h-full">
          <NewsView />
        </div>
      </div>
    </div>
  );
};

export default MangerHome;

const TotalCounterCards = () => {
  const { data: projectList = [], isLoading, isError } = useQuery({
    queryKey: ["projects", userInfo.manager_id],
    queryFn: GetProjects_status,
    placeholderData: [],
    staleTime: 1000,
  });
  
  const total_project = {
    title: "Total Projects",
    logo: <ChartBarBig />,
    count: projectList?.length || 0,
    percentage: 10,
  };
  const completed_projects = {
    title: "Completed Projects",
    logo: <ChartBarBig />,
    count: projectList.filter(
      (project) => project.project_status === "completed",
    ).length,
    percentage: 20,
  };

  const in_progress_projects = {
    title: "In Progress Projects",
    logo: <ChartBarBig />,
    count: projectList.filter(
      (project) => project.project_status === "in_progress",
    ).length,
    percentage: 30,
  };

  const pending_projects = {
    title: "Pending Projects",
    logo: <ChartBarBig />,
    count: projectList.filter(
      (project) => project.project_status === "not_started",
    ).length,
    percentage: 15,
  };
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
        <CounterCards {...total_project} />
        <CounterCards {...in_progress_projects} />
        <CounterCards {...completed_projects} />
        <CounterCards {...pending_projects} />
      </div>
    </>
  );
};

// news start
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
        setError("Failed to fetch news. Please try again later.", err);
      }
    };

    fetchNews();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 overflow-y-auto h-[300px]">
          {news.map((item, index) => (
            <div className="grid space-y-1" key={index}>
              <div className="grid space-y-2" key={index}>
                <Card className="p-4">
                  <h3>{item.title}</h3>
                  <p className="text-muted-foreground">{item.content}</p>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// function AttendanceChart() {
//   const [chartOptions, setChartOptions] = useState({
//     chart: {
//       type: "area",
//       toolbar: { show: false },
//       zoom: { enabled: false },
//       height: 350,
//     },
//     series: [
//       { name: "Work Hours", data: [] },
//       { name: "Permission Hours", data: [] },
//       { name: "Leave Days", data: [] },
//     ],
//     xaxis: { categories: [] },
//     markers: { size: 5, colors: "white", strokeColors: "skyblue" },
//     dataLabels: { enabled: false },
//     yaxis: {
//       min: 0,
//       labels: {
//         formatter: (value) => `${value} hrs`,
//       },
//     },
//     fill: {
//       type: "gradient",
//       gradient: {
//         shadeIntensity: 1,
//         opacityFrom: 0.7,
//         opacityTo: 0.1,
//         stops: [0, 90, 100],
//       },
//     },
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [viewType, setViewType] = useState("weekly"); // 'weekly' or 'monthly'
//   const [timeOffset, setTimeOffset] = useState(0); // Offset for week or month navigation

//   const fetchAttendanceData = async () => {
//     try {
//       setLoading(true);

//       // Determine API endpoint and parameters
//       const endpoint =
//         viewType === "weekly"
//           ? `${apiBaseUrl}/attendance/weekly/${userInfo.employee_id}/`
//           : `${apiBaseUrl}/employee/monthly-attendance-chart/${userInfo.employee_id}/`;
//       // : `http://127.0.0.1:8000/employee/yearly-attendance-chart/${userInfo.employee_id}/`;

//       const params =
//         viewType === "weekly"
//           ? { week_offset: timeOffset }
//           : { month_offset: timeOffset };

//       const response = await axios.get(endpoint, { params });
//       const data = response.data;

//       // Destructure response with fallbacks for optional data
//       const {
//         labels = [],
//         work_data = [],
//         permission_data = [],
//         leave_data = [],
//       } = data;

//       if (labels.length === 0) {
//         setError("No data available for the selected period.");
//         setChartOptions((prevOptions) => ({
//           ...prevOptions,
//           series: [
//             { name: "Work Hours", data: [] },
//             { name: "Permission Hours", data: [] },
//             { name: "Leave Days", data: [] },
//           ],
//           xaxis: { categories: [] },
//         }));
//       } else {
//         setError("");
//         setChartOptions((prevOptions) => ({
//           ...prevOptions,
//           series: [
//             { name: "Work Hours", data: work_data },
//             { name: "Permission Hours", data: permission_data },
//             { name: "Leave Days", data: leave_data },
//           ],
//           xaxis: { categories: labels },
//           yaxis: {
//             ...prevOptions.yaxis,
//             max: Math.ceil(
//               Math.max(...work_data, ...permission_data, ...leave_data) + 5
//             ),
//           },
//         }));
//       }
//     } catch (err) {
//       setError("Failed to load attendance data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendanceData();
//   }, [viewType, timeOffset]);

//   return (
//     <div className="chart w-full h-full shadow-md bg-white/50 p-4 rounded-lg">
//       <div className="flex justify-between">
//         <div className="flex items-center gap-4">
//           <p className="font-medium text-xl text-black">
//             Attendance Comparison Chart
//           </p>
//           <p className="font-medium text-sm text-gray-300 items-center">2024</p>
//         </div>
//         <div className="flex gap-4">
//           <select
//             name=""
//             id=""
//             className="secondary-btn"
//             onChange={(e) => setViewType(e.target.value)}
//           >
//             <option value="weekly">Week</option>
//             <option value="monthly">Month</option>
//           </select>
//           <button
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg"
//             onClick={() => setTimeOffset((prev) => prev - 1)}
//           >
//             <ChevronLeft />
//           </button>
//           <button
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg"
//             onClick={() => setTimeOffset((prev) => prev + 1)}
//           >
//             <ChevronRight />
//           </button>
//         </div>
//       </div>
//       {loading ? (
//         <p>Loading attendance data...</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : (
//         <Chart
//           options={chartOptions}
//           series={chartOptions.series}
//           type="area"
//           height={250}
//         />
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import axios from "axios";
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
import { ChartContainer } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
// const apiBaseUrl = process.env.VITE_BASE_API;

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
          ? `${apiBaseUrl}/manager-weekly-attendance-chart/${userInfo.manager_id}/`
          : `${apiBaseUrl}/manager/monthly-attendance-chart/${userInfo.manager_id}/`;

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
  }, [viewType, timeOffset, userInfo.manager_id]);

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
    <div className="h-full">
      <Card>
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

// const ProjectTable = async () => {
//   const [projectList, setProjectList] = useState([]);
//   const [loading, setLoading] = useState(true); // Added loading state

//   // useEffect(() => {
//   //   const fetchProjects = async () => {
//   //     try {
//   //       const res = await axios.get(`${apiBaseUrl}/get_projects/?_limit=5`);
//   //       setProjectList(res.data);
//   //     } catch (error) {
//   //       console.error("Error fetching projects:", error);
//   //     } finally {
//   //       setLoading(false); // Set loading to false after fetching
//   //     }
//   //   };
//   //   fetchProjects();
//   // }, []);

//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["projects"],
//     queryFn: GetProjects,
//     placeholderData: [],
//     staleTime: 1000,
//   });

//   setProjectList(data);
//   // Helper function to format date
//   const formatDate = (date) => {
//     if (!date) return "";
//     const formattedDate = new Date(date);
//     return formattedDate.toLocaleDateString(); // Formats date as MM/DD/YYYY
//   };

//   return (
//     <div className="h-full">
//       <Card className="h-full">
//         <CardHeader>
//           <CardTitle>Project List</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="border rounded-md h-full">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>ID</TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Start date</TableHead>
//                   <TableHead>Deadline</TableHead>
//                   <TableHead>Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody className="overflow-y-auto h-[250px]">
//                 {data?.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={5}>No projects found.</TableCell>
//                     {/* Show message when no projects */}
//                   </TableRow>
//                 ) : (
//                   data?.map((project) => (
//                     <TableRow key={project.project_id}>
//                       <TableCell>{project.project_id}</TableCell>
//                       <TableCell className="font-medium">
//                         {project.name}
//                       </TableCell>
//                       <TableCell>{formatDate(project.start_date)}</TableCell>
//                       <TableCell>{formatDate(project.deadline)}</TableCell>
//                       <TableCell>
//                         {project.project_status === "completed" ? (
//                           <Button className="bg-green-500">Completed</Button>
//                         ) : project.project_status === "not_started" ? (
//                           <Button>Upcoming</Button>
//                         ) : project.project_status === "in_progress" ? (
//                           <Button className="bg-red-500">On-going</Button>
//                         ) : (
//                           <Button>Unknown</Button>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

const ProjectTable = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: GetProjects_status,
    placeholderData: [],
    staleTime: 1000,
  });

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString(); // Formats date as MM/DD/YYYY
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading message
  }

  if (isError) {
    return <div>Error loading projects.</div>; // Show an error message if there’s an issue
  }

  return (
    <div className="h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Project List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Start date</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-y-auto h-[250px]">
                {data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No projects found.</TableCell>
                  </TableRow>
                ) : (
                  data?.map((project) => (
                    <TableRow key={project.project_id}>
                      <TableCell>{project.project_id}</TableCell>
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell>{formatDate(project.start_date)}</TableCell>
                      <TableCell>{formatDate(project.deadline)}</TableCell>
                      <TableCell>
                        {project.project_status === "completed" ? (
                          <Button className="bg-green-500">Completed</Button>
                        ) : project.project_status === "not_started" ? (
                          <Button>Upcoming</Button>
                        ) : project.project_status === "in_progress" ? (
                          <Button className="bg-red-500">On-going</Button>
                        ) : (
                          <Button>Unknown</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
