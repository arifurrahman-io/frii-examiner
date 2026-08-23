import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaSave, FaSyncAlt, FaUniversity } from "react-icons/fa";
import SelectDropdown from "../components/ui/SelectDropdown";
import { useAuth } from "../context/AuthContext";
import {
  getBranches,
  getPayrollProvidentFund,
  savePayrollProvidentFund,
} from "../api/apiService";
import {
  campusOptionsForUser,
  formatTaka,
} from "../utils/payrollUi";

const PayrollProvidentFundPage = () => {
  const { user } = useAuth();
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

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: branchData }, { data }] = await Promise.all([
        getBranches(),
        getPayrollProvidentFund({
          campus: campus === "all" ? undefined : campus,
        }),
      ]);
      setBranches(Array.isArray(branchData) ? branchData : []);
      setRows(
        (data.rows || []).map((row) => ({
          teacherId: row.teacher?._id,
          teacher: row.teacher,
          salaryBankAccount: row.teacher?.salaryBankAccount || "",
          pfBankAccount: row.teacher?.pfBankAccount || "",
          providentFundEnabled: Boolean(row.teacher?.providentFundEnabled),
          pfEmployee: row.pfEmployee || 0,
          pfInstitution: row.pfInstitution || 0,
          pfTotal: row.pfTotal || 0,
        }))
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load provident fund."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [campus]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const updateRow = (teacherId, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.teacherId === teacherId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePayrollProvidentFund({
        rows: rows.map((row) => ({
          teacher: row.teacherId,
          salaryBankAccount: row.salaryBankAccount,
          pfBankAccount: row.pfBankAccount,
          providentFundEnabled: row.providentFundEnabled,
        })),
      });
      toast.success("Provident fund settings saved.");
      await loadRows();
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
                <FaUniversity size={12} />
                Employee accounts
              </div>
              <h1 className="text-3xl font-semibold text-slate-950">
                Provident fund
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Default is off. When on, 10% of basic is deducted from salary
                and the institute adds the same 10%. Total PF credited is 20% of
                basic.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectDropdown
                label="Campus"
                options={campusOptions}
                value={campus}
                onChange={(event) => setCampus(event.target.value)}
              />
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={loadRows}
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
                    Salary bank account
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    PF bank account
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                    PF
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Employee 10%
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Institute 10%
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    Total PF
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      Loading provident fund...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No teachers found for this campus.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const basic = row.teacher?.basicSalary || 0;
                    const share = row.providentFundEnabled
                      ? Math.round(basic * 0.1)
                      : 0;
                    return (
                      <tr
                        key={row.teacherId}
                        className="border-b border-slate-100"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-950">
                            {row.teacher?.name}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            {row.teacher?.teacherId} ·{" "}
                            {row.teacher?.campus?.name || "—"} · basic{" "}
                            {formatTaka(basic)}
                          </p>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="w-48 rounded-lg border border-slate-300 px-2 py-2 text-sm font-semibold text-slate-900"
                            value={row.salaryBankAccount}
                            onChange={(event) =>
                              updateRow(
                                row.teacherId,
                                "salaryBankAccount",
                                event.target.value
                              )
                            }
                            placeholder="Salary A/C"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="w-48 rounded-lg border border-slate-300 px-2 py-2 text-sm font-semibold text-slate-900"
                            value={row.pfBankAccount}
                            onChange={(event) =>
                              updateRow(
                                row.teacherId,
                                "pfBankAccount",
                                event.target.value
                              )
                            }
                            placeholder="PF A/C"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={row.providentFundEnabled}
                              onChange={(event) =>
                                updateRow(
                                  row.teacherId,
                                  "providentFundEnabled",
                                  event.target.checked
                                )
                              }
                            />
                            {row.providentFundEnabled ? "On" : "Off"}
                          </label>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {formatTaka(share)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {formatTaka(share)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          {formatTaka(share * 2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PayrollProvidentFundPage;
