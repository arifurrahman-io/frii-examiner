import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaDownload, FaLock, FaSearch, FaSyncAlt, FaUserGraduate } from "react-icons/fa";
import SelectDropdown from "../components/ui/SelectDropdown";
import {
  getIncrementLetterBundle,
  getIncrementMeta,
  getIncrementTeachers,
  updateIncrementSettings,
} from "../api/apiService";
import { useAuth } from "../context/AuthContext";
import { EVALUATEE_LABELS, matchesEmployeeSearch } from "../utils/incrementUi";
import { downloadShiftIncrementLettersPdf } from "../utils/incrementLetterExport";

const IncrementEvaluationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [fiscalYear, setFiscalYear] = useState(
    searchParams.get("year") || ""
  );
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingCampus, setDownloadingCampus] = useState("");
  const [letterLockOn, setLetterLockOn] = useState("");
  const [letterLocked, setLetterLocked] = useState(false);
  const [savingLock, setSavingLock] = useState(false);

  const canSetLetterLock = ["admin", "head_teacher"].includes(user?.role);

  const yearOptions = useMemo(
    () =>
      (meta?.fiscalYears || []).map((year) => ({
        _id: year,
        name: year,
      })),
    [meta]
  );

  const loadTeachers = useCallback(async (year) => {
    const { data } = await getIncrementTeachers({ fiscalYear: year });
    setTeachers(data.teachers || []);
    if (data.letterLockOn) setLetterLockOn(data.letterLockOn);
    setLetterLocked(Boolean(data.letterLocked));
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const { data } = await getIncrementMeta();
        setMeta(data);
        const year = searchParams.get("year") || data.currentFiscalYear;
        setFiscalYear(year);
        if (data.letterLockOn && year === data.currentFiscalYear) {
          setLetterLockOn(data.letterLockOn);
          setLetterLocked(Boolean(data.letterLocked));
        }
        await loadTeachers(year);
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Increment module load failed. Restart the backend if /api/increment is missing.";
        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTeachers]);

  useEffect(() => {
    if (!fiscalYear || !meta) return;
    const refresh = async () => {
      try {
        setLoading(true);
        await loadTeachers(fiscalYear);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to refresh data.");
      } finally {
        setLoading(false);
      }
    };
    refresh();
  }, [fiscalYear, loadTeachers, meta]);

  const visibleTeachers = useMemo(
    () => teachers.filter((item) => matchesEmployeeSearch(item, searchQuery)),
    [teachers, searchQuery]
  );

  const letterCampuses = meta?.letterCampuses || [];
  const canDownloadLetters = Boolean(meta?.canDownloadLetters);

  const teacherCountByCampus = useMemo(() => {
    const counts = new Map();
    teachers.forEach((item) => {
      const campusId = String(item.campus?._id || item.campus || "");
      if (!campusId) return;
      counts.set(campusId, (counts.get(campusId) || 0) + 1);
    });
    return counts;
  }, [teachers]);

  const handleDownloadShiftLetters = async (campus) => {
    const campusId = String(campus._id);
    try {
      setDownloadingCampus(campusId);
      toast.loading(`Preparing ${campus.name} letters…`, { id: "letter-bundle" });
      const { data } = await getIncrementLetterBundle({
        fiscalYear,
        campus: campusId,
      });
      if (!data.items?.length) {
        toast.error("No teachers found for this shift.", { id: "letter-bundle" });
        return;
      }
      toast.loading(
        `Creating PDF · ${data.count} letters for ${campus.name}…`,
        { id: "letter-bundle" }
      );
      await downloadShiftIncrementLettersPdf(data.items, {
        campusName: campus.name,
        fiscalYear,
        onProgress: (current, total) => {
          toast.loading(
            `Creating PDF · ${current}/${total} · ${campus.name}`,
            { id: "letter-bundle" }
          );
        },
      });
      toast.success(`${campus.name} letters downloaded.`, { id: "letter-bundle" });
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to download letters.",
        { id: "letter-bundle" }
      );
    } finally {
      setDownloadingCampus("");
    }
  };

  const openEvaluatePage = (teacherId) => {
    navigate(
      `/increment/${teacherId}${fiscalYear ? `?year=${fiscalYear}` : ""}`
    );
  };

  const handleYearChange = (year) => {
    setFiscalYear(year);
    if (year) setSearchParams({ year }, { replace: true });
  };

  const handleSaveLetterLock = async () => {
    if (!letterLockOn) {
      toast.error("Select a lock date.");
      return;
    }
    try {
      setSavingLock(true);
      const { data } = await updateIncrementSettings({
        fiscalYear,
        letterLockOn,
      });
      setLetterLocked(Boolean(data.letterLocked));
      setLetterLockOn(data.letterLockOn || letterLockOn);
      toast.success(data.message || "Letter lock date saved.");
      await loadTeachers(fiscalYear);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save letter lock date."
      );
    } finally {
      setSavingLock(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-5 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1440px] space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-700">
                Annual increment
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                বার্ষিক মূল্যায়ন
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
                নামের যেকোনো অংশ লিখে খুঁজুন, তারপর মূল্যায়ন করুন চাপলে নতুন
                পেজে স্কোর দেওয়া যাবে।
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <SelectDropdown
                label="Fiscal year"
                options={yearOptions}
                value={fiscalYear}
                onChange={(event) => handleYearChange(event.target.value)}
              />
              <button
                type="button"
                onClick={() => loadTeachers(fiscalYear)}
                className="inline-flex h-[48px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Your scale</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              1–{meta?.scaleMax || "—"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Staff in scope</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {teachers.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Matches</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {visibleTeachers.length}
            </p>
          </div>
        </section>

        {canSetLetterLock ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 text-teal-700">
                  <FaLock size={14} />
                  <h2 className="text-base font-semibold text-slate-950">
                    Letter lock date
                  </h2>
                </div>
                <p className="max-w-3xl text-sm font-medium text-slate-500">
                  এই তারিখ থেকে {fiscalYear || "এই"} অর্থবছরের লেটার লক হবে।
                  ফাইনালাইজ করা লেটারের নতুন মূল বেতন ও বাড়ি ভাড়া তখনই
                  প্রোফাইলে বসবে। ডিফল্ট: অর্থবছর শেষের পর ৩ আগস্ট।
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  Status: {letterLocked ? "Locked" : "Open"}
                  {letterLockOn ? ` · locks on ${letterLockOn}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Lock on
                  </span>
                  <input
                    type="date"
                    className="h-[48px] rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-900"
                    value={letterLockOn}
                    onChange={(event) => setLetterLockOn(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  disabled={savingLock || !fiscalYear}
                  onClick={handleSaveLetterLock}
                  className="inline-flex h-[48px] items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  Save lock date
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {canDownloadLetters && letterCampuses.length > 0 ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Download increment letters
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  One click downloads a merged A4 PDF of every teacher letter in
                  that shift.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {letterCampuses.map((campus) => {
                const campusId = String(campus._id);
                const count = teacherCountByCampus.get(campusId);
                const busy = downloadingCampus === campusId;
                return (
                  <button
                    key={campusId}
                    type="button"
                    disabled={Boolean(downloadingCampus)}
                    onClick={() => handleDownloadShiftLetters(campus)}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-left hover:border-teal-500 hover:bg-teal-50 disabled:opacity-60"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        {campus.name}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {campus.location || "Shift"}
                        {count != null ? ` · ${count} teachers` : ""}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white">
                      <FaDownload />
                      {busy ? "PDF…" : "PDF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {loadError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {loadError}
          </div>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FaUserGraduate className="text-teal-700" />
            <h2 className="text-base font-semibold text-slate-950">
              শিক্ষক খুঁজুন
            </h2>
          </div>
          <label className="relative block">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              className="h-14 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-base font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
              placeholder="নামের যেকোনো অংশ লিখুন, যেমন jah বা আলম"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          {searchQuery.trim() ? (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              “{searchQuery.trim()}” এর সাথে {visibleTeachers.length} জন মিলেছে
            </p>
          ) : null}

          {loading && teachers.length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-slate-500">
              শিক্ষক তালিকা লোড হচ্ছে...
            </p>
          ) : visibleTeachers.length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-slate-500">
              {searchQuery.trim()
                ? "এই খোঁজে কেউ মেলেনি। নামের অন্য অংশ দিয়ে চেষ্টা করুন।"
                : "এই স্কোপে কোনো শিক্ষক পাওয়া যায়নি।"}
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-2 py-2">Campus</th>
                    <th className="px-2 py-2">Overall %</th>
                    <th className="px-2 py-2">Entries</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTeachers.map((item) => {
                    const id = String(item._id);
                    return (
                      <tr
                        key={id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-2 py-2 font-semibold text-slate-900">
                          {item.name}
                          {item.banglaName ? (
                            <p className="font-[Anek_Bangla] text-xs font-medium text-slate-600">
                              {item.banglaName}
                            </p>
                          ) : null}
                          <p className="text-xs font-medium text-slate-500">
                            {item.teacherId}
                          </p>
                        </td>
                        <td className="px-2 py-2">
                          {EVALUATEE_LABELS[item.evaluateeRole]}
                        </td>
                        <td className="px-2 py-2">
                          {item.campus?.name || "—"}
                        </td>
                        <td className="px-2 py-2">
                          {item.averages?.overall != null
                            ? `${item.averages.overall}%`
                            : "—"}
                        </td>
                        <td className="px-2 py-2">
                          {item.averages?.entryCount || 0}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => openEvaluatePage(id)}
                            className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                          >
                            মূল্যায়ন করুন
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default IncrementEvaluationPage;
