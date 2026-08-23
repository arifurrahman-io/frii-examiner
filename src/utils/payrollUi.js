export const MONTH_OPTIONS = [
  { _id: 1, name: "January" },
  { _id: 2, name: "February" },
  { _id: 3, name: "March" },
  { _id: 4, name: "April" },
  { _id: 5, name: "May" },
  { _id: 6, name: "June" },
  { _id: 7, name: "July" },
  { _id: 8, name: "August" },
  { _id: 9, name: "September" },
  { _id: 10, name: "October" },
  { _id: 11, name: "November" },
  { _id: 12, name: "December" },
];

export const MONTHS_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

export const payrollYearOptions = (aroundYear = new Date().getFullYear()) =>
  Array.from({ length: 6 }, (_, index) => {
    const year = aroundYear - 2 + index;
    return { _id: year, name: String(year) };
  });

export const formatTaka = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

export const monthLabel = (month) =>
  MONTH_OPTIONS.find((item) => Number(item._id) === Number(month))?.name || "";

export const monthLabelBn = (month) => MONTHS_BN[Number(month) - 1] || "";

export const campusOptionsForUser = (branches, user) => {
  const list = Array.isArray(branches) ? branches : [];
  if (user?.role === "executive") {
    const allowed = new Set(
      (user.campuses || []).map((item) => String(item._id || item))
    );
    return list.filter((branch) => allowed.has(String(branch._id)));
  }
  return list;
};
