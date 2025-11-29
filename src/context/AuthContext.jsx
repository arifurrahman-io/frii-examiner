import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiLogin, apiLogout } from "../api/apiService";
// Note: jwt-decode প্যাকেজটি ইন্সটল করা আবশ্যক: npm install jwt-decode
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // ১. টোকেনটিকে localStorage থেকে প্রাথমিক মান হিসেবে আনা
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // প্রাথমিক লোডিং স্টেট

  // --- ২. অ্যাপ লোড হওয়ার পর সেশন রিকভার করার লজিক (CRUCIAL FIX) ---
  useEffect(() => {
    const loadUserFromToken = async () => {
      if (token) {
        try {
          // টোকেনটি ডিকোড করে ইউজার ডেটা পুনরুদ্ধার করা
          const decoded = jwtDecode(token);

          // টোকেন মেয়াদোত্তীর্ণ কিনা তা যাচাই করা
          if (decoded.exp * 1000 < Date.now()) {
            console.log("Token expired. Logging out.");
            logout(false); // মেয়াদোত্তীর্ণ হলে লগআউট
            return;
          }

          // ইউজার ডেটা সেট করা
          setUser({
            _id: decoded.id,
            name: decoded.username || "Admin", // ডিকোড করা ডেটা ব্যবহার করা
            role: decoded.role,
          });
        } catch (error) {
          console.error("Token decoding failed:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false); // লোডিং শেষ
    };

    loadUserFromToken();
  }, [token]);

  // --- ৩. লগইন ফাংশন (সেভিং টোকেন) ---
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const { data } = await apiLogin(credentials);

      localStorage.setItem("token", data.token);
      setToken(data.token); // State update trigger useEffect again to set user
      setUser(data.user); // যেহেতু login API user ডেটাও পাঠায়, তাই সরাসরি সেট করা হলো

      toast.success(`Welcome, ${data.user.name}!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // --- ৪. লগআউট ফাংশন ---
  const logout = async (showToast = true) => {
    // async যোগ করা হলো

    // 1. (ঐচ্ছিক) ব্যাকএন্ডে API কল করে সেশন নষ্ট করা
    try {
      await apiLogout(); // POST /api/auth/logout কল করা হলো
    } catch (error) {
      // যদি সার্ভার 404 বা 500 দেয়, তবুও ফ্রন্টএন্ডকে লগআউট করতে হবে
      console.error(
        "Server logout API failed, proceeding client-side logout:",
        error
      );
    }

    // 2. টোকেন ও স্টেট রিসেট করা (CRITICAL)
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);

    if (showToast) {
      toast("Logged out successfully.", { icon: "👋" });
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Loading এর সময় কোনো কন্টেন্ট রেন্ডার করা থেকে বিরত রাখা */}
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
