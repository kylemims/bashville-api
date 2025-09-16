import { createContext, useState, useEffect } from "react";
import { STORAGE_KEYS } from "../utils/constants.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      console.log("No auth token or user data found in localStorage");
    }
    setLoading(false);
  }, []);

  const login = (token, userData = null) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setIsAuthenticated(false);
    setUser(null);
  };

  const getToken = () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
