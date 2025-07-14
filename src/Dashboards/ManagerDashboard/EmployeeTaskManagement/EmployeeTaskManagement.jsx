import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import { Calendar, Clock, Plus, User, Users } from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
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
import { GetEachEmployeeTask } from "@/api/ServerAction";

// Fetch user info from localStorage and update on manager login
const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;
const getUserInfo = () => JSON.parse(sessionStorage.getItem("userdata"));

// Skeleton loading component for task loading state
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

// Main component for employee task management
const EmployeeTaskManagement = () => {
  const [managerTask, setManagerTask] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Fetch tasks assigned to the manager
  const fetchManagerTask = async () => {
    try {
      setIsLoading(true);
      const tasks = await GetEachEmployeeTask();
      setManagerTask(tasks);
      setIsError(false);
    } catch (error) {
      setIsError(true);
      toast.error("Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerTask();
  }, []);

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isLoading ? (
        <SkeletonLoading />
      ) : isError ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load task data. Please try again.
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h5 className="font-semibold text-lg">Employee Tasks</h5>
              <p className="text-gray-500 text-sm">Manage and track team tasks</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center mt-2 md:mt-0"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign Task to Team</DialogTitle>
                </DialogHeader>
                <AddTaskToTeamMember fetchManagerTask={fetchManagerTask} />
              </DialogContent>
            </Dialog>
          </div>
          <Board managerTask={managerTask} />
        </div>
      )}
    </div>
  );
};

// Task status columns configuration
const COLUMNS = [
  { emp_taskstatus: "not started", title: "Not Started", percentage: "0%", color: "bg-blue-600" },
  { emp_taskstatus: "in progress", title: "In Progress", percentage: "50%", color: "bg-yellow-500" },
  { emp_taskstatus: "in review", title: "Review", percentage: "80%", color: "bg-orange-500" },
  { emp_taskstatus: "completed", title: "Completed", percentage: "100%", color: "bg-green-600" },
];

// Kanban board component for task organization
const Board = ({ managerTask }) => {
  const [tasks, setTasks] = useState(managerTask);

  useEffect(() => {
    setTasks(managerTask);
  }, [managerTask]);

  // Update task status and percentage
  const moveTask = async (taskId, newStatus, newPercentage) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, emp_taskstatus: newStatus, percentage: newPercentage }
          : task
      )
    );
    try {
      await axios.put(`${apiBaseUrl}/update_employeetaskstatus/`, {
        emptask_id: taskId,
        emp_taskstatus: newStatus,
      });
      toast.success("Task status updated successfully.");
    } catch (error) {
      toast.error("Failed to update task status.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-1 gap-3 overflow-x-auto p-4">
        {COLUMNS.map(({ emp_taskstatus, title, percentage, color }) => (
          <Column
            key={emp_taskstatus}
            status={emp_taskstatus}
            title={title}
            tasks={tasks.filter((task) => task.emp_taskstatus === emp_taskstatus)}
            percentage={percentage}
            color={color}
            onMoveTask={moveTask}
          />
        ))}
      </div>
    </DndProvider>
  );
};

// Column component for each task status
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

// Task card component for draggable tasks
const TaskCard = ({ task }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id },
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
          <CardTitle className="text-base">{task.task_name}</CardTitle>
          <Badge className={`${statusColors[task.emp_taskstatus]} rounded-full capitalize`}>
            {task.emp_taskstatus}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex flex-col items-start space-y-2">
        <div className="flex justify-between w-full text-sm">
          <CardDescription className="flex gap-1 items-center capitalize">
            <User className="h-4" /> {task.assigned_to}
          </CardDescription>
          <CardDescription className="flex gap-1 items-center">
            <Calendar className="h-4" /> {task.deadline}
          </CardDescription>
        </div>
        <div className="flex gap-2 items-center w-full">
          <span className="text-sm font-medium">Story:</span>
          <CardDescription className="truncate">{task.task_description}</CardDescription>
        </div>
      </CardFooter>
    </Card>
  );
};

// Task details view component
const ViewTask = ({ task }) => {
  // State to hold current manager info
  const [userInfo, setUserInfo] = useState(getUserInfo());

  // Update userInfo when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUserInfo(getUserInfo());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{task.task_name}</h1>
      <p className="text-muted-foreground">
        Review and manage the task: {task.task_name}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex gap-2 items-center">
          <Users className="h-5" />
          <div className="flex flex-col">
            <p className="text-sm">Manager</p>
            <p className="text-sm font-semibold">{userInfo.manager_name}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Calendar className="h-5" />
          <div className="flex flex-col">
            <p className="text-sm">Project</p>
            <p className="text-sm font-semibold">{task.team_project_name}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Users className="h-5" />
          <div className="flex flex-col">
            <p className="text-sm">Team</p>
            <p className="text-sm font-semibold">{task.team_name}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Calendar className="h-5" />
          <div className="flex flex-col">
            <p className="text-sm">Due Date</p>
            <p className="text-sm font-semibold">{task.deadline}</p>
          </div>
        </div>
      </div>
      <p>
        Description:{" "}
        <span className="text-muted-foreground">{task.task_description}</span>
      </p>
      <DialogClose asChild>
        <Button className="bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-full">
          Close
        </Button>
      </DialogClose>
    </div>
  );
};

// Task assignment form component
const AddTaskToTeamMember = ({ fetchManagerTask }) => {
  const [teamData, setTeamData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      task_id: "",
      task_name: "",
      task_description: "",
      deadline: "",
      team_name: "",
      team_members: "",
    },
  });

  // Fetch available teams
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setIsLoadingTeams(true);
        const { data } = await axios.get(`${apiBaseUrl}/view-my-teams/`);
        setTeamData(data.teams || []);
      } catch (error) {
        toast.error("Failed to load teams.");
      } finally {
        setIsLoadingTeams(false);
      }
    };
    fetchTeam();
  }, []);

  // Handle team selection
  const handleTeamSelect = (e) => {
    const teamName = e.target.value;
    const selected = teamData.find((team) => team.team_name === teamName);
    setSelectedTeam(selected || null);
    setProjectName(selected?.project_name || "");
    setValue("team_name", teamName);
    setValue("team_members", "");
  };

  // Submit task assignment
  const onSubmit = async (data) => {
    if (!data.team_members) {
      toast.error("Please select a team member.");
      return;
    }

    const userInfo = getUserInfo();
    const payload = {
      task_id: data.task_id,
      team_name: data.team_name,
      manager_id: userInfo.manager_id,
      project_name: projectName,
      team_members: data.team_members,
      task_name: data.task_name,
      task_description: data.task_description,
      deadline: data.deadline,
    };

    try {
      const response = await axios.post(`${apiBaseUrl}/assign-task/`, payload);
      if (response.data.success === false) {
        toast.error(response.data.message || "Failed to assign task.");
        return;
      }
      toast.success("Task assigned successfully.");
      fetchManagerTask();
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign task.");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {isLoadingTeams ? (
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-2">
            <label className="text-sm font-medium">Task ID</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              placeholder="Enter task ID"
              {...register("task_id", {
                required: "Task ID is required",
              })}
            />
            {errors.task_id && (
              <p className="text-red-500 text-sm col-span-3">{errors.task_id.message}</p>
            )}
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <label className="text-sm font-medium">Task Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              placeholder="Enter task name"
              {...register("task_name", {
                required: "Task name is required",
                pattern: {
                  value: /^[a-zA-Z0-9_ ]+$/,
                  message: "Invalid task name",
                },
              })}
            />
            {errors.task_name && (
              <p className="text-red-500 text-sm col-span-3">{errors.task_name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <label className="text-sm font-medium">Task Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              placeholder="Enter task description"
              {...register("task_description", {
                required: "Description is required",
              })}
            />
            {errors.task_description && (
              <p className="text-red-500 text-sm col-span-3">{errors.task_description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <label className="text-sm font-medium">Task Deadline</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              {...register("deadline", {
                required: "Deadline is required",
              })}
            />
            {errors.deadline && (
              <p className="text-red-500 text-sm col-span-3">{errors.deadline.message}</p>
            )}
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <label className="text-sm font-medium">Select Team</label>
            <select
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              {...register("team_name", {
                required: "Team is required",
              })}
              onChange={handleTeamSelect}
            >
              <option value="" disabled>Select Team</option>
              {teamData.map((team) => (
                <option key={team.team_id} value={team.team_name}>
                  {team.team_name}
                </option>
              ))}
            </select>
            {errors.team_name && (
              <p className="text-red-500 text-sm col-span-3">{errors.team_name.message}</p>
            )}
          </div>
          {selectedTeam && selectedTeam.members?.length > 0 ? (
            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-sm font-medium">Select Team Member</label>
              <select
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                {...register("team_members", {
                  required: "Team member is required",
                })}
              >
                <option value="" disabled>Select Team Member</option>
                {selectedTeam.members.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
              {errors.team_members && (
                <p className="text-red-500 text-sm col-span-3">{errors.team_members.message}</p>
              )}
            </div>
          ) : selectedTeam ? (
            <p className="text-gray-500 text-sm col-span-3">No team members available for this team.</p>
          ) : null}
        </div>
      )}
      <div className="flex justify-end gap-4 mt-8">
        <DialogClose asChild>
          <Button
            type="button"
            className="bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-full"
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default EmployeeTaskManagement;