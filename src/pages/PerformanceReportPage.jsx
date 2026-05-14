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
  exportShiftPerformanceReportPDF,
  getBranches,
  getShiftPerformanceReport,
} from "../api/apiService";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import SelectDropdown from "../components/ui/SelectDropdown";

const RatingCell = ({ value }) => (
  <span className="inline-flex min-w-12 justify-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
    {value || "-"}
  </span>
);

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
      await exportShiftPerformanceReportPDF(filters);
    } catch (error) {
      toast.error(error.response?.data?.message || "PDF export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1440px] space-y-6">
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
              <Button variant="secondary" onClick={() => window.print()}>
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

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FaFilter className="text-slate-400" />
            Filters
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {isIncharge ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">
                  Campus/Shift
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {selectedCampusName}
                </p>
              </div>
            ) : (
              <SelectDropdown
                label="Campus/Shift"
                name="campusId"
                value={filters.campusId}
                options={branches}
                onChange={(event) => updateFilter("campusId", event.target.value)}
              />
            )}
            <InputField
              label="From"
              name="from"
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
            />
            <InputField
              label="To"
              name="to"
              type="date"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
            />
            <div className="flex items-end">
              <Button fullWidth variant="secondary" onClick={fetchReport} loading={loading}>
                <FaSyncAlt size={13} />
                Refresh
              </Button>
            </div>
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
                    <tr key={row.teacherObjectId} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-5 py-4">
                        <p className="text-sm font-bold text-slate-950">
                          {row.teacherName}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {row.teacherId}
                        </p>
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-sm font-semibold">
                        {row.totalObservations}
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4">
                        <RatingCell value={row.presentationAverage} />
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4">
                        <RatingCell value={row.disciplineAverage} />
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4">
                        <RatingCell value={row.subjectDepthAverage} />
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4">
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
    </div>
  );
};

export default PerformanceReportPage;
