const formatPrintTimestamp = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

const formatLeaveDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const getGrantedLeaveStats = (rows = []) => {
  const teacherIds = new Set();
  const campuses = new Set();
  const years = new Set();

  rows.forEach((row) => {
    if (row.teacher?._id) teacherIds.add(String(row.teacher._id));
    if (row.teacher?.campus?.name) campuses.add(row.teacher.campus.name);
    if (row.year) years.add(Number(row.year));
  });

  const yearValues = [...years];
  const yearSpan =
    yearValues.length > 0
      ? yearValues.length === 1
        ? String(yearValues[0])
        : `${Math.min(...yearValues)}–${Math.max(...yearValues)}`
      : "-";

  return {
    recordCount: rows.length,
    teacherCount: teacherIds.size,
    campusCount: campuses.size,
    yearSpan,
  };
};

export const sanitizeFilename = (value) =>
  String(value || "granted-leaves-report")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");

export const mapLeaveRowsForExport = (rows = []) =>
  rows.map((leave, index) => ({
    sl: index + 1,
    teacherName: leave.teacher?.name || "Unknown",
    teacherId: leave.teacher?.teacherId || "-",
    campus: leave.teacher?.campus?.name || "Global",
    leaveType: leave.responsibilityType?.name || "Standard",
    year: leave.year || "-",
    reason: leave.reason || "Not specified",
    grantedOn: formatLeaveDate(leave.createdAt),
  }));

const waitForFonts = async () => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
};

export const exportGrantedLeavesPrintToPdf = async (element, filename) => {
  if (!element) {
    throw new Error("Print surface not found.");
  }

  await waitForFonts();

  const html2pdf = (await import("html2pdf.js")).default;
  const wrapper = document.createElement("div");
  wrapper.className = "granted-leaves-print-export";

  const clone = element.cloneNode(true);
  clone.classList.add("granted-leaves-print-export");
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const pdfBlob = await html2pdf()
      .set({
        margin: [14, 12, 14, 12],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 794,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(clone)
      .outputPdf("blob");

    const url = window.URL.createObjectURL(pdfBlob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  } finally {
    document.body.removeChild(wrapper);
  }
};

export { formatPrintTimestamp, formatLeaveDate };
