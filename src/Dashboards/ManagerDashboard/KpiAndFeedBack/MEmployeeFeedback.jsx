// import React, { useState, useEffect } from "react";
// import axios from "axios";
// // import { DataGrid } from "@mui/x-data-grid";
// // import { Button, TextField, Select, MenuItem, Box } from "@mui/material";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// axios.defaults.withCredentials = true;

// const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
// const apiBaseUrl = process.env.VITE_BASE_API;

// const MEmployeeFeedback = ({ setisemployeefeedback }) => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [comments, setComments] = useState("");
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [isUpdate, setIsUpdate] = useState(false);
//   const [updateFeedbackId, setUpdateFeedbackId] = useState(null);

//   // Fetch Employees List
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get(`${apiBaseUrl}/api/employee_list/`);
//         setEmployees(response.data);
//       } catch (error) {
//         console.error("Error fetching employees:", error);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   const fetchEmployeeFeedBackList = async () => {
//     const res = await axios.get(`${apiBaseUrl}/api/feedback/list/`);
//     setFeedbacks(res.data);
//   };

//   useEffect(() => {
//     fetchEmployeeFeedBackList();
//   }, []);

//   // Handle Feedback Submission
//   const handleSubmitFeedback = async () => {
//     if (!selectedEmployee || !comments) {
//       alert("Please fill in all fields.");
//       return;
//     }

//     try {
//       const feedbackData = {
//         from_manager_id: userInfo.manager_id,
//         to_employee_id: selectedEmployee,
//         comments: comments,
//       };

//       if (isUpdate) {
//         // Update feedback
//         await axios.put(
//           `${apiBaseUrl}/feedbacks/${updateFeedbackId}/update/`,
//           feedbackData
//         );
//         alert("Feedback updated successfully!");
//       } else {
//         // Submit new feedback
//         await axios.post(`${apiBaseUrl}/api/feedback/create/`, feedbackData);
//         alert("Feedback submitted successfully!");
//       }

//       fetchEmployeeFeedBackList();
//       resetForm();
//     } catch (error) {
//       console.error("Error submitting feedback:", error);
//     }
//   };

//   // Handle Update Feedback
//   const handleUpdateFeedback = (feedbackId) => {
//     const feedbackToUpdate = feedbacks.find(
//       (feedback) => feedback.id === feedbackId
//     );
//     if (feedbackToUpdate) {
//       setSelectedEmployee(feedbackToUpdate.to_employee.employee_id);
//       setComments(feedbackToUpdate.comments);
//       setUpdateFeedbackId(feedbackId);
//       setIsUpdate(true);
//       setShowForm(true);
//     }
//   };

//   // Handle Delete Feedback
//   const handleDeleteFeedback = async (feedbackId) => {
//     await axios.delete(`${apiBaseUrl}/admin/delete-feedback/${feedbackId}/`);
//     fetchEmployeeFeedBackList();
//   };

//   // Reset form to initial state
//   const resetForm = () => {
//     setSelectedEmployee("");
//     setComments("");
//     setIsUpdate(false);
//     setUpdateFeedbackId(null);
//     setShowForm(false);
//   };

//   // Columns for DataGrid
//   // const columns = [
//   //   { field: "id", headerName: "ID", width: 70 },
//   //   { field: "from_manager", headerName: "Manager", width: 150 },
//   //   { field: "to_employee", headerName: "Employee", width: 150 },
//   //   { field: "comments", headerName: "Comments", flex: 1 },
//   //   { field: "feedback_date", headerName: "Date", width: 150 },
//   //   {
//   //     field: "actions",
//   //     headerName: "Actions",
//   //     width: 180,
//   //     renderCell: (params) => (
//   //       <Box display="flex" gap={1}>
//   //         <Button
//   //           variant="contained"
//   //           color="primary"
//   //           onClick={() => handleUpdateFeedback(params.row.id)}>
//   //           Update
//   //         </Button>
//   //         <Button
//   //           variant="contained"
//   //           color="error"
//   //           onClick={() => handleDeleteFeedback(params.row.id)}>
//   //           Delete
//   //         </Button>
//   //       </Box>
//   //     ),
//   //   },
//   // ];

//   // Map feedback data to match DataGrid columns
//   // const rows = feedbacks.map((feedback, index) => ({
//   //   id: feedback.id,
//   //   from_manager: feedback.from_manager.manager_name,
//   //   to_employee: feedback.to_employee.employee_name,
//   //   comments: feedback.comments,
//   //   feedback_date: new Date(feedback.feedback_date).toLocaleDateString(),
//   // }));

//   return (
//     // <div className="p-4 border rounded-md bg-white shadow-md min-h-dvh">
//     //   <div className="flex justify-between items-center">
//     //     <h2 className="text-lg font-semibold mb-2">Employee Feedback</h2>

//     //     {/* Send Feedback Button */}

//     //     <Button
//     //       variant="contained"
//     //       color="primary"
//     //       onClick={() => setShowForm(true)}
//     //     >
//     //       Send Feedback
//     //     </Button>
//     //   </div>

//     //   {/* Feedback Form (Visible when clicking "Send Feedback") */}
//     //   {showForm && (
//     //     <Box className="p-4 border rounded-md mt-4 bg-gray-100">
//     //       <h3 className="text-lg font-semibold mb-2">
//     //         {isUpdate ? "Update Feedback" : "Send Feedback"}
//     //       </h3>

//     //       {/* Employee Select */}
//     //       <Select
//     //         value={selectedEmployee}
//     //         onChange={(e) => setSelectedEmployee(e.target.value)}
//     //         fullWidth
//     //         displayEmpty
//     //         variant="outlined"
//     //         className="mb-3"
//     //       >
//     //         <MenuItem value="">Select Employee</MenuItem>
//     //         {employees.map((employee) => (
//     //           <MenuItem key={employee.employee_id} value={employee.employee_id}>
//     //             {employee.employee_name}
//     //           </MenuItem>
//     //         ))}
//     //       </Select>

//     //       {/* Comments Input */}
//     //       <TextField
//     //         value={comments}
//     //         onChange={(e) => setComments(e.target.value)}
//     //         fullWidth
//     //         multiline
//     //         rows={3}
//     //         variant="outlined"
//     //         label="Comments"
//     //         className="mb-3"
//     //       />

//     //       {/* Submit & Cancel Buttons */}
//     //       <Box display="flex" gap={2}>
//     //         <Button
//     //           variant="contained"
//     //           color="success"
//     //           onClick={handleSubmitFeedback}
//     //         >
//     //           {isUpdate ? "Update Feedback" : "Submit Feedback"}
//     //         </Button>
//     //         <Button variant="contained" color="secondary" onClick={resetForm}>
//     //           Cancel
//     //         </Button>
//     //       </Box>
//     //     </Box>
//     //   )}

//     //   {/* Feedback List (MUI DataGrid) */}
//     //   <div className="mt-4 min-h-dvh" style={{ height: 400, width: "100%" }}>
//     //     <DataGrid rows={rows} columns={columns} pageSize={5} />
//     //   </div>
//     // </div>
//     <div className="h-[100vh-50px] space-y-4 p-4">
//       <div className="flex justify-between items-center">
//         <h2>Employee Feedbacks</h2>
//         <Dialog>
//           <DialogTrigger>
//             <Button>FeedBack</Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Feedback</DialogTitle>
//             </DialogHeader>
//             <div className="flex flex-col space-y-2">
//               <Select
//                 value={selectedEmployee}
//                 onValueChange={(e) => setSelectedEmployee(e)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Employee" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {/* <SelectItem value="">Select Employee</SelectItem> */}
//                   {employees.map((employee) => (
//                     <SelectItem
//                       key={employee.employee_id}
//                       value={employee.employee_id}>
//                       {employee.employee_name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Input
//                 value={comments}
//                 onChange={(e) => setComments(e.target.value)}
//                 placeholder="Feedback"
//               />
//             </div>
//             <DialogFooter>
//               <DialogClose>Close</DialogClose>
//               <DialogClose>
//                 <Button onClick={handleSubmitFeedback}>Sumbit</Button>
//               </DialogClose>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//       <div className="border rounded">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>S.No</TableHead>
//               <TableHead>Manager</TableHead>
//               <TableHead>Employee</TableHead>
//               <TableHead>Feedback</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {feedbacks.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5}>no feedback available</TableCell>
//               </TableRow>
//             ) : (
//               feedbacks.map((feedback, index) => {
//                 return (
//                   <TableRow key={feedback.id}>
//                     <TableCell>{index + 1}</TableCell>
//                     <TableCell>{feedback.from_manager.manager_name}</TableCell>
//                     <TableCell>{feedback.to_employee.employee_name}</TableCell>
//                     <TableCell>{feedback.comments}</TableCell>
//                     <TableCell>
//                       {new Date(feedback.feedback_date).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger>
//                           <Button>Options</Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent>
//                           <DropdownMenuItem>
//                             <Dialog>
//                               <DialogTrigger>Edit</DialogTrigger>
//                               <DialogContent>
//                                 <UpdateForm id={feedback.id} />
//                               </DialogContent>
//                             </Dialog>
//                           </DropdownMenuItem>
//                           <DropdownMenuItem
//                             onClick={() => handleDeleteFeedback(feedback.id)}>
//                             Delete
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default MEmployeeFeedback;

// const UpdateForm = ({ id }) => {
//   const feedbackId = id;
//   const [employees, setEmployees] = useState([]);
//     const [selectedEmployee, setSelectedEmployee] = useState("");
//     const [comments, setComments] = useState("");
//     const [feedbacks, setFeedbacks] = useState([]);
//     const [showForm, setShowForm] = useState(false);
//     const [isUpdate, setIsUpdate] = useState(false);
//     const [updateFeedbackId, setUpdateFeedbackId] = useState(null);

//   const feedbackToUpdate = feedbacks.find(
//     (feedback) => feedback.id === feedbackId
//   );
//   if (feedbackToUpdate) {
//     setSelectedEmployee(feedbackToUpdate.to_employee.employee_id);
//     setComments(feedbackToUpdate.comments);
//     setUpdateFeedbackId(feedbackId);
//     setIsUpdate(true);
//     setShowForm(true);
//   }
//     useEffect(() => {
//       const fetchEmployees = async () => {
//         try {
//           const response = await axios.get(`${apiBaseUrl}/api/employee_list/`);
//           setEmployees(response.data);
//         } catch (error) {
//           console.error("Error fetching employees:", error);
//         }
//       };
//       fetchEmployees();
//     }, []);

//     const fetchEmployeeFeedBackList = async () => {
//       const res = await axios.get(`${apiBaseUrl}/api/feedback/list/`);
//       setFeedbacks(res.data);
//     };

//     useEffect(() => {
//       fetchEmployeeFeedBackList();
//     }, []);
//    const handleSubmitFeedback = async () => {
//      if (!selectedEmployee || !comments) {
//        alert("Please fill in all fields.");
//        return;
//      }

//      try {
//        const feedbackData = {
//          from_manager_id: userInfo.manager_id,
//          to_employee_id: selectedEmployee,
//          comments: comments,
//        };

//        if (isUpdate) {
//          // Update feedback
//          await axios.put(
//            `${apiBaseUrl}/feedbacks/${updateFeedbackId}/update/`,
//            feedbackData
//          );
//          alert("Feedback updated successfully!");
//        } else {
//          // Submit new feedback
//          await axios.post(`${apiBaseUrl}/api/feedback/create/`, feedbackData);
//          alert("Feedback submitted successfully!");
//        }

//        fetchEmployeeFeedBackList();
//        resetForm();
//      } catch (error) {
//        console.error("Error submitting feedback:", error);
//      }
//    };
//   return (
//     <>
//       <div className="flex flex-col space-y-2">
//         <Select
//           value={selectedEmployee}
//           onValueChange={(e) => setSelectedEmployee(e)}>
//           <SelectTrigger>
//             <SelectValue placeholder="Select Employee" />
//           </SelectTrigger>
//           <SelectContent>
//             {employees.map((employee) => (
//               <SelectItem
//                 key={employee.employee_id}
//                 value={employee.employee_id}>
//                 {employee.employee_name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Input
//           value={comments}
//           onChange={(e) => setComments(e.target.value)}
//           placeholder="Feedback"
//         />
//       </div>
//       <DialogFooter>
//         <DialogClose>Close</DialogClose>
//         <DialogClose>
//           <Button onClick={handleSubmitFeedback}>Sumbit</Button>
//         </DialogClose>
//       </DialogFooter>
//     </>
//   );
// };

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Delete, Edit } from "lucide-react";
const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
const apiBaseUrl = process.env.VITE_BASE_API;

const MEmployeeFeedback = ({ setisemployeefeedback }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [comments, setComments] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateFeedbackId, setUpdateFeedbackId] = useState(null);

  // Fetch Employees List
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/employee_list/`);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch Feedback List
  const fetchEmployeeFeedBackList = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/api/feedback/list/`);
      setFeedbacks(res.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  useEffect(() => {
    fetchEmployeeFeedBackList();
  }, []);

  // Handle Feedback Submission
  const handleSubmitFeedback = async () => {
    if (!selectedEmployee || !comments) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const feedbackData = {
        from_manager_id: userInfo.manager_id,
        to_employee_id: selectedEmployee,
        comments: comments,
      };

      if (isUpdate) {
        // Update feedback
        await axios.put(
          `${apiBaseUrl}/feedbacks/${updateFeedbackId}/update/`,
          feedbackData,
        );
        alert("Feedback updated successfully!");
      } else {
        // Submit new feedback
        await axios.post(`${apiBaseUrl}/api/feedback/create/`, feedbackData);
        alert("Feedback submitted successfully!");
      }

      fetchEmployeeFeedBackList();
      resetForm();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setSelectedEmployee("");
    setComments("");
    setIsUpdate(false);
    setUpdateFeedbackId(null);
    setShowForm(false);
  };

  // Handle Update Feedback
  const handleUpdateFeedback = (feedbackId) => {
    const feedbackToUpdate = feedbacks.find(
      (feedback) => feedback.id === feedbackId,
    );
    if (feedbackToUpdate) {
      setSelectedEmployee(feedbackToUpdate.to_employee.employee_id);
      setComments(feedbackToUpdate.comments);
      setUpdateFeedbackId(feedbackId);
      setIsUpdate(true);
      setShowForm(true);
    }
  };

  // Handle Delete Feedback
  const handleDeleteFeedback = async (feedbackId) => {
    await axios.delete(`${apiBaseUrl}/admin/delete-feedback/${feedbackId}/`);
    fetchEmployeeFeedBackList();
  };

  return (
    <div className="h-[100vh-50px] space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2>Employee Feedbacks</h2>
        <Dialog>
          <DialogTrigger>
            <Button>FeedBack</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Feedback</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-2">
              <Select
                value={selectedEmployee}
                onValueChange={(e) => setSelectedEmployee(e)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem
                      key={employee.employee_id}
                      value={employee.employee_id}
                    >
                      {employee.employee_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Feedback"
              />
            </div>
            <DialogFooter>
              <DialogClose>Close</DialogClose>
              <DialogClose>
                <Button onClick={handleSubmitFeedback}>Submit</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No feedback available</TableCell>
              </TableRow>
            ) : (
              feedbacks.map((feedback, index) => {
                return (
                  <TableRow key={feedback.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{feedback.from_manager.manager_name}</TableCell>
                    <TableCell>{feedback.to_employee.employee_name}</TableCell>
                    <TableCell>{feedback.comments}</TableCell>
                    <TableCell>
                      {new Date(feedback.feedback_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button>Options</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Dialog>
                              <DialogTrigger>Edit</DialogTrigger>
                              <DialogContent>
                                <UpdateForm
                                  // feedback={feedback}
                                  handleSubmitFeedback={handleSubmitFeedback}
                                />
                              </DialogContent>
                            </Dialog>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFeedback(feedback.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* <Edit
                        className="cursor-pointer"
                        onClick={() => handleDeleteFeedback(feedback.id)}
                      />
                      <Delete className="cursor-pointer" /> */}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MEmployeeFeedback;

const UpdateForm = ({ feedback }) => {
  const [comments, setComments] = useState(feedback.comments);
  const [employees, setEmployees] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const [updateFeedbackId, setUpdateFeedbackId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(
    feedback.to_employee.employee_id,
  );
  const feedbackToUpdate = feedbacks.find(
    (feedback) => feedback.id === feedbackId,
  );
  if (feedbackToUpdate) {
    setSelectedEmployee(feedbackToUpdate.to_employee.employee_id);
    setComments(feedbackToUpdate.comments);
    setUpdateFeedbackId(feedback.id);
    setIsUpdate(true);
    setShowForm(true);
  }

  const fetchEmployeeFeedBackList = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/api/feedback/list/`);
      setFeedbacks(res.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  useEffect(() => {
    fetchEmployeeFeedBackList();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/employee_list/`);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmitFeedback = async () => {
    // if (!selectedEmployee || !comments) {
    //   alert("Please fill in all fields.");
    //   return;
    // }

    try {
      const feedbackData = {
        from_manager_id: userInfo.manager_id,
        to_employee_id: selectedEmployee,
        comments: comments,
      };

      if (isUpdate) {
        // Update feedback
        await axios.put(
          `${apiBaseUrl}/feedbacks/${updateFeedbackId}/update/`,
          feedbackData,
        );
        alert("Feedback updated successfully!");
      } else {
        // Submit new feedback
        await axios.post(`${apiBaseUrl}/api/feedback/create/`, feedbackData);
        alert("Feedback submitted successfully!");
      }

      // fetchEmployeeFeedBackList();
      resetForm();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Select
        value={selectedEmployee}
        onValueChange={(e) => setSelectedEmployee(e)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Employee" />
        </SelectTrigger>
        <SelectContent>
          {employees.map((employee) => (
            <SelectItem key={employee.employee_id} value={employee.employee_id}>
              {employee.employee_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Feedback"
      />
      <DialogFooter>
        <DialogClose>Close</DialogClose>
        <DialogClose>
          <Button onClick={handleSubmitFeedback}>Submit</Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};
