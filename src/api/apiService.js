// arifurrahman-io/frii-examiner/frii-examiner-94b444a3277f392cde2a42af87c32a9043a874f2/src/api/apiService.js

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// টোকেন যুক্ত করার জন্য ইন্টারসেপ্টর
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- ১. অথেন্টিকেশন ও ড্যাশবোর্ড API ---

export const apiLogin = (credentials) => api.post("/auth/login", credentials);
export const apiLogout = () => api.post("/auth/logout");
export const getDashboardSummary = () => api.get("/dashboard/summary");
export const getTopResponsibleTeachers = () =>
  api.get("/dashboard/top-teachers");
export const getRecentGrantedLeaves = () =>
  api.get("/dashboard/recent-granted-leaves");
export const getAssignmentAnalytics = () =>
  api.get("/dashboard/assignment-analytics");
// Dashboard Charts
export const getAssignmentByDutyType = () =>
  api.get("/dashboard/assignment-by-type");
export const getAssignmentByBranch = () =>
  api.get("/dashboard/assignment-by-branch");

export const grantLeaveRequest = (payload) => api.post("/leaves", payload);
export const getGrantedLeavesByTeacher = (teacherId) =>
  api.get(`/leaves`, { params: { teacher: teacherId, status: "Granted" } });
// For Full Leave Report Page
export const getAllGrantedLeavesForReport = () =>
  api.get("/leaves", { params: { status: "Granted" } });

// Leave CRUD
export const deleteLeave = (leaveId) => api.delete(`/leaves/${leaveId}`);
export const updateLeave = (leaveId, payload) =>
  api.put(`/leaves/${leaveId}`, payload);

// --- ২. শিক্ষক ম্যানেজমেন্ট API ---

export const getTeachers = (searchQuery) =>
  api.get("/teachers", { params: { search: searchQuery } });
export const getTeacherProfile = (teacherId) =>
  api.get(`/teachers/${teacherId}`);
export const addTeacher = (teacherData) => api.post("/teachers", teacherData);
export const updateTeacher = (teacherId, updateData) =>
  api.put(`/teachers/${teacherId}`, updateData);
export const uploadBulkTeachers = (formData) =>
  api.post("/teachers/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// --- ৩. রুটিন ও ফিল্টারিং API ---

export const addRoutine = (routineData) => api.post("/routines", routineData);
export const updateRoutine = (routineId, routineData) =>
  api.put(`/routines/${routineId}`, routineData);
export const getEligibleTeachers = (filters) =>
  api.get("/routines/filter", { params: filters });
export const deleteRoutine = (routineId) =>
  api.delete(`/routines/${routineId}`);
export const getTeacherRoutines = (teacherId) =>
  api.get(`/routines/teacher/${teacherId}`);
// Bulk Routine Upload Function
export const uploadRoutineExcel = (formData) =>
  api.post("/routines/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// --- ৪. দায়িত্ব অ্যাসাইনমেন্ট API ---

export const assignDuty = (assignmentData) =>
  api.post("/assignments", assignmentData);
export const deleteAssignmentPermanently = (assignmentId) =>
  api.delete(`/assignments/${assignmentId}`);
export const getReportData = (filters) =>
  api.get("/reports/data", { params: filters }); // Changed to use /reports/data
export const getAssignmentsByTeacherAndYear = (teacherId, year) =>
  api.get(`/assignments/teacher/${teacherId}?year=${year}`);

// --- ৫. মাস্টার ডেটা ম্যানেজমেন্ট (ডায়নামিক) ---

const getMasterUrl = (type, id = "") => {
  let base;
  switch (type) {
    case "branch":
      base = "/branches";
      break;
    case "class":
      base = "/classes";
      break;
    case "subject":
      base = "/subjects";
      break;
    case "responsibility":
      base = "/responsibility-types";
      break;
    default:
      throw new Error("Invalid master data type");
  }
  return id ? `${base}/${id}` : base;
};

export const getMasterDataList = (type) => api.get(getMasterUrl(type));
export const getBranches = () => api.get("/branches");
export const getClasses = () => api.get("/classes");
export const getSubjects = () => api.get("/subjects");
export const getResponsibilityTypes = () => api.get("/responsibility-types");

export const addMasterData = (type, data) => api.post(getMasterUrl(type), data);
export const updateMasterData = (type, id, data) =>
  api.put(getMasterUrl(type, id), data);
export const deleteMasterData = (type, id) =>
  api.delete(getMasterUrl(type, id));

// --- ৬. রিপোর্ট এক্সপোর্ট API (All Removed) ---

export const checkLeaveConflict = (filters) =>
  api.get("/leaves/conflict-check", { params: filters });

export const exportCustomReportToPDF = (filters) => {
  const params = new URLSearchParams(filters).toString();

  // 🚀 FIX: Dynamically determine the correct API endpoint based on reportType
  const endpoint =
    filters.reportType === "YEARLY_SUMMARY"
      ? `/api/reports/export/yearly-pdf?${params}`
      : `/api/reports/export/custom-pdf?${params}`;

  return window.open(endpoint, "_blank");
};
