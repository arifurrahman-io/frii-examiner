const SCRUTINIZER_SUBJECTS = new Set(["ICT", "AGRICULTURE", "H.SCIENCE"]);

export const normalizeSubjectName = (value = "") =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

export const isSeniorExaminerClass = (className = "") => {
  const normalized = String(className || "").trim().toUpperCase();
  return ["NINE", "TEN", "IX", "X"].includes(normalized);
};

export const isSeniorScrutinizerSubject = (subjectName = "") =>
  SCRUTINIZER_SUBJECTS.has(normalizeSubjectName(subjectName));

/** Nine/Ten ICT, Agriculture, H.Science only: Examiner + Scrutinizer (no senior/junior). */
export const isExaminerScrutinizerPair = (className, subjectName) =>
  isSeniorExaminerClass(className) && isSeniorScrutinizerSubject(subjectName);

export const getPairRoleLabels = (className, subjectName) => {
  if (isExaminerScrutinizerPair(className, subjectName)) {
    return { first: "Examiner", second: "Scrutinizer" };
  }
  return { first: "Examiner-1", second: "Examiner-2" };
};

const joiningTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

export const compareTeachersNeutral = (a = {}, b = {}) => {
  const idCompare = String(a.teacherId || "").localeCompare(
    String(b.teacherId || ""),
    undefined,
    { numeric: true, sensitivity: "base" }
  );
  if (idCompare !== 0) return idCompare;
  return String(a.name || "").localeCompare(String(b.name || ""));
};

export const compareTeachersBySeniority = (a = {}, b = {}) => {
  const aJoin = joiningTime(a.joiningDate);
  const bJoin = joiningTime(b.joiningDate);
  if (aJoin !== null && bJoin !== null && aJoin !== bJoin) return aJoin - bJoin;
  if (aJoin !== null && bJoin === null) return -1;
  if (aJoin === null && bJoin !== null) return 1;
  return compareTeachersNeutral(a, b);
};

export const sortTeachersForPair = (
  teachers = [],
  savedOrder = [],
  { className = "", subjectName = "" } = {}
) => {
  const list = [...teachers];
  const skipSeniority = isExaminerScrutinizerPair(className, subjectName);
  const compare = skipSeniority
    ? compareTeachersNeutral
    : compareTeachersBySeniority;

  if (Array.isArray(savedOrder) && savedOrder.length > 0) {
    const rank = new Map(savedOrder.map((id, index) => [String(id), index]));
    list.sort((a, b) => {
      const aRank = rank.has(String(a.refId))
        ? rank.get(String(a.refId))
        : Number.MAX_SAFE_INTEGER;
      const bRank = rank.has(String(b.refId))
        ? rank.get(String(b.refId))
        : Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;
      return compare(a, b);
    });
    return list;
  }
  return list.sort(compare);
};

export const formatJoiningDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};
