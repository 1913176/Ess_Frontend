import { useContext } from "react";
import { Outlet } from "react-router-dom";
import ManagerHeader from "./ManagerHeader";
import ChatContext from "../../context/chatContext";
import ChatModel from "../Chat/ChatModel";

const ManagerDashboard = () => {
  const { isOpenChat } = useContext(ChatContext);
  return (
    <div className="flex flex-col relative min-h-screen bg-slate-100">
      <ManagerHeader />
      <div className="h-full relative">
        <Outlet />
      </div>
      {isOpenChat && <ChatModel />}
    </div>
  );
};

export default ManagerDashboard;
