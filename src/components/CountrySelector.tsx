import React from "react";
import { useDashboardStore } from "../store";
import type { CountryCode } from "../store";

const COUNTRY_LABELS: Record<CountryCode, string> = {
  MY: "Malaysia",
  ID: "Indonesia",
  SG: "Singapore",
  TH: "Thailand",
  MM: "Myanmar",
  VN: "Vietnam",
  BN: "Brunei",
  LA: "Lao PDR",
  KH: "Cambodia",
  PH: "Philippines",
};

const CountrySelector: React.FC = () => {
  const selectedCountries = useDashboardStore((s) => s.selectedCountries);
  const setSelectedCountries = useDashboardStore((s) => s.setSelectedCountries);

  const handleToggle = (code: CountryCode) => {
    if (selectedCountries.includes(code)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== code));
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  return (
    <div className="country-selector">
      <label>Select ASEAN Countries:</label>
      <div style={{ background: "#222", color: "#aaa", padding: "1em", borderRadius: "8px" }}>
        {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
          <label key={code} style={{ display: "block", marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={selectedCountries.includes(code as CountryCode)}
              onChange={() => handleToggle(code as CountryCode)}
              style={{ marginRight: 8 }}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CountrySelector;
