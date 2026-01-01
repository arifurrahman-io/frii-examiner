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
import UserManagementPage from "./pages/UserManagementPage"; // ✅ নতুন ইমপোর্ট

function App() {
  return (
    <Router>
      <AuthProvider>
        <LayoutContainer>
          <Routes>
            {/* PUBLIC ROUTE */}
            <Route path="/login" element={<LoginPage />} />

            {/* 🔒 PROTECTED ROUTES */}
            <Route
              path="/"
              element={<ProtectedRoute element={<AdminDashboard />} />}
            />

            {/* 🛡️ ADMIN ONLY: User Management */}
            <Route
              path="/users"
              element={
                <ProtectedRoute
                  element={<UserManagementPage />}
                  allowedRoles={["admin"]} // ✅ শুধুমাত্র অ্যাডমিন এক্সেস পাবে
                />
              }
            />

            <Route
              path="/setup/:type"
              element={<ProtectedRoute element={<MasterSetupPage />} />}
            />
            <Route
              path="/routine"
              element={<ProtectedRoute element={<RoutineSetupPage />} />}
            />

            <Route
              path="/teachers"
              element={<ProtectedRoute element={<TeacherViewPage />} />}
            />
            <Route
              path="/teacher/profile/:id"
              element={<ProtectedRoute element={<TeacherViewPage />} />}
            />

            <Route
              path="/assign"
              element={<ProtectedRoute element={<AssignDutyPage />} />}
            />
            <Route
              path="/report"
              element={<ProtectedRoute element={<ReportViewPage />} />}
            />
            <Route
              path="/leaves/granted"
              element={<ProtectedRoute element={<GrantedLeavesPage />} />}
            />

            {/* 404 Not Found */}
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
