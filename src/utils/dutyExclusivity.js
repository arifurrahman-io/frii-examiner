/**
 * Per-year exclusivity for examination examiner duties.
 * Mirrors server/utils/dutyExclusivity.js
 */
export const DEFAULT_DUTY_EXCLUSIVITY = {
  hyPreTest: true,
  eTest: true,
  eAnnual: true,
};

export const EXCLUSIVE_DUTY_GROUPS = [
  {
    id: "hyPreTest",
    label: "E-HY or E-Pre-Test",
    types: ["E-HY", "E-Pre-Test"],
    description:
      "If a teacher already has E-HY or E-Pre-Test in a year, neither can be assigned again for any class or subject.",
  },
  {
    id: "eTest",
    label: "E-Test",
    types: ["E-Test"],
    description:
      "If a teacher already has E-Test in a year, E-Test cannot be assigned again for any class or subject.",
  },
  {
    id: "eAnnual",
    label: "E-Annual",
    types: ["E-Annual"],
    description:
      "If a teacher already has E-Annual in a year, E-Annual cannot be assigned again for any class or subject.",
  },
];

export const normalizeDutyExclusivity = (rules = {}) => ({
  hyPreTest:
    typeof rules.hyPreTest === "boolean"
      ? rules.hyPreTest
      : DEFAULT_DUTY_EXCLUSIVITY.hyPreTest,
  eTest:
    typeof rules.eTest === "boolean"
      ? rules.eTest
      : DEFAULT_DUTY_EXCLUSIVITY.eTest,
  eAnnual:
    typeof rules.eAnnual === "boolean"
      ? rules.eAnnual
      : DEFAULT_DUTY_EXCLUSIVITY.eAnnual,
});

export const getExclusiveGroup = (
  typeName,
  rules = DEFAULT_DUTY_EXCLUSIVITY
) => {
  const enabled = normalizeDutyExclusivity(rules);
  const group = EXCLUSIVE_DUTY_GROUPS.find((item) =>
    item.types.includes(typeName)
  );
  if (!group || !enabled[group.id]) return null;
  return group;
};

export const isActiveAssignmentStatus = (status) =>
  Boolean(status && status !== "Cancelled");

export const getConflictingExclusiveAssignment = (
  assignments,
  selectedTypeName,
  rules = DEFAULT_DUTY_EXCLUSIVITY
) => {
  const group = getExclusiveGroup(selectedTypeName, rules);
  if (!group || !Array.isArray(assignments)) return null;

  return (
    assignments.find((assignment) => {
      if (!isActiveAssignmentStatus(assignment.status)) return false;
      const existingName =
        typeof assignment.responsibilityType === "object"
          ? assignment.responsibilityType?.name
          : assignment.responsibilityType || assignment.name;
      return group.types.includes(existingName);
    }) || null
  );
};
