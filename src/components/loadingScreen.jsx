import React from "react";
import { ScaleLoader } from "react-spinners";
const LoadingScreen = () => {
  return (
    <div className="absolute w-full h-full bg-white/80 flex items-center justify-center z-10">
      <ScaleLoader />
    </div>
  );
};

export default LoadingScreen;
