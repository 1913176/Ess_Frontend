import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import { Calendar, Plus, User, Users } from "lucide-react";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { GetEachManagerTask } from "@/api/ServerAction";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const SkeletonLoading = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
};

const ManagerTaskManagement = () => {
  const queryClient = useQueryClient();
  const { data: tasks = [], isError, isFetching } = useQuery({
    queryKey: ["managerTasks"],
    queryFn: GetEachManagerTask,
    placeholderData: [],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });

  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let filtered = [...tasks];
    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.task_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTasks(filtered);
  }, [searchTerm, tasks]);

  const handleResetFilter = () => {
    setSearchTerm("");
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["managerTasks"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetching ? (
        <SkeletonLoading />
      ) : isError ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load task data. Please try again.
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">Manager Tasks</h5>
              <p className="text-gray-500 text-sm">Manage and track your tasks</p>
            </div>
            <div className="flex items-center gap-3 mt-2 md:mt-0">
              {/* Placeholder for Add Task button (commented out as not present in original) */}
              {/* <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <AddTaskForm fetchManagerTasks={fetchManagerTasks} />
                </DialogContent>
              </Dialog> */}
              <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
                <input
                  type="text"
                  className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
                  placeholder="Search by task name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Button
                onClick={handleResetFilter}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Reset
              </Button>
              <Button
                onClick={handleRefresh}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh
              </Button>
            </div>
          </div>
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 my-4">No tasks available.</p>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center text-gray-500 my-4">
              <p>No tasks found.</p>
              <Button
                onClick={handleResetFilter}
                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <Board tasks={filteredTasks} />
          )}
        </div>
      )}
    </div>
  );
};

const COLUMNS = [
  { status: "not started", title: "Not Started", percentage: "0%", color: "bg-blue-600" },
  { status: "in progress", title: "In Progress", percentage: "50%", color: "bg-yellow-500" },
  { status: "in review", title: "In Review", percentage: "80%", color: "bg-orange-500" },
  { status: "completed", title: "Completed", percentage: "100%", color: "bg-green-600" },
];

const Board = ({ tasks }) => {
  const [taskList, setTaskList] = useState(tasks);

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

  const moveTask = async (taskId, newStatus, newPercentage) => {
    setTaskList((prevTasks) =>
      prevTasks.map((task) =>
        task.task_id === taskId
          ? { ...task, status: newStatus, percentage: newPercentage }
          : task
      )
    );
    try {
      await axios.put(`${apiBaseUrl}/update_taskstatus/`, {
        task_id: taskId,
        status: newStatus,
      });
      toast.success("Task status updated successfully.");
    } catch (error) {
      toast.error("Failed to update task status.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-3 overflow-x-auto p-4">
        {COLUMNS.map(({ status, title, percentage, color }) => (
          <Column
            key={status}
            status={status}
            title={title}
            tasks={taskList.filter((task) => task.status === status)}
            percentage={percentage}
            color={color}
            onMoveTask={moveTask}
          />
        ))}
      </div>
    </DndProvider>
  );
};

const Column = ({ status, title, tasks, onMoveTask, percentage, color }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item) => {
      onMoveTask(item.id, status, percentage);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <Card className={`min-w-[300px] w-full shadow-md ${isOver ? "bg-gray-100" : ""}`} ref={drop}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {title}
          <Badge className={`${color} text-white`}>{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="flex flex-col gap-2">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500">No tasks in this column.</p>
            ) : (
              tasks.map((task) => (
                <Dialog key={task.task_id}>
                  <DialogTrigger asChild>
                    <div>
                      <TaskCard task={task} />
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <ViewTask task={task} />
                  </DialogContent>
                </Dialog>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const TaskCard = ({ task }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.task_id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const statusColors = {
    "not started": "bg-blue-600 text-blue-50",
    "in progress": "bg-yellow-500 text-yellow-900",
    "in review": "bg-orange-500 text-orange-50",
    "completed": "bg-green-600 text-green-50",
  };

  return (
    <Card
      ref={drag}
      className={`cursor-grab ${isDragging ? "opacity-50" : ""}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base truncate">{task.task_name || "Untitled Task"}</CardTitle>
          <Badge className={`${statusColors[task.status]} rounded-full capitalize`}>
            {task.status}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex flex-col items-start space-y-2">
        <div className="flex justify-between w-full text-sm">
          <CardDescription className="flex gap-1 items-center capitalize">
            <User className="h-4" /> {task.manager?.manager_name || "N/A"}
          </CardDescription>
          <CardDescription className="flex gap-1 items-center">
            <Calendar className="h-4" /> {task.deadline || "N/A"}
          </CardDescription>
        </div>
        <div className="flex gap-2 items-center w-full">
          <span className="text-sm font-medium">Description:</span>
          <CardDescription className="truncate">{task.description || "No description"}</CardDescription>
        </div>
      </CardFooter>
    </Card>
  );
};

const ViewTask = ({ task }) => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{task.task_name || "Untitled Task"}</h1>
      <p className="text-muted-foreground">
        Review and manage the task: {task.task_name || "task"}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex gap-2 items-center">
          <Users className="h-5" />
          <div className="flex flex-col">
            <p className="text-sm">Manager</p>
            <p className="text-sm font-semibold">{task.manager?.manager_name || "N/A"}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Calendar className="h-5" />
          <div className="flex flex-col">
            <p className="text-sm">Project</p>
            <p className="text-sm font-semibold">{task.project_name || "N/A"}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Calendar className="h-5" />
          <div className="flex flex-col">
            <p className="text-sm">Start Date</p>
            <p className="text-sm font-semibold">{task.start_date || "N/A"}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Calendar className="h-5" />
          <div className="flex flex-col">
            <p className="text-sm">Deadline</p>
            <p className="text-sm font-semibold">{task.deadline || "N/A"}</p>
          </div>
        </div>
      </div>
      <p>
        Description:{" "}
        <span className="text-muted-foreground">{task.description || "No description provided"}</span>
      </p>
      <DialogClose asChild>
        <Button className="bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-full">
          Close
        </Button>
      </DialogClose>
    </div>
  );
};

export default ManagerTaskManagement;