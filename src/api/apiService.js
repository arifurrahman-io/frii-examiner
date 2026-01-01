import axios from "axios";

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

// --- ১. অথেন্টিকেশন ও ড্যাশবোর্ড API (Year-Based Updated) ---
export const apiLogin = (credentials) => api.post("/auth/login", credentials);
export const apiLogout = () => api.post("/auth/logout");

// ড্যাশবোর্ড সামারি এখন নির্দিষ্ট বছরের ডাটা ফিল্টার করতে পারবে
export const getDashboardSummary = (year) =>
  api.get("/dashboard/summary", { params: { year } });

export const getTopResponsibleTeachers = (year) =>
  api.get("/dashboard/top-teachers", { params: { year } });

export const getRecentGrantedLeaves = (year) =>
  api.get("/dashboard/recent-granted-leaves", { params: { year } });

export const getAssignmentAnalytics = (year) =>
  api.get("/dashboard/assignment-analytics", { params: { year } });

// Charts: বছর ভিত্তিক এনালাইসিস
export const getAssignmentByDutyType = (year) =>
  api.get("/dashboard/assignment-by-type", { params: { year } });

export const getAssignmentByBranch = (year) =>
  api.get("/dashboard/assignment-by-branch", { params: { year } });

// --- ২. লিভ ম্যানেজমেন্ট API ---
export const grantLeaveRequest = (payload) => api.post("/leaves", payload);

// টিচারের প্রোফাইলে লিভ হিস্ট্রি দেখার জন্য (বছর ও টাইপ অনুযায়ী ফিল্টার সহ)
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

// --- ৩. শিক্ষক ম্যানেজমেন্ট API ---
export const getTeachers = (searchQuery, page = 1, limit = 20) =>
  api.get("/teachers", { params: { search: searchQuery, page, limit } });

export const getTeacherProfile = (teacherId) =>
  api.get(`/teachers/${teacherId}`);

export const addTeacher = (teacherData) => api.post("/teachers", teacherData);

export const updateTeacher = (teacherId, updateData) =>
  api.put(`/teachers/${teacherId}`, updateData);

export const uploadBulkTeachers = (formData) =>
  api.post("/teachers/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ইনচার্জ এবং অ্যাডমিনদের জন্য অ্যানুয়াল রিপোর্ট এন্ট্রি
export const addAnnualReport = (teacherId, data) =>
  api.post(`/teachers/${teacherId}/report`, data);

// --- ৪. রুটিন ও ফিল্টারিং API ---
export const addRoutine = (routineData) => api.post("/routines", routineData);

export const updateRoutine = (routineId, routineData) =>
  api.put(`/routines/${routineId}`, routineData);

export const getEligibleTeachers = (filters) =>
  api.get("/routines/filter", { params: filters });

export const deleteRoutine = (routineId) =>
  api.delete(`/routines/${routineId}`);

export const getTeacherRoutines = (teacherId, year) =>
  api.get(`/routines/teacher/${teacherId}`, { params: { year } });

export const uploadRoutineExcel = (formData) =>
  api.post("/routines/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// --- ৫. দায়িত্ব অ্যাসাইনমেন্ট API ---
export const assignDuty = (assignmentData) =>
  api.post("/assignments", assignmentData);

export const deleteAssignmentPermanently = (assignmentId) =>
  api.delete(`/assignments/${assignmentId}`);

export const getReportData = (filters) =>
  api.get("/reports/data", { params: filters });

export const getAssignmentsByTeacherAndYear = (teacherId, year) =>
  api.get(`/assignments/teacher/${teacherId}`, { params: { year } });

// --- ৬. মাস্টার ডেটা ম্যানেজমেন্ট (ডায়নামিক ও ক্যাশ ফ্রেন্ডলি) ---
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
export const getBranches = () => api.get("/branches");
export const getClasses = () => api.get("/classes");
export const getSubjects = () => api.get("/subjects");
export const getResponsibilityTypes = () => api.get("/responsibility-types");

export const addMasterData = (type, data) => api.post(getMasterUrl(type), data);
export const updateMasterData = (type, id, data) =>
  api.put(getMasterUrl(type, id), data);
export const deleteMasterData = (type, id) =>
  api.delete(getMasterUrl(type, id));

// --- ৭. ইউজার ও রিপোর্ট এক্সপোর্ট API ---
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
