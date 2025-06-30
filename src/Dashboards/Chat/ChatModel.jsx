import { ArrowUpRight, PlusCircle, SearchIcon } from "lucide-react";
import React from "react";
const apiBaseUrl = process.env.VITE_BASE_API;
const ChatModel = () => {
  return (
    <div className="bg-blue-50 absolute w-full h-full md:w-1/2 lg:w-1/4 xl:w-1/4 right-0 z-10 border-l transition-transform duration-500">
      <div className="p-8 flex flex-col gap-4">
        <div className="chart-header flex justify-between items-center">
          <h3 className="text-xl">Chat</h3>
          <div>
            <PlusCircle />
          </div>
        </div>
        <div className="relative flex flex-col rounded-lg">
          <input
            type="text"
            placeholder="Search chat"
            className="w-full p-3 rounded-lg bg-white/80 pr-12"
          />
          <SearchIcon className="absolute right-3 top-3 text-gray-500" />
        </div>
        <div className="chat-list grid overflow-y-auto max-h-[80dvh] gap-2 scroll-p-8">
          {Array.from({ length: 18 }).map((_, index) => (
            <Chat key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatModel;

const Chat = () => {
  return (
    <div className="chat bg-white p-3 rounded-xl border flex items-center gap-4">
      <div className="bg-black h-14 w-14 rounded-full"></div>
      <div className="leading-6 flex-1">
        <h3 className="font-medium">Sudhaker Vlt</h3>
        <p>Hii 😊</p>
      </div>
      <div className="leading-6 flex flex-col items-end">
        <span className="font-base text-xs">12.00 PM</span>
        <p>
          <ArrowUpRight />
        </p>
      </div>
    </div>
  );
};
