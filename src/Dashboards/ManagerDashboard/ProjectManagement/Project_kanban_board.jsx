import { Calendar, EllipsisVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const apiBaseUrl = process.env.VITE_BASE_API;

const COLUMNS = [
  {
    project_status: "not_started",
    title: "Upcoming Projects",
    percentage: "0%",
  },
  {
    project_status: "in_progress",
    title: "On-going Projects",
    percentage: "50%",
  },
  {
    project_status: "completed",
    title: "Completed Projects",
    percentage: "100%",
  },
];

const Project_kanban_board = ({
  projectList,
  sortConfig,
  handleSort,
  getSortIcon,
  onProjectUpdate, // New prop
}) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let sortedProjects = [...projectList];
    if (sortConfig.key) {
      sortedProjects.sort((a, b) => {
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
    }
    setProjects(sortedProjects);
  }, [projectList, sortConfig]);

  const moveProject = async (projectId, newProjectStatus, newPercentage) => {
    setProjects((prevProjects) =>
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
    try {
      await axios.put(`${apiBaseUrl}/update_project_status/`, {
        project_id: projectId,
        project_status: newProjectStatus,
      });
      // Notify parent component of the update
      onProjectUpdate(projectId, newProjectStatus, newPercentage);
    } catch (error) {
      console.error("Failed to update project status:", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 overflow-x-auto">
        {COLUMNS.map(({ project_status, title, percentage }) => (
          <ProjectColumn
            key={project_status}
            project_status={project_status}
            title={title}
            projects={projects.filter(
              (project) => project.project_status === project_status
            )}
            percentage={percentage}
            onMoveProject={moveProject}
            sortConfig={sortConfig}
            handleSort={handleSort}
            getSortIcon={getSortIcon}
          />
        ))}
      </div>
    </DndProvider>
  );
};

const ProjectColumn = ({
  project_status,
  title,
  projects,
  onMoveProject,
  percentage,
  sortConfig,
  handleSort,
  getSortIcon,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "PROJECT",
    drop: (item) => {
      onMoveProject(item.id, project_status, percentage);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <Card
      ref={drop}
      className={`min-w-[300px] w-full ${isOver ? "bg-gray-100" : ""}`}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
            {projects.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="hidden sm:block">
          <div className="grid grid-cols-3 gap-2 text-sm font-medium">
            <div
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Name {getSortIcon("name")}
            </div>
            <div
              className="cursor-pointer"
              onClick={() => handleSort("start_date")}
            >
              Start Date {getSortIcon("start_date")}
            </div>
            <div>Status</div>
          </div>
        </div>
        {projects.length === 0 && (
          <p className="text-center text-gray-500">No projects</p>
        )}
        <div className="hidden sm:block space-y-2">
          {projects.map((project) => (
            <ProjectCard key={project.project_id} project={project} />
          ))}
        </div>
        <div className="sm:hidden space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.project_id} project={project} mobile />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectCard = ({ project, mobile }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PROJECT",
    item: { id: project.project_id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getStatusBadge = () => {
    switch (project.project_status) {
      case "completed":
        return (
          <span className="bg-green-600 text-white px-3 py-1 rounded-md text-xs">
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="bg-orange-600 text-white px-3 py-1 rounded-md text-xs">
            In Progress
          </span>
        );
      case "not_started":
        return (
          <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs">
            Not Started
          </span>
        );
      default:
        return null;
    }
  };

  if (mobile) {
    return (
      <Card
        ref={drag}
        className={`cursor-grab border ${isDragging ? "opacity-50" : ""}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-xl">{project.name || "N/A"}</CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription>{project.project_id}</CardDescription>
          <CardDescription>Manager: {project.manager_name || project.project_manager || "N/A"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Description: {project.description || "N/A"}
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <CardDescription>
              Start
              <p className="flex items-center gap-2">
                <Calendar /> <span>{project.start_date || "N/A"}</span>
              </p>
            </CardDescription>
            <CardDescription>
              End
              <p className="flex items-center gap-2">
                <Calendar /> <span>{project.deadline || "N/A"}</span>
              </p>
            </CardDescription>
          </div>
        </CardFooter>
      </Card>
    );
  } else {
    return (
      <Card
        ref={drag}
        className={`cursor-grab border ${isDragging ? "opacity-50" : ""}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-xl">{project.name || "N/A"}</CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription>{project.project_id}</CardDescription>
          <CardDescription>Manager: {project.manager_name || project.project_manager || "N/A"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Description: {project.description || "N/A"}
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <CardDescription>
              Start
              <p className="flex items-center gap-2">
                <Calendar /> <span>{project.start_date || "N/A"}</span>
              </p>
            </CardDescription>
            <CardDescription>
              End
              <p className="flex items-center gap-2">
                <Calendar /> <span>{project.deadline || "N/A"}</span>
              </p>
              </CardDescription>
              <EllipsisVertical className="h-4 w-4 text-gray-500" />
            </div>
          </CardFooter>
        </Card>
      );
  }
};
export default Project_kanban_board;