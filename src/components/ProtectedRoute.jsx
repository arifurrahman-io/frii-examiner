import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // AuthContext থেকে useAuth হুক ইমপোর্ট করুন

/**
 * এই কম্পোনেন্টটি সুরক্ষিত রুটগুলিকে রেন্ডার করার জন্য ব্যবহৃত হয়।
 * যদি ইউজার লগইন না করে থাকে, তবে তাকে '/login' এ রিডাইরেক্ট করে।
 * * @param {object} props - props containing the element (the target page component)
 */
const ProtectedRoute = ({ element }) => {
  // ধরে নেওয়া হচ্ছে useAuth() হুকটি isAuthenticated এবং loading স্টেট প্রদান করে
  const { isAuthenticated, loading } = useAuth();

  // অথেন্টিকেশন চেক করার সময় Loading স্টেট থাকলে
  if (loading) {
    return (
      <div className="text-center p-20 text-xl text-indigo-500">
        Loading user session...
      </div>
    );
  }

  // যদি ইউজার লগইন না করে থাকে, তবে তাকে /login পেজে নেভিগেট করা
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ইউজার লগইন করে থাকলে, অনুরোধ করা পেজটি রেন্ডার করা
  return element;
};

export default ProtectedRoute;
