import { createContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isOpenChat, setIsOpenChat] = useState(false);
  return (
    <ChatContext.Provider value={{ isOpenChat, setIsOpenChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
