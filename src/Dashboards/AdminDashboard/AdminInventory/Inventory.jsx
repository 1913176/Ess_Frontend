
import React from "react";
import { Outlet } from "react-router-dom";


const Billing = () => {
  return (
    <div className="flex flex-col h-screen">
      
      <div className="flex-1 p-4 overflow-auto">
        <Outlet /> 
        
      </div>
    </div>
  );
};

export default Billing;