export const COUNTRY_CODES = [
  { code: "MY", name: "Malaysia" },
  { code: "ID", name: "Indonesia" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "MM", name: "Myanmar" },
  { code: "VN", name: "Vietnam" },
  { code: "BN", name: "Brunei" },
  { code: "LA", name: "Lao PDR" },
  { code: "KH", name: "Cambodia" },
  { code: "PH", name: "Philippines" },
];

export const COUNTRY_LABELS: Record<string, string> = Object.fromEntries(
  COUNTRY_CODES.map((c) => [c.code, c.name])
);

// Improved color palette for better distinction
export const COUNTRY_COLORS: Record<string, string> = {
  MY: "#3366CC", // Blue
  ID: "#DC3912", // Red
  SG: "#FF9900", // Orange
  TH: "#109618", // Green
  MM: "#990099", // Purple
  VN: "#0099C6", // Teal
  BN: "#DD4477", // Pink
  LA: "#66AA00", // Lime
  KH: "#B82E2E", // Dark Red
  PH: "#316395", // Navy
};
