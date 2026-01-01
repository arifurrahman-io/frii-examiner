import React from "react";
import Navbar from "../ui/Navbar";

const LayoutContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* নেভিগেশন বার */}
      <Navbar />

      {/* 🚀 কন্টেন্ট এরিয়া: 
        pt-20 (Padding Top) যোগ করা হয়েছে যাতে কন্টেন্ট হেডারের নিচে না যায়। 
        Header height is covered by this padding.
      */}
      <main className="pt-20 md:pt-24 pb-10">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LayoutContainer;
// ✅ Navbar কম্পোনেন্ট ইমপোর্ট করা হলো
