import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useDashboardStore } from "../store";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import CircularProgress from "@mui/material/CircularProgress";
import { COUNTRY_CODES, COUNTRY_LABELS, COUNTRY_COLORS } from "./chartUtils";

const INDICATORS = {
  exportGoods: "NE.EXP.GNFS.ZS", // Y-Axis
  gdpPerCapita: "NY.GDP.PCAP.CD", // X-Axis
  population: "SP.POP.TOTL", // Size
};

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
  const setSelectedYear = useDashboardStore((s) => s.setSelectedYear);

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

  if (exportQuery.error || gdpQuery.error || popQuery.error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
        color="error.main"
      >
        Error loading data.
      </Box>
    );
  }

  // Map World Bank API data to chart data
  function extractValue(data: any, code: string): number | null {
    if (!Array.isArray(data?.[1])) return null;
    const found = data[1].find((row: any) => row.country.id === code);
    return found && found.value != null ? found.value : null;
  }

  const chartDataByCountry = COUNTRY_CODES.map(({ code }) => {
    const x = extractValue(gdpQuery.data, code);
    const y = extractValue(exportQuery.data, code);
    const z = extractValue(popQuery.data, code);
    return x != null && y != null && z != null
      ? { code, country: COUNTRY_LABELS[code], x, y, z }
      : null;
  }).filter(Boolean) as { code: string; country: string; x: number; y: number; z: number }[];

  const isLoading = exportQuery.isLoading || gdpQuery.isLoading || popQuery.isLoading;

  return (
    <Box sx={{ width: "100%", background: "transparent", p: 2, position: "relative" }}>
      <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
        Exports vs GDP per Capita (ASEAN) — {selectedYear}
      </Typography>
      <Box sx={{ position: "relative", width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              name="GDP per capita (USD$)"
              type="number"
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
              tickFormatter={(v) => v.toLocaleString()}
            />
            <YAxis
              dataKey="y"
              name="Export of goods and services (% of GDP)"
              type="number"
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
            />
            <ZAxis dataKey="z" name="Population" range={[80, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <Box
                      sx={{ bgcolor: "background.paper", p: 1.5, borderRadius: 1, boxShadow: 2 }}
                    >
                      <b>{d.country}</b>
                      <br />
                      GDP per capita: ${d.x.toLocaleString()}
                      <br />
                      Export (% GDP): {d.y.toFixed(2)}
                      <br />
                      Population: {d.z.toLocaleString()}
                    </Box>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {COUNTRY_CODES.map(({ code }) => {
              const data = chartDataByCountry.filter((d) => d.code === code);
              if (!data.length) return null;
              return (
                <Scatter
                  key={code}
                  name={COUNTRY_LABELS[code]}
                  data={data}
                  fill={COUNTRY_COLORS[code]}
                  shape="circle"
                />
              );
            })}
          </ScatterChart>
        </ResponsiveContainer>
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(30,30,30,0.5)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress color="inherit" />
          </Box>
        )}
      </Box>
      <Box mt={3} display="flex" flexDirection="column" alignItems="center">
        <Slider
          min={2011}
          max={2021}
          step={1}
          value={selectedYear}
          onChange={(_, v) => setSelectedYear(v as number)}
          marks={[2011, 2013, 2015, 2017, 2019, 2021].map((y) => ({ value: y, label: y }))}
          valueLabelDisplay="auto"
          sx={{ width: 320 }}
        />
      </Box>
    </Box>
  );
};

export default ScatterPlotView;
