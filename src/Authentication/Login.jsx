// // import { toast } from "react-toastify";
// // import { useState, useContext } from "react";
// // import {
// //   Eye,
// //   EyeOff,
// //   Lock,
// //   User,
// //   BadgeIcon as IdCard,
// //   Loader,
// // } from "lucide-react";
// // // import { useRouter } from "next/navigation";
// // // import { toast } from "@/components/ui/use-toast";
// // import { useForm } from "react-hook-form";
// // import { useNavigate } from "react-router-dom";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Card, CardContent } from "@/components/ui/card";
// // import AuthContext from "@/context/authContext";

// // // This would be replaced with your actual API base URL
// // const apiBaseUrl = process.env.VITE_BASE_API;

// // export default function LoginForm() {
// //   const router = useNavigate();
// //   // const router = useRouter();
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [userId, setUserId] = useState("");
// //   const [userName, setUsername] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [error, setError] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const {
// //     register,
// //     handleSubmit,
// //     formState: { errors },
// //   } = useForm();

// //   const fetchDetails = async (loginUser) => {
// //     try {
// //       const res = await fetch(`${apiBaseUrl}/api/details/`, {
// //         credentials: "include",
// //       });
// //       const data = await res.json();

// //       // Find the user in the data
// //       return (
// //         data.admins.find((u) => u.user_id === loginUser.user_id) ||
// //         data.managers.find((u) => u.manager_id === loginUser.user_id) ||
// //         data.hrs.find((u) => u.hr_id === loginUser.user_id) ||
// //         data.employees.find((u) => u.employee_id === loginUser.user_id) ||
// //         data.supervisors.find((u) => u.supervisor_id === loginUser.user_id)
// //       );
// //     } catch (error) {
// //       console.error("Error fetching user details:", error);
// //       setError("Error fetching user details. Please try again later.");
// //       return null;
// //     }
// //   };

// //   const handleLogin = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     const payload = {
// //       username: userName,
// //       user_id: userId,
// //       password: password,
// //     };

// //     try {
// //       const res = await fetch(`${apiBaseUrl}/common_login/`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(payload),
// //         credentials: "include",
// //       });

// //       if (!res.ok) {
// //         throw new Error("Login failed");
// //       }

// //       const loginUser = await res.json();
// //       if (loginUser) {
// //         // Store login user in session storage
// //         sessionStorage.setItem("loginUser", JSON.stringify(loginUser));

// //         const user = await fetchDetails(loginUser);

// //         if (user) {
// //           // Store user data in local storage
// //           sessionStorage.setItem("userdata", JSON.stringify(user));

// //           // Navigate based on role
// //           if (loginUser.role === "admin") {
// //             router("/admin");
// //             toast({
// //               title: "Welcome Back",
// //               description: `${user.username}👋.`,
// //               variant: "default",
// //             });
// //           } else if (loginUser.role === "hr") {
// //             router("/hr");
// //             toast({
// //               title: "Welcome Back",
// //               description: `${user.username}👋.`,
// //               variant: "default",
// //             });
// //           } else if (loginUser.role === "manager") {
// //             router("/manager");
// //             toast({
// //               title: "Welcome Back",
// //               description: `${user.username}👋.`,
// //               variant: "default",
// //             });
// //           } else if (loginUser.role === "employee") {
// //             router("/employee");
// //             toast({
// //               title: "Welcome Back",
// //               description: `${user.username}👋.`,
// //               variant: "default",
// //             });
// //           } else if (loginUser.role === "supervisor") {
// //             router("/supervisor");
// //             toast({
// //               title: "Welcome Back",
// //               description: `${user.username}👋.`,
// //               variant: "default",
// //             });
// //           }
// //         }
// //       } else {
// //         toast({
// //           title: "Error",
// //           description: "Invalid username or password.",
// //           variant: "destructive",
// //         });
// //         setError("Invalid username or password");
// //         setLoading(false);
// //       }
// //     } catch (error) {
// //       toast({
// //         title: "Error",
// //         description: "Login failed. Please try again.",
// //         variant: "destructive",
// //       });
// //       setError("Login failed. Please try again.");
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-dvh flex items-center justify-center relative bg-[url('/src/assets/Images/light-bg.jpg')]">
// //       {loading && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
// //           <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
// //             <Loader className="h-8 w-8 animate-spin text-primary" />
// //             <p className="mt-2 text-sm font-medium">Loading...</p>
// //           </div>
// //         </div>
// //       )}

// //       <Card className="w-96 m-4">
// //         <CardContent className="p-8 flex flex-col justify-center items-center">
// //           <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
// //             <span className="text-primary-foreground font-bold">ESS</span>
// //           </div>

// //           <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 mt-10">
// //             Welcome Back
// //           </h2>
// //           <p className="text-center text-muted-foreground mb-8">
// //             Sign in to your account
// //           </p>

// //           <form onSubmit={handleLogin} className="w-full space-y-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="userId">User ID</Label>
// //               <div className="relative">
// //                 <IdCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
// //                 <Input
// //                   id="user_id"
// //                   className="pl-10"
// //                   placeholder="Enter your User ID"
// //                   value={userId}
// //                   onChange={(e) => setUserId(e.target.value)}
// //                   required
// //                 />
// //               </div>
// //               {errors.userId && (
// //                 <p className="text-sm text-destructive">User ID is required</p>
// //               )}
// //             </div>

// //             <div className="space-y-2">
// //               <Label htmlFor="username">Username</Label>
// //               <div className="relative">
// //                 <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
// //                 <Input
// //                   id="username"
// //                   className="pl-10"
// //                   placeholder="Enter your username"
// //                   value={userName}
// //                   onChange={(e) => setUsername(e.target.value)}
// //                   required
// //                 />
// //               </div>
// //               {errors.userName && (
// //                 <p className="text-sm text-destructive">Username is required</p>
// //               )}
// //             </div>

// //             <div className="space-y-2">
// //               <Label htmlFor="password">Password</Label>
// //               <div className="relative">
// //                 <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
// //                 <Input
// //                   id="password"
// //                   type={showPassword ? "text" : "password"}
// //                   className="pl-10 pr-10"
// //                   placeholder="Enter your password"
// //                   value={password}
// //                   onChange={(e) => setPassword(e.target.value)}
// //                   required
// //                 />
// //                 <button
// //                   type="button"
// //                   className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
// //                   onClick={() => setShowPassword(!showPassword)}
// //                 >
// //                   {showPassword ? (
// //                     <EyeOff className="h-5 w-5" />
// //                   ) : (
// //                     <Eye className="h-5 w-5" />
// //                   )}
// //                 </button>
// //               </div>
// //               {errors.password && (
// //                 <p className="text-sm text-destructive">Password is required</p>
// //               )}
// //               {error && <p className="text-sm text-destructive">{error}</p>}
// //             </div>

// //             <Button type="submit" className="w-full" size="lg">
// //               Sign In
// //             </Button>
// //           </form>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }

// import { useState } from "react";
// import { Eye, EyeOff, Lock, User, Loader } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "react-toastify";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";

// const apiBaseUrl = process.env.VITE_BASE_API;

// export default function LoginForm() {
//   const router = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [date, setDate] = useState(new Date());
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   const fetchDetails = async (loginUser) => {
//     try {
//       const res = await fetch(`${apiBaseUrl}/api/details/`, {
//         credentials: "include",
//       });
//       const data = await res.json();

//       return (
//         data.admins.find((u) => u.user_id === loginUser.user_id) ||
//         data.managers.find((u) => u.manager_id === loginUser.user_id) ||
//         data.hrs.find((u) => u.hr_id === loginUser.user_id) ||
//         data.employees.find((u) => u.employee_id === loginUser.user_id) ||
//         data.supervisors.find((u) => u.supervisor_id === loginUser.user_id)
//       );
      
//     } catch (error) {
//       console.error("Error fetching user details:", error);
//       toast.error("Error fetching user details. Please try again later.");
//       return null;
//     }
//   };

//   const onSubmit = async (data) => {
//   setLoading(true);

//   const payload = {
//     username: data.username,
//     user_id: data.user_id,
//     password: data.password,
//   };

//   try {
//     const res = await fetch(`${apiBaseUrl}/common_login/`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//       credentials: "include",
//     });

//     if (!res.ok) {
//       throw new Error("Login failed");
//     }

//     const loginUser = await res.json();
//     console.log("Login response:", loginUser);

//     if (loginUser && loginUser.designation) {
//       sessionStorage.setItem("loginUser", JSON.stringify(loginUser));
//       console.log("llll", loginUser.user_id);
//       const user = await fetchDetails(loginUser);

//       if (user) {
//         sessionStorage.setItem("userdata", JSON.stringify(user));

//         // Navigate based on role or designation
//         const routes = {
//           admin: "/admin",
//           hr: "/user/hr",
//           manager: "/manager",
//           employee: "/user/employee",
//           supervisor: "/user/supervisor",
//         };

//         const roleKey = loginUser.role?.toLowerCase();
//         const designationKey = loginUser.designation?.toLowerCase().replace(/\s+/g, '');
//         const route = routes[roleKey] || routes[designationKey];

//         if (route) {
//           router(route);
//           toast.success(`Welcome Back ${data.username} 👋`);
//         } else {
//           toast.error("Role not recognized. Please contact support.");
//         }
//       } else {
//         throw new Error("Invalid credentials or no role");
//       }
//     } else {
//       throw new Error("Invalid credentials or no designation");
//     }
//   } catch (error) {
//     console.error("Login error:", error);
//     toast.error("Login failed. Please check your credentials.");
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="flex overflow-clip min-h-screen">
//       {loading && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
//             <Loader className="h-8 w-8 animate-spin text-[#ffd54f]" />
//             <p className="mt-2 text-sm font-medium">Authenticating...</p>
//           </div>
//         </div>
//       )}

//       <div className="h-full w-full overflow-hidden">
//         <div className="h-full grid grid-cols-2 lg:grid-cols-3">
//           {/* Form Section */}
//           <div className="p-10 h-screen col-span-2 lg:col-span-1 bg-gradient-to-l from-amber-200 to-blue-200">
//             <div className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-[#e0e0e0] text-lg font-semibold text-gray-800 mb-12">
//               ESS
//             </div>

//             <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
//             <p className="text-gray-500 mb-8">
//               Sign in to your employee account
//             </p>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               {/* User ID Field */}
//               <div className="space-y-2">
//                 <Label htmlFor="user_id" className="text-gray-500 text-sm">
//                   User ID
//                 </Label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                   {/* <Input
//                     id="user_id"
//                     className="pl-10 h-12 rounded-xl border-0 bg-white focus:border-amber-400 focus:ring-amber-400 transition-all"
//                     placeholder="Enter your user ID"
//                     {...register("user_id", { required: true })}
//                   /> */}
//                   <input
//                     id="user_id"
//                     className="pl-10 h-12 rounded-xl border w-full bg-white focus:border-amber-400 focus:ring-amber-400 transition-all"
//                     placeholder="Enter your user ID"
//                     {...register("user_id", { required: true })}
//                   />
//                 </div>
//                 {errors.user_id && (
//                   <p className="text-sm text-red-500">User ID is required</p>
//                 )}
//               </div>

//               {/* Username Field */}
//               <div className="space-y-2">
//                 <Label htmlFor="username" className="text-gray-500 text-sm">
//                   Username
//                 </Label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                   <input
//                     id="username"
//                     className="pl-10 h-12 rounded-xl border w-full bg-[#fff] focus:border-amber-400 focus:ring-amber-400 transition-all"
//                     placeholder="Enter your username"
//                     {...register("username", { required: true })}
//                   />
//                 </div>
//                 {errors.username && (
//                   <p className="text-sm text-red-500">Username is required</p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-gray-500 text-sm">
//                   Password
//                 </Label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                   <input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     className="pl-10 h-12 rounded-xl border w-full bg-[#fff] focus:border-amber-400 focus:ring-amber-400 transition-all"
//                     placeholder="Enter your password"
//                     {...register("password", { required: true })}
//                   />
//                   <button
//                     type="button"
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-5 w-5" />
//                     ) : (
//                       <Eye className="h-5 w-5" />
//                     )}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-sm text-red-500">Password is required</p>
//                 )}
//               </div>

//               <div className="flex justify-end">
//                 <a
//                   href="#"
//                   className="text-sm text-gray-500 hover:text-gray-700"
//                 >
//                   Forgot password?
//                 </a>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full h-12 rounded-full bg-[#ffd54f] hover:bg-[#ffca28] text-gray-900 font-semibold"
//               >
//                 Sign In
//               </Button>
//             </form>
//           </div>

//           {/* Calendar Section with Background Image */}
//           <div className="hidden lg:block relative bg-[#2c2c2c] md:col-span-2 overflow-hidden">
//             {/* <div
//               className="absolute inset-0 bg-cover bg-center opacity-20"
//               style={{
//                 backgroundImage:
//                   "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
//               }}
//             ></div> */}
//             {/* <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
//               <div className="bg-white/90 p-6 rounded-xl shadow-lg w-full max-w-xs">
//                 <Calendar
//                   onChange={setDate}
//                   value={date}
//                   className="border-0"
//                   tileClassName={({ date, view }) =>
//                     view === "month" && date.getDate() === new Date().getDate()
//                       ? "bg-[#ffd54f] rounded-full text-white"
//                       : null
//                   }
//                 />
//               </div>
//               <div className="mt-8 text-white text-center">
//                 <h3 className="text-xl font-semibold mb-2">
//                   {date.getDay() === 0
//                     ? "Today is a Holiday 🎉"
//                     : "Today's Schedule"}
//                 </h3>
//                 {date.getDay() === 0 ? (
//                   <p className="text-gray-300">Enjoy your Sunday!</p>
//                 ) : (
//                   <>
//                     <p className="text-gray-300">9:00 AM - 6:00 PM</p>
//                     <p className="text-gray-300 mt-2">
//                       Lunch: 1:00 PM - 2:00 PM
//                     </p>
//                   </>
//                 )}
//               </div>
//             </div> */}

//             <ImageSlider />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const ImageSlider = () => {
//   return (
//     <div className="text-white">
//       <Swiper
//         loop={true}
//         autoplay={{ delay: 1000, disableOnInteraction: false }}
//       >
//         {[
//           "/BannerImages/banner1.jpg",
//           "/BannerImages/banner2.jpg",
//           "/BannerImages/banner3.jpg",
//           "/BannerImages/banner4.jpg",
//         ].map((image, index) => (
//           <SwiperSlide key={index}>
//             <div className="h-screen relative">
//               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-amber-200/30 to-amber-50/10"></div>
//               <img
//                 src={image}
//                 alt={image}
//                 loading="lazy"
//                 className="max-w-full h-full object-cover object-center bg-gradient-to-b from-amber-200 to-amber-50 "
//               />
//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </div>
//   );
// };


// import { toast } from "react-toastify";
// import { useState, useContext } from "react";
// import {
//   Eye,
//   EyeOff,
//   Lock,
//   User,
//   BadgeIcon as IdCard,
//   Loader,
// } from "lucide-react";
// // import { useRouter } from "next/navigation";
// // import { toast } from "@/components/ui/use-toast";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import AuthContext from "@/context/authContext";

// // This would be replaced with your actual API base URL
// const apiBaseUrl = process.env.VITE_BASE_API;

// export default function LoginForm() {
//   const router = useNavigate();
//   // const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);
//   const [userId, setUserId] = useState("");
//   const [userName, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   const fetchDetails = async (loginUser) => {
//     try {
//       const res = await fetch(`${apiBaseUrl}/api/details/`, {
//         credentials: "include",
//       });
//       const data = await res.json();

//       // Find the user in the data
//       return (
//         data.admins.find((u) => u.user_id === loginUser.user_id) ||
//         data.managers.find((u) => u.manager_id === loginUser.user_id) ||
//         data.hrs.find((u) => u.hr_id === loginUser.user_id) ||
//         data.employees.find((u) => u.employee_id === loginUser.user_id) ||
//         data.supervisors.find((u) => u.supervisor_id === loginUser.user_id)
//       );
//     } catch (error) {
//       console.error("Error fetching user details:", error);
//       setError("Error fetching user details. Please try again later.");
//       return null;
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const payload = {
//       username: userName,
//       user_id: userId,
//       password: password,
//     };

//     try {
//       const res = await fetch(`${apiBaseUrl}/common_login/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//         credentials: "include",
//       });

//       if (!res.ok) {
//         throw new Error("Login failed");
//       }

//       const loginUser = await res.json();
//       if (loginUser) {
//         // Store login user in session storage
//         sessionStorage.setItem("loginUser", JSON.stringify(loginUser));

//         const user = await fetchDetails(loginUser);

//         if (user) {
//           // Store user data in local storage
//           sessionStorage.setItem("userdata", JSON.stringify(user));

//           // Navigate based on role
//           if (loginUser.role === "admin") {
//             router("/admin");
//             toast({
//               title: "Welcome Back",
//               description: `${user.username}👋.`,
//               variant: "default",
//             });
//           } else if (loginUser.role === "hr") {
//             router("/hr");
//             toast({
//               title: "Welcome Back",
//               description: `${user.username}👋.`,
//               variant: "default",
//             });
//           } else if (loginUser.role === "manager") {
//             router("/manager");
//             toast({
//               title: "Welcome Back",
//               description: `${user.username}👋.`,
//               variant: "default",
//             });
//           } else if (loginUser.role === "employee") {
//             router("/employee");
//             toast({
//               title: "Welcome Back",
//               description: `${user.username}👋.`,
//               variant: "default",
//             });
//           } else if (loginUser.role === "supervisor") {
//             router("/supervisor");
//             toast({
//               title: "Welcome Back",
//               description: `${user.username}👋.`,
//               variant: "default",
//             });
//           }
//         }
//       } else {
//         toast({
//           title: "Error",
//           description: "Invalid username or password.",
//           variant: "destructive",
//         });
//         setError("Invalid username or password");
//         setLoading(false);
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Login failed. Please try again.",
//         variant: "destructive",
//       });
//       setError("Login failed. Please try again.");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-dvh flex items-center justify-center relative bg-[url('/src/assets/Images/light-bg.jpg')]">
//       {loading && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
//             <Loader className="h-8 w-8 animate-spin text-primary" />
//             <p className="mt-2 text-sm font-medium">Loading...</p>
//           </div>
//         </div>
//       )}

//       <Card className="w-96 m-4">
//         <CardContent className="p-8 flex flex-col justify-center items-center">
//           <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
//             <span className="text-primary-foreground font-bold">ESS</span>
//           </div>

//           <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 mt-10">
//             Welcome Back
//           </h2>
//           <p className="text-center text-muted-foreground mb-8">
//             Sign in to your account
//           </p>

//           <form onSubmit={handleLogin} className="w-full space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="userId">User ID</Label>
//               <div className="relative">
//                 <IdCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                 <Input
//                   id="user_id"
//                   className="pl-10"
//                   placeholder="Enter your User ID"
//                   value={userId}
//                   onChange={(e) => setUserId(e.target.value)}
//                   required
//                 />
//               </div>
//               {errors.userId && (
//                 <p className="text-sm text-destructive">User ID is required</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="username">Username</Label>
//               <div className="relative">
//                 <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                 <Input
//                   id="username"
//                   className="pl-10"
//                   placeholder="Enter your username"
//                   value={userName}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required
//                 />
//               </div>
//               {errors.userName && (
//                 <p className="text-sm text-destructive">Username is required</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   className="pl-10 pr-10"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="text-sm text-destructive">Password is required</p>
//               )}
//               {error && <p className="text-sm text-destructive">{error}</p>}
//             </div>

//             <Button type="submit" className="w-full" size="lg">
//               Sign In
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useState } from "react";
import { Eye, EyeOff, Lock, User, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const apiBaseUrl = process.env.VITE_BASE_API;

export default function LoginForm() {
  const router = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const fetchDetails = async (loginUser) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/details/`, {
        credentials: "include",
      });
      const data = await res.json();

      return (
        data.admins.find((u) => u.user_id === loginUser.user_id) ||
        data.managers.find((u) => u.manager_id === loginUser.user_id) ||
        data.hrs.find((u) => u.hr_id === loginUser.user_id) ||
        data.employees.find((u) => u.employee_id === loginUser.user_id) ||
        data.supervisors.find((u) => u.supervisor_id === loginUser.user_id)
      );
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Error fetching user details. Please try again later.");
      return null;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = {
      username: data.username,
      user_id: data.user_id,
      password: data.password,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/common_login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const loginUser = await res.json();
      if (loginUser) {
        sessionStorage.setItem("loginUser", JSON.stringify(loginUser));
        const user = await fetchDetails(loginUser);

        if (user) {
          sessionStorage.setItem("userdata", JSON.stringify(user));

          // Navigate based on role
          const routes = {
            admin: "/admin",
            hr: "/user/hr",
            manager: "/manager",
            employee: "/user/employee",
            supervisor: "/user/supervisor",
          };

          const route = routes[loginUser.role];
          if (route) {
            router(route);
            toast.success(`Welcome Back ${user.username} 👋`);
          }
        }
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex overflow-clip min-h-screen">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-[#ffd54f]" />
            <p className="mt-2 text-sm font-medium">Authenticating...</p>
          </div>
        </div>
      )}

      <div className="h-full w-full overflow-hidden">
        <div className="h-full grid grid-cols-2 lg:grid-cols-3">
          {/* Form Section */}
          <div className="p-10 h-screen col-span-2 lg:col-span-1 bg-gradient-to-l from-amber-200 to-blue-200">
            <div className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-[#e0e0e0] text-lg font-semibold text-gray-800 mb-12">
              ESS
            </div>

            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-500 mb-8">
              Sign in to your employee account
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* User ID Field */}
              <div className="space-y-2">
                <Label htmlFor="user_id" className="text-gray-500 text-sm">
                  User ID
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  {/* <Input
                    id="user_id"
                    className="pl-10 h-12 rounded-xl border-0 bg-white focus:border-amber-400 focus:ring-amber-400 transition-all"
                    placeholder="Enter your user ID"
                    {...register("user_id", { required: true })}
                  /> */}
                  <input
                    id="user_id"
                    className="pl-10 h-12 rounded-xl border w-full bg-white focus:border-amber-400 focus:ring-amber-400 transition-all"
                    placeholder="Enter your user ID"
                    {...register("user_id", { required: true })}
                  />
                </div>
                {errors.user_id && (
                  <p className="text-sm text-red-500">User ID is required</p>
                )}
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-500 text-sm">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    className="pl-10 h-12 rounded-xl border w-full bg-[#fff] focus:border-amber-400 focus:ring-amber-400 transition-all"
                    placeholder="Enter your username"
                    {...register("username", { required: true })}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-500">Username is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-500 text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 h-12 rounded-xl border w-full bg-[#fff] focus:border-amber-400 focus:ring-amber-400 transition-all"
                    placeholder="Enter your password"
                    {...register("password", { required: true })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">Password is required</p>
                )}
              </div>

              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-full bg-[#ffd54f] hover:bg-[#ffca28] text-gray-900 font-semibold"
              >
                Sign In
              </Button>
            </form>
          </div>

          {/* Calendar Section with Background Image */}
          <div className="hidden lg:block relative bg-[#2c2c2c] md:col-span-2 overflow-hidden">
            {/* <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
              }}
            ></div> */}
            {/* <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <div className="bg-white/90 p-6 rounded-xl shadow-lg w-full max-w-xs">
                <Calendar
                  onChange={setDate}
                  value={date}
                  className="border-0"
                  tileClassName={({ date, view }) =>
                    view === "month" && date.getDate() === new Date().getDate()
                      ? "bg-[#ffd54f] rounded-full text-white"
                      : null
                  }
                />
              </div>
              <div className="mt-8 text-white text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {date.getDay() === 0
                    ? "Today is a Holiday 🎉"
                    : "Today's Schedule"}
                </h3>
                {date.getDay() === 0 ? (
                  <p className="text-gray-300">Enjoy your Sunday!</p>
                ) : (
                  <>
                    <p className="text-gray-300">9:00 AM - 6:00 PM</p>
                    <p className="text-gray-300 mt-2">
                      Lunch: 1:00 PM - 2:00 PM
                    </p>
                  </>
                )}
              </div>
            </div> */}

            <ImageSlider />
          </div>
        </div>
      </div>
    </div>
  );
}

const ImageSlider = () => {
  return (
    <div className="text-white">
      <Swiper
        loop={true}
        autoplay={{ delay: 1000, disableOnInteraction: false }}
      >
        {[
          "/BannerImages/banner1.jpg",
          "/BannerImages/banner2.jpg",
          "/BannerImages/banner3.jpg",
          "/BannerImages/banner4.jpg",
        ].map((image, index) => (
          <SwiperSlide key={index}>
            <div className="h-screen relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-amber-200/30 to-amber-50/10"></div>
              <img
                src={image}
                alt={image}
                loading="lazy"
                className="max-w-full h-full object-cover object-center bg-gradient-to-b from-amber-200 to-amber-50 "
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
