import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaExchangeAlt,
  FaFileExport,
  FaGraduationCap,
  FaSave,
  FaShieldAlt,
  FaSyncAlt,
  FaTable,
} from "react-icons/fa";
import SelectDropdown from "../components/ui/SelectDropdown";
import { useAuth } from "../context/AuthContext";
import {
  exportCustomReportToPDF,
  getClasses,
  getExaminerExchangeDates,
  getExaminerPairOrders,
  getReportData,
  getResponsibilityTypes,
  saveExaminerExchangeDates,
  saveExaminerPairOrders,
} from "../api/apiService";
import {
  formatJoiningDate,
  getPairRoleLabels,
  isExaminerScrutinizerPair,
  sortTeachersForPair,
} from "../utils/examinerPairOrder";

const getExchangeDateIdKey = ({
  responsibilityType,
  targetClass,
  targetSubject,
}) => [responsibilityType, targetClass, targetSubject].join("|||");

const getPairedScrutinizerDutyName = (examinerDutyName = "") => {
  const name = String(examinerDutyName || "").trim();
  if (!/^E/i.test(name)) return null;
  return name.replace(/^E/i, "S");
};

const getClassSubjectKey = (className = "", subjectName = "") =>
  `${String(className).trim().toUpperCase()}|||${String(subjectName)
    .trim()
    .toUpperCase()}`;

const ExaminerReportSetupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const yearOptions = useMemo(() => {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = startYear; year <= currentYear + 1; year += 1) {
      years.push({ _id: year, name: `${year}` });
    }
    return years.reverse();
  }, []);

  const [year, setYear] = useState(new Date().getFullYear());
  const [classId, setClassId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [masterData, setMasterData] = useState({
    classes: [],
    types: [],
    allTypes: [],
  });
  const [examinerRows, setExaminerRows] = useState([]);
  const [scrutinizerRows, setScrutinizerRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exchangeDates, setExchangeDates] = useState({});
  const [pairOrders, setPairOrders] = useState({});
  const [exchangeDateSaveLoading, setExchangeDateSaveLoading] = useState(false);
  const [pairOrderSaveLoading, setPairOrderSaveLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Examiner setup is restricted to admins.");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [classesRes, typesRes] = await Promise.all([
          getClasses(),
          getResponsibilityTypes(),
        ]);
        const types = Array.isArray(typesRes.data) ? typesRes.data : [];
        const examinerTypes = types.filter((type) =>
          type.name?.trim().toUpperCase().startsWith("E")
        );
        setMasterData({
          classes: Array.isArray(classesRes.data) ? classesRes.data : [],
          types: examinerTypes,
          allTypes: types,
        });
        if (examinerTypes.length > 0) {
          setTypeId((prev) => prev || examinerTypes[0]._id);
        }
      } catch (error) {
        toast.error("Failed to load filters.");
      }
    };
    loadMaster();
  }, []);

  const selectedType = masterData.types.find(
    (type) => String(type._id) === String(typeId)
  );
  const selectedClass = masterData.classes.find(
    (item) => String(item._id) === String(classId)
  );
  const pairedScrutinizerName = getPairedScrutinizerDutyName(
    selectedType?.name
  );

  const loadAssignments = useCallback(async () => {
    if (!year || !classId || !typeId) {
      setExaminerRows([]);
      setScrutinizerRows([]);
      setExchangeDates({});
      setPairOrders({});
      return;
    }

    setLoading(true);
    try {
      const { data: examinerData } = await getReportData({
        reportType: "DETAILED_ASSIGNMENT",
        year,
        classId,
        typeId,
        typeIds: typeId,
        status: "Assigned",
      });
      const examiners = Array.isArray(examinerData) ? examinerData : [];
      setExaminerRows(examiners);

      let scrutinizers = [];
      if (pairedScrutinizerName) {
        const sType = masterData.allTypes.find(
          (type) =>
            String(type.name || "").trim().toUpperCase() ===
            pairedScrutinizerName.toUpperCase()
        );
        if (sType?._id) {
          const { data: sData } = await getReportData({
            reportType: "DETAILED_ASSIGNMENT",
            year,
            classId,
            typeId: sType._id,
            typeIds: sType._id,
            status: "Assigned",
          });
          scrutinizers = Array.isArray(sData) ? sData : [];
        }
      }
      setScrutinizerRows(scrutinizers);

      const keys = examiners
        .filter(
          (row) =>
            row.RESPONSIBILITY_TYPE_ID && row.CLASS_ID && row.SUBJECT_ID
        )
        .map((row) => ({
          responsibilityType: row.RESPONSIBILITY_TYPE_ID,
          targetClass: row.CLASS_ID,
          targetSubject: row.SUBJECT_ID,
        }));

      if (keys.length === 0) {
        setExchangeDates({});
        setPairOrders({});
        return;
      }

      const typeIds = [...new Set(keys.map((item) => item.responsibilityType))].join(
        ","
      );
      const classIds = [...new Set(keys.map((item) => item.targetClass))].join(",");
      const subjectIds = [
        ...new Set(keys.map((item) => item.targetSubject)),
      ].join(",");

      const [{ data: dateData }, { data: pairData }] = await Promise.all([
        getExaminerExchangeDates({ year, typeIds, classIds, subjectIds }),
        getExaminerPairOrders({ year, typeIds, classIds, subjectIds }),
      ]);

      setExchangeDates(
        Object.fromEntries(
          (Array.isArray(dateData) ? dateData : []).map((item) => [
            item.key,
            item.lastDateOfExchange || "",
          ])
        )
      );
      setPairOrders(
        Object.fromEntries(
          (Array.isArray(pairData) ? pairData : []).map((item) => [
            item.key,
            item.teacherOrder || [],
          ])
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load examiner assignments."
      );
      setExaminerRows([]);
      setScrutinizerRows([]);
    } finally {
      setLoading(false);
    }
  }, [year, classId, typeId, pairedScrutinizerName, masterData.allTypes]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const exchangeDateRows = useMemo(() => {
    const rowMap = new Map();
    examinerRows.forEach((row) => {
      if (
        !row.RESPONSIBILITY_TYPE_ID ||
        !row.CLASS_ID ||
        !row.SUBJECT_ID ||
        !row.CLASS ||
        !row.SUBJECT
      ) {
        return;
      }
      const key = getExchangeDateIdKey({
        responsibilityType: row.RESPONSIBILITY_TYPE_ID,
        targetClass: row.CLASS_ID,
        targetSubject: row.SUBJECT_ID,
      });
      if (!rowMap.has(key)) {
        rowMap.set(key, {
          key,
          responsibilityType: row.RESPONSIBILITY_TYPE_ID,
          targetClass: row.CLASS_ID,
          targetSubject: row.SUBJECT_ID,
          dutyType: row.RESPONSIBILITY_TYPE,
          className: row.CLASS,
          subjectName: row.SUBJECT,
        });
      }
    });
    return [...rowMap.values()].sort((a, b) => {
      const classCompare = a.className.localeCompare(b.className);
      if (classCompare !== 0) return classCompare;
      return a.subjectName.localeCompare(b.subjectName);
    });
  }, [examinerRows]);

  const scrutinizerBySubject = useMemo(() => {
    const map = new Map();
    scrutinizerRows.forEach((row) => {
      const key = getClassSubjectKey(row.CLASS, row.SUBJECT);
      if (!map.has(key)) map.set(key, []);
      if (
        row.TEACHER_REF_ID &&
        !map.get(key).some((item) => item.refId === row.TEACHER_REF_ID)
      ) {
        map.get(key).push({
          refId: row.TEACHER_REF_ID,
          name: row.TEACHER || "N/A",
          teacherId: row.TEACHERID || "",
          campus: row.CAMPUS || "",
          joiningDate: row.JOINING_DATE || null,
        });
      }
    });
    return map;
  }, [scrutinizerRows]);

  const examinerPairRows = useMemo(() => {
    const groupMap = new Map();
    examinerRows.forEach((row) => {
      if (
        !row.RESPONSIBILITY_TYPE_ID ||
        !row.CLASS_ID ||
        !row.SUBJECT_ID ||
        !row.TEACHER_REF_ID
      ) {
        return;
      }
      const key = getExchangeDateIdKey({
        responsibilityType: row.RESPONSIBILITY_TYPE_ID,
        targetClass: row.CLASS_ID,
        targetSubject: row.SUBJECT_ID,
      });
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          responsibilityType: row.RESPONSIBILITY_TYPE_ID,
          targetClass: row.CLASS_ID,
          targetSubject: row.SUBJECT_ID,
          dutyType: row.RESPONSIBILITY_TYPE,
          className: row.CLASS,
          subjectName: row.SUBJECT,
          teachers: [],
        });
      }
      const group = groupMap.get(key);
      if (!group.teachers.some((item) => item.refId === row.TEACHER_REF_ID)) {
        group.teachers.push({
          refId: row.TEACHER_REF_ID,
          name: row.TEACHER || "N/A",
          teacherId: row.TEACHERID || "",
          campus: row.CAMPUS || "",
          joiningDate: row.JOINING_DATE || null,
        });
      }
    });

    return [...groupMap.values()]
      .map((group) => {
        const labels = getPairRoleLabels(group.className, group.subjectName);
        const isScrutinizerPair = isExaminerScrutinizerPair(
          group.className,
          group.subjectName
        );

        if (isScrutinizerPair) {
          const examiners = sortTeachersForPair(group.teachers, [], {
            className: group.className,
            subjectName: group.subjectName,
          });
          const scrutinizers =
            scrutinizerBySubject.get(
              getClassSubjectKey(group.className, group.subjectName)
            ) || [];
          return {
            ...group,
            teachers: [examiners[0], scrutinizers[0]].filter(Boolean),
            first: examiners[0] || null,
            second: scrutinizers[0] || null,
            firstLabel: labels.first,
            secondLabel: labels.second,
            canSwap: false,
            isScrutinizerPair: true,
          };
        }

        const teachers = sortTeachersForPair(
          group.teachers,
          pairOrders[group.key] || [],
          {
            className: group.className,
            subjectName: group.subjectName,
          }
        );
        return {
          ...group,
          teachers,
          first: teachers[0] || null,
          second: teachers[1] || null,
          firstLabel: labels.first,
          secondLabel: labels.second,
          canSwap: teachers.length >= 2,
          isScrutinizerPair: false,
        };
      })
      .sort((a, b) => {
        const classCompare = a.className.localeCompare(b.className);
        if (classCompare !== 0) return classCompare;
        return a.subjectName.localeCompare(b.subjectName);
      });
  }, [examinerRows, pairOrders, scrutinizerBySubject]);

  const handleSaveExchangeDates = async () => {
    if (exchangeDateRows.length === 0) return;
    setExchangeDateSaveLoading(true);
    try {
      await saveExaminerExchangeDates({
        year,
        entries: exchangeDateRows.map((row) => ({
          responsibilityType: row.responsibilityType,
          targetClass: row.targetClass,
          targetSubject: row.targetSubject,
          lastDateOfExchange: exchangeDates[row.key] || "",
        })),
      });
      toast.success("Exchange dates saved.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save exchange dates."
      );
    } finally {
      setExchangeDateSaveLoading(false);
    }
  };

  const handleSwapExaminerPair = async (pair) => {
    if (!pair?.canSwap || pair.teachers.length < 2) return;

    const nextTeachers = [...pair.teachers];
    [nextTeachers[0], nextTeachers[1]] = [nextTeachers[1], nextTeachers[0]];
    const teacherOrder = nextTeachers.map((teacher) => teacher.refId);

    setPairOrders((prev) => ({ ...prev, [pair.key]: teacherOrder }));
    setPairOrderSaveLoading(true);
    try {
      await saveExaminerPairOrders({
        year,
        entries: [
          {
            responsibilityType: pair.responsibilityType,
            targetClass: pair.targetClass,
            targetSubject: pair.targetSubject,
            teacherOrder,
          },
        ],
      });
      toast.success(
        `${pair.className} · ${pair.subjectName}: ${pair.firstLabel} / ${pair.secondLabel} swapped.`
      );
    } catch (error) {
      setPairOrders((prev) => ({
        ...prev,
        [pair.key]: pair.teachers.map((teacher) => teacher.refId),
      }));
      toast.error(
        error.response?.data?.message || "Failed to save examiner pair order."
      );
    } finally {
      setPairOrderSaveLoading(false);
    }
  };

  const handleExportClassPdf = async () => {
    if (!classId || !typeId) {
      toast.error("Select class and E-duty type first.");
      return;
    }
    setExportLoading(true);
    try {
      if (exchangeDateRows.length > 0) {
        await saveExaminerExchangeDates({
          year,
          entries: exchangeDateRows.map((row) => ({
            responsibilityType: row.responsibilityType,
            targetClass: row.targetClass,
            targetSubject: row.targetSubject,
            lastDateOfExchange: exchangeDates[row.key] || "",
          })),
        });
      }
      await exportCustomReportToPDF({
        reportType: "EXPORT_CLASS_DETAILED",
        year,
        classId,
        typeId,
        typeIds: typeId,
        status: "Assigned",
      });
      toast.success("Class examiner PDF exported.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Export failed.");
    } finally {
      setExportLoading(false);
    }
  };

  if (user?.role !== "admin") return null;

  const filtersReady = Boolean(year && classId && typeId);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-5 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1440px] space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <FaShieldAlt size={12} />
                Examiner report setup
              </div>
              <h1 className="text-3xl font-semibold text-slate-950">
                Exchange dates & examiner order
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Manage Last Date of Exchange and Examiner-1 / Examiner-2 order
                for class PDF reports. Scrutinizer for Nine/Ten Agriculture,
                ICT, and H.Science comes from{" "}
                {pairedScrutinizerName || "S-*"} when viewing{" "}
                {selectedType?.name || "E-*"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FaTable />
                All reports
              </Link>
              <button
                type="button"
                onClick={loadAssignments}
                disabled={loading || !filtersReady}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleExportClassPdf}
                disabled={exportLoading || !filtersReady}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                <FaFileExport />
                {exportLoading ? "Exporting..." : "Export class PDF"}
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SelectDropdown
              label="Year"
              options={yearOptions}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            />
            <SelectDropdown
              label="Class"
              options={[
                { _id: "", name: "Select class" },
                ...masterData.classes,
              ]}
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
            />
            <SelectDropdown
              label="E-duty type"
              options={[
                { _id: "", name: "Select duty type" },
                ...masterData.types,
              ]}
              value={typeId}
              onChange={(event) => setTypeId(event.target.value)}
            />
          </div>
          {filtersReady && (
            <p className="mt-4 text-sm font-medium text-slate-500">
              Showing {selectedClass?.name || "class"} ·{" "}
              {selectedType?.name || "duty"}
              {pairedScrutinizerName
                ? ` · Scrutinizer source ${pairedScrutinizerName}`
                : ""}
            </p>
          )}
        </section>

        {!filtersReady ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">
            Select year, class, and an E-duty type to manage this report.
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-20 text-sm font-semibold text-slate-500">
            <FaSyncAlt className="mr-2 animate-spin" />
            Loading assignments
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Last Date of Exchange
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Saved dates are reused automatically when printing this
                    report.
                  </p>
                </div>
                <FaGraduationCap className="mt-1 text-teal-700" />
              </div>

              {exchangeDateRows.length === 0 ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                  No assigned subjects found for this class and duty type.
                </p>
              ) : (
                <>
                  <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
                    {exchangeDateRows.map((row) => (
                      <label
                        key={row.key}
                        className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-3"
                      >
                        <span className="block truncate text-xs font-semibold text-slate-600">
                          {row.className} - {row.subjectName}
                          {row.dutyType ? ` (${row.dutyType})` : ""}
                        </span>
                        <input
                          type="date"
                          value={exchangeDates[row.key] || ""}
                          onChange={(event) =>
                            setExchangeDates((prev) => ({
                              ...prev,
                              [row.key]: event.target.value,
                            }))
                          }
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveExchangeDates}
                    disabled={exchangeDateSaveLoading}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-100 disabled:opacity-60"
                  >
                    <FaSave />
                    {exchangeDateSaveLoading
                      ? "Saving..."
                      : "Save exchange dates"}
                  </button>
                </>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Examiner order
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Swap Examiner-1 / Examiner-2 for regular subjects. For
                    Agriculture, ICT, and H.Science, Scrutinizer is shown from{" "}
                    {pairedScrutinizerName || "S-*"} (not swappable here).
                  </p>
                </div>
                <FaExchangeAlt className="mt-1 text-teal-700" />
              </div>

              {examinerPairRows.length === 0 ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                  No examiner pairs found for this selection.
                </p>
              ) : (
                <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                  {examinerPairRows.map((pair) => (
                    <div
                      key={pair.key}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <p className="text-xs font-semibold text-slate-600">
                        {pair.className} · {pair.subjectName}
                        {pair.dutyType ? ` (${pair.dutyType})` : ""}
                        {pair.isScrutinizerPair ? " · Examiner / Scrutinizer" : ""}
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                            {pair.firstLabel}
                          </p>
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {pair.first?.name || "—"}
                          </p>
                          <p className="truncate text-[11px] font-medium text-slate-500">
                            {pair.first?.campus || "N/A"}
                            {!pair.isScrutinizerPair &&
                              (pair.first?.joiningDate
                                ? ` · joined ${formatJoiningDate(pair.first.joiningDate)}`
                                : pair.first
                                  ? " · no joining date"
                                  : "")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSwapExaminerPair(pair)}
                          disabled={!pair.canSwap || pairOrderSaveLoading}
                          title={
                            pair.isScrutinizerPair
                              ? "Scrutinizer comes from S-* duty"
                              : "Swap positions"
                          }
                          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaExchangeAlt />
                          Swap
                        </button>
                        <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {pair.secondLabel}
                          </p>
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {pair.second?.name || "—"}
                          </p>
                          <p className="truncate text-[11px] font-medium text-slate-500">
                            {pair.second?.campus ||
                              (pair.isScrutinizerPair
                                ? `Assign ${pairedScrutinizerName || "S-*"}`
                                : "N/A")}
                            {!pair.isScrutinizerPair &&
                              pair.second &&
                              (pair.second.joiningDate
                                ? ` · joined ${formatJoiningDate(pair.second.joiningDate)}`
                                : " · no joining date")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExaminerReportSetupPage;
