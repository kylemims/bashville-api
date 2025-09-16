import { useContext } from "react";
import AuthContext from "../contexts/AuthContext.jsx";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider! Did you forget to wrap your app?");
  }
  return context;
};
