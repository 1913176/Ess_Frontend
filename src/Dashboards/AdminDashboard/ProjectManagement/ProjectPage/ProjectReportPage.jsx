import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { List, Ellipsis } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { GetProjects } from "@/api/ServerAction";

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

const ProjectReportPage = () => {
  const queryClient = useQueryClient();
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

  const handleResetFilter = () => {
    setSearchTerm("");
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["projects"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetchingProjects ? (
        <SkeletonLoading />
      ) : isErrorProjects ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load project data. Please try again.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Project Report Summary</h5>
                <p className="text-gray-500 text-sm">Overview of project statistics</p>
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
                <h5 className="font-semibold text-lg">Project Report</h5>
              </div>
              <div className="mt-2 md:mt-0 flex gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
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
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
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
                      <TableCell>Status</TableCell>
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
                        <TableCell className="text-base">
                          {project.status === "completed" ? (
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          ) : project.status === "in_progress" ? (
                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                              In Progress
                            </span>
                          ) : project.status === "not_started" ? (
                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                              Not Started
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                              In Review
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectReportPage;