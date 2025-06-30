import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const apiBaseUrl = process.env.VITE_BASE_API;

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/view-my-emptask/`);
        setTasks(response.data.tasks || []); // Ensure tasks is always an array
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch tasks. Please try again.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-2 mt-2">
      <div className="task flex justify-around bg-white shadow-md p-4 rounded-lg w-full">
        <div className="w-full">
          <p className="p-3 font-medium text-xl">My Task</p>
          {loading ? (
            <p>Loading tasks...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : tasks.length === 0 ? (
            <p>No tasks available.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="border-b border-black p-3 text-left font-normal text-base text-gray-500">
                    Tasks Name
                  </th>
                  <th className="border-b border-black p-3 text-left font-normal text-base text-gray-500">
                    Timeline
                  </th>
                  <th className="border-b border-black p-3 text-left font-normal text-base text-gray-500">
                    Status
                  </th>
                  <th className="border-b border-black p-3 text-left font-normal text-base text-gray-500">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((employee_task) => (
                  <tr key={employee_task.emptask_id}>
                    <td className="p-5 font-medium text-base">
                      {employee_task.task_name}
                    </td>
                    <td className="p-5 font-medium text-base">
                      {employee_task.deadline}
                    </td>
                    <td
                      className={`p-5 font-medium text-base ${employee_task.status}`}
                    >
                      &#x2022; {employee_task.status}
                    </td>
                    <td>
                      <button className="p-5 bg-blue-700 rounded pt-1 pr-3 pb-1 pl-3 text-white font-medium text-base hover:bg-blue-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Task;
