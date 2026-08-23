import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaSave, FaSyncAlt, FaUserClock } from "react-icons/fa";
import SelectDropdown from "../components/ui/SelectDropdown";
import { useAuth } from "../context/AuthContext";
import {
  getBranches,
  getPayrollAttendance,
  savePayrollAttendance,
} from "../api/apiService";
import {
  MONTH_OPTIONS,
  campusOptionsForUser,
  payrollYearOptions,
} from "../utils/payrollUi";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const toCount = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return numeric;
};

const PayrollAttendancePage = () => {
  const { user } = useAuth();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [campus, setCampus] = useState("all");
  const [branches, setBranches] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const campusOptions = useMemo(
    () => [
      { _id: "all", name: "All assigned campuses" },
      ...campusOptionsForUser(branches, user),
    ],
    [branches, user]
  );
  const yearOptions = useMemo(() => payrollYearOptions(currentYear), []);

  const loadBranches = useCallback(async () => {
    try {
      const { data } = await getBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load campuses.");
    }
  }, []);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getPayrollAttendance({
        year,
        month,
        campus: campus === "all" ? undefined : campus,
      });
      setRows(
        (data.rows || []).map((row) => ({
          teacherId: row.teacher?._id,
          teacher: row.teacher,
          presentDays: row.presentDays || 0,
          clDays: row.clDays || 0,
          lwpDays: row.lwpDays || 0,
        }))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load attendance.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [year, month, campus]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const updateRow = (teacherId, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.teacherId === teacherId ? { ...row, [field]: toCount(value) } : row
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await savePayrollAttendance({
        year,
        month,
        rows: rows.map((row) => ({
          teacher: row.teacherId,
          presentDays: row.presentDays,
          clDays: row.clDays,
          lwpDays: row.lwpDays,
        })),
      });
      const overflowCount = data.overflows?.length || 0;
      toast.success(
        overflowCount
          ? `Saved. ${overflowCount} teacher(s) had CL over 20 days moved to LWP.`
          : "Attendance saved."
      );
      await loadAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-5 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1440px] space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <FaUserClock size={12} />
                Monthly attendance
              </div>
              <h1 className="text-3xl font-semibold text-slate-950">
                Payroll attendance
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Enter present, casual leave, and leave without pay counts for
                the calendar month. Annual CL quota is 20 days; extra CL becomes
                LWP.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SelectDropdown
                label="Year"
                options={yearOptions}
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              />
              <SelectDropdown
                label="Month"
                options={MONTH_OPTIONS}
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
              />
              <SelectDropdown
                label="Campus"
                options={campusOptions}
                value={campus}
                onChange={(event) => setCampus(event.target.value)}
              />
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={loadAttendance}
                  className="inline-flex h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FaSyncAlt className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !rows.length}
                  className="inline-flex h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Teacher
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Campus
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Present
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Absent as CL
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Absent as LWP
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading attendance...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      No teachers found for this campus.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.teacherId} className="border-b border-slate-100">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-950">
                          {row.teacher?.name}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {row.teacher?.teacherId}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-600">
                        {row.teacher?.campus?.name || "—"}
                      </td>
                      {["presentDays", "clDays", "lwpDays"].map((field) => (
                        <td key={field} className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            className="w-24 rounded-lg border border-slate-300 px-2 py-2 text-right text-sm font-semibold text-slate-900"
                            value={row[field]}
                            onChange={(event) =>
                              updateRow(row.teacherId, field, event.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PayrollAttendancePage;
