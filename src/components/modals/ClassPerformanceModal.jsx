import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaShieldAlt,
} from "react-icons/fa";
import {
  addClassPerformanceObservation,
} from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import SelectDropdown from "../ui/SelectDropdown";

const ratingOptions = [1, 2, 3, 4, 5].map((value) => ({
  _id: String(value),
  name: `${value}`,
}));

const emptyForm = {
  className: "",
  subject: "",
  classDate: new Date().toISOString().slice(0, 10),
  topic: "",
  durationMinutes: "",
  presentation: "4",
  discipline: "4",
  subjectDepth: "4",
  comments: "",
};

const currentYear = new Date().getFullYear();

const toId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || "");
  return String(value);
};

const parseRoutineDisplay = (display = "") => {
  const match = display.match(/^(.*?)\s*\[(.*?)\]\s*-\s*\d{4}$/);
  return {
    subject: match?.[1]?.trim() || "Subject",
    className: match?.[2]?.trim() || "Class",
  };
};

const normalizeRoutineEntry = (routine) => {
  const parsed = parseRoutineDisplay(routine.display);
  const classId = toId(routine.classNameId || routine.className?._id);
  const subjectId = toId(routine.subjectId || routine.subject?._id);

  return {
    routineId: toId(routine._id),
    year: Number(routine.year),
    classId,
    className:
      (typeof routine.className === "string"
        ? routine.className
        : routine.className?.name) || parsed.className,
    subjectId,
    subject:
      (typeof routine.subject === "string"
        ? routine.subject
        : routine.subject?.name) || parsed.subject,
  };
};

const getReviewScope = (user) => {
  if (user?.role === "head_teacher") {
    return {
      label: "Headmaster observation",
      detail: "School-wide access for all teachers",
    };
  }

  if (user?.role === "incharge") {
    return {
      label: "Branch incharge observation",
      detail: user?.campus?.name
        ? `Limited to ${user.campus.name}`
        : "Limited to assigned branch",
    };
  }

  return {
    label: "Admin observation",
    detail: "School-wide access for all teachers",
  };
};

const ClassPerformanceModal = ({
  isOpen,
  onClose,
  teacherId,
  teacher,
  routineSchedule = [],
  onSuccess,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const currentRoutineOptions = useMemo(
    () =>
      routineSchedule
        .filter((routine) => Number(routine.year) === currentYear)
        .map(normalizeRoutineEntry)
        .filter((routine) => routine.classId && routine.subjectId),
    [routineSchedule]
  );

  const classes = useMemo(() => {
    const uniqueClasses = new Map();
    currentRoutineOptions.forEach((routine) => {
      if (!uniqueClasses.has(routine.classId)) {
        uniqueClasses.set(routine.classId, {
          _id: routine.classId,
          name: routine.className,
        });
      }
    });
    return Array.from(uniqueClasses.values()).sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { numeric: true })
    );
  }, [currentRoutineOptions]);

  const subjects = useMemo(() => {
    const uniqueSubjects = new Map();
    currentRoutineOptions
      .filter((routine) => routine.classId === formData.className)
      .forEach((routine) => {
        if (!uniqueSubjects.has(routine.subjectId)) {
          uniqueSubjects.set(routine.subjectId, {
            _id: routine.subjectId,
            name: routine.subject,
          });
        }
      });
    return Array.from(uniqueSubjects.values()).sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { numeric: true })
    );
  }, [currentRoutineOptions, formData.className]);

  const average = useMemo(() => {
    const values = [
      Number(formData.presentation),
      Number(formData.discipline),
      Number(formData.subjectDepth),
    ];
    return (values.reduce((total, value) => total + value, 0) / values.length)
      .toFixed(2)
      .replace(/\.00$/, "");
  }, [formData]);

  const selectedClass = useMemo(
    () => classes.find((classItem) => classItem._id === formData.className),
    [classes, formData.className]
  );

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject._id === formData.subject),
    [subjects, formData.subject]
  );

  const reviewScope = useMemo(() => getReviewScope(user), [user]);

  useEffect(() => {
    if (!isOpen) return;

    setConfirming(false);
  }, [isOpen]);

  useEffect(() => {
    if (!formData.className || !formData.subject) return;

    const subjectStillAvailable = subjects.some(
      (subject) => subject._id === formData.subject
    );

    if (!subjectStillAvailable) {
      setFormData((prev) => ({ ...prev, subject: "" }));
      setConfirming(false);
    }
  }, [formData.className, formData.subject, subjects]);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "className" ? { subject: "" } : {}),
    }));
    setConfirming(false);
  };

  const handleSubmit = async () => {
    if (!formData.presentation || !formData.discipline || !formData.subjectDepth) {
      toast.error("All rating criteria are required.");
      return;
    }

    if (!currentRoutineOptions.length) {
      toast.error(`No ${currentYear} routine found for this teacher.`);
      return;
    }

    if (!formData.className || !formData.subject) {
      toast.error("Select a class and subject from the teacher's current routine.");
      return;
    }

    if (!confirming) {
      setConfirming(true);
      return;
    }

    setSaving(true);
    try {
      await addClassPerformanceObservation(teacherId, {
        className: formData.className || undefined,
        subject: formData.subject || undefined,
        classDate: formData.classDate,
        topic: formData.topic,
        durationMinutes: formData.durationMinutes || undefined,
        criteria: {
          presentation: Number(formData.presentation),
          discipline: Number(formData.discipline),
          subjectDepth: Number(formData.subjectDepth),
        },
        comments: formData.comments,
      });

      toast.success("Class performance recorded.");
      setFormData(emptyForm);
      setConfirming(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save observation.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-performance-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm"
        onClick={saving ? undefined : onClose}
        aria-label="Close class performance form"
      />

      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="h-1.5 bg-slate-900" />
        <div className="p-5 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-teal-50 text-teal-700">
                <FaChalkboardTeacher />
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-700">
                  Class observation
                </p>
                <h2
                  id="class-performance-title"
                  className="mt-1 text-xl font-bold text-slate-950"
                >
                  Record class performance
                </h2>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <p className="text-xs font-medium text-slate-500">Average</p>
              <p className="text-2xl font-bold text-slate-950">{average}</p>
            </div>
          </div>

          <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-white text-teal-700">
                <FaShieldAlt />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-teal-700">
                  {reviewScope.label}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {reviewScope.detail}
                </p>
                {teacher?.name && (
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {teacher.name} | {teacher.campus?.name || "Campus"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {!confirming ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectDropdown
                  label="Class"
                  name="className"
                  value={formData.className}
                  options={classes}
                  disabled={!classes.length}
                  placeholder={
                    classes.length
                      ? "Select routine class"
                      : `No ${currentYear} routine class found`
                  }
                  onChange={(event) =>
                    updateField("className", event.target.value)
                  }
                />
                <SelectDropdown
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  options={subjects}
                  disabled={!formData.className || !subjects.length}
                  placeholder={
                    formData.className
                      ? "Select routine subject"
                      : "Select class first"
                  }
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                />
                <InputField
                  label="Class date"
                  name="classDate"
                  type="date"
                  value={formData.classDate}
                  onChange={(event) =>
                    updateField("classDate", event.target.value)
                  }
                />
                <InputField
                  label="Duration minutes"
                  name="durationMinutes"
                  type="number"
                  min="1"
                  placeholder="40"
                  value={formData.durationMinutes}
                  onChange={(event) =>
                    updateField("durationMinutes", event.target.value)
                  }
                />
              </div>

              <div className="mt-4">
                <InputField
                  label="Topic"
                  name="topic"
                  placeholder="Class topic"
                  value={formData.topic}
                  onChange={(event) => updateField("topic", event.target.value)}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SelectDropdown
                  label="Presentation"
                  name="presentation"
                  value={formData.presentation}
                  options={ratingOptions}
                  onChange={(event) =>
                    updateField("presentation", event.target.value)
                  }
                />
                <SelectDropdown
                  label="Discipline"
                  name="discipline"
                  value={formData.discipline}
                  options={ratingOptions}
                  onChange={(event) =>
                    updateField("discipline", event.target.value)
                  }
                />
                <SelectDropdown
                  label="Subject depth"
                  name="subjectDepth"
                  value={formData.subjectDepth}
                  options={ratingOptions}
                  onChange={(event) =>
                    updateField("subjectDepth", event.target.value)
                  }
                />
              </div>

              <label className="mt-4 block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Comments
                </span>
                <textarea
                  value={formData.comments}
                  onChange={(event) => updateField("comments", event.target.value)}
                  placeholder="Observation notes"
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </>
          ) : (
            <div className="space-y-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-teal-900">
                <FaClipboardCheck />
                Confirm class rating before submission
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium text-teal-700">Class</p>
                  <p className="font-bold text-slate-900">
                    {selectedClass?.name || "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-teal-700">Subject</p>
                  <p className="font-bold text-slate-900">
                    {selectedSubject?.name || "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-teal-700">Date</p>
                  <p className="font-bold text-slate-900">
                    {formData.classDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-teal-700">Average</p>
                  <p className="font-bold text-slate-900">{average}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs font-medium text-slate-500">
                    Presentation
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {formData.presentation}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs font-medium text-slate-500">
                    Discipline
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {formData.discipline}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs font-medium text-slate-500">
                    Subject depth
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {formData.subjectDepth}
                  </p>
                </div>
              </div>
              {(formData.topic || formData.comments) && (
                <div className="rounded-lg bg-white p-3 text-sm leading-6 text-slate-700">
                  {formData.topic && (
                    <p className="font-bold text-slate-900">{formData.topic}</p>
                  )}
                  {formData.comments && <p>{formData.comments}</p>}
                </div>
              )}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {confirming ? (
              <Button
                variant="secondary"
                onClick={() => setConfirming(false)}
                disabled={saving}
              >
                <FaArrowLeft size={13} />
                Edit
              </Button>
            ) : (
              <Button variant="secondary" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSubmit} loading={saving}>
              <FaClipboardCheck size={13} />
              {confirming ? "Confirm rating" : "Review rating"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPerformanceModal;
