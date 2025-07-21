import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Calendar, Clock, CheckCircle, List, User } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const apiBaseUrl = process.env.VITE_BASE_API;

const userInfo = JSON.parse(sessionStorage.getItem("userdata"));

const Card = () => {
  const [employeeData, setEmployeeData] = useState({
    employee: {
      employee_name: "",
      department_name: "",
      employee_image: "",
      employee_id: ""
    },
    leave_balance: {
      total_leave_days: 0,
      total_absent_days: 0,
      vacation_leave: 0,
      medical_leave: 0,
      personal_leave: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  axios.defaults.withCredentials = true;

  const fetchEmployeeData = async () => {
    console.log("get employee data API hitted")
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${apiBaseUrl}/employee_dashboard/`);
      
      // Safely merge API response with defaults
      setEmployeeData(prev => ({
        employee: {
          ...prev.employee,
          ...(res.data.employee || {})
        },
        leave_balance: {
          ...prev.leave_balance,
          ...(res.data.leave_balance || {})
        }
      }));
      console.log(employeeData, "EMPDATA")
    } catch (err) {
      setError(err.message || "Failed to fetch employee data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {/* Profile Card Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-8 col-span-full lg:col-span-1">
          <div className="flex items-center">
            <Skeleton circle width={80} height={80} className="mr-6" />
            <div className="flex-1">
              <Skeleton width={150} height={25} className="mb-2" />
              <Skeleton width={100} height={20} className="mb-1" />
              <Skeleton width={80} height={16} />
            </div>
          </div>
        </div>

        {/* Leave Cards Skeleton */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-8 flex items-center h-full">
            <Skeleton circle width={60} height={60} className="mr-6" />
            <div className="flex-1">
              <Skeleton width={120} height={20} className="mb-2" />
              <Skeleton width={60} height={30} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={fetchEmployeeData}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Destructure with defaults
  const { 
    employee_name = "", 
    department_name = "", 
    employee_id = "" 
  } = employeeData.employee || {};
  
  const { 
    total_leave_days = 0,
    total_absent_days = 0,
    vacation_leave = 0,
    medical_leave = 0,
    personal_leave = 0
  } = employeeData.leave_balance || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Employee Profile Card */}
      <div className="bg-white rounded-xl shadow-md p-8 col-span-full lg:col-span-1">
        <div className="flex items-center">
          <div className="bg-blue-100 p-5 rounded-full mr-6">
            <User className="text-blue-600 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{employee_name}</h2>
            <p className="text-gray-600">{department_name}</p>
            <p className="text-gray-500 text-sm mt-1">ID: {employee_id}</p>
          </div>
        </div>
      </div>

      {/* Total Leave Days Card */}
      <div className="bg-white rounded-xl shadow-md p-8 flex items-center h-full">
        <div className="bg-green-100 p-5 rounded-full mr-6">
          <Calendar className="text-green-600 w-8 h-8" />
        </div>
        <div>
          <h3 className="text-gray-500 text-md font-medium">Total Leave Days</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {total_leave_days}
          </p>
        </div>
      </div>

      {/* Total Absent Days Card */}
      {/* <div className="bg-white rounded-xl shadow-md p-8 flex items-center h-full">
        <div className="bg-red-100 p-5 rounded-full mr-6">
          <Calendar className="text-red-600 w-8 h-8" />
        </div>
        <div>
          <h3 className="text-gray-500 text-md font-medium">Total Absent Days</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {total_absent_days}
          </p>
        </div>
      </div> */}

      {/* Vacation Leave Card */}
      <div className="bg-white rounded-xl shadow-md p-8 flex items-center h-full">
        <div className="bg-blue-100 p-5 rounded-full mr-6">
          <CheckCircle className="text-blue-600 w-8 h-8" />
        </div>
        <div>
          <h3 className="text-gray-500 text-md font-medium">Vacation Leave</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {vacation_leave}
          </p>
        </div>
      </div>

      {/* Medical Leave Card */}
      <div className="bg-white rounded-xl shadow-md p-8 flex items-center h-full">
        <div className="bg-purple-100 p-5 rounded-full mr-6">
          <CheckCircle className="text-purple-600 w-8 h-8" />
        </div>
        <div>
          <h3 className="text-gray-500 text-md font-medium">Medical Leave</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {medical_leave}
          </p>
        </div>
      </div>

      {/* Personal Leave Card */}
      <div className="bg-white rounded-xl shadow-md p-8 flex items-center h-full">
        <div className="bg-yellow-100 p-5 rounded-full mr-6">
          <CheckCircle className="text-yellow-600 w-8 h-8" />
        </div>
        <div>
          <h3 className="text-gray-500 text-md font-medium">Personal Leave</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {personal_leave}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;