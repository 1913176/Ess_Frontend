import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const apiBaseUrl = process.env.VITE_BASE_API;
const userInfo = JSON.parse(sessionStorage.getItem("userdata") || "{}");

const PreformanceReviews = () => {
  const [performanceList, setPerformanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceList = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/performance-review/list/`);
        setPerformanceList(res.data);
      } catch (error) {
        console.error("Error fetching performance list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceList();
  }, []);

  if (loading) return <CircularProgress className="m-auto" />;

  return (
    <div className="p-4 min-h-dvh">
      <h3 className="text-2xl font-semibold mb-6">Performance Reviews</h3>
      <PerformanceTable performanceList={performanceList} />
    </div>
  );
};

export default PreformanceReviews;

const PerformanceTable = ({ performanceList }) => {
  // Filter performance list for the current user
  const filteredPerformance = performanceList.filter(
    (employee) => employee.employee.id === userInfo.id
  );

  return (
    <div className="border rounded">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S.No</TableHead>
            <TableHead>Manager Name</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Review Date</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPerformance.map((performance) => (
            <TableRow key={performance.id}>
              <TableCell>{performance.id}</TableCell>
              <TableCell>{performance.manager.manager_name}</TableCell>
              <TableCell>{performance.comments}</TableCell>
              <TableCell>{performance.review_date}</TableCell>
              <TableCell>{performance.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
