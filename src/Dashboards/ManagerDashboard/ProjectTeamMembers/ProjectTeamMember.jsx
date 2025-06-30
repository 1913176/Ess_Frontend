import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import React, { useState, useEffect } from "react";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const SkeletonLoading = () => {
  return (
    <div className="space-y-4">
      {/* Desktop Skeleton */}
      <div className="hidden sm:block space-y-4">
        <div className="flex justify-between items-center p-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="mt-6 space-y-3 p-4">
          <div className="grid grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-8 gap-4">
              {[...Array(8)].map((_, j) => (
                <div key={j} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Mobile Skeleton */}
      <div className="sm:hidden space-y-4 p-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-200 rounded-lg space-y-3 animate-pulse">
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-1">
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectTeamMember = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManager, setSelectedManager] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalTeams: 0,
    uniqueProjects: 0,
    uniqueManagers: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${apiBaseUrl}/view-my-teams/`);
        const teamData = data.teams || [];
        setTeams(teamData);
        setFilteredTeams(teamData);
        calculateSummaryStats(teamData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateSummaryStats = (teamData) => {
    const totalTeams = teamData.length;
    const uniqueProjects = new Set(teamData.map((team) => team.project_name)).size;
    const uniqueManagers = new Set(teamData.map((team) => team.manager)).size;
    setSummaryStats({ totalTeams, uniqueProjects, uniqueManagers });
  };

  useEffect(() => {
    let filtered = [...teams];
    if (searchTerm) {
      filtered = filtered.filter(
        (team) =>
          team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedManager !== "All") {
      filtered = filtered.filter((team) => team.manager === selectedManager);
    }
    setFilteredTeams(filtered);
    calculateSummaryStats(filtered);
  }, [searchTerm, selectedManager, teams]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedTeams = [...filteredTeams].sort((a, b) => {
      if (key === "sno") {
        return direction === "asc" ? a.index - b.index : b.index - a.index;
      }
      if (key === "team_id") {
        return direction === "asc"
          ? a.team_id - b.team_id
          : b.team_id - a.team_id;
      }
      if (key === "team_name" || key === "manager" || key === "team_leader" || key === "project_name") {
        const valueA = a[key] || "";
        const valueB = b[key] || "";
        return direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return 0;
    });
    setFilteredTeams(sortedTeams);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setSelectedManager("All");
    setFilteredTeams(teams);
    calculateSummaryStats(teams);
  };

  const managers = ["All", ...new Set(teams.map((team) => team.manager))];

  const getBadgeColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-red-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="p-2 sm:p-4">
      {/* Summary Card */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex flex-col md:flex-row justify-between p-4">
            <div>
              <h5 className="font-semibold text-lg mb-1">Team Summary</h5>
              <p className="text-gray-500 text-sm">Overview of your teams</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-3 border-t min-w-full" style={{ minWidth: "600px" }}>
              <div className="p-4 text-center border-r">
                <p className="text-gray-500 text-sm">Total Teams</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {summaryStats.totalTeams}
                  <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                    Teams
                  </span>
                </p>
              </div>
              <div className="p-4 text-center border-r">
                <p className="text-gray-500 text-sm">Unique Projects</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {summaryStats.uniqueProjects}
                  <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                    Projects
                  </span>
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">Unique Managers</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {summaryStats.uniqueManagers}
                  <span className="text-xs font-normal bg-purple-500 text-white px-2 py-1 rounded-full ml-1">
                    Managers
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Teams Card */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {loading ? (
          <SkeletonLoading />
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h5 className="font-semibold text-lg">My Teams</h5>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row gap-3"></div>
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
                  <input
                    type="text"
                    className="form-input rounded-full pl-3 pr-10 border-gray-300 w-full text-sm h-9"
                    placeholder="Search by team or project"
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
                <div className="relative">
                  <button
                    className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <i className="fas fa-filter mr-2"></i> Filter by Manager
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-2 right-0 bg-white rounded-lg shadow-xl p-4 w-72">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-purple-600">
                          <i className="far fa-user mr-2"></i>Manager Filter
                        </span>
                        <i
                          className="fas fa-times text-gray-500 cursor-pointer"
                          onClick={() => setIsDropdownOpen(false)}
                        ></i>
                      </div>
                      {managers.map((manager) => (
                        <div
                          key={manager}
                          className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                            selectedManager === manager ? "bg-gray-200 text-purple-600" : ""
                          }`}
                          onClick={() => {
                            setSelectedManager(manager);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <i className="far fa-user mr-2"></i>
                          {manager}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleResetFilter}
                  className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              {error && <p className="text-center text-red-500 my-4">{error}</p>}
              {!error && filteredTeams.length === 0 && (
                <p className="text-center text-gray-500 my-4">
                  No team data available for the selected criteria.
                </p>
              )}
              {!error && filteredTeams.length > 0 && (
                <div className="overflow-x-auto">
                  {/* Mobile View - Card Layout */}
                  <div className="sm:hidden space-y-4 py-2">
                    {filteredTeams.map((team, index) => (
                      <div
                        key={team.team_id || index}
                        className="bg-white border rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="font-medium">{team.team_name}</div>
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs inline-block w-20 text-center">
                              ID: {team.team_id}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Manager</p>
                            <p>{team.manager || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Team Leader</p>
                            <p>{team.team_leader || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Project</p>
                            <p>{team.project_name || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Task</p>
                            <p>{team.team_task || "N/A"}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-gray-500">Team Members</p>
                          <div className="flex flex-wrap gap-2">
                            {team.members?.map((member, i) => (
                              <Badge
                                key={member.name}
                                className={`${getBadgeColor(i)} text-white m-1 capitalize`}
                              >
                                {member.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop View - Table */}
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-200">
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("sno")}
                          >
                            S.No {getSortIcon("sno")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("team_id")}
                          >
                            ID {getSortIcon("team_id")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("team_name")}
                          >
                            Name {getSortIcon("team_name")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("manager")}
                          >
                            Manager {getSortIcon("manager")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("team_leader")}
                          >
                            Team Leader {getSortIcon("team_leader")}
                          </TableHead>
                          <TableHead
                            className="bg-gray-200 cursor-pointer"
                            onClick={() => handleSort("project_name")}
                          >
                            Project {getSortIcon("project_name")}
                          </TableHead>
                          <TableHead className="bg-gray-200">
                            Task
                          </TableHead>
                          <TableHead className="bg-gray-200">
                            Team Members
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeams.map((team, index) => (
                          <TableRow key={team.team_id || index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{team.team_id}</TableCell>
                            <TableCell>{team.team_name}</TableCell>
                            <TableCell>{team.manager || "N/A"}</TableCell>
                            <TableCell>{team.team_leader || "N/A"}</TableCell>
                            <TableCell>{team.project_name || "N/A"}</TableCell>
                            <TableCell>{team.team_task || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {team.members?.map((member, i) => (
                                  <Badge
                                    key={member.name}
                                    className={`${getBadgeColor(i)} text-white m-1 capitalize`}
                                  >
                                    {member.name}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
            {!error && filteredTeams.length > 0 && (
              <div className="flex justify-end items-center mt-4 flex-wrap">
                <div className="flex space-x-1">
                  <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">
                    Previous
                  </button>
                  <button className="px-3 py-1 border rounded text-sm bg-blue-500 text-white">
                    1
                  </button>
                  <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">
                    2
                  </button>
                  <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">
                    3
                  </button>
                  <button className="px-3 py-1 border rounded text-sm text-gray-500 hover:bg-gray-100">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectTeamMember;