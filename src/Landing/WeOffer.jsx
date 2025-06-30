import { Calendar, Users, WalletCards } from "lucide-react";
import React from "react";

const WeOffer = () => {
  return (
    <div className="py-16 bg-slate-900 px-8">
      <div className="container mx-auto text-center">
        <p className="text-4xl lg:text-6xl font-medium mb-4 text-slate-100">
          What We Offer
        </p>
        <p className="text-gray-300/70 mb-12 max-w-2xl text-base lg:text-xl mx-auto">
          Comprehensive HRMS solutions to streamline your human resource
          management processes.
        </p>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-md hover:bg-slate-700">
            <Users className="w-12 h-12 mb-4 text-blue-100" />
            <h3 className="text-xl font-medium text-slate-100 mb-3">
              Employee Management
            </h3>
            <p className="text-gray-500">
              Efficiently manage employee data, attendance, and performance
              tracking in one place.
            </p>
          </div>
          <div className="flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-md hover:bg-slate-700">
            <WalletCards className="w-12 h-12 mb-4 text-blue-100" />
            <h3 className="text-xl font-medium text-slate-100 mb-3">
              Payroll Processing
            </h3>
            <p className="text-gray-500">
              Automated payroll management with tax calculations and compliance
              handling.
            </p>
          </div>
          <div className="flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-md hover:bg-slate-700">
            <Calendar className="w-12 h-12 mb-4 text-blue-100" />
            <h3 className="text-xl font-medium text-slate-100 mb-3">
              Leave Management
            </h3>
            <p className="text-gray-500">
              Streamlined leave application and approval process with calendar
              integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeOffer;
