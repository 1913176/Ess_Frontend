import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateProject = ({
  open,
  setOpen,
  projectId,
  ManagerList,
  fetchProjectList,
}) => {
  const [ProjectData, setProjectData] = useState({
    name: "",
    description: "",
    start_date: "",
    deadline: "",
    project_manager: "",
    project_id: "",
  });

  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchProjectData = async () => {
      // if (!projectId) {
      //   console.error("Project ID is undefined");
      //   toast.error("Project ID is missing. Please try again.");
      //   return;
      // }
      try {
        const { data } = await axios.get(`${apiBaseUrl}/project/${projectId}/`);

        if (data.success && data.project) {
          // Ensure the data structure is correct
          setProjectData({
            project_id: data.project.project_id,
            name: data.project.name,
            description: data.project.description,
            start_date: data.project.start_date,
            deadline: data.project.deadline,
            project_manager: data.project.project_manager,
          });
        } else {
          throw new Error("Invalid project data received");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
        // toast.error("Failed to fetch project data.");
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    try {
      const formattedData = {
        ...ProjectData,
        start_date: new Date(ProjectData.start_date)
          .toISOString()
          .split("T")[0],
        deadline: new Date(ProjectData.deadline).toISOString().split("T")[0],
      };

      const formData = new FormData();
      for (const key in formattedData) {
        formData.append(key, formattedData[key]);
      }

      await axios.put(`${apiBaseUrl}/edit-project/${projectId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Project updated successfully.");
      fetchProjectList(); // Refresh the list
      setOpen(false);
    } catch (error) {
      console.error("Error updating Project:", error);
      toast.error("Failed to update Project.");
    }
  };

  return (
    <Dialog open={open} setOpen={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Project</DialogTitle>
        </DialogHeader>
        <form className="space-y-6 w-full" onSubmit={handleUpdateProject}>
          <div className="grid gap-6 w-full">
            <div className="space-y-4">
              <h2 className="font-medium text-gray-700">Project Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProjectData.name}
                    onChange={(e) =>
                      setProjectData({ ...ProjectData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    placeholder="Enter description"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProjectData.description}
                    onChange={(e) =>
                      setProjectData({
                        ...ProjectData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProjectData.start_date}
                    onChange={(e) =>
                      setProjectData({
                        ...ProjectData,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Deadline</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProjectData.deadline}
                    onChange={(e) =>
                      setProjectData({
                        ...ProjectData,
                        deadline: e.target.value,
                      })
                    }
                  />
                </div>

                {/* <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Project ID</label>
                  <input
                    type="text"
                    placeholder="Enter Project ID"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProjectData.project_id}
                    onChange={(e) =>
                      setProjectData({
                        ...ProjectData,
                        project_id: e.target.value,
                      })
                    }
                  />
                </div> */}

                <div className="grid grid-cols-3 items-center gap-2 w-full">
                  <label className="text-sm font-medium">Project Manager</label>
                  <select
                    id="project_manager"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    value={ProjectData.project_manager}
                    onChange={(e) =>
                      setProjectData({
                        ...ProjectData,
                        project_manager: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select Project Manager
                    </option>
                    {ManagerList.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.manager_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Update
                </button>
              </div>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProject;
