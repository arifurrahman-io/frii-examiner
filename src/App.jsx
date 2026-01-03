import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --- Global Context & Layouts ---
import { AuthProvider } from "./context/AuthContext.jsx";
import LayoutContainer from "./components/layouts/LayoutContainer";
import ProtectedRoute from "./components/ProtectedRoute";

// --- Page Components ---
import AdminDashboard from "./pages/AdminDashboard";
import MasterSetupPage from "./pages/MasterSetupPage";
import RoutineSetupPage from "./pages/RoutineSetupPage";
import AssignDutyPage from "./pages/AssignDutyPage";
import ReportViewPage from "./pages/ReportViewPage";
import TeacherViewPage from "./pages/TeacherViewPage";
import LoginPage from "./pages/LoginPage";
import GrantedLeavesPage from "./pages/GrantedLeavesPage";
import UserManagementPage from "./pages/UserManagementPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <LayoutContainer>
          <Routes>
            {/* --- 🔓 PUBLIC NODES --- */}
            <Route path="/login" element={<LoginPage />} />

            {/* --- 🔒 PROTECTED CORE NODES --- */}
            <Route
              path="/"
              element={<ProtectedRoute element={<AdminDashboard />} />}
            />

            {/* 🛡️ ADMIN ONLY: System Governance */}
            <Route
              path="/users"
              element={
                <ProtectedRoute
                  element={<UserManagementPage />}
                  allowedRoles={["admin"]} // শুধুমাত্র অ্যাডমিন এক্সেস পাবে
                />
              }
            />

            {/* ⚙️ SETUP NODES: Admin & Incharge Access */}
            <Route
              path="/setup/:type"
              element={
                <ProtectedRoute
                  element={<MasterSetupPage />}
                  allowedRoles={["admin", "incharge"]}
                />
              }
            />

            <Route
              path="/routine"
              element={
                <ProtectedRoute
                  element={<RoutineSetupPage />}
                  allowedRoles={["admin", "incharge"]}
                />
              }
            />

            {/* 👥 TEACHER NODES */}
            <Route
              path="/teachers"
              element={<ProtectedRoute element={<TeacherViewPage />} />}
            />
            <Route
              path="/teacher/profile/:id"
              element={<ProtectedRoute element={<TeacherViewPage />} />}
            />

            {/* 📋 DUTY ALLOCATION: Restricted Logic inside component for Incharge */}
            <Route
              path="/assign"
              element={
                <ProtectedRoute
                  element={<AssignDutyPage />}
                  allowedRoles={["admin", "incharge"]}
                />
              }
            />

            {/* 📊 AUDIT & ARCHIVE: Global vs Campus Node */}
            <Route
              path="/report"
              element={
                <ProtectedRoute
                  element={<ReportViewPage />}
                  allowedRoles={["admin"]} // অডিট সাধারণত এডমিনদের জন্য
                />
              }
            />
            <Route
              path="/leaves/granted"
              element={
                <ProtectedRoute
                  element={<GrantedLeavesPage />}
                  allowedRoles={["admin", "incharge"]}
                />
              }
            />

            {/* --- ⚠️ 404 INTERRUPT --- */}
            <Route
              path="*"
              element={
                <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC]">
                  <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-inner animate-pulse">
                    <span className="text-4xl font-black italic">404</span>
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                    Matrix Link Interrupted
                  </h1>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">
                    The requested node does not exist in the current session.
                  </p>
                </div>
              }
            />
          </Routes>
        </LayoutContainer>
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl border border-slate-100",
          duration: 4000,
        }}
      />
    </Router>
  );
}

export default App;
