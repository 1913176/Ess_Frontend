import { Edit, Eye, Trash2, UserPlus, Ellipsis } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AddTask from "./AddTask";
import UpdateTask from "./UpdateTask";
import { GetManagerTask } from "@/api/ServerAction";

const apiBaseUrl = process.env.VITE_BASE_API;

const SkeletonLoading = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="bg-gray-200 rounded-lg animate-pulse p-4">
        <div className="h-8 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, j) => (
            <div key={j} className="h-12 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
   

 </div>
  );
};

const TaskAssignmentPage = () => {
  const queryClient = useQueryClient();
  const [projectList, setProjectList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [addTaskPopup, setAddTaskPopup] = useState(false);
  const [updateTaskPopup, setUpdateTaskPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: ManagerTaskList = { task: [] }, isFetching, isError } = useQuery({
    queryKey: ["ManagerTask"],
    queryFn: GetManagerTask,
    placeholderData: { task: [] },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const taskList = useMemo(() => {
    return ManagerTaskList.task.map((task) => ({
      id: task.task_id,
      task_name: task.task_name,
      project_name: task.project_name,
      manager: task.manager.manager_name,
      priority: task.priority,
      description: task.description,
      status: task.status,
      start_date: task.start_date,
      deadline: task.deadline,
    }));
  }, [ManagerTaskList]);

  const fetchProjectList = async () => {
    const { data } = await axios.get(`${apiBaseUrl}/projects/`);
    setProjectList(data.projects || []);
  };

  const fetchManagerList = async () => {
    const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
    setManagerList(data || []);
  };

  useEffect(() => {
    fetchProjectList();
    fetchManagerList();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = [...taskList];
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.task_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.manager?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
          ? valueA.toString().localeCompare(valueB.toString())
          : valueB.toString().localeCompare(valueA.toString());
      });
    }
    return filtered;
  }, [searchTerm, sortConfig, taskList]);

  const calculateSummaryStats = () => {
    const totalTasks = taskList.length;
    const inProgressTasks = taskList.filter((t) => t.status === "in progress").length;
    const completedTasks = taskList.filter((t) => t.status === "completed").length;
    const managersInvolved = new Set(taskList.map((t) => t.manager)).size;
    return { totalTasks, inProgressTasks, completedTasks, managersInvolved };
  };

  const stats = calculateSummaryStats();

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setUpdateTaskPopup(true);
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Are you sure you want to delete Task ID ${task.id}?`)) {
      return;
    }
    try {
      await axios.delete(`${apiBaseUrl}/delete_task/${task.id}/`);
      toast.success(`Task ID ${task.id} deleted successfully.`);
      queryClient.invalidateQueries(["ManagerTask"]);
    } catch (error) {
      toast.error("Failed to delete Task. Please try again.");
    }
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["ManagerTask"]);
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
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Task Summary</h5>
                <p className="text-gray-500 text-sm">Overview of task details</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 border-t min-w-full" style={{ minWidth: "600px" }}>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Total Tasks</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalTasks}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      Tasks
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">In Progress</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.inProgressTasks}
                    <span className="text-xs font-normal bg-yellow-500 text-white px-2 py-1 rounded-full ml-1">
                      Active
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Completed Tasks</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.completedTasks}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      Completed
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">Managers Involved</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.managersInvolved}
                    <span className="text-xs font-normal bg-orange-500 text-white px-2 py-1 rounded-full ml-1">
                      Managers
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h5 className="font-semibold text-lg">Task Records</h5>
              </div>
              <div className="mt-2 md:mt-0 flex gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  onClick={() => setAddTaskPopup(true)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Add Task
                </Button>
              </div>
            </div>
            {showFilters && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
                    <input
                      type="text"
                      className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
                      placeholder="Search by task, project, or manager"
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
                </div>
              </div>
            )}
            <div className="flex justify-end mb-4 gap-3">
              <Button
                onClick={handleRefresh}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh
              </Button>
              <Button
                onClick={handleResetFilter}
                className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                Reset
              </Button>
            </div>
            {taskList.length === 0 ? (
              <p className="text-center text-gray-500 my-4">
                No task records available.
              </p>
            ) : filteredData.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                <p>No task records found.</p>
                <Button
                  onClick={handleResetFilter}
                  className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="border rounded-md bg-white h-full">
                <Table className="table-auto">
                  <TableHeader>
                    <TableRow className="text-base bg-slate-100">
                      <TableCell onClick={() => handleSort("id")} className="cursor-pointer">
                        ID {getSortIcon("id")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("task_name")} className="cursor-pointer">
                        Task Name {getSortIcon("task_name")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("project_name")} className="cursor-pointer">
                        Project {getSortIcon("project_name")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("manager")} className="cursor-pointer">
                        Manager {getSortIcon("manager")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("priority")} className="cursor-pointer">
                        Priority {getSortIcon("priority")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("start_date")} className="cursor-pointer">
                        Start Date {getSortIcon("start_date")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("deadline")} className="cursor-pointer">
                        Deadline {getSortIcon("deadline")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("status")} className="cursor-pointer">
                        Status {getSortIcon("status")}
                      </TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium text-sm">{task.id}</TableCell>
                        <TableCell className="text-base">{task.task_name}</TableCell>
                        <TableCell className="text-base">{task.project_name}</TableCell>
                        <TableCell className="text-base">{task.manager}</TableCell>
                        <TableCell className="text-base">
                          {task.priority === "high" ? (
                            <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              High
                            </span>
                          ) : task.priority === "medium" ? (
                            <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                              Medium
                            </span>
                          ) : (
                            <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              Low
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-base">{task.start_date}</TableCell>
                        <TableCell className="text-base">{task.deadline}</TableCell>
                        <TableCell className="text-base">
                          {task.status === "in progress" ? (
                            <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                              Progress
                            </span>
                          ) : task.status === "in review" ? (
                            <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              Review
                            </span>
                          ) : task.status === "not started" ? (
                            <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              Not Started
                            </span>
                          ) : (
                            <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Ellipsis />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Sheet>
                                  <SheetTrigger asChild>
                                    <div className="flex items-center">
                                      <Eye className="mr-2 w-4 h-4" /> View
                                    </div>
                                  </SheetTrigger>
                                  <SheetContent className="bg-white rounded-lg shadow-sm p-6">
                                    <SheetHeader>
                                      <SheetTitle className="text-lg font-semibold text-gray-800">
                                        Task Details
                                      </SheetTitle>
                                    </SheetHeader>
                                    <div className="grid space-y-4 mt-6">
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Task ID</div>
                                        <div className="col-span-2">{task.id}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Task Name</div>
                                        <div className="col-span-2">{task.task_name}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Project</div>
                                        <div className="col-span-2">{task.project_name}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Manager</div>
                                        <div className="col-span-2">{task.manager}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Priority</div>
                                        <div className="col-span-2">
                                          {task.priority === "high" ? (
                                            <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                              High
                                            </span>
                                          ) : task.priority === "medium" ? (
                                            <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                              Medium
                                            </span>
                                          ) : (
                                            <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                              Low
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Time</div>
                                        <div className="col-span-2">
                                          {task.start_date} - {task.deadline}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Status</div>
                                        <div className="col-span-2">
                                          {task.status === "in progress" ? (
                                            <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                              Progress
                                            </span>
                                          ) : task.status === "in review" ? (
                                            <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                              Review
                                            </span>
                                          ) : task.status === "not started" ? (
                                            <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                              Not Started
                                            </span>
                                          ) : (
                                            <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                              Completed
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Description</div>
                                        <div className="col-span-2">
                                          <SheetDescription>{task.description}</SheetDescription>
                                        </div>
                                      </div>
                                    </div>
                                  </SheetContent>
                                </Sheet>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(task)}>
                                <Edit className="mr-2 w-4 h-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(task)}>
                                <Trash2 className="mr-2 w-4 h-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          {addTaskPopup && (
            <AddTask
              open={addTaskPopup}
              setOpen={setAddTaskPopup}
              ProjectList={projectList}
              ManagerList={managerList}
              fetchTaskList={() => queryClient.invalidateQueries(["ManagerTask"])}
            />
          )}
          {updateTaskPopup && (
            <UpdateTask
              open={updateTaskPopup}
              setOpen={setUpdateTaskPopup}
              taskId={selectedTask.id}
              ProjectList={projectList}
              ManagerList={managerList}
              fetchTaskList={() => queryClient.invalidateQueries(["ManagerTask"])}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TaskAssignmentPage;