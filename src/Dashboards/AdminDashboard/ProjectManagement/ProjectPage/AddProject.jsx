import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;

const AddProject = ({ open, setOpen, ManagerList, fetchProjectList }) => {
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    start_date: "",
    deadline: "",
    project_manager: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!projectData.name.trim()) {
      newErrors.name = "Project name is required";
    } else if (!nameRegex.test(projectData.name)) {
      newErrors.name = "Project name should contain only alphabets";
    }

    if (!projectData.description.trim()) {
      newErrors.description = "Project description is required";
    }

    if (!projectData.start_date) {
      newErrors.start_date = "Start date is required";
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (projectData.start_date < today) {
        newErrors.start_date = "Start date cannot be in the past";
      }
    }

    if (!projectData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else if (
      projectData.start_date &&
      projectData.deadline <= projectData.start_date
    ) {
      newErrors.deadline = "Deadline must be after the start date";
    }

    if (!projectData.project_manager) {
      newErrors.project_manager = "Project manager is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      await axios.post(`${apiBaseUrl}/create-project/`, projectData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setOpen(false);
      fetchProjectList();
      toast.success("Project added successfully");
    } catch (error) {
      toast.error("Failed to add Project");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white rounded-lg shadow-sm p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Add Project</DialogTitle>
        </DialogHeader>
        <form className="space-y-6 w-full" onSubmit={handleAddProject}>
          <div className="grid gap-6 w-full">
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium text-gray-600">Name</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Enter project name"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={projectData.name}
                    onChange={(e) =>
                      setProjectData({ ...projectData, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium text-gray-600">Description</label>
                <div className="col-span-2">
                  <textarea
                    placeholder="Enter description"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={projectData.description}
                    onChange={(e) =>
                      setProjectData({ ...projectData, description: e.target.value })
                    }
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <div className="col-span-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={projectData.start_date}
                    onChange={(e) =>
                      setProjectData({ ...projectData, start_date: e.target.value })
                    }
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium text-gray-600">Deadline</label>
                <div className="col-span-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={projectData.deadline}
                    onChange={(e) =>
                      setProjectData({ ...projectData, deadline: e.target.value })
                    }
                  />
                  {errors.deadline && (
                    <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2 w-full">
                <label className="text-sm font-medium text-gray-600">Project Manager</label>
                <div className="col-span-2">
                  <select
                    id="project_manager"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={projectData.project_manager}
                    onChange={(e) =>
                      setProjectData({ ...projectData, project_manager: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select Project Manager
                    </option>
                    {ManagerList.map((manager) => (
                      <option
                        key={manager.manager_id}
                        value={manager.manager_id}
                      >
                        {manager.manager_name}
                      </option>
                    ))}
                  </select>
                  {errors.project_manager && (
                    <p className="text-red-500 text-xs mt-1">{errors.project_manager}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
  <div className="flex justify-end gap-4 mt-8">
    <DialogClose asChild>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        Cancel
      </button>
    </DialogClose>
    <button
      type="submit"
      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      Add Project
    </button>
  </div>
</DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProject;