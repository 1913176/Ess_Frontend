import { Outlet } from "react-router-dom";
import HRHeader from "./HRHeader";

export default function HRLayout() {
  return (
    <div className="flex flex-col w-full">
      <HRHeader />
      <div className="h-[calc(100vh-50px)] relative">
        <Outlet />
      </div>
    </div>
  );
}
