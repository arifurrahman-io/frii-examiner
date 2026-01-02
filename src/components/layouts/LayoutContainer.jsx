import React from "react";
import Navbar from "../ui/Navbar";
import Footer from "../ui/Footer";

const LayoutContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* নেভিগেশন বার */}
      <Navbar />
      <main className="pt-20 md:pt-24 pb-10">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LayoutContainer;
// ✅ Navbar কম্পোনেন্ট ইমপোর্ট করা হলো
