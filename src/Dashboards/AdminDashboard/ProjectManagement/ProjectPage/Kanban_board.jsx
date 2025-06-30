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
import { Alert } from "@/components/ui/alert";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.VITE_BASE_API;

const COLUMNS = [
  {
    project_status: "not_started",
    title: "Upcoming Project",
    percentage: "0%",
  },
  {
    project_status: "in_progress",
    title: "On-going Project",
    percentage: "50%",
  },
  {
    project_status: "in review",
    title: "In-Review Project",
    percentage: "50%",
  },
  {
    project_status: "completed",
    title: "Completed Project",
    percentage: "100%",
  },
];

const SkeletonLoading = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
};

const Kanban_board = ({ projectList }) => {
  const [projects, setProjects] = useState(projectList);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setProjects(projectList);
  }, [projectList]);

  const moveProject = async (projectId, newProjectStatus, newPercentage) => {
    try {
      setIsLoading(true);
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
      await axios.put(`${apiBaseUrl}/update_project_status/`, {
        project_id: projectId,
        project_status: newProjectStatus,
      });
      toast.success("Project status updated successfully.");
    } catch (error) {
      setIsError(true);
      toast.error("Failed to update project status.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {isLoading ? (
        <SkeletonLoading />
      ) : isError ? (
        <Alert variant="destructive" className="text-center my-4">
          Failed to load Kanban board. Please try again.
        </Alert>
      ) : (
        <div className="w-full h-full overflow-x-auto flex gap-4 p-2">
          {COLUMNS.map(({ project_status, title, percentage }) => (
            <ProjectColumns
              key={project_status}
              project_status={project_status}
              title={title}
              projects={projects?.filter(
                (project) => project.project_status === project_status
              )}
              percentage={percentage}
              onMoveProject={moveProject}
            />
          ))}
        </div>
      )}
    </DndProvider>
  );
};

const ProjectColumns = ({
  project_status,
  title,
  projects,
  onMoveProject,
  percentage,
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
      className={`min-w-[300px] h-full w-full bg-white rounded-lg shadow-sm border border-gray-200 ${
        isOver ? "bg-gray-100" : ""
      }`}
    >
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex justify-between items-center text-lg font-semibold text-gray-800">
          <h3>{title}</h3>
          <span className="text-sm text-gray-500">{projects?.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full p-4">
        <div className="space-y-4">
          {projects?.length === 0 ? (
            <p className="text-center text-gray-500">No projects in this status.</p>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.project_id} project={project} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectCard = ({ project }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PROJECT",
    item: { id: project.project_id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Card
      ref={drag}
      className={`cursor-grab bg-white rounded-lg shadow-md border border-gray-200 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <CardHeader className="p-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="capitalize text-lg font-semibold text-gray-800">
            {project.name}
          </CardTitle>
          <div className="text-sm">
            {project.project_status === "completed" ? (
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full">
                Completed
              </span>
            ) : project.project_status === "in_progress" ? (
              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                In Progress
              </span>
            ) : project.project_status === "not_started" ? (
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                Not Started
              </span>
            ) : (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                In Review
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between w-full text-sm text-gray-600">
          <CardDescription className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{project.start_date}</span>
          </CardDescription>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{project.deadline}</span>
          </CardDescription>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Kanban_board;