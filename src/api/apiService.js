import axios from "axios";

// কাস্টম axios ইনস্ট্যান্স তৈরি
const api = axios.create({
  baseURL: "/api",
});

/**
 * 🛡️ Request Interceptor
 * প্রতিটি রিকোয়েস্টের সাথে অটোমেটিক Bearer Token যুক্ত করে।
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 🔐 ROLE & USER HELPERS
 */
export const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role || "guest";
  } catch (e) {
    return "guest";
  }
};

export const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

// --- ১. অথেন্টিকেশন API ---
export const apiLogin = (credentials) => api.post("/auth/login", credentials);
export const apiLogout = () => api.post("/auth/logout");

// --- ২. ড্যাশবোর্ড API ---
export const getDashboardSummary = (year) =>
  api.get("/dashboard/summary", { params: { year } });
export const getTopResponsibleTeachers = (year) =>
  api.get("/dashboard/top-teachers", { params: { year } });
export const getRecentGrantedLeaves = (year) =>
  api.get("/dashboard/recent-granted-leaves", { params: { year } });
export const getAssignmentByDutyType = (year) =>
  api.get("/dashboard/assignment-by-type", { params: { year } });
export const getAssignmentByBranch = (year) =>
  api.get("/dashboard/assignment-by-branch", { params: { year } });

// --- ৩. লিভ ম্যানেজমেন্ট API ---
export const grantLeaveRequest = (payload) => api.post("/leaves", payload);
export const getGrantedLeavesByTeacher = (teacherId, year) =>
  api.get(`/leaves`, {
    params: { teacher: teacherId, status: "Granted", year },
  });

export const getAllGrantedLeavesForReport = (filters) =>
  api.get("/leaves", { params: { ...filters, status: "Granted" } });
export const deleteLeave = (leaveId) => api.delete(`/leaves/${leaveId}`);
export const updateLeave = (leaveId, payload) =>
  api.put(`/leaves/${leaveId}`, payload);
export const checkLeaveConflict = (filters) =>
  api.get("/leaves/conflict-check", { params: filters });

// --- ৪. শিক্ষক ম্যানেজমেন্ট API ---
export const getTeachers = (searchQuery, page = 1, limit = 20, campusId = "") =>
  api.get("/teachers", {
    params: { search: searchQuery, page, limit, campus: campusId },
  });

export const getTeacherProfile = (teacherId) =>
  api.get(`/teachers/${teacherId}`);
export const addTeacher = (teacherData) => api.post("/teachers", teacherData);
export const updateTeacher = (teacherId, updateData) =>
  api.put(`/teachers/${teacherId}`, updateData);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

/**
 * ✅ পারফরম্যান্স রিপোর্ট অপারেশনস
 */
export const deletePerformanceReport = (teacherId, reportId) => {
  return api.delete(`/teachers/${teacherId}/reports/${reportId}`);
};

export const addAnnualReport = (teacherId, data) =>
  api.post(`/teachers/${teacherId}/report`, data);

export const uploadBulkTeachers = (formData) =>
  api.post("/teachers/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// --- ৫. রুটিন API ---
export const addRoutine = (routineData) => api.post("/routines", routineData);
export const updateRoutine = (routineId, routineData) =>
  api.put(`/routines/${routineId}`, routineData);
export const deleteRoutine = (routineId) =>
  api.delete(`/routines/${routineId}`);
export const getEligibleTeachers = (filters) =>
  api.get("/routines/filter", { params: filters });
export const getTeacherRoutines = (teacherId, year) =>
  api.get(`/routines/teacher/${teacherId}`, { params: { year } });
export const uploadRoutineExcel = (formData) =>
  api.post("/routines/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// --- ৬. দায়িত্ব অ্যাসাইনমেন্ট API ---
/**
 * POST /assignments
 * এখানে ইনচার্জ এক্সেস করার সময় ব্যাকএন্ড চেক করবে (Class 1-3 Restriction)
 */
export const assignDuty = (assignmentData) =>
  api.post("/assignments", assignmentData);
export const deleteAssignmentPermanently = (assignmentId) =>
  api.delete(`/assignments/${assignmentId}`);
export const getAssignmentsByTeacherAndYear = (teacherId, year) =>
  api.get(`/assignments/teacher/${teacherId}`, { params: { year } });

// --- ৭. মাস্টার ডেটা ম্যানেজমেন্ট ---
export const getBranches = () => api.get("/branches");
export const getClasses = () => api.get("/classes");
export const getSubjects = () => api.get("/subjects");
export const getResponsibilityTypes = () => api.get("/responsibility-types");

const getMasterUrl = (type, id = "") => {
  const routes = {
    branch: "/branches",
    class: "/classes",
    subject: "/subjects",
    responsibility: "/responsibility-types",
  };
  const base = routes[type];
  if (!base) throw new Error("Invalid master data type");
  return id ? `${base}/${id}` : base;
};

export const getMasterDataList = (type) => api.get(getMasterUrl(type));
export const addMasterData = (type, data) => api.post(getMasterUrl(type), data);
export const updateMasterData = (type, id, data) =>
  api.put(getMasterUrl(type, id), data);
export const deleteMasterData = (type, id) =>
  api.delete(getMasterUrl(type, id));

// --- ৮. রিপোর্ট ও ইউজার ম্যানেজমেন্ট ---
export const getReportData = (filters) =>
  api.get("/reports/data", { params: filters });

/**
 * 📄 PDF এক্সপোর্ট ফিক্স
 * সরাসরি window.open না করে বেস URL এর সাথে কনক্যাট করা হয়েছে
 */
export const exportCustomReportToPDF = (filters) => {
  const params = new URLSearchParams(filters).toString();
  const endpoint =
    filters.reportType === "YEARLY_SUMMARY"
      ? `/api/reports/export/yearly-pdf?${params}`
      : `/api/reports/export/custom-pdf?${params}`;
  return window.open(endpoint, "_blank");
};

export const getUsers = () => api.get("/users");
export const addUser = (data) => api.post("/users/add", data);
export const updateUser = (id, data) => api.put(`/users/update/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/delete/${id}`);

export default api;
