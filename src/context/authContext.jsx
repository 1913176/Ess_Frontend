import { createContext, useState } from "react";
import { CommonLogin, UserDetails } from "@/api/ServerAction";
import { useMutation, useQuery } from "@tanstack/react-query";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loginData, setLoginData] = useState({});
  const [userInfo, setUserInfo] = useState([]);
  const mutation = useMutation({
    mutationFn: (payload) => CommonLogin(payload),
    onSuccess: (data) => {
      setLoginData(data);
      FindUser.mutate(data);
    },
  });
  //   const { data: userInfo, isLoading } = useQuery({
  //     queryKey: ["auth"],
  //     queryFn: () => UserDetails(loginData),
  //   });

  const FindUser = useMutation({
    mutationFn: (payload) => UserDetails(payload),
    onSuccess: (data) => {
      setUserInfo(data);
    },
  });

  console.log({ loginData, userInfo });

  return (
    <AuthContext.Provider value={{ mutation, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
