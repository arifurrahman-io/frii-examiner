import React, { useState } from "react";
import { FaSignInAlt, FaUserTie, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    teacherIdOrEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // AuthContext থেকে login ফাংশন এবং isAuthenticated স্টেট আনা
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
    // ✅ MODERNIZE: Add subtle gradient background to the page wrapper
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-indigo-100">
      {/* ✅ MODERNIZE: Deeper shadow and slightly softer corners */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-3xl border border-indigo-100/50 transform transition-all duration-500 hover:shadow-4xl">
        <div className="text-center mb-8">
          <FaUserTie className="text-6xl text-indigo-600 mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-800">
            Admin/Teacher Login
          </h2>
          <p className="text-gray-500 mt-1">
            Access your Responsibility Management Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username/Teacher ID Field */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="teacherIdOrEmail"
            >
              Teacher ID or Email
            </label>
            <div className="relative">
              <FaUserTie className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="teacherIdOrEmail"
                type="text"
                name="teacherIdOrEmail"
                value={credentials.teacherIdOrEmail}
                onChange={handleChange}
                placeholder="Enter ID or Email"
                // ✅ MODERNIZE: Enhanced focus style
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 focus:ring-2 transition"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter Password"
                // ✅ MODERNIZE: Enhanced focus style
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 focus:ring-2 transition"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            // ✅ MODERNIZE: Stronger hover and focus rings
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold uppercase tracking-wider hover:bg-indigo-700 transition duration-200 flex items-center justify-center disabled:opacity-50 focus:ring-4 focus:ring-indigo-300"
            disabled={loading}
          >
            {loading ? (
              // ✅ MODERNIZE: Use FaSyncAlt for visual feedback
              <>
                <FaSyncAlt className="animate-spin mr-2" /> Logging In...
              </>
            ) : (
              <>
                <FaSignInAlt className="mr-2" />
                LOG IN
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Contact administration if you forgot your credentials.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
