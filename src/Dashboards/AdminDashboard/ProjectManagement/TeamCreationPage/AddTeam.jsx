import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const apiBaseUrl = process.env.VITE_BASE_API;

const AddTeam = ({
  open,
  setOpen,
  ManagerList,
  EmployeeList,
  ProjectList,
  fetchTeamList,
}) => {
  const [TeamData, setTeamData] = useState({
    team_name: "",
    project_name: "",
    manager: "",
    team_leader: "",
    members: [],
    team_task: "",
    showMembersDropdown: false,
  });

  const [errors, setErrors] = useState({});

  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTeamData((prev) => ({
          ...prev,
          showMembersDropdown: false,
        }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!TeamData.team_name) newErrors.team_name = "Team Name is required";
    if (!TeamData.project_name)
      newErrors.project_name = "Project Name is required";
    if (!TeamData.team_leader)
      newErrors.team_leader = "Team Leader is required";
    if (TeamData.members.length === 0)
      newErrors.members = "At least one team member is required";
    if (!TeamData.team_task) newErrors.team_task = "Team Task is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const HandleAddTeam = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/create_team/`,
        TeamData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      setOpen(false);
      toast.success(response.data.message || "Team added successfully!");
      fetchTeamList();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to add team. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Add Team
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={HandleAddTeam} className="space-y-4">
          <div className="grid gap-4">
            {/* Team Name */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">
                Team Name
              </Label>
              <div className="col-span-2">
                <Input
                  type="text"
                  placeholder="Enter name"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={TeamData.team_name}
                  onChange={(e) =>
                    setTeamData({ ...TeamData, team_name: e.target.value })
                  }
                />
                {errors.team_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.team_name}
                  </p>
                )}
              </div>
            </div>

            {/* Project Name */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">
                Project Name
              </Label>
              <div className="col-span-2">
                <Select
                  value={TeamData.project_name}
                  onValueChange={(value) => {
                    const SelectProject = ProjectList.find(
                      (project) => project.name === value,
                    );
                    const SelectManager = ManagerList.find(
                      (manager) =>
                        manager.manager_id === SelectProject?.project_manager,
                    );
                    setTeamData({
                      ...TeamData,
                      project_name: SelectProject?.name || "",
                      manager: SelectManager?.manager_name || "",
                    });
                  }}
                >
                  <SelectTrigger className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {ProjectList.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.project_name}
                  </p>
                )}
              </div>
            </div>

            {/* Team Leader */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">
                Team Leader
              </Label>
              <div className="col-span-2">
                <Select
                  value={TeamData.team_leader}
                  onValueChange={(value) =>
                    setTeamData({ ...TeamData, team_leader: value })
                  }
                >
                  <SelectTrigger className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select Team Leader" />
                  </SelectTrigger>
                  <SelectContent>
                    {EmployeeList.map((employee) => (
                      <SelectItem
                        key={employee.employee_id}
                        value={employee.username}
                      >
                        {employee.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.team_leader && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.team_leader}
                  </p>
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="grid grid-cols-3 items-center gap-2 relative">
              <Label className="text-sm font-medium text-gray-600">
                Team Members
              </Label>
              <div className="col-span-2 relative" ref={dropdownRef}>
                <Button
                  type="button"
                  className="w-full bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-left py-2 px-3 min-h-[40px] flex items-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTeamData((prev) => ({
                      ...prev,
                      showMembersDropdown: !prev.showMembersDropdown,
                    }));
                  }}
                >
                  <div
                    className={`text-sm ${
                      TeamData.members.length > 0
                        ? "text-gray-800"
                        : "text-gray-400"
                    } max-h-20 overflow-y-auto text-left w-full`}
                  >
                    {TeamData.members.length > 0
                      ? TeamData.members.join(", ")
                      : "Select Members"}
                  </div>
                </Button>

                {TeamData.showMembersDropdown && (
                  <div className="absolute left-0 right-0 mt-2 w-full rounded-md bg-white shadow-lg border border-gray-300 z-50 max-h-60 overflow-y-auto">
                    <ul className="py-2">
                      {EmployeeList.map((employee) => {
                        const memberName = employee.username;
                        const isChecked = TeamData.members.includes(memberName);
                        return (
                          <li
                            key={employee.employee_id}
                            className="px-4 py-2 flex items-center hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()} // keeps dropdown open
                          >
                            <input
                              type="checkbox"
                              className="mr-2 w-4 h-4"
                              value={memberName}
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setTeamData((prevData) => {
                                  const updatedMembers = checked
                                    ? Array.from(
                                        new Set([
                                          ...prevData.members,
                                          memberName,
                                        ]),
                                      )
                                    : prevData.members.filter(
                                        (name) => name !== memberName,
                                      );
                                  return {
                                    ...prevData,
                                    members: updatedMembers,
                                  };
                                });
                              }}
                            />
                            <span className="text-sm">{memberName}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {errors.members && (
                  <p className="text-red-500 text-xs mt-1">{errors.members}</p>
                )}
              </div>
            </div>

            {/* Team Task */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">
                Team Task
              </Label>
              <div className="col-span-2">
                <Input
                  type="text"
                  placeholder="Enter Team Task"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={TeamData.team_task}
                  onChange={(e) =>
                    setTeamData({ ...TeamData, team_task: e.target.value })
                  }
                />
                {errors.team_task && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.team_task}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeam;
