import React from "react";
import { useLocation } from "react-router-dom"; // ✅ রুট চেক করার জন্য useLocation ইমপোর্ট
import Navbar from "../ui/Navbar"; // ✅ Navbar কম্পোনেন্ট ইমপোর্ট করা হলো

const LayoutContainer = ({ children }) => {
  const location = useLocation();
  // যদি পাথ '/login' হয়, তবে Navbar দেখানোর প্রয়োজন নেই
  const isLoginPage = location.pathname === "/login";

  return (
    // সম্পূর্ণ অ্যাপ্লিকেশনের কনটেইনার
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ১. স্থির হেডার (শর্তসাপেক্ষে Navbar রেন্ডার করা) */}
      {!isLoginPage && <Navbar />}

      {/* ২. মূল কন্টেন্ট কনটেইনার */}
      <main className="flex-grow">
        <div className="container mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default LayoutContainer;
