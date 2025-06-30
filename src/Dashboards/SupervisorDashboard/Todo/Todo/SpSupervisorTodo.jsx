import React, { useState, useEffect } from "react";
import axios from "axios";
// import rectangleIcon from "./../../../assets/Images/Rectangle 6469 (3).png";
// import groupIcon from "./../../../assets/Images/Group 427318907 (5).png";
// import group1Icon from "./../../../assets/Images/Group 427318909 (2).png";

const apiBaseUrl = process.env.VITE_BASE_API;

const SpSupervisorTodo = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState("");

  // Fetch todos from the backend API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/todos/`);
        setTodos(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch todos. Please try again later.");
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // Handle creating a new todo
  const handleCreateTodo = async () => {
    if (!newTodo.trim()) {
      setError("Todo title cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/todos/create/`, {
        title: newTodo,
        description: "New task description",
        completed: false,
      });

      // Update the todo list with the newly created todo
      setTodos((prevTodos) => [...prevTodos, response.data.data]);
      setNewTodo("");
      setError(null); // Clear any errors
    } catch (err) {
      setError("Failed to create todo. Please try again.");
    }
  };

  // Handle toggling a todo's completed status
  const handleToggleTodo = async (id) => {
    try {
      const response = await axios.patch(`${apiBaseUrl}/todos/toggle/${id}/`);

      // Update the todo list with the toggled item
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? response.data.data : todo)),
      );
      setError(null); // Clear any errors
    } catch (err) {
      setError("Failed to toggle todo status. Please try again.");
    }
  };

  // Handle deleting a todo
  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/todos/delete/${id}/`);

      // Update the todo list after deleting the item
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      setError(null); // Clear any errors
    } catch (err) {
      setError("Failed to delete todo. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-2">
      <div className="bg-white mt-10 p-5 rounded-lg">
        <div className="border-r-4 border-blue-700">
          <p className="font-medium text-lg leading-6">To-do list</p>

          {/* Add new todo input */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              className="border rounded-lg p-2 flex-grow"
              placeholder="Enter a new task"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white p-2 rounded-lg"
              onClick={handleCreateTodo}
            >
              Add Task
            </button>
          </div>

          {/* List of todos */}
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex gap-5 p-4 border-b gray-300 items-center"
            >
              {/* <img src={groupIcon} alt="icon" /> */}
              <img
                // src={todo.completed ? rectangleIcon : group1Icon}
                alt="status icon"
                onClick={() => handleToggleTodo(todo.id)} // Call toggle function on click
                className="cursor-pointer"
              />
              <p
                className={`font-light text-sm leading-5 ${
                  todo.completed ? "text-gray-400 line-through" : ""
                }`}
              >
                {todo.title}
              </p>
              <button
                className="bg-red-500 text-white p-2 rounded-lg"
                onClick={() => handleDeleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SpSupervisorTodo;
