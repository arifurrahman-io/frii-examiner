import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LayoutContainer from "./components/layouts/LayoutContainer";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";
import MasterSetupPage from "./pages/MasterSetupPage";
import RoutineSetupPage from "./pages/RoutineSetupPage";
import AssignDutyPage from "./pages/AssignDutyPage";
import ReportViewPage from "./pages/ReportViewPage";
import PerformanceReportPage from "./pages/PerformanceReportPage";
import TeacherViewPage from "./pages/TeacherViewPage";
import LoginPage from "./pages/LoginPage";
import GrantedLeavesPage from "./pages/GrantedLeavesPage";
import UserManagementPage from "./pages/UserManagementPage";

function App() {
  return (
    <Router>
      <LayoutContainer>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute
                element={<AdminDashboard />}
                allowedRoles={["admin", "head_teacher", "incharge"]}
              />
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute
                element={<UserManagementPage />}
                allowedRoles={["admin"]}
              />
            }
          />

          <Route
            path="/setup/:type"
            element={
              <ProtectedRoute
                element={<MasterSetupPage />}
                allowedRoles={["admin"]}
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

          <Route
            path="/teachers"
            element={
              <ProtectedRoute
                element={<TeacherViewPage />}
                allowedRoles={["admin", "head_teacher", "incharge"]}
              />
            }
          />

          <Route
            path="/teacher/profile/:id"
            element={
              <ProtectedRoute
                element={<TeacherViewPage />}
                allowedRoles={["admin", "head_teacher", "incharge"]}
              />
            }
          />

          <Route
            path="/assign"
            element={
              <ProtectedRoute
                element={<AssignDutyPage />}
                allowedRoles={["admin", "incharge"]}
              />
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute
                element={<ReportViewPage />}
                allowedRoles={["admin"]}
              />
            }
          />

          <Route
            path="/performance-report"
            element={
              <ProtectedRoute
                element={<PerformanceReportPage />}
                allowedRoles={["admin", "head_teacher", "incharge"]}
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

          <Route
            path="*"
            element={
              <div className="grid min-h-[80vh] place-items-center bg-slate-50 p-6 text-center">
                <div>
                  <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-lg bg-rose-50 text-2xl font-semibold text-rose-600">
                    404
                  </div>
                  <h1 className="text-2xl font-semibold text-slate-950">
                    Page not found
                  </h1>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    The requested workspace page is not available.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </LayoutContainer>
      <Toaster
        position="top-center"
        containerStyle={{
          top: "max(16px, env(safe-area-inset-top))",
          left: 16,
          right: 16,
        }}
        toastOptions={{
          className:
            "max-w-[calc(100vw-32px)] rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-lg",
          duration: 4000,
        }}
      />
    </Router>
  );
}

export default App;
