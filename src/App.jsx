import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --- Global Context & Layouts ---
import { AuthProvider } from "./context/AuthContext.jsx";
import LayoutContainer from "./components/layouts/LayoutContainer";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ নতুন ইমপোর্ট

// --- Page Components ---
import AdminDashboard from "./pages/AdminDashboard";
import MasterSetupPage from "./pages/MasterSetupPage";
import RoutineSetupPage from "./pages/RoutineSetupPage";
import AssignDutyPage from "./pages/AssignDutyPage";
import ReportViewPage from "./pages/ReportViewPage";
import TeacherViewPage from "./pages/TeacherViewPage";
import LoginPage from "./pages/LoginPage";
import GrantedLeavesPage from "./pages/GrantedLeavesPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <LayoutContainer>
          <Routes>
            {/* PUBLIC ROUTE: লগইন পেজ সবার জন্য উন্মুক্ত */}
            <Route path="/login" element={<LoginPage />} />

            {/* 🔒 PROTECTED ROUTES: লগইন করা না থাকলে এটি দেখা যাবে না */}

            {/* ড্যাশবোর্ড রুট */}
            <Route
              path="/"
              element={<ProtectedRoute element={<AdminDashboard />} />}
            />

            {/* মাস্টার সেটআপ রুট */}
            <Route
              path="/setup/:type"
              element={<ProtectedRoute element={<MasterSetupPage />} />}
            />

            {/* রুটিন সেটআপ রুট */}
            <Route
              path="/routine"
              element={<ProtectedRoute element={<RoutineSetupPage />} />}
            />

            {/* শিক্ষক তালিকা ও প্রোফাইল */}
            <Route
              path="/teachers"
              element={<ProtectedRoute element={<TeacherViewPage />} />}
            />
            <Route
              path="/teacher/profile/:id"
              element={<ProtectedRoute element={<TeacherViewPage />} />}
            />

            {/* অ্যাসাইনমেন্ট ও রিপোর্টিং */}
            <Route
              path="/assign"
              element={<ProtectedRoute element={<AssignDutyPage />} />}
            />
            <Route
              path="/report"
              element={<ProtectedRoute element={<ReportViewPage />} />}
            />
            <Route
              path="/leaves/granted" // ✅ NEW ROUTE
              element={<ProtectedRoute element={<GrantedLeavesPage />} />}
            />

            {/* ফলব্যাক রুট (404 Not Found) */}
            <Route
              path="*"
              element={
                <h1 className="text-center text-red-500 mt-20 text-3xl">
                  404 Not Found
                </h1>
              }
            />
          </Routes>
        </LayoutContainer>
      </AuthProvider>

      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
