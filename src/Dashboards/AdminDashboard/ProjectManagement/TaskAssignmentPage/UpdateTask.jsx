import axios from "axios";
import React, { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateTask = ({ open, setOpen, taskId, ProjectList, ManagerList, fetchTaskList }) => {
  const [TaskData, setTaskData] = useState({
    task_name: "",
    project_name: "",
    manager: "",
    priority: "",
    description: "",
    status: "",
    start_date: "",
    deadline: "",
    task_id: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId) {
        toast.error("Task ID is missing. Please try again.");
        return;
      }

      try {
        const { data } = await axios.get(`${apiBaseUrl}/tasks/${taskId}/`);
        if (data.success && data.task) {
          setTaskData({
            task_name: data.task.task_name,
            project_name: data.task.project_name,
            manager: data.task.manager,
            priority: data.task.priority,
            description: data.task.description,
            status: data.task.status,
            start_date: data.task.start_date,
            deadline: data.task.deadline,
            task_id: data.task.task_id,
          });
        } else {
          throw new Error("Invalid task data received");
        }
      } catch (error) {
        toast.error("Failed to fetch task data.");
      }
    };
    fetchTaskData();
  }, [taskId]);

  const validateForm = () => {
    let tempErrors = {};
    if (!TaskData.task_name.trim()) tempErrors.task_name = "Task name is required.";
    if (!TaskData.project_name) tempErrors.project_name = "Project name is required.";
    if (!TaskData.priority) tempErrors.priority = "Priority is required.";
    if (!TaskData.description.trim()) tempErrors.description = "Description is required.";
    if (!TaskData.status) tempErrors.status = "Status is required.";
    if (!TaskData.start_date) tempErrors.start_date = "Start date is required.";
    if (!TaskData.deadline) tempErrors.deadline = "Deadline is required.";
    else if (TaskData.start_date && TaskData.deadline < TaskData.start_date) {
      tempErrors.deadline = "Deadline cannot be before start date.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const HandleUpdateTask = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.put(`${apiBaseUrl}/edit-task/${taskId}/`, TaskData, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(response.data.message || "Task updated successfully!");
      fetchTaskList();
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Update Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={HandleUpdateTask} className="space-y-4">
          <div className="grid gap-4">
            {/* Task Name */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">Task Name</Label>
              <div className="col-span-2">
                <Input
                  type="text"
                  placeholder="Enter name"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={TaskData.task_name}
                  onChange={(e) => setTaskData({ ...TaskData, task_name: e.target.value })}
                />
                {errors.task_name && <p className="text-red-500 text-xs mt-1">{errors.task_name}</p>}
              </div>
            </div>

            {/* Project Name */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">Project Name</Label>
              <div className="col-span-2">
                <Select
                  value={TaskData.project_name}
                  onValueChange={(value) => {
                    const selectedProject = ProjectList.find((project) => project.name === value);
                    const selectedManager = ManagerList.find(
                      (manager) => manager.manager_id === selectedProject?.project_manager
                    );
                    setTaskData({
                      ...TaskData,
                      project_name: selectedProject?.name || "",
                      manager: selectedManager?.id || "",
                    });
                  }}
                >
                  <SelectTrigger className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {ProjectList.map((project) => (
                      <SelectItem key={project.project_id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_name && <p className="text-red-500 text-xs mt-1">{errors.project_name}</p>}
              </div>
            </div>

            {/* Priority */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">Priority</Label>
              <div className="col-span-2">
                <Select
                  value={TaskData.priority}
                  onValueChange={(value) => setTaskData({ ...TaskData, priority: value })}
                >
                  <SelectTrigger className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High"].map((p) => (
                      <SelectItem key={p} value={p.toLowerCase()}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <div className="col-span-2">
                <Select
                  value={TaskData.status}
                  onValueChange={(value) => setTaskData({ ...TaskData, status: value })}
                >
                  <SelectTrigger className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Not Started", "In Progress", "In Review", "Completed"].map((s) => (
                      <SelectItem key={s} value={s.toLowerCase()}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">Description</Label>
              <div className="col-span-2">
                <Input
                  type="text"
                  placeholder="Enter Description"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={TaskData.description}
                  onChange={(e) => setTaskData({ ...TaskData, description: e.target.value })}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">Task Start Date</Label>
              <div className="col-span-2">
                <Input
                  type="date"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={TaskData.start_date}
                  onChange={(e) => setTaskData({ ...TaskData, start_date: e.target.value })}
                />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
              </div>
            </div>

            {/* Deadline */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">Task Deadline</Label>
              <div className="col-span-2">
                <Input
                  type="date"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={TaskData.deadline}
                  onChange={(e) => setTaskData({ ...TaskData, deadline: e.target.value })}
                />
                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
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
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-br from-purple-600 to-blue-500 text-white"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTask;