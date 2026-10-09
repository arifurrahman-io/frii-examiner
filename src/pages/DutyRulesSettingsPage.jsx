import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSave, FaShieldAlt, FaSyncAlt, FaToggleOn } from "react-icons/fa";
import Button from "../components/ui/Button";
import { getAppSettings, updateAppSettings } from "../api/apiService";
import {
  DEFAULT_DUTY_EXCLUSIVITY,
  EXCLUSIVE_DUTY_GROUPS,
  normalizeDutyExclusivity,
} from "../utils/dutyExclusivity";

const DutyRulesSettingsPage = () => {
  const [rules, setRules] = useState(DEFAULT_DUTY_EXCLUSIVITY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAppSettings();
      setRules(normalizeDutyExclusivity(data.dutyExclusivity));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load duty rule settings."
      );
      setRules(DEFAULT_DUTY_EXCLUSIVITY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleRule = (id) => {
    setRules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateAppSettings({ dutyExclusivity: rules });
      setRules(normalizeDutyExclusivity(data.dutyExclusivity));
      toast.success(data.message || "Duty exclusivity settings saved.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save duty rule settings."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-5 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <FaShieldAlt size={12} />
            Assignment validation
          </div>
          <h1 className="text-3xl font-semibold text-slate-950">Duty rules</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            Turn per-year exclusivity checks on or off. When a rule is on, a
            teacher cannot receive another duty from that group in the same
            year, even for a different class or subject.
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FaToggleOn className="text-teal-700" />
              Exclusivity rules
            </div>
            <button
              type="button"
              onClick={loadSettings}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center border border-dashed border-slate-200 bg-slate-50 py-16 text-sm font-semibold text-slate-500">
              <FaSyncAlt className="mr-2 animate-spin" />
              Loading settings
            </div>
          ) : (
            <div className="space-y-3">
              {EXCLUSIVE_DUTY_GROUPS.map((group) => {
                const enabled = Boolean(rules[group.id]);
                return (
                  <div
                    key={group.id}
                    className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {group.label}
                      </p>
                      <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                        {group.description}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Types: {group.types.join(" · ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() => toggleRule(group.id)}
                      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
                        enabled ? "bg-teal-700" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                          enabled ? "left-7" : "left-1"
                        }`}
                      />
                      <span className="sr-only">
                        {enabled ? "Disable" : "Enable"} {group.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <FaSave />
              Save rules
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DutyRulesSettingsPage;
