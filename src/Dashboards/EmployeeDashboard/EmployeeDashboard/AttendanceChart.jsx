import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
axios.defaults.withCredentials = true;
const apiBaseUrl = process.env.VITE_BASE_API;
const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

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
          ? `${apiBaseUrl}/attendance/weekly/${userInfo.employee_id}/`
          : `${apiBaseUrl}/employee/monthly-attendance-chart/${userInfo.employee_id}/`;

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
          }))
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

  // Calculate max value for Y-axis scaling
  const maxValue = Math.max(
    ...chartData.map(item => Math.max(
      item.work_hours,
      item.permission_hours,
      item.leave_days
    )),
    8 // Minimum max value of 8 for better visualization
  );

  return (
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
              onClick={() => setTimeOffset((prev) => prev - 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              <ChevronLeft />
            </Button>
            <Button
              onClick={() => setTimeOffset((prev) => prev + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="flex">
            {/* Left Y-axis labels */}
            <div className="flex flex-col justify-between h-[250px] mr-2 text-sm text-gray-500">
              {[100, 80, 60, 40, 20, 0].map((value) => (
                <div key={value}>{value}%</div>
              ))}
            </div>
            
            {/* Main chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    hide 
                    domain={[0, maxValue]} 
                  />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="work_hours"
                    name="Work Hours"
                    stroke="#4CAF50"
                    fill="#4CAF50"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="permission_hours"
                    name="Permission Hours"
                    stroke="#FF9800"
                    fill="#FF9800"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="leave_days"
                    name="Leave Days"
                    stroke="#F44336"
                    fill="#F44336"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Right Y-axis labels */}
            <div className="flex flex-col justify-between h-[250px] ml-2 text-sm text-gray-500">
              {[100, 90, 100].map((value, index) => (
                <div key={index}>{value}%</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;