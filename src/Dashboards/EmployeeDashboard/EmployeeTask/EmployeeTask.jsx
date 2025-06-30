import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "./Card";
import Card1 from "./Card1";
import Card2 from "./Card2";
import Card3 from "./Card3";
import TaskManagement from "./TaskManagement";
const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.withCredentials = true;

const EmployeeTask = () => {
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch tasks from the backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    setLoading(true);
    axios
      .get(`${apiBaseUrl}/assigned_task/`)
      .then((response) => {
        setTasks(response.data); // Assuming the backend returns tasks grouped by status
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      });
  };

  // Update task status
  const updateTaskStatus = (taskId, newStatus) => {
    axios
      .post(`${apiBaseUrl}/assigned_task/`, {
        task_id: taskId,
        status: newStatus,
      })
      .then((response) => {
        if (response.data.success) {
          console.log("Task status updated:", response.data.message);
          fetchTasks(); // Refresh tasks after updating
        } else {
          console.error("Error updating task:", response.data.error);
        }
      })
      .catch((error) => {
        console.error("Error updating task:", error);
      });
  };

  return (
    <div className="flex flex-wrap justify-around">
      <TaskManagement tasks={tasks} />
    </div>
  );
};

export default EmployeeTask;
