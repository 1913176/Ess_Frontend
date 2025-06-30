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
import AddTeam from "./AddTeam";
import UpdateTeam from "./UpdateTeam";
import { GetAllTeams } from "@/api/ServerAction";

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

const TeamCreationPage = () => {
  const queryClient = useQueryClient();
  const [teamList, setTeamList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [addTeamPopup, setAddTeamPopup] = useState(false);
  const [updateTeamPopup, setUpdateTeamPopup] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: AllTeamList = { teams: [] }, isFetching, isError } = useQuery({
    queryKey: ["Teams"],
    queryFn: GetAllTeams,
    placeholderData: { teams: [] },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (AllTeamList?.teams) {
      setTeamList(
        AllTeamList.teams.map((team) => ({
          id: team.team_id,
          team_name: team.team_name,
          project_name: team.project_name,
          manager: team.manager,
          team_leader: team.team_leader,
          members: team.members,
          team_task: team.team_task,
        }))
      );
    }
  }, [AllTeamList]);

  const fetchManagerList = async () => {
    const { data } = await axios.get(`${apiBaseUrl}/api/manager_list/`);
    setManagerList(data || []);
  };

  const fetchEmployeeList = async () => {
    const { data } = await axios.get(`${apiBaseUrl}/api/employee_list/`);
    setEmployeeList(data || []);
  };

  const fetchProjectList = async () => {
    const { data } = await axios.get(`${apiBaseUrl}/projects/`);
    setProjectList(data.projects || []);
  };

  useEffect(() => {
    fetchManagerList();
    fetchEmployeeList();
    fetchProjectList();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = [...teamList];
    if (searchTerm) {
      filtered = filtered.filter(
        (team) =>
          team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.manager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.team_leader?.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, sortConfig, teamList]);

  const calculateSummaryStats = () => {
    const totalTeams = teamList.length;
    const projectsInvolved = new Set(teamList.map((t) => t.project_name)).size;
    const managersInvolved = new Set(teamList.map((t) => t.manager)).size;
    const totalMembers = teamList.reduce((sum, team) => sum + (team.members?.length || 0), 0);
    return { totalTeams, projectsInvolved, managersInvolved, totalMembers };
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

  const handleEdit = (team) => {
    setSelectedTeam(team.id);
    setUpdateTeamPopup(true);
  };

  const handleDelete = async (team) => {
    if (!window.confirm(`Are you sure you want to delete Team ID ${team.id}?`)) {
      return;
    }
    try {
      await axios.delete(`${apiBaseUrl}/delete_team/${team.id}/`);
      toast.success(`Team ID ${team.id} deleted successfully.`);
      queryClient.invalidateQueries(["Teams"]);
    } catch (error) {
      toast.error("Failed to delete Team. Please try again.");
    }
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setShowFilters(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["Teams"]);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      {isFetching ? (
        <SkeletonLoading />
      ) : isError ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load team data. Please try again.
        </Alert>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between p-4">
              <div>
                <h5 className="font-semibold text-lg mb-1">Team Summary</h5>
                <p className="text-gray-500 text-sm">Overview of team details</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 border-t min-w-full" style={{ minWidth: "600px" }}>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Total Teams</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalTeams}
                    <span className="text-xs font-normal bg-blue-500 text-white px-2 py-1 rounded-full ml-1">
                      Teams
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Projects Involved</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.projectsInvolved}
                    <span className="text-xs font-normal bg-yellow-500 text-white px-2 py-1 rounded-full ml-1">
                      Projects
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center border-r">
                  <p className="text-gray-500 text-sm">Managers Involved</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.managersInvolved}
                    <span className="text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                      Managers
                    </span>
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">Total Members</p>
                  <p className="text-xl sm:text-2xl font-semibold">
                    {stats.totalMembers}
                    <span className="text-xs font-normal bg-orange-500 text-white px-2 py-1 rounded-full ml-1">
                      Members
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h5 className="font-semibold text-lg">Team Records</h5>
              </div>
              <div className="mt-2 md:mt-0 flex gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  onClick={() => setAddTeamPopup(true)}
                  className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Add Team
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
                      placeholder="Search by team, project, manager, or leader"
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
            {teamList.length === 0 ? (
              <p className="text-center text-gray-500 my-4">
                No team records available.
              </p>
            ) : filteredData.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                <p>No team records found.</p>
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
                      <TableCell onClick={() => handleSort("team_name")} className="cursor-pointer">
                        Team Name {getSortIcon("team_name")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("project_name")} className="cursor-pointer">
                        Project {getSortIcon("project_name")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("manager")} className="cursor-pointer">
                        Manager {getSortIcon("manager")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("team_leader")} className="cursor-pointer">
                        Team Leader {getSortIcon("team_leader")}
                      </TableCell>
                      <TableCell>Members</TableCell>
                      <TableCell>Task</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium text-sm">{team.id}</TableCell>
                        <TableCell className="text-base">{team.team_name}</TableCell>
                        <TableCell className="text-base">{team.project_name}</TableCell>
                        <TableCell className="text-base">{team.manager}</TableCell>
                        <TableCell className="text-base">{team.team_leader}</TableCell>
                        <TableCell className="text-base">{team.members.join(", ")}</TableCell>
                        <TableCell className="text-base">{team.team_task}</TableCell>
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
                                        Team Details
                                      </SheetTitle>
                                    </SheetHeader>
                                    <div className="grid space-y-4 mt-6">
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Team ID</div>
                                        <div className="col-span-2">{team.id}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Team Name</div>
                                        <div className="col-span-2">{team.team_name}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Project</div>
                                        <div className="col-span-2">{team.project_name}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Manager</div>
                                        <div className="col-span-2">{team.manager}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Team Leader</div>
                                        <div className="col-span-2">{team.team_leader}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Members</div>
                                        <div className="col-span-2">{team.members.join(", ")}</div>
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="col-span-1 text-gray-600">Task</div>
                                        <div className="col-span-2">
                                          <SheetDescription>{team.team_task}</SheetDescription>
                                        </div>
                                      </div>
                                    </div>
                                  </SheetContent>
                                </Sheet>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(team)}>
                                <Edit className="mr-2 w-4 h-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(team)}>
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
          {addTeamPopup && (
            <AddTeam
              open={addTeamPopup}
              setOpen={setAddTeamPopup}
              ManagerList={managerList}
              EmployeeList={employeeList}
              ProjectList={projectList}
              fetchTeamList={() => queryClient.invalidateQueries(["Teams"])}
            />
          )}
          {updateTeamPopup && (
            <UpdateTeam
              open={updateTeamPopup}
              setOpen={setUpdateTeamPopup}
              teamId={selectedTeam}
              ManagerList={managerList}
              EmployeeList={employeeList}
              ProjectList={projectList}
              fetchTeamList={() => queryClient.invalidateQueries(["Teams"])}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TeamCreationPage;