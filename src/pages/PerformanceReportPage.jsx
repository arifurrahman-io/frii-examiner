import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaDownload,
  FaFilter,
  FaPrint,
  FaSyncAlt,
} from "react-icons/fa";
import {
  getBranches,
  getShiftPerformanceReport,
} from "../api/apiService";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import SelectDropdown from "../components/ui/SelectDropdown";
import {
  createUniformRowDidParseCell,
  getUniformBodyStyles,
  getUniformTableStyles,
  withUniformHeadStyles,
} from "../utils/pdfTableRows";
import { drawInstituteHeader, INSTITUTE_NAME } from "../utils/reportBranding";

const RatingCell = ({ value }) => (
  <span className="inline-flex min-w-12 justify-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
    {value || "-"}
  </span>
);

const formatReportDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatPrintTimestamp = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

const getReportStats = (rows = []) => {
  const totalObservations = rows.reduce(
    (total, row) => total + Number(row.totalObservations || 0),
    0
  );
  const scoredRows = rows.filter((row) => row.overallAverage);
  const averageOverall = scoredRows.length
    ? (
        scoredRows.reduce(
          (sum, row) => sum + Number(row.overallAverage || 0),
          0
        ) / scoredRows.length
      ).toFixed(2)
    : "-";

  return {
    averageOverall,
    teacherCount: rows.length,
    totalObservations,
  };
};

const sanitizeFilename = (value) =>
  String(value || "class-performance-report")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");

const openPdfDocument = (doc, filename) => {
  const blob = doc.output("blob");
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  return filename;
};

const createPerformanceReportPdf = ({
  autoTable,
  jsPDF,
  rows,
  campusName,
  generatedAt,
  periodLabel,
  preparedBy,
}) => {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "p" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 34;
  const teal = [15, 118, 110];
  const slate = [15, 23, 42];
  const muted = [100, 116, 139];
  const line = [203, 213, 225];
  const stats = getReportStats(rows);

  const drawFooter = (pageNumber) => {
    doc.setDrawColor(...line);
    doc.setLineWidth(0.4);
    doc.line(marginX, pageHeight - 34, pageWidth - marginX, pageHeight - 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text("FRII Teacher Platform", marginX, pageHeight - 21);
    doc.text(`Page ${pageNumber}`, pageWidth - marginX, pageHeight - 21, {
      align: "right",
    });
  };

  const instituteBaselineY = 18;
  const dividerY = drawInstituteHeader(doc, {
    y: instituteBaselineY,
    fontSize: 17,
    withDivider: true,
  });
  const headerBlockY = dividerY + 12;

  doc.setFillColor(...teal);
  doc.roundedRect(marginX, headerBlockY, 42, 42, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("FRII", marginX + 21, headerBlockY + 26, { align: "center" });

  doc.setTextColor(...slate);
  doc.setFontSize(18);
  doc.text("Class Performance Report", marginX + 54, headerBlockY + 18);

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text(`Campus/Shift: ${campusName}`, marginX + 54, headerBlockY + 36);

  const metaWidth = 176;
  const metaX = pageWidth - marginX - metaWidth;
  doc.setDrawColor(...line);
  doc.setLineWidth(0.6);
  doc.roundedRect(metaX, headerBlockY + 2, metaWidth, 60, 4, 4, "S");

  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text("Generated", metaX + metaWidth - 12, headerBlockY + 15, {
    align: "right",
  });
  doc.text("Prepared by", metaX + metaWidth - 12, headerBlockY + 41, {
    align: "right",
  });

  doc.setFontSize(9);
  doc.setTextColor(...slate);
  doc.text(formatPrintTimestamp(generatedAt), metaX + metaWidth - 12, headerBlockY + 27, {
    align: "right",
  });
  doc.text(preparedBy, metaX + metaWidth - 12, headerBlockY + 53, {
    align: "right",
  });

  doc.setDrawColor(...teal);
  doc.setLineWidth(1.4);
  doc.line(marginX, headerBlockY + 68, pageWidth - marginX, headerBlockY + 68);

  const cardGap = 8;
  const cardY = headerBlockY + 84;
  const cardHeight = 44;
  const cardWidth = (pageWidth - marginX * 2 - cardGap * 3) / 4;
  [
    ["Reporting period", periodLabel],
    ["Teachers", String(stats.teacherCount)],
    ["Total observations", String(stats.totalObservations)],
    ["Average overall", stats.averageOverall],
  ].forEach(([label, value], index) => {
    const x = marginX + index * (cardWidth + cardGap);
    doc.setDrawColor(...line);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 4, 4, "FD");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(label, x + 10, cardY + 14);
    doc.setFontSize(index === 0 ? 9 : 12);
    doc.setTextColor(...slate);
    doc.text(String(value), x + 10, cardY + 32, {
      maxWidth: cardWidth - 20,
    });
  });

  doc.setFontSize(12);
  doc.setTextColor(...slate);
  doc.text("Teacher Performance Averages", marginX, cardY + 68);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(
    "Scores are calculated from recorded class observations.",
    pageWidth - marginX,
    cardY + 68,
    { align: "right" }
  );

  autoTable(doc, {
    startY: cardY + 78,
    head: [
      [
        "SL",
        "Teacher",
        "ID",
        "Classes",
        "Presentation",
        "Discipline",
        "Depth",
        "Overall",
      ],
    ],
    body: rows.length
      ? rows.map((row, index) => [
          index + 1,
          row.teacherName,
          row.teacherId,
          row.totalObservations,
          row.presentationAverage || "-",
          row.disciplineAverage || "-",
          row.subjectDepthAverage || "-",
          row.overallAverage || "-",
        ])
      : [
          [
            {
              content: "No class performance data found for this selection.",
              colSpan: 8,
              styles: {
                halign: "center",
                fontStyle: "bold",
                textColor: muted,
              },
            },
          ],
        ],
    theme: "grid",
    headStyles: withUniformHeadStyles({
      fillColor: teal,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
      lineColor: teal,
    }),
    styles: getUniformTableStyles({
      cellPadding: { top: 6, right: 7, bottom: 6, left: 7 },
      fontSize: 8.5,
      lineColor: line,
      lineWidth: 0.4,
      textColor: slate,
    }),
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      1: { cellWidth: 132 },
      2: { cellWidth: 78 },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center", fontStyle: "bold", textColor: [6, 95, 70] },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    bodyStyles: getUniformBodyStyles(),
    didParseCell: createUniformRowDidParseCell(doc, {
      fontSize: 8.5,
      cellPadding: 7,
      columnWidths: {
        0: 28,
        1: 132,
        2: 78,
        3: 48,
        4: 48,
        5: 48,
        6: 48,
        7: 48,
      },
      columnMaxLines: { 1: 2 },
      afterParse: (data) => {
        if (data.section === "body" && data.column.index === 7) {
          data.cell.styles.fillColor = [236, 253, 245];
          data.cell.styles.fontStyle = "bold";
        }
      },
    }),
    margin: { left: marginX, right: marginX, bottom: 46 },
    didDrawPage: (data) => {
      drawFooter(data.pageNumber);
    },
  });

  let signatureY = (doc.lastAutoTable?.finalY || 220) + 56;
  if (signatureY > pageHeight - 88) {
    doc.addPage();
    signatureY = 110;
    drawFooter(doc.internal.getNumberOfPages());
  }

  const signatureGap = 28;
  const signatureWidth = (pageWidth - marginX * 2 - signatureGap * 2) / 3;
  ["Prepared by", "Reviewed by", "Approved by"].forEach((label, index) => {
    const x = marginX + index * (signatureWidth + signatureGap);
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.6);
    doc.line(x, signatureY, x + signatureWidth, signatureY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(label, x, signatureY + 14);
  });

  return doc;
};

const PerformanceReportPage = () => {
  const { user } = useAuth();
  const isIncharge = user?.role === "incharge";
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    campusId: user?.campus?._id || user?.campus || "",
    from: "",
    to: "",
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [printTimestamp, setPrintTimestamp] = useState(() => new Date());

  const selectedCampusName = useMemo(() => {
    if (isIncharge) return user?.campus?.name || "Assigned Campus/Shift";
    return (
      branches.find((branch) => branch._id === filters.campusId)?.name ||
      report?.campus?.name ||
      "Campus/Shift"
    );
  }, [branches, filters.campusId, isIncharge, report, user]);

  useEffect(() => {
    if (isIncharge) return;

    getBranches()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setBranches(list);
        setFilters((prev) => ({
          ...prev,
          campusId: prev.campusId || list[0]?._id || "",
        }));
      })
      .catch(() => toast.error("Failed to load Campus/Shift list."));
  }, [isIncharge]);

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const fetchReport = async () => {
    if (!filters.campusId) {
      toast.error("Select a Campus/Shift first.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await getShiftPerformanceReport(filters);
      setReport(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load report.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.campusId) fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.campusId]);

  const exportPdf = async () => {
    if (!filters.campusId) {
      toast.error("Select a Campus/Shift first.");
      return;
    }

    setExporting(true);
    try {
      const [{ data }, { jsPDF }, { default: autoTable }] = await Promise.all([
        getShiftPerformanceReport(filters),
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const generatedAt = new Date();
      const rows = data?.rows || [];
      const campusName = data?.campus?.name || selectedCampusName;
      const from = formatReportDate(data?.filters?.from || filters.from);
      const to = formatReportDate(data?.filters?.to || filters.to);
      const exportPeriodLabel =
        from && to
          ? `${from} to ${to}`
          : from
            ? `From ${from}`
            : to
              ? `Up to ${to}`
              : "All available dates";

      setReport(data);
      setPrintTimestamp(generatedAt);

      const doc = createPerformanceReportPdf({
        autoTable,
        jsPDF,
        rows,
        campusName,
        generatedAt,
        periodLabel: exportPeriodLabel,
        preparedBy: user?.name || "System User",
      });

      openPdfDocument(
        doc,
        `Class_Performance_${sanitizeFilename(campusName)}.pdf`
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "PDF export failed.");
    } finally {
      setExporting(false);
    }
  };

  const reportRows = useMemo(() => report?.rows || [], [report]);
  const totalObservations = useMemo(
    () =>
      reportRows.reduce(
        (total, row) => total + Number(row.totalObservations || 0),
        0
      ),
    [reportRows]
  );
  const overallAverage = useMemo(() => {
    const scoredRows = reportRows.filter((row) => row.overallAverage);
    if (!scoredRows.length) return "-";

    const total = scoredRows.reduce(
      (sum, row) => sum + Number(row.overallAverage || 0),
      0
    );
    return (total / scoredRows.length).toFixed(2);
  }, [reportRows]);
  const periodLabel = useMemo(() => {
    const from = formatReportDate(filters.from || report?.filters?.from);
    const to = formatReportDate(filters.to || report?.filters?.to);

    if (from && to) return `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Up to ${to}`;
    return "All available dates";
  }, [filters.from, filters.to, report]);

  const handlePrint = () => {
    setPrintTimestamp(new Date());
    window.requestAnimationFrame(() => window.print());
  };

  return (
    <div className="performance-report-page min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <main className="performance-report-screen mx-auto max-w-[1440px] space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-900 text-white">
                <FaChartBar />
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-700">
                  Campus/Shift report
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                  Class Performance
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {selectedCampusName}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={handlePrint}>
                <FaPrint size={13} />
                Print
              </Button>
              <Button onClick={exportPdf} loading={exporting}>
                <FaDownload size={13} />
                Export PDF
              </Button>
            </div>
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FaFilter className="text-slate-400" />
                Filters
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1.15fr)_minmax(180px,0.7fr)_minmax(180px,0.7fr)]">
                {isIncharge ? (
                  <div className="min-h-[72px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2 xl:col-span-1">
                    <p className="text-sm font-medium text-slate-700">
                      Campus/Shift
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-slate-900">
                      {selectedCampusName}
                    </p>
                  </div>
                ) : (
                  <SelectDropdown
                    label="Campus/Shift"
                    name="campusId"
                    value={filters.campusId}
                    options={branches}
                    className="sm:col-span-2 xl:col-span-1"
                    onChange={(event) =>
                      updateFilter("campusId", event.target.value)
                    }
                  />
                )}
                <InputField
                  label="From"
                  name="from"
                  type="date"
                  value={filters.from}
                  className="[&>div:last-child]:hidden"
                  onChange={(event) => updateFilter("from", event.target.value)}
                />
                <InputField
                  label="To"
                  name="to"
                  type="date"
                  value={filters.to}
                  className="[&>div:last-child]:hidden"
                  onChange={(event) => updateFilter("to", event.target.value)}
                />
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={fetchReport}
              loading={loading}
              className="h-11 w-full lg:w-40"
            >
              <FaSyncAlt size={13} />
              Refresh
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Teacher averages
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {report?.rows?.length || 0} teachers with observations
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Teacher",
                    "Classes",
                    "Presentation",
                    "Discipline",
                    "Depth",
                    "Overall",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-slate-200 px-5 py-3 text-left text-xs font-semibold text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-16 text-center">
                      <FaSyncAlt className="mx-auto animate-spin text-2xl text-teal-600/50" />
                    </td>
                  </tr>
                ) : report?.rows?.length ? (
                  report.rows.map((row) => (
                    <tr
                      key={row.teacherObjectId}
                      className="h-16 hover:bg-slate-50"
                    >
                      <td className="h-16 max-h-16 align-middle border-b border-slate-100 px-5 py-2">
                        <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-950">
                          {row.teacherName}
                        </p>
                        <p className="line-clamp-1 text-xs font-medium text-slate-500">
                          {row.teacherId}
                        </p>
                      </td>
                      <td className="h-16 max-h-16 align-middle border-b border-slate-100 px-5 py-2 text-sm font-semibold">
                        {row.totalObservations}
                      </td>
                      <td className="h-16 max-h-16 align-middle border-b border-slate-100 px-5 py-2">
                        <RatingCell value={row.presentationAverage} />
                      </td>
                      <td className="h-16 max-h-16 align-middle border-b border-slate-100 px-5 py-2">
                        <RatingCell value={row.disciplineAverage} />
                      </td>
                      <td className="h-16 max-h-16 align-middle border-b border-slate-100 px-5 py-2">
                        <RatingCell value={row.subjectDepthAverage} />
                      </td>
                      <td className="h-16 max-h-16 align-middle border-b border-slate-100 px-5 py-2">
                        <span className="inline-flex min-w-12 justify-center rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                          {row.overallAverage || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-16 text-center text-sm font-semibold text-slate-500"
                    >
                      No class performance data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <section className="performance-print" aria-label="Printable performance report">
        <header className="performance-print-header performance-print-header-stacked">
          <div className="performance-print-header-main">
            <p className="performance-print-institute">{INSTITUTE_NAME}</p>
            <h1>Class Performance Report</h1>
            <p className="performance-print-subtitle">
              Campus/Shift: {selectedCampusName}
            </p>
          </div>
          <div className="performance-print-meta">
            <span>Generated</span>
            <strong>{formatPrintTimestamp(printTimestamp)}</strong>
            <span>Prepared by</span>
            <strong>{user?.name || "System User"}</strong>
          </div>
        </header>

        <section className="performance-print-summary" aria-label="Report summary">
          <div>
            <span>Reporting period</span>
            <strong>{periodLabel}</strong>
          </div>
          <div>
            <span>Teachers</span>
            <strong>{reportRows.length}</strong>
          </div>
          <div>
            <span>Total observations</span>
            <strong>{totalObservations}</strong>
          </div>
          <div>
            <span>Average overall</span>
            <strong>{overallAverage}</strong>
          </div>
        </section>

        <div className="performance-print-table-wrap">
          <div className="performance-print-section-title">
            <h2>Teacher Performance Averages</h2>
            <p>Scores are calculated from recorded class observations.</p>
          </div>

          <table className="performance-print-table">
            <thead>
              <tr>
                <th>SL</th>
                <th>Teacher</th>
                <th>ID</th>
                <th>Classes</th>
                <th>Presentation</th>
                <th>Discipline</th>
                <th>Depth</th>
                <th>Overall</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.length ? (
                reportRows.map((row, index) => (
                  <tr key={row.teacherObjectId}>
                    <td>{index + 1}</td>
                    <td>{row.teacherName}</td>
                    <td>{row.teacherId}</td>
                    <td>{row.totalObservations}</td>
                    <td>{row.presentationAverage || "-"}</td>
                    <td>{row.disciplineAverage || "-"}</td>
                    <td>{row.subjectDepthAverage || "-"}</td>
                    <td className="performance-print-overall">
                      {row.overallAverage || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="performance-print-empty">
                    No class performance data found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="performance-print-footer">
          <div>
            <span>Prepared by</span>
          </div>
          <div>
            <span>Reviewed by</span>
          </div>
          <div>
            <span>Approved by</span>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default PerformanceReportPage;
