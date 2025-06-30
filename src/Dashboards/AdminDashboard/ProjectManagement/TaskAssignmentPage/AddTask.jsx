import axios from "axios";
import React, { useState } from "react";
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

const AddTask = ({ open, setOpen, ProjectList, ManagerList, fetchTaskList }) => {
  const [TaskData, setTaskData] = useState({
    task_name: "",
    project_name: "",
    manager: "",
    priority: "",
    description: "",
    start_date: "",
    deadline: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!TaskData.task_name || !/^[A-Za-z0-9\s.,!?'-]+$/.test(TaskData.task_name)) {
      newErrors.task_name = "Task Name is required and should be valid.";
    }
    if (!TaskData.project_name) {
      newErrors.project_name = "Please select a project.";
    }
    if (!TaskData.priority) {
      newErrors.priority = "Please select a priority.";
    }
    if (!TaskData.description || !/^[A-Za-z0-9\s.,!?'-]+$/.test(TaskData.description)) {
      newErrors.description = "Description is required and should be valid.";
    }
    if (!TaskData.start_date) {
      newErrors.start_date = "Please select a start date.";
    } else if (TaskData.start_date < today) {
      newErrors.start_date = "Start Date cannot be in the past.";
    }
    if (!TaskData.deadline) {
      newErrors.deadline = "Please select a deadline.";
    } else if (TaskData.deadline < today) {
      newErrors.deadline = "Deadline cannot be in the past.";
    } else if (TaskData.deadline < TaskData.start_date) {
      newErrors.deadline = "Deadline cannot be before the start date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const HandleAddTask = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`${apiBaseUrl}/create-task/`, TaskData, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(data.message || "Task added successfully!");
      fetchTaskList();
      setOpen(false);
      setTaskData({
        task_name: "",
        project_name: "",
        manager: "",
        priority: "",
        description: "",
        start_date: "",
        deadline: "",
      });
    } catch (error) {
      toast.error("Failed to add task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Add Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={HandleAddTask} className="space-y-4">
          <div className="grid gap-4">
            {/* Project Selection */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">Project</Label>
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
                    {ProjectList.map((p) => (
                      <SelectItem key={p.project_id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_name && <p className="text-red-500 text-xs mt-1">{errors.project_name}</p>}
              </div>
            </div>

            {/* Task Name */}
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className="text-sm font-medium text-gray-600">Task Name</Label>
              <div className="col-span-2">
                <Input
                  type="text"
                  placeholder="Enter Task Name"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={TaskData.task_name}
                  onChange={(e) => setTaskData({ ...TaskData, task_name: e.target.value })}
                />
                {errors.task_name && <p className="text-red-500 text-xs mt-1">{errors.task_name}</p>}
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
              <Label className="text-sm font-medium text-gray-600">Start Date</Label>
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
              <Label className="text-sm font-medium text-gray-600">Deadline</Label>
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

export default AddTask;