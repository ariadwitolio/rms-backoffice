export const SELLING_TIME_DAY_OPTIONS = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export const ALL_SELLING_TIME_DAY_LABELS = SELLING_TIME_DAY_OPTIONS.map(
  (day) => day.label
);

export const BUSINESS_UNIT_ASSIGNMENT_GROUPS = [
  {
    id: "entity-central-jakarta",
    label: "Labamu Central Jakarta",
    units: [{ id: "unit-central-jakarta", name: "Labamu Central Jakarta" }],
  },
  {
    id: "entity-bandung",
    label: "Labamu Bandung",
    units: [{ id: "unit-bandung", name: "Labamu Bandung" }],
  },
  {
    id: "entity-surabaya",
    label: "Labamu Surabaya",
    units: [{ id: "unit-surabaya", name: "Labamu Surabaya" }],
  },
  {
    id: "entity-bali",
    label: "Labamu Bali",
    units: [{ id: "unit-bali", name: "Labamu Bali" }],
  },
];

export const UNIT_PRECISION_OPTIONS = [
  "1",
  ".0",
  ".00",
  ".000",
  ".0000",
  ".00000",
];
