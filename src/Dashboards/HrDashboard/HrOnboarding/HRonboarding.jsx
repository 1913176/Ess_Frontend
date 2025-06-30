// import React, { useState, useEffect } from "react";
// import axios from "axios";
// // import "./style.css"; // You may still use your custom styles if needed

// const apiBaseUrl = process.env.VITE_BASE_API

// // Set Axios base URL
// axios.defaults.baseURL = `${apiBaseUrl}/api/onboarding-dashboard/`;

// const HRonboarding = () => {
//   const [tasks, setTasks] = useState([]);
//   const [error, setError] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     role: "",
//     status: "pre_joining",
//     progress: "week_joining",
//     task_percentage: 0,
//   });

//   // Fetching tasks from the backend
//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   // Fetch tasks from the API
//   const fetchTasks = async () => {
//     try {
//       const response = await axios.get(
//         `${apiBaseUrl}/api/onboarding-dashboard/`
//       );
//       setTasks(response.data);
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//       setError("Error fetching tasks. Please try again later.");
//     }
//   };

//   // Handling form input changes
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Handle the POST request when submitting new onboarding task
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Form Data:", formData);

//     // Validate form data before sending request
//     if (!formData.name || !formData.role || formData.task_percentage < 0) {
//       setError("Please fill in all fields with valid data.");
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${apiBaseUrl}/api/onboarding-dashboard/`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log("Response Data:", response.data);
//       setTasks([...tasks, response.data]);
//       setFormData({
//         name: "",
//         role: "",
//         status: "pre_joining",
//         progress: "week_joining",
//         task_percentage: 0,
//       });
//       setError(null); // Reset error after successful form submission
//     } catch (error) {
//       console.error("Error creating task:", error);
//       setError("Error creating task. Please try again later.");
//     }
//   };

//   // Handle row input changes (editing inline)
//   const handleRowChange = (e, index) => {
//     const { name, value } = e.target;
//     const updatedTasks = [...tasks];
//     updatedTasks[index][name] = value;
//     setTasks(updatedTasks);
//   };

//   // Handle submitting all updated tasks
//   const handleBatchSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         `${apiBaseUrl}/api/onboarding-dashboard/batch-create/`,
//         tasks,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log("Batch Response:", response.data);
//       setTasks(response.data);
//       setError(null);
//     } catch (error) {
//       console.error("Error submitting tasks:", error);
//       setError("Error submitting tasks. Please try again later.");
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-6">Onboarding Dashboard</h2>

//       {/* Error Message */}
//       {error && <p className="text-red-500">{error}</p>}

//       <form onSubmit={handleSubmit} className="mb-6">
//         {/* Form for adding new task */}
//         <div className="mb-4">
//           <label className="block text-sm font-semibold text-gray-700">
//             Name
//           </label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded-md"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-semibold text-gray-700">
//             Role
//           </label>
//           <input
//             type="text"
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded-md"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-semibold text-gray-700">
//             Status
//           </label>
//           <select
//             name="status"
//             value={formData.status}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded-md"
//           >
//             <option value="pre_joining">Pre Joining</option>
//             <option value="post_joining">Post Joining</option>
//           </select>
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-semibold text-gray-700">
//             Progress
//           </label>
//           <select
//             name="progress"
//             value={formData.progress}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded-md"
//           >
//             <option value="week_joining">Week Joining</option>
//             <option value="day_joining">Day Joining</option>
//             <option value="completed">Completed</option>
//           </select>
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-semibold text-gray-700">
//             Task Percentage
//           </label>
//           <input
//             type="number"
//             name="task_percentage"
//             value={formData.task_percentage}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded-md"
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
//         >
//           Add Task
//         </button>
//       </form>

//       <h3 className="text-xl font-semibold mb-4">Onboarding Tasks</h3>

//       {/* Input Table for Tasks */}
//       <form onSubmit={handleBatchSubmit}>
//         <table className="min-w-full table-auto border-collapse border border-gray-300">
//           <thead>
//             <tr>
//               <th className="px-4 py-2 border border-gray-300">Name</th>
//               <th className="px-4 py-2 border border-gray-300">Role</th>
//               <th className="px-4 py-2 border border-gray-300">Status</th>
//               <th className="px-4 py-2 border border-gray-300">Progress</th>
//               <th className="px-4 py-2 border border-gray-300">
//                 Task Percentage
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {tasks.map((task, index) => (
//               <tr key={task.id || index}>
//                 <td className="px-4 py-2 border border-gray-300">
//                   <input
//                     type="text"
//                     name="name"
//                     value={task.name}
//                     onChange={(e) => handleRowChange(e, index)}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   />
//                 </td>
//                 <td className="px-4 py-2 border border-gray-300">
//                   <input
//                     type="text"
//                     name="role"
//                     value={task.role}
//                     onChange={(e) => handleRowChange(e, index)}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   />
//                 </td>
//                 <td className="px-4 py-2 border border-gray-300">
//                   <select
//                     name="status"
//                     value={task.status}
//                     onChange={(e) => handleRowChange(e, index)}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   >
//                     <option value="pre_joining">Pre Joining</option>
//                     <option value="post_joining">Post Joining</option>
//                   </select>
//                 </td>
//                 <td className="px-4 py-2 border border-gray-300">
//                   <select
//                     name="progress"
//                     value={task.progress}
//                     onChange={(e) => handleRowChange(e, index)}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   >
//                     <option value="week_joining">Week Joining</option>
//                     <option value="day_joining">Day Joining</option>
//                     <option value="completed">Completed</option>
//                   </select>
//                 </td>
//                 <td className="px-4 py-2 border border-gray-300">
//                   <input
//                     type="number"
//                     name="task_percentage"
//                     value={task.task_percentage}
//                     onChange={(e) => handleRowChange(e, index)}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <button
//           type="submit"
//           className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4"
//         >
//           Submit All Tasks
//         </button>
//       </form>
//     </div>
//   );
// };

// export default HRonboarding;

import { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
} from "@mui/material";

const apiBaseUrl = process.env.VITE_BASE_API;
axios.defaults.baseURL = `${apiBaseUrl}/api/onboarding-dashboard/`;

const HRonboarding = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    status: "pre_joining",
    progress: "week_joining",
    task_percentage: 0,
  });
  const [openForm, setOpenForm] = useState(false);

  // Fetch tasks from the backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/onboarding-dashboard/`,
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Error fetching tasks. Please try again later.");
    }
  };

  // Handling form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle the POST request when submitting new onboarding task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role || formData.task_percentage < 0) {
      setError("Please fill in all fields with valid data.");
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/onboarding-dashboard/`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      setTasks([...tasks, response.data]);
      setFormData({
        name: "",
        role: "",
        status: "pre_joining",
        progress: "week_joining",
        task_percentage: 0,
      });
      setError(null); // Reset error after successful form submission
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Error creating task. Please try again later.");
    }
  };

  // Handle closing the modal form
  const handleCloseForm = () => {
    setOpenForm(false);
  };

  // Columns definition for DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Name", width: 180, editable: true },
    { field: "role", headerName: "Role", width: 180, editable: true },
    {
      field: "status",
      headerName: "Status",
      width: 180,
      editable: true,
      renderCell: (params) => (
        <Select
          value={params.value}
          onChange={(e) => {
            const updatedTasks = [...tasks];
            updatedTasks[params.rowIndex].status = e.target.value;
            setTasks(updatedTasks);
          }}
        >
          <MenuItem value="pre_joining">Pre Joining</MenuItem>
          <MenuItem value="post_joining">Post Joining</MenuItem>
        </Select>
      ),
    },
    {
      field: "progress",
      headerName: "Progress",
      width: 180,
      editable: true,
      renderCell: (params) => (
        <div className="flex w-full h-full">
          <select
            value={params.value}
            onChange={(e) => {
              const updatedTasks = [...tasks];
              updatedTasks[params.rowIndex].progress = e.target.value;
              setTasks(updatedTasks);
            }}
          >
            <option value="week_joining">Week Joining</option>
            <option value="day_joining">Day Joining</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      ),
    },
    {
      field: "task_percentage",
      headerName: "Task Percentage",
      width: 180,
      editable: true,
    },
  ];

  return (
    <div className="p-4 min-h-dvh">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Onboarding Dashboard</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenForm(true)}
          className="mb-6"
        >
          Onboard New Employee
        </Button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      <Modal open={openForm} onClose={handleCloseForm}>
        <Box
          sx={{
            width: 400,
            margin: "auto",
            padding: 2,
            backgroundColor: "white",
            borderRadius: 2,
          }}
        >
          <h3 className="text-xl font-semibold mb-4">Add New Task</h3>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="pre_joining">Pre Joining</MenuItem>
                <MenuItem value="post_joining">Post Joining</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Progress</InputLabel>
              <Select
                name="progress"
                value={formData.progress}
                onChange={handleChange}
              >
                <MenuItem value="week_joining">Week Joining</MenuItem>
                <MenuItem value="day_joining">Day Joining</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Task Percentage"
              name="task_percentage"
              type="number"
              value={formData.task_percentage}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <div className="flex justify-between">
              <Button
                onClick={handleCloseForm}
                variant="outlined"
                color="secondary"
              >
                Close
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Add Task
              </Button>
            </div>
          </form>
        </Box>
      </Modal>

      <div className="bg-white/50" style={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={tasks}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};

export default HRonboarding;
