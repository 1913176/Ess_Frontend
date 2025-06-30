// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import UpdateProfile from "./UpdateProfile";
// const apiBaseUrl = process.env.VITE_BASE_API;
// const ManagerProfile = () => {
//   const userInfo = JSON.parse(localStorage.getItem("userdata")) || {}; // Prevent null errors
//   const [profile, setProfile] = useState(null);
//   const [isUpdate, setUpdate] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       if (!userInfo.manager_id) {
//         setError("User data not found. Please log in again.");
//         setLoading(false);
//         return;
//       }

//       // Debugging: Check if the ID is correct
//       console.log("Fetching profile for Manager ID:", userInfo.manager_id);

//       try {
//         const response = await axios.get(
//           `${apiBaseUrl}/api/managers/${userInfo.manager_id}/`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${localStorage.getItem("token")}`, // Optional if authentication is used
//             },
//           }
//         );
//         setProfile(response.data);
//       } catch (err) {
//         console.error("API Error:", err.response ? err.response.data : err);
//         setError(err.response?.data?.detail || "Failed to fetch profile data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [userInfo.manager_id]); // Only fetch when `userInfo.id` changes

//   if (loading) return <p>Loading profile...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   return (
//     <div>
//       <div className="bg-white shadow-md rounded-lg p-2">
//         <p className="p-1 font-bold">Profile Details</p>
//         <div className="flex gap-2 p-1">
//           <p>ID:</p>
//           <p>{profile.manager_id}</p> {/* Adjusted key name if needed */}
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Name:</p>
//           <p>{profile.manager_name}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Username:</p>
//           <p>{profile.username}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Email:</p>
//           <p>{profile.email || "None"}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Image:</p>
//           <img
//             src={profile.image || "https://via.placeholder.com/150"}
//             alt="Profile"
//             className="w-16 h-16 rounded-full"
//           />
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Gender:</p>
//           <p>{profile.gender}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Date of Birth:</p>
//           <p>{profile.dob}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Hired Date:</p>
//           <p>{profile.hiredDate || "None"}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Department:</p>
//           <p>{profile.department || "None"}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Shift:</p>
//           <p>{profile.shift}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Address:</p>
//           <p>{profile.address || "None"}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>City:</p>
//           <p>{profile.city || "None"}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Country:</p>
//           <p>{profile.country || "None"}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>State:</p>
//           <p>{profile.state || "None"}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Phone:</p>
//           <p>{profile.phone || "None"}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>Pincode:</p>
//           <p>{profile.pincode || "None"}</p>
//         </div>
//         <div className="flex gap-2 p-1">
//           <p>LinkedIn Profile:</p>
//           <a
//             href={profile.linkedin || "#"}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-500 underline"
//           >
//             {profile.linkedin ? "View Profile" : "None"}
//           </a>
//         </div>

//         <p
//           onClick={() => setUpdate((prev) => !prev)}
//           className="bg-blue-400 text-white w-[120px] mt-2 rounded-md text-center p-1 cursor-pointer hover:bg-blue-500 transition"
//         >
//           Update Profile
//         </p>
//       </div>

//       {/* for popup */}
//       {isUpdate && (
//         <div className="absolute left-0 top-12 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
//           <UpdateProfile
//             managerId = {userInfo.manager_id}
//             setUpdate={setUpdate}
//             profile={profile}
//             setProfile={setProfile}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManagerProfile;

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Edit, File, IdCard, Mail } from "lucide-react";
import React from "react";
import { useState } from "react";
const apiBaseUrl = process.env.VITE_BASE_API;
const ManagerProfile = () => {
  const userInfo = JSON.parse(localStorage.getItem("userdata")) || {};
  const [profile, setProfile] = useState(userInfo);
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="profile-header flex justify-between">
        <div className="">
          <h2 className="font-semibold">Manager Profile</h2>
          <p className="font-base">View and Manager informantion</p>
        </div>
        <Button>
          <Edit /> Edit Profile
        </Button>
      </div>
      <div className="flex h-full gap-4 flex-col sm:flex-row">
        <div className="">
          <Card>
            <CardHeader className="flex flex-col justify-center items-center">
              <img
                src={`${apiBaseUrl}${profile.manager_image}`}
                alt={profile.manager_name}
                className="size-60        
             rounded-full object-cover object-center border-4 p-1 border-primary"
              />
              <h3 className="font-bold text-xl">
                {profile.manager_name || "manager Name"}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <p className="flex space-x-2 items-center">
                  <IdCard height={24} />{" "}
                  <span>{profile.manager_id || "MGR000"}</span>
                </p>
                <p className=" flex space-x-2 items-center">
                  <Mail height={24} />{" "}
                  <span>{profile.email || "manager@email.com"}</span>
                </p>
                <p className="flex space-x-2 items-center">
                  <Mail height={24} />{" "}
                  <span>
                    {profile.department + " Department" || "example Department"}
                  </span>
                </p>
              </div>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        </div>
        <div className="flex-1">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="documents">Document</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="space-y-4">
                <Overview />
                <Skillset />
                <AttendanceRecord />
              </div>
            </TabsContent>
            <TabsContent value="employment">Employment</TabsContent>
            <TabsContent value="documents">
              <Documentset />
            </TabsContent>
            <TabsContent value="attendance">
              <AttendanceRecord />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;

const Overview = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quasi
          repudiandae a corrupti, adipisci aut consectetur commodi ex debitis
          tempora nobis placeat delectus ad. Aperiam, sed iure. Aperiam eveniet
          sequi harum.
        </CardContent>
      </Card>
    </div>
  );
};

const Skillset = () => {
  const [skills, setSkills] = useState([
    "Reactjs",
    "JavaScript",
    "Java",
    "Python",
    "Django",
  ]);
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {skills.map((skill, index) => (
              <Badge key={index}>{skill}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Documentset = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Employee Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-col">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <File />
                <div className="flex flex-col">
                  <h2 className="font-bold">Document Name</h2>
                  <p className="text-muted-foreground">Doc Type</p>
                </div>
              </div>
              <div className="">
                <Button>Download</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AttendanceRecord = () => {
  return (
    <div className="">
      {/* attendance header */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>Current month attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div className="flex flex-col items-center justify-center space-y-2 w-full">
              <Clock />
              <h2>{"0 Days"}</h2>
              <p className="text-muted-foreground">Present</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 w-full">
              <Clock />
              <h2>{"0 Days"}</h2>
              <p className="text-muted-foreground">Absent</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 w-full">
              <Clock />
              <h2>{"0 Days"}</h2>
              <p className="text-muted-foreground">Leave</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 w-full">
              <Clock />
              <h2>{"0 Days"}</h2>
              <p className="text-muted-foreground">Workig Days</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* attendance activity */}
      {/* <Card>
        <CardHeader>
          <CardTitle></CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card> */}
    </div>
  );
};
