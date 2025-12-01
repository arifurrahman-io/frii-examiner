import React, { useState } from "react";
import { FaSignInAlt, FaUserTie, FaLock, FaSyncAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

// Reusable UI Components
import InputField from "../components/ui/InputField"; // <--- Import InputField
import Button from "../components/ui/Button"; // <--- Import Button

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    teacherIdOrEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // যদি ইউজার ইতিমধ্যেই লগইন করে থাকে, তবে তাকে ড্যাশবোর্ডে রিডাইরেক্ট করুন
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { teacherIdOrEmail, password } = credentials;

    if (!teacherIdOrEmail || !password) {
      toast.error("Please enter both ID/Email and Password.");
      setLoading(false);
      return;
    }

    try {
      // AuthContext এর login ফাংশন কল করা
      const success = await login({
        username: teacherIdOrEmail, // API অনুযায়ী ইউজারনেম হিসেবে পাঠানো
        password,
      });

      if (success) {
        // সফল হলে ড্যাশবোর্ডে নেভিগেট করা
        navigate("/");
      }
    } catch (error) {
      // ত্রুটি ইতিমধ্যেই AuthContext দ্বারা টোস্ট করা হয়েছে, এখানে শুধু লোডিং শেষ করুন
      console.error("Login attempt error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ Updated: BG gradient and layout container
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* ✅ Updated: Enhanced card style with cleaner design */}
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-4xl border border-indigo-200/70 transform transition-all duration-500 hover:shadow-5xl">
        <div className="text-center mb-10">
          <FaUserTie className="text-6xl text-indigo-700 mx-auto mb-3" />
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Login Required
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Access your Responsibility Management Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Username/Teacher ID Field (Using reusable InputField) */}
          <InputField
            label="Teacher ID or Email"
            type="text"
            name="teacherIdOrEmail"
            icon={FaUserTie}
            placeholder="Enter ID or Email"
            value={credentials.teacherIdOrEmail}
            onChange={handleChange}
            required
            // Note: InputField handles border/focus styling internally
          />

          {/* 2. Password Field (Using reusable InputField) */}
          <InputField
            label="Password"
            type="password"
            name="password"
            icon={FaLock}
            placeholder="Enter Password"
            value={credentials.password}
            onChange={handleChange}
            required
          />

          {/* 3. Submit Button (Using reusable Button) */}
          <Button
            type="submit"
            fullWidth
            loading={loading}
            variant="primary"
            className="mt-8 text-lg py-3"
          >
            <FaSignInAlt className="mr-2" />
            LOG IN
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Contact administration if you forgot your credentials.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
