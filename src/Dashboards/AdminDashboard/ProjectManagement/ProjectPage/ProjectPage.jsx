import {
  Edit,
  Eye,
  GanttChartIcon,
  Grid,
  List,
  Trash2,
  UserPlus,
  Ellipsis,
} from "lucide-react";
import React, { useState, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Kanban_board from "./Kanban_board";
import AddProject from "./AddProject";
import UpdateProject from "./UpdateProject";
import {
  GetEmployeeTasks,
  GetManagerTask,
  GetProjects,
  GetProjects_status,
} from "@/api/ServerAction";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";

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

const fetchManagerList = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
  return data || [];
};

const ProjectPage = () => {
  const queryClient = useQueryClient();
  const [addProjectPopup, setAddProjectPopup] = useState(false);
  const [updateProjectPopup, setUpdateProjectPopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: projects = [], isFetching: isFetchingProjects, isError: isErrorProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: GetProjects,
    placeholderData: { projects: [] },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: project_status = [], isFetching: isFetchingStatus } = useQuery({
    queryKey: ["projects-status"],
    queryFn: GetProjects_status,
    placeholderData: [],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: managerList = [], isFetching: isFetchingManagers } = useQuery({
    queryKey: ["managers"],
    queryFn: fetchManagerList,
    placeholderData: [],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: ManagerTaskList = { task: [] }, isFetching: isFetchingManagerTasks } = useQuery({
    queryKey: ["ManagerTask"],
    queryFn: GetManagerTask,
    placeholderData: { task: [] },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: EmployeeTaskList = [], isFetching: isFetchingEmployeeTasks } = useQuery({
    queryKey: ["EmployeeTask"],
    queryFn: GetEmployeeTasks,
    placeholderData: [],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredData = useMemo(() => {
    let filtered = [...(projects.projects || [])];
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.project_id?.toString().includes(searchTerm) ||
          project.project_manager?.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, sortConfig, projects]);

  const calculateSummaryStats = () => {
    const totalProjects = projects.projects?.length || 0;
    const activeProjects = projects.projects?.filter((p) => p.status === "in progress").length || 0;
    const completedProjects = projects.projects?.filter((p) => p.status === "completed").length || 0;
    const managersInvolved = new Set(projects.projects?.map((p) => p.project_manager)).size || 0;
    return { totalProjects, activeProjects, completedProjects, managersInvolved };
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

  const handleEdit = (project) => {
    setSelectedProject(project.project_id);
    setUpdateProjectPopup(true);
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Are you sure you want to delete Project ID ${project.project_id}?`)) {
      return;
    }
    try {
      await axios.delete(`${apiBaseUrl}/delete_project/${project.project_id}/`);
      toast.success(`Project ID ${project.project_id} deleted successfully.`);
      queryClient.invalidateQueries(["projects"]);
    } catch (error) {
      toast.error("Failed to delete Project. Please try again.");
    }
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["projects", "projects-status", "managers", "ManagerTask", "EmployeeTask"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {(isFetchingProjects || isFetchingStatus || isFetchingManagers || isFetchingManagerTasks || isFetchingEmployeeTasks) ? (
        <SkeletonLoading />
      ) : (isErrorProjects) ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load project data. Please try again.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Project Summary</h5>
                <p className="text-gray-500 text-sm">Overview of project details</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 border-t min-w-full" style={{ minWidth: "600px" }}>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Total Projects</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalProjects}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      Projects
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Active Projects</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.activeProjects}
                    <span className="text-xs font-normal bg-yellow-500 text-white px-2 py-1 rounded-full ml-1">
                      Active
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Completed Projects</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.completedProjects}
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
                <h5 className="font-semibold text-lg">Project Records</h5>
              </div>
              <div className="mt-2 md:mt-0 flex gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  onClick={() => setAddProjectPopup(true)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Add Project
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
                      placeholder="Search by name, ID, or manager"
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
            <Tabs defaultValue="list" className="min-h-full">
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
                <TabsList>
                  <TabsTrigger value="list"><List /></TabsTrigger>
                  <TabsTrigger value="kanban"><Grid /></TabsTrigger>
                  <TabsTrigger value="ganttchart"><GanttChartIcon /></TabsTrigger>
                </TabsList>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
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
              </div>
              <TabsContent value="list">
                {projects.projects?.length === 0 ? (
                  <p className="text-center text-gray-500 my-4">
                    No project records available.
                  </p>
                ) : filteredData.length === 0 ? (
                  <div className="text-center text-gray-500 my-4">
                    <p>No project records found.</p>
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
                          <TableCell onClick={() => handleSort("project_id")} className="cursor-pointer">
                            ID {getSortIcon("project_id")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("name")} className="cursor-pointer">
                            Name {getSortIcon("name")}
                          </TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell onClick={() => handleSort("start_date")} className="cursor-pointer">
                            Start Date {getSortIcon("start_date")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("deadline")} className="cursor-pointer">
                            Deadline {getSortIcon("deadline")}
                          </TableCell>
                          <TableCell onClick={() => handleSort("project_manager")} className="cursor-pointer">
                            Manager {getSortIcon("project_manager")}
                          </TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((project) => (
                          <TableRow key={project.project_id}>
                            <TableCell className="font-medium text-sm">
                              {project.project_id}
                            </TableCell>
                            <TableCell className="text-base">
                              {project.name}
                            </TableCell>
                            <TableCell className="text-base">
                              {project.description}
                            </TableCell>
                            <TableCell className="text-base">
                              {project.start_date}
                            </TableCell>
                            <TableCell className="text-base">
                              {project.deadline}
                            </TableCell>
                            <TableCell className="text-base">
                              {project.project_manager}
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
                                            Project Details
                                          </SheetTitle>
                                        </SheetHeader>
                                        <div className="grid space-y-4 mt-6">
                                          <div className="grid grid-cols-3 items-center gap-4">
                                            <div className="col-span-1 text-gray-600">Project ID</div>
                                            <div className="col-span-2">{project.project_id}</div>
                                          </div>
                                          <div className="grid grid-cols-3 items-center gap-4">
                                            <div className="col-span-1 text-gray-600">Name</div>
                                            <div className="col-span-2">{project.name}</div>
                                          </div>
                                          <div className="grid grid-cols-3 items-center gap-4">
                                            <div className="col-span-1 text-gray-600">Due to</div>
                                            <div className="col-span-2">
                                              {project.start_date} - {project.deadline}
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-3 items-center gap-4">
                                            <div className="col-span-1 text-gray-600">Manager</div>
                                            <div className="col-span-2">{project.project_manager}</div>
                                          </div>
                                          <div className="grid grid-cols-3 items-center gap-4">
                                            <div className="col-span-1 text-gray-600">Description</div>
                                            <div className="col-span-2">
                                              <SheetDescription>{project.description}</SheetDescription>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="grid space-y-6 mt-8">
                                          <div>
                                            <SheetTitle className="text-lg font-semibold text-gray-800">
                                              Manager Task
                                            </SheetTitle>
                                            {ManagerTaskList.task?.length > 0 ? (
                                              ManagerTaskList.task
                                                .filter((t) => t.project_name === project.name)
                                                .map((task) => (
                                                  <div
                                                    key={task.id}
                                                    className="grid grid-cols-3 items-center gap-4 mt-4"
                                                  >
                                                    <div className="col-span-1">{task.task_name}</div>
                                                    <div className="col-span-1">{task.manager.manager_name}</div>
                                                    <div className="col-span-1">
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
                                                ))
                                            ) : (
                                              <div className="text-gray-600">
                                                No tasks assigned to this project manager.
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <SheetTitle className="text-lg font-semibold text-gray-800">
                                              Team Member Task
                                            </SheetTitle>
                                            {EmployeeTaskList.length > 0 ? (
                                              EmployeeTaskList.filter(
                                                (t) => t.team_project_name === project.name
                                              ).map((task) => (
                                                <div
                                                  key={task.emptask_id}
                                                  className="grid grid-cols-3 items-center gap-4 mt-4"
                                                >
                                                  <div className="col-span-1">{task.task_name}</div>
                                                  <div className="col-span-1">{task.assigned_to}</div>
                                                  <div className="col-span-1">
                                                    {task.emp_taskstatus === "in progress" ? (
                                                      <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                                        Progress
                                                      </span>
                                                    ) : task.emp_taskstatus === "in review" ? (
                                                      <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                                        Review
                                                      </span>
                                                    ) : task.emp_taskstatus === "not started" ? (
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
                                              ))
                                            ) : (
                                              <div className="text-gray-600">
                                                No tasks assigned to this project manager.
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </SheetContent>
                                    </Sheet>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(project)}>
                                    <Edit className="mr-2 w-4 h-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(project)}>
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
              </TabsContent>
              <TabsContent value="kanban">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <Kanban_board projectList={project_status} />
                </div>
              </TabsContent>
              <TabsContent value="ganttchart">
                <GanttChart projectList={filteredData} />
              </TabsContent>
            </Tabs>
          </div>
          {addProjectPopup && (
            <AddProject
              open={addProjectPopup}
              setOpen={setAddProjectPopup}
              ManagerList={managerList}
              fetchProjectList={() => queryClient.invalidateQueries(["projects"])}
            />
          )}
          {updateProjectPopup && (
            <UpdateProject
              open={updateProjectPopup}
              setOpen={setUpdateProjectPopup}
              projectId={selectedProject}
              ManagerList={managerList}
              fetchProjectList={() => queryClient.invalidateQueries(["projects"])}
            />
          )}
        </>
      )}
    </div>
  );
};

const GanttChart = ({ projectList }) => {
  const timelineRef = React.useRef(null);

  useEffect(() => {
    const items = new DataSet(
      projectList.map((project) => ({
        id: project.project_id,
        content: project.name,
        start: project.start_date,
        end: project.deadline,
        className: `project-color-${project.status}`,
      }))
    );

    const options = {
      stack: true,
      showCurrentTime: true,
      zoomMin: 1000 * 60 * 60 * 24 * 7,
      zoomMax: 1000 * 60 * 60 * 24 * 365,
      width: "100%",
      editable: false,
      margin: { item: 10, axis: 5 },
    };

    const timeline = new Timeline(timelineRef.current, items, options);

    return () => {
      timeline.destroy();
    };
  }, [projectList]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Gantt Chart</h2>
      <div ref={timelineRef} className="h-[400px]"></div>
    </div>
  );
};

export default ProjectPage;