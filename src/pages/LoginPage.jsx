import React, { useState, useEffect } from "react";
import { FaSignInAlt, FaUserTie, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

// Reusable UI Components
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    teacherIdOrEmail: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load saved ID/Email if "Remember Me" was previously checked
  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      setCredentials((prev) => ({ ...prev, teacherIdOrEmail: savedUser }));
      setRememberMe(true);
    }
  }, []);

  // Redirect if already logged in
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
      // Call login function from AuthContext
      const success = await login({
        username: teacherIdOrEmail, // Passed as username per backend requirement
        password,
      });

      if (success) {
        // Handle "Remember Me" logic
        if (rememberMe) {
          localStorage.setItem("rememberedUser", teacherIdOrEmail);
        } else {
          localStorage.removeItem("rememberedUser");
        }

        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login attempt error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
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
          {/* 1. Username/Teacher ID Field */}
          <InputField
            label="Teacher ID or Email"
            type="text"
            name="teacherIdOrEmail"
            icon={FaUserTie}
            placeholder="Enter ID or Email"
            value={credentials.teacherIdOrEmail}
            onChange={handleChange}
            required
          />

          {/* 2. Password Field (Now with Toggle support in InputField component) */}
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

          {/* 3. Remember Me & Options Section */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer transition-all"
              />
              <span className="ml-2 text-sm font-medium text-gray-600 group-hover:text-indigo-700 transition-colors">
                Remember Me
              </span>
            </label>
            <button
              type="button"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              onClick={() =>
                toast.loading("Contacting Admin Support...", { duration: 2000 })
              }
            >
              Forgot Password?
            </button>
          </div>

          {/* 4. Submit Button */}
          <Button
            type="submit"
            fullWidth
            loading={loading}
            variant="primary"
            className="mt-4 text-lg py-3 flex items-center justify-center"
          >
            <FaSignInAlt className="mr-2" />
            LOG IN
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Contact administration if you forgot your credentials.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
