import React from "react";
import { useNavigate } from "react-router-dom";

export const ErrorPage = ({ path }) => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center animate-fadeIn">
        <h1 className="text-9xl font-extrabold text-gray-800 animate-bounce">
          4<span className="text-blue-500">0</span>4
        </h1>
        <p className="text-2xl font-semibold text-gray-600 mb-8 mt-4">
          Oops! Page Not Found
        </p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't seem to exist
        </p>
        <div className="space-x-4">
          <button
            onClick={handleReload}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium
                                 transform transition-transform duration-200 hover:scale-105
                                 hover:bg-blue-600 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="px-8 py-3 bg-gray-700 text-white rounded-lg font-medium
                                 transform transition-transform duration-200 hover:scale-105
                                 hover:bg-gray-800 shadow-lg hover:shadow-xl"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};
