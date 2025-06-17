import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useDashboardStore } from "../store";

const INDICATORS = {
  exportGoods: "NE.EXP.GNFS.ZS", // Y-Axis
  gdpPerCapita: "NY.GDP.PCAP.CD", // X-Axis
  population: "SP.POP.TOTL", // Size
};

const COUNTRY_CODES = ["MY", "ID", "SG", "TH", "MM", "VN", "BN", "LA", "KH", "PH"];

function buildWorldBankUrl(indicator: string, countries: string[], year: number) {
  return `https://api.worldbank.org/v2/country/${countries.join(
    ";"
  )}/indicator/${indicator}?format=json&date=${year}`;
}

async function fetchIndicator(indicator: string, countries: string[], year: number) {
  const url = buildWorldBankUrl(indicator, countries, year);
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

const ScatterPlotView: React.FC = () => {
  const selectedCountries = useDashboardStore((s) => s.selectedCountries);
  const selectedYear = useDashboardStore((s) => s.selectedYear);

  // Fetch all three indicators in parallel
  const exportQuery = useQuery({
    queryKey: ["indicator", INDICATORS.exportGoods, selectedCountries, selectedYear],
    queryFn: () => fetchIndicator(INDICATORS.exportGoods, selectedCountries, selectedYear),
  });
  const gdpQuery = useQuery({
    queryKey: ["indicator", INDICATORS.gdpPerCapita, selectedCountries, selectedYear],
    queryFn: () => fetchIndicator(INDICATORS.gdpPerCapita, selectedCountries, selectedYear),
  });
  const popQuery = useQuery({
    queryKey: ["indicator", INDICATORS.population, selectedCountries, selectedYear],
    queryFn: () => fetchIndicator(INDICATORS.population, selectedCountries, selectedYear),
  });

  if (exportQuery.isLoading || gdpQuery.isLoading || popQuery.isLoading) {
    return (
      <div className="scatter-plot-view" style={{ color: "#aaa", textAlign: "center" }}>
        Loading data...
      </div>
    );
  }
  if (exportQuery.error || gdpQuery.error || popQuery.error) {
    return (
      <div className="scatter-plot-view" style={{ color: "red", textAlign: "center" }}>
        Error loading data.
      </div>
    );
  }

  // Debug output
  return (
    <div
      className="scatter-plot-view"
      style={{
        margin: "2em 0",
        background: "#181818",
        borderRadius: "12px",
        minHeight: "350px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
      }}
    >
      <div>Fetched data for year {selectedYear}:</div>
      <pre
        style={{
          textAlign: "left",
          maxWidth: "100%",
          overflowX: "auto",
          fontSize: "0.8em",
          background: "#222",
          color: "#eee",
          padding: "1em",
          borderRadius: "8px",
        }}
      >
        {JSON.stringify(
          {
            exportGoods: exportQuery.data,
            gdpPerCapita: gdpQuery.data,
            population: popQuery.data,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
};

export default ScatterPlotView;
