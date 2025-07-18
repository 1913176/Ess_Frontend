import React, { useState, useEffect } from "react";
import axios from "axios";
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
import UpdateProfile from "./UpdateProfile";

const apiBaseUrl = process.env.VITE_BASE_API;

const SpSupervisorProfile = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userdata")) || {};
  const [profile, setProfile] = useState(null);
  const [isUpdate, setUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!userInfo.supervisor_id) {
      setError("User data not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/supervisor/get/${userInfo.supervisor_id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      // Log the API response for debugging
      console.log("Fetch Profile API Response:", response.data);

      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error("API Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.detail || "Failed to fetch profile data.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userInfo.supervisor_id, isUpdate]); // Re-fetch profile when isUpdate changes

  if (loading) return <p>Loading profile...</p>;
  if (error || !profile) return <p className="text-red-500">{error || "Profile data not available."}</p>;

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="profile-header flex justify-between">
        <div>
          <h2 className="font-semibold">Supervisor Profile</h2>
          <p className="font-base">View and manage supervisor information</p>
        </div>
        <Button onClick={() => setUpdate((prev) => !prev)}>
          <Edit /> Edit Profile
        </Button>
      </div>
      <div className="flex h-full gap-4 flex-col sm:flex-row">
        <div>
          <Card>
            <CardHeader className="flex flex-col justify-center items-center">
              <img
                src={
                  profile.supervisor_image
                    ? `${apiBaseUrl}${profile.supervisor_image}?t=${new Date().getTime()}`
                    : "https://via.placeholder.com/150"
                }
                alt={profile.supervisor_name}
                className="size-60 rounded-full object-cover object-center border-4 p-1 border-primary"
              />
              <h3 className="font-bold text-xl">
                {profile.supervisor_name || "Supervisor Name"}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <p className="flex space-x-2 items-center">
                  <IdCard height={24} />
                  <span>{profile.supervisor_id || "SUP000"}</span>
                </p>
                <p className="flex space-x-2 items-center">
                  <Mail height={24} />
                  <span>{profile.email || "supervisor@email.com"}</span>
                </p>
                <p className="flex space-x-2 items-center">
                  <Mail height={24} />
                  <span>
                    {profile.department_name
                      ? `${profile.department_name} Department`
                      : "Example Department"}
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
                <Overview profile={profile} />
                <Skillset />
                <AttendanceRecord />
              </div>
            </TabsContent>
            <TabsContent value="employment">
              <Employment profile={profile} />
            </TabsContent>
            <TabsContent value="documents">
              <Documentset />
            </TabsContent>
            <TabsContent value="attendance">
              <AttendanceRecord />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {isUpdate && (
        <div className="absolute left-0 top-12 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <UpdateProfile
            supervisorId={userInfo.supervisor_id}
            setUpdate={setUpdate}
            profile={profile}
            setProfile={setProfile}
          />
        </div>
      )}
    </div>
  );
};

const Overview = ({ profile }) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Gender:</strong> {profile.gender || "None"}</p>
            <p><strong>Date of Birth:</strong> {profile.dob || "None"}</p>
            <p><strong>Address:</strong> {profile.address || "None"}</p>
            <p><strong>City:</strong> {profile.city || "None"}</p>
            <p><strong>State:</strong> {profile.state || "None"}</p>
            <p><strong>Country:</strong> {profile.country || "None"}</p>
            <p><strong>Phone:</strong> {profile.phone_number || "None"}</p>
            <p><strong>Pincode:</strong> {profile.pincode || "None"}</p>
            <p>
              <strong>LinkedIn:</strong>{" "}
              {profile.linkedin_profile_link ? (
                <a
                  href={profile.linkedin_profile_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Profile
                </a>
              ) : (
                "None"
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Skillset = () => {
  const [skills] = useState([
    "Leadership",
    "Team Management",
    "Project Oversight",
    "Communication",
  ]);
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
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
          <CardTitle>Supervisor Documents</CardTitle>
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
              <div>
                <Button>Download</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Employment = ({ profile }) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Employment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Hired Date:</strong> {profile.hired_date || "None"}</p>
            <p><strong>Department:</strong> {profile.department_name || "None"}</p>
            <p><strong>Shift:</strong> {profile.shift || "None"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AttendanceRecord = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>Current month attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div className="flex flex-col items-center justify-center space-y-2 w-full">
              <Clock />
              <h2>0 Days</h2>
              <p className="text-muted-foreground">Present</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 w-full">
              <Clock />
              <h2>0 Days</h2>
              <p className="text-muted-foreground">Absent</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 w-full">
              <Clock />
              <h2>0 Days</h2>
              <p className="text-muted-foreground">Leave</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 w-full">
              <Clock />
              <h2>0 Days</h2>
              <p className="text-muted-foreground">Working Days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpSupervisorProfile;