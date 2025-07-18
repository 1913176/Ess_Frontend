import React, { useState } from "react";
import Content from "./AttendanceContent";
import AttendanceChart from "../../UserDashboard/EmployeeAttendance/AttendanceChart";
import AttendanceForm from "../../UserDashboard/EmployeeAttendance/AttendanceForm";
import axios from "axios";

axios.defaults.withCredentials = true;
const Employee_Attendance = () => {
  const [isOpenForm, setIsOpenForm] = useState(false);
  return (
    <div className="relative min-h-dvh h-full overflow-hidden">
      <div className="flex flex-col">
        <Content setIsOpenForm={setIsOpenForm} />
        {/* <AttendanceChart /> */}
      </div>
      {isOpenForm && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <AttendanceForm setIsOpenForm={setIsOpenForm} />
        </div>
      )}
    </div>
  );
};

export default Employee_Attendance;
