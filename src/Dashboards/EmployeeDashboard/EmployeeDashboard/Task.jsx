import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Configure axios with credentials and CORS settings
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const apiBaseUrl = import.meta.env.VITE_BASE_API || "https://ess-backend-fg6m.onrender.com";

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/view-my-emptask/`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        const tasksData = response.data.tasks || [];
        const uniqueTasks = tasksData.reduce((acc, task) => {
          if (!task.emptask_id || !acc.some(t => t.emptask_id === task.emptask_id)) {
            acc.push(task);
          }
          return acc;
        }, []);
        setTasks(uniqueTasks);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks. Please try again.");
        setLoading(false);
      }
    };
  
    fetchTasks();
  }, []);

  const getStatusBadge = (status) => {
    const baseClasses = "min-w-[100px] flex justify-center";
    // Updated design: All statuses use the same light green background and dark green text
    return (
      <Badge
        className={`bg-green-100 text-green-800 hover:bg-green-200 ${baseClasses}`}
      >
        {status}
      </Badge>
    );
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  // Function to determine status progress for the timeline
  const getStatusProgress = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return { started: true, progress: true, completed: true };
      case "in progress":
        return { started: true, progress: true, completed: false };
      case "not started":
        return { started: false, progress: false, completed: false };
      default:
        return { started: false, progress: false, completed: false };
    }
  };

  return (
    <div className="p-4 h-full">
      <div className="task flex flex-col bg-white shadow-md p-6 rounded-lg w-full">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">My Tasks</h2>
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-gray-50 text-gray-600 text-sm font-medium">
              <TableHead className="py-3 px-4">Task Name</TableHead>
              <TableHead className="py-3 px-4">Timeline</TableHead>
              <TableHead className="py-3 px-4">Status</TableHead>
              <TableHead className="py-3 px-4">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="max-h-[200px] overflow-y-auto">
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="hover:bg-gray-50">
                  <TableCell className="py-3 px-4">
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Skeleton className="h-6 w-[100px] rounded-full" />
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Skeleton className="h-8 w-[100px] rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  No tasks available.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((employee_task, index) => (
                <TableRow
                  key={employee_task.emptask_id || `task-${index}`}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="py-3 px-4 text-gray-700">
                    {employee_task.task_name}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">
                    {employee_task.deadline}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {getStatusBadge(employee_task.status)}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Button
                      variant="default"
                      className="text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-1 text-sm"
                      onClick={() => handleViewDetails(employee_task)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Task Details Dialog - Unchanged */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Project Details
            </DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6 py-4">
              {/* Title */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="text-lg font-semibold text-gray-900">{selectedTask.task_name}</p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-gray-900 whitespace-pre-line">
                  {selectedTask.task_description || "No description provided"}
                </p>
              </div>

              {/* Start Date and Due Date with Dashed Line */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                    <p className="text-gray-900">{selectedTask.start_date || "Not specified"}</p>
                  </div>
                  <div className="flex-1 h-1 border-t-2 border-dashed border-gray-300 mx-4"></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                    <p className="text-gray-900">{selectedTask.deadline || "No deadline set"}</p>
                  </div>
                </div>
              </div>

              {/* Status Timeline - Unchanged */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusProgress(selectedTask.status).started ? 'bg-green-500' : 'bg-red-100'}`}>
                      {getStatusProgress(selectedTask.status).started ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Started</p>
                  </div>
                  <div className={`flex-1 h-1 ${getStatusProgress(selectedTask.status).progress ? 'bg-green-500' : 'border-t-2 border-dashed border-gray-300'} mx-2`}></div>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusProgress(selectedTask.status).progress ? 'bg-green-500' : 'bg-red-100'}`}>
                      {getStatusProgress(selectedTask.status).progress ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Progress</p>
                  </div>
                  <div className={`flex-1 h-1 ${getStatusProgress(selectedTask.status).completed ? 'bg-green-500' : 'border-t-2 border-dashed border-gray-300'} mx-2`}></div>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusProgress(selectedTask.status).completed ? 'bg-green-500' : 'bg-red-100'}`}>
                      {getStatusProgress(selectedTask.status).completed ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Completed</p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100 rounded-md px-4 py-2"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Task;