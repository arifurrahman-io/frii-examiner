import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { apiLogin, apiLogout } from "../api/apiService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout(false);
          return;
        }

        const sessionUser = {
          _id: decoded.id,
          name: decoded.name || decoded.username || "Admin",
          username: decoded.username,
          role: decoded.role,
          email: decoded.email,
          campus: decoded.campus,
        };
        setUser(sessionUser);
        localStorage.setItem("user", JSON.stringify(sessionUser));
      } catch (error) {
        console.error("Token decoding failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromToken();
  }, [token]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const { data } = await apiLogin(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (showToast = true) => {
    try {
      await apiLogout();
    } catch (error) {
      console.error(
        "Server logout API failed, proceeding client-side logout:",
        error
      );
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);

    if (showToast) {
      toast("Logged out successfully.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {isLoading ? (
        <div className="text-center p-20 text-xl text-indigo-500">
          Loading session...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
