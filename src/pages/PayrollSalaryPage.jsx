import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaFileInvoice, FaPrint, FaSyncAlt, FaTimes } from "react-icons/fa";
import SelectDropdown from "../components/ui/SelectDropdown";
import PayrollPayslipPrint from "../components/payroll/PayrollPayslipPrint";
import { useAuth } from "../context/AuthContext";
import {
  getBranches,
  getPayrollPayslip,
  getPayrollSalaryReport,
} from "../api/apiService";
import {
  MONTH_OPTIONS,
  campusOptionsForUser,
  formatTaka,
  monthLabel,
  payrollYearOptions,
} from "../utils/payrollUi";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const PayrollSalaryPage = () => {
  const { user } = useAuth();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [campus, setCampus] = useState("all");
  const [branches, setBranches] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payslip, setPayslip] = useState(null);

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
        getPayrollSalaryReport({
          year,
          month,
          campus: campus === "all" ? undefined : campus,
        }),
      ]);
      setBranches(Array.isArray(branchData) ? branchData : []);
      setRows(data.rows || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load salary report.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [year, month, campus]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const openPayslip = async (teacherId) => {
    try {
      const { data } = await getPayrollPayslip(teacherId, { year, month });
      setPayslip(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load payslip.");
    }
  };

  const handlePrintReport = () => window.print();
  const handlePrintPayslip = () => {
    window.requestAnimationFrame(() => window.print());
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-5 text-slate-900 sm:px-6 lg:px-8">
      <main className={`mx-auto max-w-[1440px] space-y-6 print:max-w-none ${payslip ? "print:hidden" : ""}`}>
        <header className="no-print rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">
                Salary report
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Monthly gross is basic plus house rent (50% of basic). Net
                deducts LWP at basic / 30 per day, plus 10% of basic when
                provident fund is on.
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
                  onClick={loadReport}
                  className="inline-flex h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FaSyncAlt className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="inline-flex h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <FaPrint />
                  Print
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
          <div className="hidden print:block px-4 pt-4">
            <h2 className="text-xl font-semibold">
              Salary report · {monthLabel(month)} {year}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Teacher
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Present
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    CL
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    LWP
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Basic
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    House rent
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    LWP deduction
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    PF (10%)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Net
                  </th>
                  <th className="no-print px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Payslip
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading salary report...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-sm text-slate-500">
                      No teachers found.
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
                      <td className="px-4 py-3 text-right text-sm">{row.presentDays}</td>
                      <td className="px-4 py-3 text-right text-sm">{row.clDays}</td>
                      <td className="px-4 py-3 text-right text-sm">{row.lwpDays}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatTaka(row.basic)}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatTaka(row.houseRent)}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        {formatTaka(row.lwpDeduction ?? row.deduction)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {row.providentFundEnabled ? formatTaka(row.pfEmployee) : "Off"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">
                        {formatTaka(row.net)}
                      </td>
                      <td className="no-print px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openPayslip(row.teacher._id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <FaFileInvoice />
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {payslip ? (
        <div className="ps-preview-modal no-print">
          <div className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">
            <p className="text-sm font-semibold">Payslip preview</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrintPayslip}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold"
              >
                <FaPrint />
                Print
              </button>
              <button
                type="button"
                onClick={() => setPayslip(null)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/20"
                aria-label="Close payslip"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-200 p-4">
            <PayrollPayslipPrint slip={payslip} />
          </div>
        </div>
      ) : null}

      {payslip ? (
        <div className="hidden print:block">
          <PayrollPayslipPrint slip={payslip} />
        </div>
      ) : null}
    </div>
  );
};

export default PayrollSalaryPage;
