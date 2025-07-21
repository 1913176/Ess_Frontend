import React, { useState, useEffect } from "react";
import { ChartBarBig } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetProjects_status } from "@/api/ServerAction";
import Project_kanban_board from "./Project_kanban_board";
import { Button } from "@/components/ui/button";

const apiBaseUrl = process.env.VITE_BASE_API;

const SkeletonLoading = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="flex gap-4 overflow-x-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="min-w-[300px] bg-gray-200 rounded-lg animate-pulse p-4">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-20 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectManagement = () => {
  const queryClient = useQueryClient();

  //Query for projects
  const { data, isError, isFetching } = useQuery({
    queryKey: ["projects"],
    queryFn: GetProjects_status,
    placeholderData: [],
    staleTime: 1000,
  });

  const [projectList, setProjectList] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    if (data) {
      setProjectList(data);
      setFilteredProjects(data);
    }
  }, [data]);

  useEffect(() => {
    let filtered = [...projectList];
    if (searchTerm) {
      filtered = filtered.filter((project) =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
    }
    setFilteredProjects(filtered);
  }, [searchTerm, sortConfig, projectList]);

  const calculateSummaryStats = () => {
    const totalProjects = projectList.length;
    const completed = projectList.filter(
      (project) => project.project_status === "completed"
    ).length;
    const inProgress = projectList.filter(
      (project) => project.project_status === "in_progress"
    ).length;
    const notStarted = projectList.filter(
      (project) => project.project_status === "not_started"
    ).length;
    return { totalProjects, completed, inProgress, notStarted };
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
    setFilteredProjects(projectList);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["projects"]);
  };

  const handleProjectUpdate = (projectId, newProjectStatus, newPercentage) => {
    setProjectList((prevProjects) =>
      prevProjects.map((project) =>
        project.project_id === projectId
          ? {
              ...project,
              project_status: newProjectStatus,
              percentage: newPercentage,
            }
          : project
      )
    );
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetching ? (
        <SkeletonLoading />
      ) : isError ? (
        <p className="text-center text-red-500 my-4">
          Failed to load projects. Please try again.
        </p>
      ) : (
        <>
         <div className="bg-white rounded-lg shadow-sm mb-4">
  <div className="flex flex-col md:flex-row justify-between p-4">
    <div>
      <h5 className="font-semibold text-lg mb-1">Project Summary</h5>
      <p className="text-gray-500 text-sm">
        Overview of your projects
      </p>
    </div>
  </div>
  <div className="overflow-x-auto">
    <div
      className="grid grid-cols-4 border-t min-w-full"
      style={{ minWidth: "600px" }}
    >
      {/* Total Projects - unchanged position */}
      <div className="p-4 text-center border-r">
        <p className="text-gray-500 text-sm">Total Projects</p>
        <p className="text-xl sm:text-2xl font-semibold">
          {stats.totalProjects}
          <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
            Projects
          </span>
        </p>
      </div>
      {/* Not Started - moved to second position */}
      <div className="p-4 text-center border-r">
        <p className="text-gray-500 text-sm">Not Started</p>
        <p className="text-xl sm:text-2xl font-semibold">
          {stats.notStarted}
          <span className="text-xs font-normal bg-gray-500 text-white px-2 py-1 rounded-full ml-1">
            {Math.round(
              (stats.notStarted / (stats.totalProjects || 1)) * 100
            )}
            %
          </span>
        </p>
      </div>
      {/* In Progress - moved to third position */}
      <div className="p-4 text-center border-r">
        <p className="text-gray-500 text-sm">In Progress</p>
        <p className="text-xl sm:text-2xl font-semibold">
          {stats.inProgress}
          <span className="text-xs font-normal bg-orange-500 text-white px-2 py-1 rounded-full ml-1">
            {Math.round(
              (stats.inProgress / (stats.totalProjects || 1)) * 100
            )}
            %
          </span>
        </p>
      </div>
      {/* Completed - moved to fourth position */}
      <div className="p-4 text-center">
        <p className="text-gray-500 text-sm">Completed</p>
        <p className="text-xl sm:text-2xl font-semibold">
          {stats.completed}
          <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
            {Math.round(
              (stats.completed / (stats.totalProjects || 1)) * 100
            )}
            %
          </span>
        </p>
      </div>
    </div>
  </div>
</div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h5 className="font-semibold text-lg">Project Kanban Board</h5>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row gap-3"></div>
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
                  <input
                    type="text"
                    className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
                    placeholder="Search by project name"
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
                <button
                  onClick={handleRefresh}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                >
                  <i className="fas fa-sync-alt mr-2"></i> Refresh
                </button>
                <button
                  onClick={handleResetFilter}
                  className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
            {projectList.length === 0 ? (
              <p className="text-center text-gray-500 my-4">
                No projects available.
              </p>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                <p>No projects found.</p>
                <Button
                  onClick={handleResetFilter}
                  className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <Project_kanban_board
                projectList={filteredProjects}
                sortConfig={sortConfig}
                handleSort={handleSort}
                getSortIcon={getSortIcon}
                onProjectUpdate={handleProjectUpdate}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectManagement;