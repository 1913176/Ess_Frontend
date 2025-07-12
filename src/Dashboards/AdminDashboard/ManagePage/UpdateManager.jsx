// // Same imports as before
// import axios from "axios";
// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// const apiBaseUrl = process.env.VITE_BASE_API;

// const UpdateManager = ({
//   open,
//   setOpen,
//   managerId,
//   ShiftList,
//   DepartmentList,
//   fetchManagerList,
// }) => {
//   const [ManagerData, setManagerData] = useState({
//     manager_name: "",
//     email: "",
//     gender: "",
//     dob: "",
//     manager_image: null,
//     manager_id: "",
//     username: "",
//     password: "",
//     department: "",
//     shift: "",
//     hired_date: "",
//   });

//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     const fetchManagerData = async () => {
//       if (!managerId) return;

//       try {
//         const { data } = await axios.get(
//           `${apiBaseUrl}/api/managers/get/${managerId}/`,
//         );
//         setManagerData({
//           manager_name: data.manager_name,
//           email: data.email,
//           gender: data.gender,
//           dob: data.dob,
//           manager_image: null,
//           manager_id: data.manager_id,
//           username: data.username,
//           password: "",
//           department: data.department,
//           shift: data.shift,
//           hired_date: data.hired_date,
//         });
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load manager data.");
//       }
//     };

//     fetchManagerData();
//   }, [managerId]);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!/^[A-Za-z\s]*$/.test(ManagerData.manager_name))
//       newErrors.manager_name = "Only letters allowed in name";

//     if (!/^[A-Za-z\s]*$/.test(ManagerData.username))
//       newErrors.username = "Only letters allowed in username";

//     const today = new Date().toISOString().split("T")[0];
//     if (ManagerData.dob > today)
//       newErrors.dob = "Date of Birth cannot be a future date";

//     if (ManagerData.hired_date > today)
//       newErrors.hired_date = "Hired Date cannot be a future date";

//     if (!ManagerData.password)
//       newErrors.password = "Password is required to update manager";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     const formData = new FormData();
//     Object.entries(ManagerData).forEach(([key, value]) => {
//       if (key === "manager_image" && !value) return;
//       if (key === "manager_id") return;
//       if (key === "password" && value === "") return;
//       formData.append(key, value);
//     });

//     try {
//       const res = await axios.put(
//         `${apiBaseUrl}/admin/managers/${managerId}/`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } },
//       );
//       toast.success("Manager updated successfully");
//       fetchManagerList();
//       setOpen(false);
//     } catch (error) {
//       const err = error?.response?.data;
//       if (err?.username) {
//         setErrors({ username: err.username });
//       } else if (err?.email) {
//         setErrors({ email: err.email });
//       } else if (err?.password) {
//         setErrors({ password: err.password });
//       } else {
//         toast.error("Failed to update manager.");
//       }
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Update Manager</DialogTitle>
//         </DialogHeader>
//         <form className="space-y-2" onSubmit={handleSubmit}>
//           {/* PERSONAL DETAILS */}
//           <div className="grid gap-2">
//             {/* Name */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>Name</label>
//               <div className="col-span-2">
//                 <input
//                   type="text"
//                   className="w-full border px-3 py-2 rounded"
//                   value={ManagerData.manager_name}
//                   onChange={(e) =>
//                     setManagerData({
//                       ...ManagerData,
//                       manager_name: e.target.value,
//                     })
//                   }
//                 />
//                 {errors.manager_name && (
//                   <p className="text-red-500 text-xs">{errors.manager_name}</p>
//                 )}
//               </div>
//             </div>

//             {/* Email */}
//             <div className="grid grid-cols-3 gap-2 items-start">
//               <label>Email</label>
//               <div className="col-span-2">
//                 <input
//                   type="email"
//                   className="w-full border px-3 py-2 rounded"
//                   value={ManagerData.email}
//                   onChange={(e) =>
//                     setManagerData({ ...ManagerData, email: e.target.value })
//                   }
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">{errors.email}</p>
//                 )}
//               </div>
//             </div>
//             {/* Gender */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>Gender</label>
//               <select
//                 className="col-span-2 border px-3 py-2 rounded"
//                 value={ManagerData.gender}
//                 onChange={(e) =>
//                   setManagerData({ ...ManagerData, gender: e.target.value })
//                 }
//               >
//                 <option value="">Select Gender</option>
//                 <option>Male</option>
//                 <option>Female</option>
//                 <option>Other</option>
//               </select>
//             </div>

//             {/* DOB */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>Date of Birth</label>
//               <div className="col-span-2">
//                 <input
//                   type="date"
//                   className="w-full border px-3 py-2 rounded"
//                   value={ManagerData.dob}
//                   onChange={(e) =>
//                     setManagerData({ ...ManagerData, dob: e.target.value })
//                   }
//                 />
//                 {errors.dob && (
//                   <p className="text-red-500 text-xs">{errors.dob}</p>
//                 )}
//               </div>
//             </div>

//             {/* Profile image */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>Profile Image</label>
//               <input
//                 type="file"
//                 className="col-span-2 border px-3 py-2 rounded"
//                 onChange={(e) =>
//                   setManagerData({
//                     ...ManagerData,
//                     manager_image: e.target.files[0],
//                   })
//                 }
//               />
//             </div>
//           </div>

//           {/* WORK DETAILS */}
//           <div className="grid gap-2">
//             {/* Department */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>Department</label>
//               <select
//                 className="col-span-2 border px-3 py-2 rounded"
//                 value={ManagerData.department}
//                 onChange={(e) =>
//                   setManagerData({ ...ManagerData, department: e.target.value })
//                 }
//               >
//                 <option value="">Select Department</option>
//                 {DepartmentList.map((d) => (
//                   <option key={d.id} value={d.id}>
//                     {d.department_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Manager ID (read-only) */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>User ID</label>
//               <input
//                 className="col-span-2 border px-3 py-2 rounded bg-gray-100"
//                 value={ManagerData.manager_id}
//                 disabled
//               />
//             </div>

//             {/* Password */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>Password</label>
//               <div className="col-span-2">
//                 <input
//                   type="text"
//                   className="w-full border px-3 py-2 rounded"
//                   value={ManagerData.password}
//                   onChange={(e) =>
//                     setManagerData({ ...ManagerData, password: e.target.value })
//                   }
//                   required
//                 />
//                 {errors.password && (
//                   <p className="text-red-500 text-xs">{errors.password}</p>
//                 )}
//               </div>
//             </div>

//             {/* Username */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>Username</label>
//               <div className="col-span-2">
//                 <input
//                   type="text"
//                   className="w-full border px-3 py-2 rounded"
//                   value={ManagerData.username}
//                   onChange={(e) =>
//                     setManagerData({ ...ManagerData, username: e.target.value })
//                   }
//                 />
//                 {errors.username && (
//                   <p className="text-red-500 text-xs">{errors.username}</p>
//                 )}
//               </div>
//             </div>

//             {/* Hired Date */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>Hired Date</label>
//               <div className="col-span-2">
//                 <input
//                   type="date"
//                   className="w-full border px-3 py-2 rounded"
//                   value={ManagerData.hired_date}
//                   onChange={(e) =>
//                     setManagerData({
//                       ...ManagerData,
//                       hired_date: e.target.value,
//                     })
//                   }
//                 />
//                 {errors.hired_date && (
//                   <p className="text-red-500 text-xs">{errors.hired_date}</p>
//                 )}
//               </div>
//             </div>

//             {/* Shift */}
//             <div className="grid grid-cols-3 items-center gap-2">
//               <label>Shift</label>
//               <select
//                 className="col-span-2 border px-3 py-2 rounded"
//                 value={ManagerData.shift}
//                 onChange={(e) =>
//                   setManagerData({ ...ManagerData, shift: e.target.value })
//                 }
//               >
//                 <option value="">Select Shift</option>
//                 {ShiftList.map((s) => (
//                   <option key={s.id} value={s.id}>
//                     {s.shift_number}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="flex justify-end gap-4 mt-6">
//             <button
//               type="button"
//               className="px-4 py-2 bg-gray-200 rounded-lg"
//               onClick={() => setOpen(false)}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg"
//             >
//               Update
//             </button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default UpdateManager;

// import axios from "axios";
// import React, { useState, useEffect } from "react";
// import { Eye, EyeOff } from "lucide-react";
// import { toast } from "react-toastify";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// const apiBaseUrl = process.env.VITE_BASE_API;

// const UpdateManager = ({
//   open,
//   setOpen,
//   managerId,
//   ShiftList,
//   DepartmentList,
//   fetchManagerList,
// }) => {
//   const [ManagerData, setManagerData] = useState({
//     manager_name: "",
//     email: "",
//     gender: "",
//     dob: "",
//     manager_image: null,
//     manager_id: "",
//     username: "",
//     password: "",
//     department: "",
//     shift: "",
//     hired_date: "",
//     location: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [LocationList, setLocationList] = useState([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const response = await axios.get(
//           `${apiBaseUrl}/admin/overall-location/`,
//         );
//         setLocationList(response.data);
//       } catch (error) {
//         console.error("Error fetching locations:", error);
//         toast.error("Failed to load locations");
//       }
//     };
//     fetchLocations();
//   }, []);

//   useEffect(() => {
//     const fetchManagerData = async () => {
//       if (!managerId) return;

//       try {
//         const { data } = await axios.get(
//           `${apiBaseUrl}/api/managers/get/${managerId}/`,
//         );
//         setManagerData({
//           manager_name: data.manager_name,
//           email: data.email,
//           gender: data.gender,
//           dob: data.dob,
//           manager_image: null,
//           manager_id: data.manager_id,
//           username: data.username,
//           password: "",
//           department: data.department,
//           shift: data.shift,
//           hired_date: data.hired_date,
//           location: data.location || "",
//         });
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load manager data.");
//       }
//     };

//     fetchManagerData();
//   }, [managerId]);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!/^[A-Za-z\s]*$/.test(ManagerData.manager_name))
//       newErrors.manager_name = "Only letters allowed in name";

//     if (!/^[A-Za-z\s]*$/.test(ManagerData.username))
//       newErrors.username = "Only letters allowed in username";

//     const today = new Date().toISOString().split("T")[0];
//     if (ManagerData.dob > today)
//       newErrors.dob = "Date of Birth cannot be a future date";

//     if (ManagerData.hired_date > today)
//       newErrors.hired_date = "Hired Date cannot be a future date";

//     if (!ManagerData.password)
//       newErrors.password = "Password is required to update manager";

//     if (!ManagerData.location) newErrors.location = "Please select a location";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setIsSubmitting(true);

//     const formData = new FormData();
//     Object.entries(ManagerData).forEach(([key, value]) => {
//       if (key === "manager_image" && !value) return;
//       if (key === "manager_id") return;
//       if (key === "password" && value === "") return;
//       formData.append(key, value);
//     });

//     try {
//       const res = await axios.put(
//         `${apiBaseUrl}/admin/managers/${managerId}/`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } },
//       );
//       toast.success("Manager updated successfully");
//       fetchManagerList();
//       setOpen(false);
//     } catch (error) {
//       const err = error?.response?.data;
//       if (err?.username) {
//         setErrors({ username: err.username });
//       } else if (err?.email) {
//         setErrors({ email: err.email });
//       } else if (err?.password) {
//         setErrors({ password: err.password });
//       } else {
//         toast.error("Failed to update manager.");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-lg">
//         <DialogHeader>
//           <DialogTitle className="text-lg font-semibold text-gray-900">Update Manager</DialogTitle>
//         </DialogHeader>
//         <form className="space-y-4 w-full p-4" onSubmit={handleSubmit}>
//           <div className="grid gap-4">
//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Name</label>
//               <div className="col-span-2">
//                 <input
//                   type="text"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   value={ManagerData.manager_name}
//                   onChange={(e) =>
//                     setManagerData({
//                       ...ManagerData,
//                       manager_name: e.target.value,
//                     })
//                   }
//                 />
//                 {errors.manager_name && (
//                   <p className="text-red-500 text-xs mt-1">{errors.manager_name}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Email</label>
//               <div className="col-span-2">
//                 <input
//                   type="email"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   value={ManagerData.email}
//                   onChange={(e) =>
//                     setManagerData({ ...ManagerData, email: e.target.value })
//                   }
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">{errors.email}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Gender</label>
//               <select
//                 className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
//                 value={ManagerData.gender}
//                 onChange={(e) =>
//                   setManagerData({ ...ManagerData, gender: e.target.value })
//                 }
//               >
//                 <option value="">Select Gender</option>
//                 <option>Male</option>
//                 <option>Female</option>
//                 <option>Other</option>
//               </select>
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Date of Birth</label>
//               <div className="col-span-2">
//                 <input
//                   type="date"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   value={ManagerData.dob}
//                   onChange={(e) =>
//                     setManagerData({ ...ManagerData, dob: e.target.value })
//                   }
//                 />
//                 {errors.dob && (
//                   <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Profile Image</label>
//               <input
//                 type="file"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
//                 onChange={(e) =>
//                   setManagerData({
//                     ...ManagerData,
//                     manager_image: e.target.files[0],
//                   })
//                 }
//               />
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Department</label>
//               <select
//                 className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
//                 value={ManagerData.department}
//                 onChange={(e) =>
//                   setManagerData({ ...ManagerData, department: e.target.value })
//                 }
//               >
//                 <option value="">Select Department</option>
//                 {DepartmentList.map((d) => (
//                   <option key={d.id} value={d.id}>
//                     {d.department_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">User ID</label>
//               <input
//                 className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm bg-gray-100 col-span-2"
//                 value={ManagerData.manager_id}
//                 disabled
//               />
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Password</label>
//               <div className="col-span-2 relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
//                   value={ManagerData.password}
//                   onChange={(e) =>
//                     setManagerData({ ...ManagerData, password: e.target.value })
//                   }
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
//                 </button>
//                 {errors.password && (
//                   <p className="text-red-500 text-xs mt-1">{errors.password}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Location</label>
//               <select
//                 className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
//                 value={ManagerData.location}
//                 onChange={(e) =>
//                   setManagerData({ ...ManagerData, location: e.target.value })
//                 }
//                 required
//               >
//                 <option value="" disabled>
//                   Select Location
//                 </option>
//                 {LocationList.map((location) => (
//                   <option key={location.id} value={location.id}>
//                     {location.location_name}
//                   </option>
//                 ))}
//               </select>
//               {errors.location && (
//                 <p className="text-red-500 text-xs mt-1">{errors.location}</p>
//               )}
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Username</label>
//               <div className="col-span-2">
//                 <input
//                   type="text"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   value={ManagerData.username}
//                   onChange={(e) =>
//                     setManagerData({ ...ManagerData, username: e.target.value })
//                   }
//                 />
//                 {errors.username && (
//                   <p className="text-red-500 text-xs mt-1">{errors.username}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Hired Date</label>
//               <div className="col-span-2">
//                 <input
//                   type="date"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   value={ManagerData.hired_date}
//                   onChange={(e) =>
//                     setManagerData({
//                       ...ManagerData,
//                       hired_date: e.target.value,
//                     })
//                   }
//                 />
//                 {errors.hired_date && (
//                   <p className="text-red-500 text-xs mt-1">{errors.hired_date}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-3 items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Shift</label>
//               <select
//                 className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
//                 value={ManagerData.shift}
//                 onChange={(e) =>
//                   setManagerData({ ...ManagerData, shift: e.target.value })
//                 }
//               >
//                 <option value="">Select Shift</option>
//                 {ShiftList.map((s) => (
//                   <option key={s.id} value={s.id}>
//                     {s.shift_number}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 mt-6">
//             <button
//               type="button"
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-md hover:shadow-lg transition-all duration-300"
//               onClick={() => setOpen(false)}
//               disabled={isSubmitting}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className={`px-4 py-2 text-sm font-medium text-white rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
//                 isSubmitting
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-gradient-to-br from-purple-600 to-blue-500 hover:-translate-y-0.5"
//               }`}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Updating..." : "Update"}
//             </button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default UpdateManager;

import axios from "axios";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const apiBaseUrl = process.env.VITE_BASE_API;

const UpdateManager = ({
  open,
  setOpen,
  managerId,
  ShiftList,
  DepartmentList,
  fetchManagerList,
}) => {
  const [ManagerData, setManagerData] = useState({
    manager_name: "",
    email: "",
    gender: "",
    dob: "",
    manager_image: null,
    manager_id: "",
    username: "",
    password: "",
    department: "",
    streams: {},
    shift: "",
    hired_date: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [LocationList, setLocationList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const streamOptions = [
    "Project Management",
    "Manager Task",
    "Employee Task",
    "Attendance",
    "Employee Attendance",
    "Project Team Member",
    "Help Desk",
    "KPI",
    "Profile",
    "Billing",
  ];
  const subComponents = ["Admin", "Manager", "User", "Management"];

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/admin/overall-location/`,
        );
        setLocationList(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Failed to load locations");
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchManagerData = async () => {
      if (!managerId) return;

      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/api/managers/get/${managerId}/`,
        );

        // Parse streams if it's a string
        const streams =
          typeof data.streams === "string"
            ? JSON.parse(data.streams)
            : data.streams || {};

        setManagerData({
          manager_name: data.manager_name,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          manager_image: null,
          manager_id: data.manager_id,
          username: data.username,
          password: "",
          department: data.department?.toString() || "",
          streams: streams,
          shift: data.shift?.toString() || "",
          hired_date: data.hired_date,
          location: data.location?.toString() || "",
        });

        if (data.manager_image) {
          setImagePreview(`${apiBaseUrl}${data.manager_image}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load manager data.");
      }
    };

    fetchManagerData();
  }, [managerId]);

  const handleStreamChange = (stream) => {
    setManagerData((prev) => {
      const newStreams = { ...prev.streams };
      if (newStreams[stream]) {
        delete newStreams[stream];
      } else {
        newStreams[stream] = [];
      }
      return { ...prev, streams: newStreams };
    });
  };

  const handleSubComponentChange = (stream, subComponent) => {
    setManagerData((prev) => {
      const newStreams = { ...prev.streams };
      const currentSubComponents = newStreams[stream] || [];
      if (currentSubComponents.includes(subComponent)) {
        newStreams[stream] = currentSubComponents.filter(
          (sc) => sc !== subComponent,
        );
      } else {
        newStreams[stream] = [...currentSubComponents, subComponent];
      }
      return { ...prev, streams: newStreams };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!/^[A-Za-z\s]*$/.test(ManagerData.manager_name))
      newErrors.manager_name = "Only letters allowed in name";

    if (!/^[A-Za-z\s]*$/.test(ManagerData.username))
      newErrors.username = "Only letters allowed in username";

    if (ManagerData.dob > today)
      newErrors.dob = "Date of Birth cannot be a future date";

    if (ManagerData.hired_date > today)
      newErrors.hired_date = "Hired Date cannot be a future date";

    if (!ManagerData.location) newErrors.location = "Please select a location";

    if (!ManagerData.gender) {
      toast.error("Please select a gender");
      return false;
    }

    if (!ManagerData.department) {
      toast.error("Please select a department");
      return false;
    }

    if (!ManagerData.shift) {
      toast.error("Please select a shift");
      return false;
    }

    if (Object.keys(ManagerData.streams).length === 0) {
      toast.error("Please select at least one stream");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(ManagerData).forEach(([key, value]) => {
      if (key === "manager_image" && !value) return;
      if (key === "manager_id") return;
      if (key === "password" && value === "") return;

      if (key === "streams") {
        try {
          const streamsString = JSON.stringify(value);
          formData.append("streams", streamsString);
        } catch (error) {
          console.error("Error stringifying streams:", error);
          toast.error("Invalid streams format");
          setIsSubmitting(false);
          return;
        }
      } else if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      const res = await axios.put(
        `${apiBaseUrl}/admin/managers/${managerId}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("Manager updated successfully");
      fetchManagerList();
      setOpen(false);
    } catch (error) {
      const err = error?.response?.data;
      if (err?.username) {
        setErrors({ username: err.username });
      } else if (err?.email) {
        setErrors({ email: err.email });
      } else if (err?.password) {
        setErrors({ password: err.password });
      } else if (err?.streams) {
        setErrors({ streams: err.streams });
      } else {
        toast.error("Failed to update manager.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Update Manager
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4 w-full p-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="col-span-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={ManagerData.manager_name}
                    onChange={(e) =>
                      setManagerData({
                        ...ManagerData,
                        manager_name: e.target.value,
                      })
                    }
                  />
                  {errors.manager_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.manager_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="col-span-2">
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={ManagerData.email}
                    onChange={(e) =>
                      setManagerData({ ...ManagerData, email: e.target.value })
                    }
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                  value={ManagerData.gender}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <div className="col-span-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={ManagerData.dob}
                    onChange={(e) =>
                      setManagerData({ ...ManagerData, dob: e.target.value })
                    }
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Profile Image
                </label>
                <div className="col-span-2">
                  {imagePreview && (
                    <div className="mb-2">
                      <img
                        src={imagePreview}
                        alt="Current profile"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setManagerData({
                          ...ManagerData,
                          manager_image: file,
                        });
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                  value={ManagerData.department}
                  onChange={(e) =>
                    setManagerData({
                      ...ManagerData,
                      department: e.target.value,
                    })
                  }
                >
                  <option value="">Select Department</option>
                  {DepartmentList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  User ID
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm bg-gray-100 col-span-2"
                  value={ManagerData.manager_id}
                  disabled
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="col-span-2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                    value={ManagerData.password}
                    onChange={(e) =>
                      setManagerData({
                        ...ManagerData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Leave blank to keep current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                  value={ManagerData.location}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, location: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select Location
                  </option>
                  {LocationList.map((location) => (
                    <option key={location.id} value={location.id.toString()}>
                      {location.location_name}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="col-span-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={ManagerData.username}
                    onChange={(e) =>
                      setManagerData({
                        ...ManagerData,
                        username: e.target.value,
                      })
                    }
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Hired Date
                </label>
                <div className="col-span-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={ManagerData.hired_date}
                    onChange={(e) =>
                      setManagerData({
                        ...ManagerData,
                        hired_date: e.target.value,
                      })
                    }
                  />
                  {errors.hired_date && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.hired_date}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Shift
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
                  value={ManagerData.shift?.toString()}
                  onChange={(e) =>
                    setManagerData({ ...ManagerData, shift: e.target.value })
                  }
                >
                  <option value="">Select Shift</option>
                  {ShiftList.map((s) => (
                    <option key={s.id} value={s.id?.toString()}>
                      {s.shift_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stream Section */}
              <div className="grid grid-cols-3 items-start gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Stream
                </label>
                <div className="col-span-2 space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {streamOptions.length > 0 &&
                    ManagerData.streams &&
                    streamOptions.map((stream) => (
                      <div key={stream} className="mb-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!!ManagerData.streams[stream]}
                            onChange={() => handleStreamChange(stream)}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {stream}
                          </span>
                        </label>
                        {ManagerData.streams[stream] && (
                          <div className="ml-6 mt-1 space-y-1">
                            {subComponents.map((subComponent) => (
                              <label
                                key={subComponent}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={ManagerData.streams[
                                    stream
                                  ]?.includes(subComponent)}
                                  onChange={() =>
                                    handleSubComponentChange(
                                      stream,
                                      subComponent,
                                    )
                                  }
                                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-600">
                                  {subComponent}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-purple-600 to-blue-500 hover:-translate-y-0.5"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateManager;
