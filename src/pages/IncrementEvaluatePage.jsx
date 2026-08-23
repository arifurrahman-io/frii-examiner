import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FaChartLine,
  FaChevronLeft,
  FaFileAlt,
  FaPrint,
  FaSave,
  FaEye,
  FaStar,
  FaTasks,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import IncrementLetterPrint from "../components/increment/IncrementLetterPrint";
import IncrementLetterPreviewModal from "../components/increment/IncrementLetterPreviewModal";
import {
  createIncrementEvaluation,
  getIncrementMeta,
  getTeacherIncrementLetter,
  getTeacherIncrementSummary,
  updateTeacherSalary,
  upsertIncrementLetter,
} from "../api/apiService";
import {
  EVALUATEE_LABELS,
  SCORE_LABELS_4,
  SCORE_LABELS_5,
  defaultEffectiveFromLabel,
  deriveIncrementSalary,
  houseRentFromBasic,
} from "../utils/incrementUi";

const IncrementEvaluatePage = () => {
  const { teacherId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const yearFromQuery = searchParams.get("year") || "";

  const [fiscalYear, setFiscalYear] = useState(yearFromQuery);
  const [summary, setSummary] = useState(null);
  const [letterPayload, setLetterPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [note, setNote] = useState("");
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: 0,
    houseRent: 0,
  });
  const [letterForm, setLetterForm] = useState({
    generalIncrement: 0,
    performanceIncrement: 0,
    totalIncrement: 0,
    previousBasic: 0,
    previousHouseRent: 0,
    newBasic: 0,
    newHouseRent: 0,
    totalMonthly: 0,
    effectiveFromLabel: "",
    status: "draft",
    notes: "",
    criterionAmounts: [],
  });

  const canManageLetter = ["admin", "head_teacher"].includes(user?.role);

  const loadSummary = useCallback(
    async (year) => {
      const [summaryRes, letterRes] = await Promise.all([
        getTeacherIncrementSummary(teacherId, { fiscalYear: year }),
        getTeacherIncrementLetter(teacherId, { fiscalYear: year }),
      ]);
      setSummary(summaryRes.data);
      setLetterPayload(letterRes.data);
      const letter = letterRes.data.letter || {};
      const currentBasic = Number(summaryRes.data.teacher.basicSalary || 0);
      const generalIncrement = letter.generalIncrement || 0;
      const performanceIncrement = letter.performanceIncrement || 0;
      const criteria = summaryRes.data.criteria || [];
      const savedAmounts = letter.criterionAmounts || [];
      const criterionAmounts = criteria.map((criterion) => {
        const saved = savedAmounts.find(
          (item) => String(item.criterion) === String(criterion._id)
        );
        return {
          criterion: criterion._id,
          titleBn: criterion.titleBn,
          amount: saved?.amount || 0,
        };
      });
      const amountsTotal = criterionAmounts.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );
      const nextPerformance =
        amountsTotal > 0 ? amountsTotal : performanceIncrement;
      const derived = deriveIncrementSalary({
        previousBasic: currentBasic,
        generalIncrement,
        performanceIncrement: nextPerformance,
      });
      const letterIsFinal = letter.status === "final";
      setSalaryForm({
        basicSalary: currentBasic,
        houseRent: houseRentFromBasic(currentBasic),
      });
      setLetterForm({
        generalIncrement,
        performanceIncrement: nextPerformance,
        ...derived,
        ...(letterIsFinal
          ? {
              previousBasic: letter.previousBasic ?? derived.previousBasic,
              previousHouseRent:
                letter.previousHouseRent ?? derived.previousHouseRent,
              totalIncrement: letter.totalIncrement ?? derived.totalIncrement,
              newBasic: letter.newBasic ?? derived.newBasic,
              newHouseRent: letter.newHouseRent ?? derived.newHouseRent,
              totalMonthly: letter.totalMonthly ?? derived.totalMonthly,
            }
          : {}),
        effectiveFromLabel:
          letter.effectiveFromLabel || defaultEffectiveFromLabel(year || fiscalYear),
        status: letter.status || "draft",
        notes: letter.notes || "",
        criterionAmounts,
      });
    },
    [teacherId]
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        let year = yearFromQuery;
        if (!year) {
          const { data } = await getIncrementMeta();
          year = data.currentFiscalYear;
          setFiscalYear(year);
        }
        await loadSummary(year);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load evaluation page."
        );
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [loadSummary, yearFromQuery]);

  const handleSaveEvaluation = async (criterionId, score) => {
    try {
      setSaving(true);
      await createIncrementEvaluation({
        teacherId,
        criterionId,
        score: Number(score),
        fiscalYear,
        note,
      });
      toast.success("মূল্যায়ন সেভ হয়েছে।");
      await loadSummary(fiscalYear);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save evaluation.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSalary = async () => {
    try {
      setSaving(true);
      const basicSalary = Number(salaryForm.basicSalary) || 0;
      await updateTeacherSalary(teacherId, {
        basicSalary,
        houseRent: houseRentFromBasic(basicSalary),
      });
      toast.success("Salary updated.");
      await loadSummary(fiscalYear);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update salary.");
    } finally {
      setSaving(false);
    }
  };

  const recomputeLetterTotals = (next) => {
    const derived = deriveIncrementSalary({
      previousBasic: next.previousBasic,
      generalIncrement: next.generalIncrement,
      performanceIncrement: next.performanceIncrement,
    });
    return {
      ...next,
      ...derived,
    };
  };

  const applyPerformanceFromAmounts = (nextAmounts, base = letterForm) => {
    const performanceIncrement = nextAmounts.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    return recomputeLetterTotals({
      ...base,
      criterionAmounts: nextAmounts,
      performanceIncrement,
    });
  };

  const handleCriterionAmount = (criterionId, amount) => {
    setLetterForm((prev) => {
      const nextAmounts = (prev.criterionAmounts || []).map((item) =>
        String(item.criterion) === String(criterionId)
          ? { ...item, amount }
          : item
      );
      return applyPerformanceFromAmounts(nextAmounts, prev);
    });
  };

  const distributePerformanceIncrement = () => {
    const rows = letterForm.criterionAmounts || [];
    if (rows.length === 0) return;
    const total = Number(letterForm.performanceIncrement) || 0;
    const weights = rows.map((row) => {
      const average = (summary?.averages?.byCriterion || []).find(
        (item) => String(item.criterion) === String(row.criterion)
      )?.average;
      return Math.max(0, Number(average) || 0);
    });
    const weightSum = weights.reduce((sum, value) => sum + value, 0);
    let remaining = total;
    const nextAmounts = rows.map((row, index) => {
      if (index === rows.length - 1) {
        return { ...row, amount: Math.max(0, remaining) };
      }
      const share =
        weightSum > 0
          ? Math.round((total * weights[index]) / weightSum)
          : Math.round(total / rows.length);
      remaining -= share;
      return { ...row, amount: share };
    });
    setLetterForm((prev) => applyPerformanceFromAmounts(nextAmounts, prev));
  };

  const handleLetterField = (field, value) => {
    setLetterForm((prev) => {
      const next = { ...prev, [field]: value };
      if (["generalIncrement", "performanceIncrement"].includes(field)) {
        return recomputeLetterTotals(next);
      }
      return next;
    });
  };

  const handleSaveLetter = async (status = "draft") => {
    try {
      setSaving(true);
      await upsertIncrementLetter({
        teacherId,
        fiscalYear,
        ...letterForm,
        status,
      });
      toast.success(
        status === "final" ? "Letter finalized." : "Letter draft saved."
      );
      await loadSummary(fiscalYear);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save letter.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    document.documentElement.classList.add("increment-letter-print-mode");
    const cleanup = () => {
      document.documentElement.classList.remove("increment-letter-print-mode");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.requestAnimationFrame(() => window.print());
  };

  const backToList = () => {
    navigate(`/increment${fiscalYear ? `?year=${fiscalYear}` : ""}`);
  };

  if (loading && !summary) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm font-semibold text-slate-500">
        মূল্যায়ন পেজ লোড হচ্ছে...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            এই শিক্ষকের মূল্যায়ন লোড করা যায়নি।
          </p>
          <button
            type="button"
            onClick={backToList}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            তালিকায় ফিরুন
          </button>
        </div>
      </div>
    );
  }

  const letterProps = {
    teacher: letterPayload?.teacher || summary.teacher,
    letter: {
      ...(letterPayload?.letter || {}),
      ...letterForm,
      fiscalYear,
      letterDate: letterPayload?.letter?.letterDate || new Date(),
      averages: summary.averages,
      criterionAmounts: letterForm.criterionAmounts,
    },
    evaluateeRole: summary.evaluateeRole,
    criteria: summary.criteria,
  };

  return (
    <div className="increment-letter-print-root min-h-screen bg-slate-50 px-4 pb-8 pt-3 text-slate-900 sm:px-6 lg:px-8">
      <main className="no-print mx-auto max-w-[1100px] space-y-3">
        <header className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-slate-800 px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={backToList}
              className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white"
            >
              <FaChevronLeft size={11} />
              তালিকায় ফিরুন
            </button>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-100">
              {fiscalYear} · {EVALUATEE_LABELS[summary.evaluateeRole]}
            </p>
            <h1 className="mt-0.5 text-xl font-semibold text-white sm:text-2xl">
              {summary.teacher?.name}
            </h1>
            {summary.teacher?.banglaName ? (
              <p className="mt-0.5 font-[Anek_Bangla] text-sm font-semibold text-teal-50">
                {summary.teacher.banglaName}
              </p>
            ) : null}
            <p className="mt-0.5 text-xs font-medium text-teal-100/90">
              {summary.teacher?.teacherId} · {summary.teacher?.campus?.name || "—"}
            </p>
          </div>

          <div className="px-4 py-3 sm:px-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-teal-50 text-teal-700">
                <FaTasks size={12} />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-950">
                  Last 3 years duties
                </p>
                <p className="text-[11px] font-medium text-slate-500">
                  Assigned responsibilities by calendar year
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(summary.recentDuties || []).map((block) => (
                <div
                  key={block.year}
                  className="rounded-lg border border-slate-200 bg-slate-50/80 p-2.5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                    {block.year}
                  </p>
                  {block.duties?.length ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {block.duties.map((duty) => (
                        <span
                          key={`${block.year}-${duty.name}`}
                          title={(duty.details || []).join(", ")}
                          className="inline-flex max-w-full items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200"
                        >
                          <span className="truncate">{duty.name}</span>
                          {duty.details?.length ? (
                            <span className="ml-1 text-slate-400">
                              {duty.details.length}
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                      No duties recorded
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-500">Overall</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {summary.averages?.overall != null
                ? `${summary.averages.overall}%`
                : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-500">By evaluator</p>
            <div className="mt-1 space-y-0.5 text-xs font-semibold text-slate-700">
              <p>
                Incharge: {summary.averages?.byEvaluatorRole?.incharge ?? "—"}
                {summary.averages?.byEvaluatorRole?.incharge != null ? "%" : ""}
              </p>
              <p>
                Coordinator:{" "}
                {summary.averages?.byEvaluatorRole?.coordinator ?? "—"}
                {summary.averages?.byEvaluatorRole?.coordinator != null
                  ? "%"
                  : ""}
              </p>
              <p>
                Head teacher:{" "}
                {summary.averages?.byEvaluatorRole?.head_teacher ?? "—"}
                {summary.averages?.byEvaluatorRole?.head_teacher != null
                  ? "%"
                  : ""}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-500">Scale</p>
            <p className="mt-1 text-base font-semibold text-slate-950">
              1–{summary.scaleMax}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {summary.canEditEvaluations
                ? "Evaluations editable"
                : "Evaluation edit closed (after 31 July)"}
            </p>
          </div>
        </section>

        {summary.canEvaluate && summary.canEditEvaluations ? (
          <section className="rounded-lg border border-teal-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <FaStar className="text-amber-500" size={14} />
              <div>
                <h2 className="text-sm font-semibold text-slate-950">
                  মূল্যায়ন করুন
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  প্রতিটি সূচকে ১ থেকে {summary.scaleMax} স্কোর চাপুন।
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {(summary.criteria || []).map((criterion) => {
                const criterionAvg = (summary.averages?.byCriterion || []).find(
                  (item) => String(item.criterion) === String(criterion._id)
                );
                const labels =
                  summary.scaleMax === 5 ? SCORE_LABELS_5 : SCORE_LABELS_4;
                return (
                  <div
                    key={criterion._id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2.5"
                  >
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {criterion.titleBn}
                        </p>
                        {criterion.descriptionBn ? (
                          <p className="mt-0.5 text-[11px] font-medium leading-4 text-slate-500">
                            {criterion.descriptionBn}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-[11px] font-semibold text-teal-700">
                        গড়:{" "}
                        {criterionAvg?.average != null
                          ? `${criterionAvg.average}%`
                          : "—"}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Array.from({ length: summary.scaleMax }, (_, index) => {
                        const score = index + 1;
                        return (
                          <button
                            key={score}
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              handleSaveEvaluation(criterion._id, score)
                            }
                            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-left text-[11px] font-semibold text-slate-800 hover:border-teal-500 hover:bg-teal-50 disabled:opacity-60"
                          >
                            <span className="block text-sm leading-none">{score}</span>
                            <span className="text-[10px] text-slate-500">
                              {labels[score]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <label className="mt-2 block space-y-1">
              <span className="text-xs font-medium text-slate-700">
                নোট (ঐচ্ছিক — পরবর্তী স্কোরের সাথে যাবে)
              </span>
              <input
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="পর্যবেক্ষণ নোট"
              />
            </label>
          </section>
        ) : (
          <section className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
            {summary.canEvaluate
              ? "এই অর্থবছরের মূল্যায়ন এডিট উইন্ডো বন্ধ (৩১ জুলাইয়ের পর)।"
              : "আপনার রোল দিয়ে এই ব্যক্তিকে মূল্যায়ন করা যাবে না।"}
          </section>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <FaChartLine className="text-teal-700" size={14} />
            <h2 className="text-sm font-semibold text-slate-950">
              Criterion averages
            </h2>
          </div>
          <div className="space-y-1.5">
            {(summary.averages?.byCriterion || []).map((item) => (
              <div
                key={item.criterion}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5"
              >
                <p className="text-xs font-semibold text-slate-800">
                  {item.titleBn}
                </p>
                <p className="text-xs font-semibold text-slate-950">
                  {item.average != null ? `${item.average}%` : "—"}
                </p>
              </div>
            ))}
            {(summary.averages?.byCriterion || []).length === 0 && (
              <p className="text-sm text-slate-500">No evaluations yet.</p>
            )}
          </div>
        </section>

        {canManageLetter && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FaFileAlt className="text-indigo-700" />
                <h2 className="text-base font-semibold text-slate-950">
                  Salary & increment letter
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FaEye />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <FaPrint />
                  Print
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Current basic salary
                </span>
                <input
                  type="number"
                  disabled={saving || summary.letterLocked}
                  className="h-[48px] w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold disabled:bg-slate-50 disabled:text-slate-500"
                  value={salaryForm.basicSalary}
                  onChange={(event) => {
                    const basicSalary = event.target.value;
                    setSalaryForm({
                      basicSalary,
                      houseRent: houseRentFromBasic(basicSalary),
                    });
                    if (letterForm.status !== "final") {
                      setLetterForm((prev) =>
                        recomputeLetterTotals({
                          ...prev,
                          previousBasic: basicSalary,
                        })
                      );
                    }
                  }}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Current house rent (50% of basic)
                </span>
                <input
                  type="number"
                  readOnly
                  className="h-[48px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600"
                  value={houseRentFromBasic(salaryForm.basicSalary)}
                />
              </label>
            </div>
            <button
              type="button"
              disabled={saving || summary.letterLocked}
              onClick={handleSaveSalary}
              className="mb-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <FaSave />
              Save current salary
            </button>
            <p className="mb-6 text-xs font-medium text-slate-500">
              {summary.letterLocked
                ? `Letter is locked${
                    summary.letterLockOn ? ` after ${summary.letterLockOn}` : ""
                  }. Current basic salary and house rent now show the updated letter values.`
                : `Previous basic comes from the teacher profile. House rent is always 50% of basic. New basic adds 2/3 of total increment; new house rent is half of new basic. Salary updates apply only after the letter lock date${
                    summary.letterLockOn ? ` (${summary.letterLockOn})` : ""
                  }.`}
            </p>

            {["incharge", "coordinator"].includes(summary.evaluateeRole) ? (
              <p className="mb-4 text-xs font-semibold text-slate-500">
                এই লেটারে সূচক অনুযায়ী টাকার অঙ্ক নয়; মূল্যায়নের গড় অনুযায়ী
                রেটিং চেকবক্স এবং নিচের মোট পারফরম্যান্স ইনক্রিমেন্ট ব্যবহার হয়।
              </p>
            ) : (
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-950">
                  বিবেচ্য অঙ্ক (প্রতি সূচক)
                </h3>
                <button
                  type="button"
                  onClick={distributePerformanceIncrement}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
                >
                  পারফরম্যান্স ইনক্রিমেন্ট বণ্টন করুন
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {(letterForm.criterionAmounts || []).map((item) => (
                  <label key={item.criterion} className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">
                      {item.titleBn}
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="h-[48px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold"
                      value={item.amount}
                      onChange={(event) =>
                        handleCriterionAmount(item.criterion, event.target.value)
                      }
                    />
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                যোগফল স্বয়ংক্রিয়ভাবে পারফরম্যান্সভিত্তিক ইনক্রিমেন্ট হবে।
              </p>
            </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["generalIncrement", "General increment", false],
                ["performanceIncrement", "Performance increment", false],
                ["totalIncrement", "Total increment", true],
                ["previousBasic", "Previous basic", true],
                ["previousHouseRent", "Previous house rent (50%)", true],
                ["newBasic", "New basic (prev + 2/3 increment)", true],
                ["newHouseRent", "New house rent (50%)", true],
                ["totalMonthly", "Total monthly", true],
              ].map(([field, label, readOnly]) => (
                <label key={field} className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    {label}
                  </span>
                  <input
                    type="number"
                    readOnly={readOnly}
                    className={`h-[48px] w-full rounded-lg border px-3 text-sm font-semibold ${
                      readOnly
                        ? "border-slate-200 bg-slate-50 text-slate-600"
                        : "border-slate-300 bg-white"
                    }`}
                    value={letterForm[field]}
                    onChange={(event) =>
                      handleLetterField(field, event.target.value)
                    }
                  />
                </label>
              ))}
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Effective from label
                </span>
                <input
                  className="h-[48px] w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold"
                  value={letterForm.effectiveFromLabel}
                  onChange={(event) =>
                    handleLetterField("effectiveFromLabel", event.target.value)
                  }
                  placeholder="জুলাই-২০২৬"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saving || summary.letterLocked}
                onClick={() => handleSaveLetter("draft")}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                <FaSave />
                Save draft
              </button>
              <button
                type="button"
                disabled={
                  saving || (summary.letterLocked && user?.role !== "admin")
                }
                onClick={() => handleSaveLetter("final")}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                Finalize & apply salary
              </button>
            </div>
          </section>
        )}
      </main>

      {canManageLetter ? (
        <>
          <IncrementLetterPrint {...letterProps} />
          <IncrementLetterPreviewModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            onPrint={handlePrint}
          >
            <IncrementLetterPrint {...letterProps} />
          </IncrementLetterPreviewModal>
        </>
      ) : null}
    </div>
  );
};

export default IncrementEvaluatePage;
