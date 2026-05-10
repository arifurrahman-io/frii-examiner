import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaIdBadge,
  FaPhone,
  FaSearch,
  FaSyncAlt,
  FaUniversity,
  FaUsers,
} from "react-icons/fa";
import { getTeachers } from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";
import useDebounce from "../../hooks/useDebounce";

const currentYear = new Date().getFullYear();

const getYearAssignments = (teacher, year) =>
  Array.isArray(teacher.assignmentsByYear)
    ? teacher.assignmentsByYear.find((item) => item._id === year)
        ?.responsibilities || []
    : [];

const TeacherInitial = ({ name }) => (
  <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
    {name?.charAt(0) || "T"}
  </div>
);

const Metric = ({ label, value }) => (
  <div className="border border-slate-200 bg-white px-4 py-3">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
  </div>
);

const TeacherSearchList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);

  const isAdmin = user?.role === "admin";
  const inchargeCampusId = user?.campus?._id || user?.campus;

  const fetchTeachers = useCallback(
    async (search = "", pageNum = 1) => {
      setLoading(true);
      try {
        const campusIdFilter = !isAdmin ? inchargeCampusId : "";
        const { data } = await getTeachers(
          search,
          pageNum,
          limit,
          campusIdFilter,
          true
        );

        let teacherList = data.teachers || [];
        if (!isAdmin && inchargeCampusId) {
          teacherList = teacherList.filter((teacher) => {
            const teacherCampusId = teacher.campus?._id || teacher.campus;
            return teacherCampusId === inchargeCampusId;
          });
        }

        setTeachers(teacherList);
        setTotalPages(data.totalPages || 1);
        setTotalTeachers(data.totalTeachers || 0);
        setPage(data.page || 1);
      } catch (error) {
        toast.error("Failed to load teachers.");
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    },
    [limit, isAdmin, inchargeCampusId]
  );

  useEffect(() => {
    setPage(1);
    fetchTeachers(debouncedSearchTerm, 1);
  }, [debouncedSearchTerm, fetchTeachers]);

  const pageStats = useMemo(() => {
    const withRoutine = teachers.filter(
      (teacher) => teacher.routineSchedule?.length
    ).length;
    const withCurrentDuty = teachers.filter(
      (teacher) => getYearAssignments(teacher, currentYear).length
    ).length;
    return { withRoutine, withCurrentDuty };
  }, [teachers]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchTeachers(searchTerm, newPage);
  };

  const openProfile = (teacherId) => navigate(`/teacher/profile/${teacherId}`);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Total teachers" value={totalTeachers} />
        <Metric label={`${currentYear} duty assigned`} value={pageStats.withCurrentDuty} />
        <Metric label="Routine available" value={pageStats.withRoutine} />
      </div>

      <div className="border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              type="text"
              placeholder={
                !isAdmin
                  ? `Search ${user?.campus?.name || "assigned campus"} teachers`
                  : "Search by name, ID, or phone"
              }
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              Page {page} of {totalPages}
            </p>
            <button
              onClick={() => fetchTeachers(searchTerm, 1)}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} size={12} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <section className="overflow-hidden border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Teacher Directory
            </h2>
            <p className="text-sm text-slate-500">
              {teachers.length} records on this page
            </p>
          </div>
          <FaUsers className="text-slate-300" />
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Teacher
                </th>
                <th className="border-b border-slate-200 px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Contact
                </th>
                <th className="border-b border-slate-200 px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Branch/Shift
                </th>
                <th className="border-b border-slate-200 px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  {currentYear} Duties
                </th>
                <th className="border-b border-slate-200 px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Routine
                </th>
                <th className="border-b border-slate-200 px-5 py-3 text-right text-xs font-semibold text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-14 text-center text-sm font-semibold text-slate-500"
                  >
                    Loading teachers...
                  </td>
                </tr>
              ) : teachers.length ? (
                teachers.map((teacher) => {
                  const currentAssignments = getYearAssignments(
                    teacher,
                    currentYear
                  );
                  return (
                    <tr
                      key={teacher._id}
                      onClick={() => openProfile(teacher._id)}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <td className="border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <TeacherInitial name={teacher.name} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {teacher.name}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                              <FaIdBadge size={10} /> {teacher.teacherId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-slate-300" size={12} />
                          {teacher.phone || "-"}
                        </div>
                        {teacher.designation && (
                          <p className="mt-1 text-xs text-slate-500">
                            {teacher.designation}
                          </p>
                        )}
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <FaUniversity className="text-slate-300" size={12} />
                          {teacher.campus?.name || "-"}
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4">
                        <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                          {currentAssignments.length}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          {teacher.routineSchedule?.length || 0}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openProfile(teacher._id);
                          }}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-teal-800"
                        >
                          <FaEye size={12} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-14 text-center text-sm font-semibold text-slate-500"
                  >
                    No matching teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-200 lg:hidden">
          {loading ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Loading teachers...
            </div>
          ) : teachers.length ? (
            teachers.map((teacher) => {
              const currentAssignments = getYearAssignments(teacher, currentYear);
              return (
                <button
                  key={teacher._id}
                  type="button"
                  onClick={() => openProfile(teacher._id)}
                  className="w-full p-5 text-left hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <TeacherInitial name={teacher.name} />
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-slate-900">
                          {teacher.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {teacher.teacherId}
                        </p>
                      </div>
                    </div>
                    <FaEye className="mt-2 text-slate-400" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Phone</p>
                      <p className="font-semibold text-slate-800">
                        {teacher.phone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Branch/Shift
                      </p>
                      <p className="font-semibold text-slate-800">
                        {teacher.campus?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Duties
                      </p>
                      <p className="font-semibold text-slate-800">
                        {currentAssignments.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Routine
                      </p>
                      <p className="font-semibold text-slate-800">
                        {teacher.routineSchedule?.length || 0}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              No matching teachers found.
            </div>
          )}
        </div>
      </section>

      {totalTeachers > limit && (
        <div className="flex flex-col items-center justify-between gap-4 border border-slate-200 bg-white p-4 sm:flex-row">
          <p className="text-sm font-medium text-slate-500">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <FaChevronLeft size={12} />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSearchList;
