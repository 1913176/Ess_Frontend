import React from "react";
import AttendanceContent from "./AttendanceContent";
import AttendanceChart from "./AttendanceChart";
import AttendanceForm from "./AttendanceForm";
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
