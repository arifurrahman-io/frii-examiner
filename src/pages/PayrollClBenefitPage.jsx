import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaPrint, FaSyncAlt } from "react-icons/fa";
import SelectDropdown from "../components/ui/SelectDropdown";
import { useAuth } from "../context/AuthContext";
import { getBranches, getPayrollClBenefit } from "../api/apiService";
import {
  campusOptionsForUser,
  formatTaka,
  payrollYearOptions,
} from "../utils/payrollUi";

const currentYear = new Date().getFullYear();

const PayrollClBenefitPage = () => {
  const { user } = useAuth();
  const [year, setYear] = useState(currentYear);
  const [campus, setCampus] = useState("all");
  const [branches, setBranches] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const campusOptions = useMemo(
    () => [
      { _id: "all", name: "All assigned campuses" },
      ...campusOptionsForUser(branches, user),
    ],
    [branches, user]
  );
  const yearOptions = useMemo(() => payrollYearOptions(currentYear), []);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: branchData }, { data }] = await Promise.all([
        getBranches(),
        getPayrollClBenefit({
          year,
          campus: campus === "all" ? undefined : campus,
        }),
      ]);
      setBranches(Array.isArray(branchData) ? branchData : []);
      setRows(data.rows || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load CL benefit report."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [year, campus]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-5 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1440px] space-y-6">
        <header className="no-print rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">
                Yearly CL benefit
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Teachers who used fewer than 11 casual leave days in the calendar
                year. Benefit = (basic / 30) × (20 − CL used).
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SelectDropdown
                label="Year"
                options={yearOptions}
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
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
                  onClick={loadReport}
                  className="inline-flex h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FaSyncAlt className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <FaPrint />
                  Print
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="hidden print:block px-4 pt-4">
            <h2 className="text-xl font-semibold">CL benefit report · {year}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Teacher
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Basic
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    CL used
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Unused CL
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Benefit
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading CL benefit report...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      No eligible teachers (CL used must be under 11).
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.teacher._id} className="border-b border-slate-100">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-950">
                          {row.teacher.name}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {row.teacher.teacherId} · {row.teacher.campus?.name || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {formatTaka(row.teacher.basicSalary)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">{row.clUsed}</td>
                      <td className="px-4 py-3 text-right text-sm">{row.unusedCl}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">
                        {formatTaka(row.benefit)}
                      </td>
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

export default PayrollClBenefitPage;
