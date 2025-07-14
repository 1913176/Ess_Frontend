import { DownloadCloud, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const apiBaseUrl = process.env.VITE_BASE_API;

const ManagerTrainingCertification = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userdata"));
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [certifications, setCertifications] = useState([]);

  // Fetch data from the backend
  useEffect(() => {
    const fetchTrainingPrograms = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/training_programs/`);
        console.log(response);

        setTrainingPrograms(response.data); // Adjust based on the response structure
        // setCertifications(response.data.certifications); // Adjust if certifications are part of the response
      } catch (error) {
        console.error("Error fetching training programs:", error);
      }
    };
    const fetchCertificate = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/certificates/manager/${userInfo.username}/`,
        );
        console.log(response);

        // setTrainingPrograms(response.data); // Adjust based on the response structure
        setCertifications(response.data); // Adjust if certifications are part of the response
      } catch (error) {
        console.error("Error fetching training programs:", error);
      }
    };
    fetchCertificate();

    fetchTrainingPrograms();
  }, []);
  const HandleEnroll = async (program_id) => {
    const payload = {
      program_id: program_id,
      manager_username: userInfo.username,
    };
    const response = await axios.post(`${apiBaseUrl}/enroll_manager/`, payload);
    toast.success("enroll successfully");
  };

  return (
    <div className="p-6 h-[calc(100vh-50px)] flex flex-col lg:flex-row gap-8">
      {/* Training Program Section */}
      {/* <div className="training-program flex-1 bg-white p-8 rounded-2xl border">
        <h2 className="text-2xl font-bold mb-4">Training Programme</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">No</th>
                <th className="py-3 px-4 text-left">Program Name</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {trainingPrograms.map((program, index) => (
                <tr className="border-t" key={index}>
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{program.name}</td>
                  <td className="py-3 px-4">{program.description}</td>
                  <td className="py-3 px-4">
                    <button
                      className="flex rounded-xl hover:bg-blue-500 bg-blue-600 text-white items-center justify-center px-4 py-2"
                      onClick={() => HandleEnroll(program.program_id)} // Use an arrow function
                    >
                      <Plus className="h-6" /> Enroll
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
      {/* <div className="flex-1"> */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Training Programme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.no</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Desciption Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainingPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}> no Programme available</TableCell>
                  </TableRow>
                ) : (
                  trainingPrograms.map((programme, index) => (
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{programme.name}</TableCell>
                      <TableCell>{programme.description}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => HandleEnroll(program.program_id)}
                        >
                          <Plus className="h-6" /> Enroll
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* </div> */}

      {/* Certification Section */}
      <Card>
        <CardHeader>
          <CardTitle>Certification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="certificate-card-list flex flex-col gap-2">
            {certifications.map((cert, index) => (
              <div
                key={cert.id}
                className="certificate-card flex justify-between border p-5 rounded-xl gap-14 hover:shadow-xl bg-slate-100"
              >
                <div className="flex flex-col items-start leading-8">
                  <h3 className="font-medium text-head">
                    {cert.certification_name}
                  </h3>
                  <p className="text-sm text-body">
                    {cert.certifications_date}
                  </p>
                </div>
                <button className="btn-primary flex items-center gap-2 rounded-2xl px-4 py-2">
                  <DownloadCloud />
                  <a
                    href={cert.certifications_file}
                    download={cert.certifications_file}
                  >
                    Download
                  </a>
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerTrainingCertification;
