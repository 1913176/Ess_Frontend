import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, User, Search, Filter, ArrowUpDown, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const apiBaseUrl = import.meta.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdDate");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    task_name: "",
    task_description: "",
    deadline: "",
    created_at: new Date().toISOString().split('T')[0],
    emp_taskstatus: "not started",
    category: "Web Layout",
    progress: 0
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${apiBaseUrl}/get_employeetasks/`);
        setTasks(data);
        setFilteredTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    let result = [...tasks];
    
    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter(task => task.emp_taskstatus?.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Apply search
    if (searchQuery) {
      result = result.filter(task => 
        task.task_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.task_description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "createdDate") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      } else {
        return new Date(a.deadline || 0) - new Date(b.deadline || 0);
      }
    });
    
    setFilteredTasks(result);
  }, [tasks, statusFilter, searchQuery, sortBy]);

  const completedTasks = tasks.filter(task => task.emp_taskstatus === "completed").length;
  const pendingTasks = tasks.filter(task => task.emp_taskstatus === "pending").length;
  const totalTasks = tasks.length;

  const moveTask = async (taskId, newStatus) => {
    try {
      await axios.put(`${apiBaseUrl}/update_employeetaskstatus/`, {
        emptask_id: taskId,
        emp_taskstatus: newStatus,
      });
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, emp_taskstatus: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleCreateTask = async () => {
    try {
      const { data } = await axios.post(`${apiBaseUrl}/create_employeetask/`, newTask);
      setTasks(prev => [data, ...prev]);
      setNewTask({
        task_name: "",
        task_description: "",
        deadline: "",
        created_at: new Date().toISOString().split('T')[0],
        emp_taskstatus: "not started",
        category: "Web Layout",
        progress: 0
      });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen ">Loading...</div>;
  }

  return (
    <div className=" bg-gray-100 w-screen h-screen p-9">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 ">Employee Task Management</h1>
        
        {/* Summary Cards */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center overflow-hidden">
                  <User className="h-4 w-4 text-white" />
                </div>
              ))}
              <div className="h-8 w-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white text-xs">
                +1
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 ml-auto">
            <div>
              <span className="text-gray-500">Total Tasks: </span>
              <span className="font-semibold">{totalTasks}</span>
            </div>
            <div>
              <span className="text-gray-500">Pending: </span>
              <span className="font-semibold">{pendingTasks}</span>
            </div>
            <div>
              <span className="text-gray-500">Completed: </span>
              <span className="font-semibold">{completedTasks}</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Tasks..."
              className="pl-10 pr-4 py-2 w-64 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div>
            <span className="font-medium mr-2">Status</span>
            <div className="inline-flex rounded-md overflow-hidden border">
              <button 
                className={`px-4 py-1 text-sm ${statusFilter === "All" ? "bg-gray-200" : "bg-white"}`}
                onClick={() => setStatusFilter("All")}
              >
                All
              </button>
              <button 
                className={`px-4 py-1 text-sm ${statusFilter === "not started" ? "bg-gray-200" : "bg-white"}`}
                onClick={() => setStatusFilter("not started")}
              >
                Not Started
              </button>
              <button 
                className={`px-4 py-1 text-sm ${statusFilter === "in progress" ? "bg-gray-200" : "bg-white"}`}
                onClick={() => setStatusFilter("in progress")}
              >
                In Progress
              </button>
              <button 
                className={`px-4 py-1 text-sm ${statusFilter === "in review" ? "bg-gray-200" : "bg-white"}`}
                onClick={() => setStatusFilter("in review")}
              >
                In Review
              </button>
              <button 
                className={`px-4 py-1 text-sm ${statusFilter === "completed" ? "bg-gray-200" : "bg-white"}`}
                onClick={() => setStatusFilter("completed")}
              >
                Completed
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 border rounded-md text-sm"
              onClick={() => setSortBy("createdDate")}
            >
              <Calendar className="h-4 w-4" />
              <span>Created Date</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 border rounded-md text-sm"
              onClick={() => setSortBy("deadline")}
            >
              <Calendar className="h-4 w-4" />
              <span>Due Date</span>
            </button>
          </div>
          {/* New Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className=" h-8 w-27 shadow-lg ml-auto">
            <Plus className="h-6 w-6" /> Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task_name">Task Name</Label>
              <Input
                id="task_name"
                name="task_name"
                value={newTask.task_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task_description">Description</Label>
              <Textarea
                id="task_description"
                name="task_description"
                value={newTask.task_description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="created_at">Created Date</Label>
                <Input
                  id="created_at"
                  name="created_at"
                  type="date"
                  value={newTask.created_at}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Due Date</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={newTask.deadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emp_taskstatus">Status</Label>
              <select
                id="emp_taskstatus"
                name="emp_taskstatus"
                className="w-full border rounded-md p-2"
                value={newTask.emp_taskstatus}
                onChange={handleInputChange}
              >
                <option value="not started">Not Started</option>
                <option value="in progress">In Progress</option>
                <option value="in review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
        
      </div>
      
      {/* Task Board */}
      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-4 overflow-x-auto pb-6">
          <Column
            status="not started"
            title="Not Started"
            tasks={filteredTasks.filter(task => task.emp_taskstatus === "not started")}
            color="purple"
            count={filteredTasks.filter(task => task.emp_taskstatus === "not started").length}
            onMoveTask={moveTask}
          />
          
          <Column
            status="in progress"
            title="In Progress"
            tasks={filteredTasks.filter(task => task.emp_taskstatus === "in progress")}
            color="blue"
            count={filteredTasks.filter(task => task.emp_taskstatus === "in progress").length}
            onMoveTask={moveTask}
          />
          
          <Column
            status="in review"
            title="In Review"
            tasks={filteredTasks.filter(task => task.emp_taskstatus === "in review")}
            color="amber"
            count={filteredTasks.filter(task => task.emp_taskstatus === "in review").length}
            onMoveTask={moveTask}
          />
          
          <Column
            status="completed"
            title="Completed"
            tasks={filteredTasks.filter(task => task.emp_taskstatus === "completed")}
            color="green"
            count={filteredTasks.filter(task => task.emp_taskstatus === "completed").length}
            onMoveTask={moveTask}
          />
        </div>
      </DndProvider>

      
    </div>
  );
};

const Column = ({ status, title, tasks, color, count, onMoveTask }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item) => onMoveTask(item.id, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const dotColors = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    green: "bg-green-500"
  };

  return (
    <div
      ref={drop}
      className={`w-full flex-1 min-w-[300px] rounded-lg bg-gray-50 ${
        isOver ? "opacity-70" : ""
      }`}
    >
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${dotColors[color]}`}></div>
          <h3 className="font-medium text-gray-700">{title}</h3>
        </div>
        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-md">
          {count}
        </span>
      </div>
      <div className="p-3 space-y-3 h-[calc(100vh-250px)] overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

const TaskCard = ({ task }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const statusColors = {
    "not started": "bg-gray-500",
    "in progress": "bg-blue-500",
    "in review": "bg-amber-500",
    "completed": "bg-green-500"
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <Card
      ref={drag}
      className={`cursor-grab ${isDragging ? "opacity-50" : "opacity-100"} bg-white shadow-sm hover:shadow-md transition-shadow`}
    >
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
        <div className="flex gap-2 items-center">
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
            {task.category || "Task"}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded text-white ${statusColors[task.emp_taskstatus || "not started"]}`}>
            {task.emp_taskstatus || "not started"}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-base mb-2">{task.task_name}</CardTitle>
        <CardDescription className="text-sm mb-4">
          {task.task_description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-6">
  <div className="text-sm text-gray-600 flex items-center justify-between w-full">
    <span className="whitespace-nowrap">Due: {formatDate(task.deadline)}</span>
    <div className="flex -space-x-2">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden">
          <User className="h-3 w-3 text-gray-600" />
        </div>
      ))}
    </div>
  </div>
</CardFooter>
    </Card>
  );
};

export default TaskManagement;