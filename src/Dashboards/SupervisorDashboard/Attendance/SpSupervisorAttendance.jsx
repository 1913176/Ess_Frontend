import React from "react";
import AttendanceContent from "../../SupervisorDashboard/Attendance/AttendanceContent";
import AttendanceChart from "../../SupervisorDashboard/Attendance/AttendanceChart";
import AttendanceForm from "../../SupervisorDashboard/Attendance/AttendanceForm";
import axios from "axios";

axios.defaults.withCredentials = true;
const SpSupervisorAttendance = () => {
  return (
    <div>
      <AttendanceContent />
      <AttendanceForm />
      <AttendanceChart />
    </div>
  );
};

export default SpSupervisorAttendance;
