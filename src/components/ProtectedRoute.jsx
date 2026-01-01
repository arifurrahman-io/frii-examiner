import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * @param {JSX.Element} element - যে পেজটি ইউজার দেখতে চাচ্ছেন
 * @param {Array} allowedRoles - কোন কোন রোলের ইউজার এই পেজটি দেখতে পারবেন (ঐচ্ছিক)
 */
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // ১. অথেন্টিকেশন চেক করার সময় Loading স্টেট থাকলে
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-20 text-xl font-bold text-indigo-500 animate-pulse">
          Loading user session...
        </div>
      </div>
    );
  }

  // ২. যদি ইউজার লগইন না করে থাকে, তবে তাকে '/login' এ রিডাইরেক্ট করা
  // 'state' ব্যবহার করা হয়েছে যাতে লগইন করার পর ইউজার আবার আগের পেজেই ফিরে আসতে পারেন
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ৩. রোল ভিত্তিক অ্যাক্সেস কন্ট্রোল (Admin, Teacher, Incharge)
  // যদি allowedRoles পাঠানো হয় এবং ইউজারের রোল তার সাথে না মিলে
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-black text-red-500 mb-2">Access Denied</h1>
        <p className="text-gray-600 font-medium">
          You do not have permission to view this page.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  // ৪. সব চেক পাস করলে অনুরোধ করা পেজটি রেন্ডার করা
  return element;
};

export default ProtectedRoute;
