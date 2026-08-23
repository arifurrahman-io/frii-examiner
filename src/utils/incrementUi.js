export const EVALUATEE_LABELS = {
  teacher: "সাধারণ শিক্ষক",
  incharge: "শিফট ইনচার্জ",
  coordinator: "ব্রাঞ্চ কো-অর্ডিনেটর",
};

export const SCORE_LABELS_5 = [
  "",
  "উন্নয়ন প্রয়োজন",
  "গ্রহণযোগ্য",
  "ভালো",
  "খুব ভালো",
  "অসাধারণ",
];

export const SCORE_LABELS_4 = [
  "",
  "উন্নয়ন প্রয়োজন",
  "গ্রহণযোগ্য",
  "ভালো",
  "খুব ভালো",
];

export const LETTER_SCORE_OPTIONS = [
  { value: 1, label: "উন্নয়ন প্রয়োজন" },
  { value: 2, label: "গ্রহণযোগ্য" },
  { value: 3, label: "ভালো" },
  { value: 4, label: "খুব ভালো" },
  { value: 5, label: "অসাধারণ" },
];

export const percentToFiveScale = (percent) => {
  if (percent == null || !Number.isFinite(Number(percent))) return null;
  const score = Math.round((Number(percent) / 100) * 5);
  if (score < 1) return 1;
  return Math.min(5, score);
};

export const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-BD", { maximumFractionDigits: 0 });

export const HOUSE_RENT_RATIO = 0.5;
export const BASIC_INCREMENT_SHARE = 2 / 3;

export const houseRentFromBasic = (basic) =>
  Math.round(Math.max(0, Number(basic) || 0) * HOUSE_RENT_RATIO);

export const deriveIncrementSalary = ({
  previousBasic = 0,
  generalIncrement = 0,
  performanceIncrement = 0,
} = {}) => {
  const basic = Math.max(0, Number(previousBasic) || 0);
  const totalIncrement =
    Math.max(0, Number(generalIncrement) || 0) +
    Math.max(0, Number(performanceIncrement) || 0);
  const newBasic = basic + Math.round(totalIncrement * BASIC_INCREMENT_SHARE);
  const previousHouseRent = houseRentFromBasic(basic);
  const newHouseRent = houseRentFromBasic(newBasic);

  return {
    previousBasic: basic,
    previousHouseRent,
    totalIncrement,
    newBasic,
    newHouseRent,
    totalMonthly: newBasic + newHouseRent,
  };
};

export const toBnDigits = (value) =>
  String(value ?? "").replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);

export const formatBnLetterDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value || "";
  const monthIndex =
    Number(parts.find((part) => part.type === "month")?.value || 0) - 1;
  const year = parts.find((part) => part.type === "year")?.value || "";
  const months = [
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
  return `${toBnDigits(day)} ${months[monthIndex] || ""}, ${toBnDigits(year)}`;
};

export const formatBnFiscalYear = (fiscalYear) =>
  toBnDigits(String(fiscalYear || "").replace("/", "-"));

export const formatBnFiscalYearLong = (fiscalYear) => {
  const [start, end] = String(fiscalYear || "")
    .replace("/", "-")
    .split("-");
  if (!start) return "";
  if (!end) return toBnDigits(start);
  const fullEnd = end.length === 2 ? `${String(start).slice(0, 2)}${end}` : end;
  return `${toBnDigits(start)}-${toBnDigits(fullEnd)}`;
};

export const defaultEffectiveFromLabel = (fiscalYear) => {
  const startYear = String(fiscalYear || "").split(/[-/]/)[0] || "";
  return startYear ? `জুলাই-${toBnDigits(startYear)}` : "";
};

export const formatBnMoney = (value) => toBnDigits(formatMoney(value));

export const getLetterRecipientMeta = (teacher = {}, evaluateeRole = "teacher") => {
  const campusName = teacher.campus?.name || "";
  const location = teacher.campus?.location || "";
  const haystack = `${campusName} ${location}`.toLowerCase();

  let shift = "দিবা শাখা";
  if (/morn|morning|প্রভাত/.test(haystack)) shift = "প্রভাতী শাখা";
  else if (/day|দিবা/.test(haystack)) shift = "দিবা শাখা";

  let area = location.trim();
  if (/banasree|ban-/.test(haystack)) area = "বনশ্রী";
  else if (/malib|mali-/.test(haystack)) area = "মালিবাগ";
  else if (/mohammadpur|mdpur|md-pur/.test(haystack)) area = "মোহাম্মদপুর";

  if (area && !/ঢাকা/.test(area)) area = `${area}, ঢাকা`;
  if (!area) area = "ঢাকা";

  let designation = teacher.designation?.trim() || "সহকারী শিক্ষক";
  if (evaluateeRole === "incharge" && !/ইনচার্জ/.test(designation)) {
    designation = "ইনচার্জ";
  }
  if (
    evaluateeRole === "coordinator" &&
    !/কো.?অর্ডিনেটর|coordinator/i.test(designation)
  ) {
    designation = "ব্রাঞ্চ কো-অর্ডিনেটর";
  }

  const rawName = String(teacher.banglaName || teacher.name || "").trim();
  const isFemale =
    /মুহতারমা/.test(rawName) || /শিক্ষিকা|সহকারিণী/.test(designation);
  const honorific = isFemale ? "মুহতারমা" : "মুহতারাম";
  const honorificName = /^(মুহতারাম|মুহতারমা)\s+/u.test(rawName)
    ? rawName
    : `${honorific} ${rawName}`.trim();

  const areaShort = area.replace(/,?\s*ঢাকা\s*$/u, "").trim() || "ঢাকা";
  let roleLine = `${designation}, ${shift}`;
  let cityLine = `${area}।`;
  if (evaluateeRole === "incharge") {
    roleLine = `${designation}, ${areaShort} ${shift}`;
    cityLine = "ঢাকা।";
  } else if (evaluateeRole === "coordinator") {
    roleLine = `${designation}, ${areaShort} ক্যাম্পাস`;
    cityLine = "ঢাকা।";
  }

  return {
    shift,
    area,
    areaShort,
    designation,
    honorificName,
    campusName,
    roleLine,
    cityLine,
  };
};

export const INCHARGE_LETTER_CRITERIA = [
  {
    code: "leadership",
    titleBn: "নেতৃত্ব",
    descriptionBn:
      "প্রাতিষ্ঠানিক সিদ্ধান্ত ও কার্যক্রম বাস্তবায়নে প্রয়োজনে অতিরিক্ত সময় প্রদানের মাধ্যমে সক্রিয় নেতৃত্ব দান।",
  },
  {
    code: "supervision",
    titleBn: "সুপারভিশন",
    descriptionBn:
      "শিক্ষকদের শ্রেণী পাঠ ও অন্যান্য কাজের নিয়মিত তদারকি ও ফাইল আপডেট।",
  },
  {
    code: "admin_mgmt",
    titleBn: "প্রশাসন ও ব্যবস্থাপনা",
    descriptionBn:
      "অফিস ও প্রশাসনিক কাজে অংশগ্রহণ, শিক্ষার্থী-শিক্ষক এবং অভিভাবক ম্যানেজমেন্টে সক্রিয়তা।",
  },
  {
    code: "mission",
    titleBn: "মিশন বাস্তবায়ন",
    descriptionBn:
      "আল্লাহর সাথে সম্পর্ক বৃদ্ধির মিশন বাস্তবায়নে ব্যক্তিগত ও দলীয় সক্রিয়তা।",
  },
  {
    code: "teaching",
    titleBn: "শিক্ষাদান মান",
    descriptionBn:
      "সাপ্তাহিক শ্রেণি পাঠে অংশগ্রহণ ও আদর্শ লেসন প্ল্যান অনুসরণ।",
  },
];

export const COORDINATOR_LETTER_CRITERIA = [
  {
    code: "leadership_supervision",
    titleBn: "নেতৃত্ব ও সুপারভিশন",
    descriptionBn:
      "সকল শিফটের ইনচার্জদের কাজের তদারকি, সমন্বয় ও নেতৃত্ব প্রদান।",
  },
  {
    code: "implementation",
    titleBn: "বাস্তবায়ন",
    descriptionBn:
      "প্রতিষ্ঠানের সকল নীতি, সিদ্ধান্ত ও কার্যক্রম বাস্তবায়নে সক্রিয় নেতৃত্ব দান।",
  },
  {
    code: "admin_mgmt",
    titleBn: "প্রশাসনিক ও ব্যবস্থাপনা",
    descriptionBn:
      "অফিস ও প্রশাসনিক কাজে অংশগ্রহণ, শিক্ষার্থী-শিক্ষক এবং অভিভাবক ম্যানেজমেন্ট ও প্রয়োজনীয় ডকুমেন্টেশন।",
  },
  {
    code: "mission",
    titleBn: "মিশন বাস্তবায়ন",
    descriptionBn:
      "আল্লাহর সাথে সম্পর্ক বৃদ্ধির মিশন বাস্তবায়নে ব্যক্তিগত ও দলগত সক্রিয়তা।",
  },
];

export const TEACHER_LETTER_CRITERIA = [
  {
    code: "annual_performance",
    titleBn: "সাংবৎসরিক পারফরমেন্স মূল্যায়ন",
    descriptionBn:
      "বিষয় শিক্ষক ও নির্ধারিত অন্যান্য দায়িত্ব পালনসহ অ্যাডজাস্টমেন্ট ক্লাস ও সকল নির্দেশনা পালন এবং বিভিন্ন প্রোগ্রাম ও ক্লাবের কাজে স্বতঃস্ফূর্ত অংশগ্রহণ।",
  },
  {
    code: "lesson_plan",
    titleBn: "লেসন প্ল্যানের প্রয়োগ",
    descriptionBn:
      "নিয়মিতভাবে আদর্শ ও পূর্ণাঙ্গ লেসন প্ল্যান প্রণয়ন করে তার ভিত্তিতে অংশগ্রহণমূলক ক্লাস পারফরমেন্স নিশ্চিত করা।",
  },
  {
    code: "class_teacher",
    titleBn: "শ্রেণি শিক্ষকের দায়িত্ব",
    descriptionBn:
      "নিয়মিত শিক্ষার্থী ফাইল আপডেট; বিশেষ সমস্যাগ্রস্ত ও দুর্বল শিক্ষার্থী এবং খেলা-সংস্কৃতি-দ্বীন চর্চায় সম্ভাবনাময় শিক্ষার্থীদের চিহ্নিত করে বিশেষ প্রোগ্রামের মাধ্যমে নিবিড় তত্ত্বাবধান ও প্রয়োজনীয় ডকুমেন্টেশন।",
  },
  {
    code: "examiner",
    titleBn: "পরীক্ষক নিরীক্ষকের দায়িত্ব",
    descriptionBn:
      "যথাসময়ে যথাযথভাবে নিরপেক্ষভাবে পরীক্ষার খাতা মূল্যায়ন এবং পূর্ণাঙ্গ নিরীক্ষণ কাজ সম্পন্ন করে সততার সাথে রিপোর্ট প্রদান।",
  },
];

export const LETTER_CRITERIA_BY_ROLE = {
  teacher: TEACHER_LETTER_CRITERIA,
  incharge: INCHARGE_LETTER_CRITERIA,
  coordinator: COORDINATOR_LETTER_CRITERIA,
};

const normalizeSearchText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\u0980-\u09FF]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const matchesEmployeeSearch = (item, query) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystack = normalizeSearchText(
    [
      item.name,
      item.banglaName,
      item.teacherId,
      item.designation,
      item.campus?.name,
      EVALUATEE_LABELS[item.evaluateeRole],
    ]
      .filter(Boolean)
      .join(" ")
  );
  const compactHaystack = haystack.replace(/\s+/g, "");
  const compactQuery = normalizedQuery.replace(/\s+/g, "");

  if (haystack.includes(normalizedQuery) || compactHaystack.includes(compactQuery)) {
    return true;
  }

  return normalizedQuery
    .split(" ")
    .filter(Boolean)
    .every((token) => haystack.includes(token) || compactHaystack.includes(token));
};
