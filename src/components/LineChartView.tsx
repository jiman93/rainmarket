import * as React from "react";
import type { TooltipProps } from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { useDashboardStore } from "../store";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { COUNTRY_CODES, COUNTRY_LABELS, COUNTRY_COLORS } from "./chartUtils";

const ALL_YEARS = Array.from({ length: 2021 - 2011 + 1 }, (_, i) => 2011 + i);

function processLineData(apiData: unknown, selectedCountries: string[], years: number[]) {
  const data = apiData as { [key: number]: unknown[] };
  const byCountry: Record<string, Record<number, number | null>> = {};
  for (const c of COUNTRY_CODES) {
    byCountry[c.code] = {};
  }
  const arr = Array.isArray((data as { [key: number]: unknown[] })[1])
    ? (data as { [key: number]: unknown[] })[1]
    : [];
  for (const row of arr as Array<{ country: { id: string }; date: string; value: number | null }>) {
    const country = row.country.id;
    const year = Number(row.date);
    const value = row.value;
    if (byCountry[country] && years.includes(year)) {
      byCountry[country][year] = value ?? null;
    }
  }
  // Build chart data: [{ year: 2011, MY: 1.2, ID: 2.3, ... }, ...]
  return years.map((year) => {
    const entry: Record<string, any> = { year };
    for (const c of selectedCountries) {
      entry[c] = byCountry[c][year] ?? null;
    }
    return entry;
  });
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28FD0",
  "#FF6699",
];

// Custom Tooltip for LineChart
const COUNTRY_CODE_TO_NAME = COUNTRY_LABELS;

const CustomTooltip: React.FC<TooltipProps<number, string>> = (
  props: TooltipProps<number, string>
) => {
  const { active, payload, label } = props;
  const typedPayload = payload as Payload<number, string>[] | undefined;
  if (active && typedPayload && typedPayload.length) {
    return (
      <Box
        sx={{ bgcolor: "background.paper", p: 1.5, borderRadius: 1, boxShadow: 2, minWidth: 120 }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Year: {label}</div>
        {typedPayload.map((entry) => {
          const key = typeof entry.dataKey === "string" ? entry.dataKey : String(entry.dataKey);
          const value =
            typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value ?? "-";
          return (
            <div key={key} style={{ color: entry.color, marginBottom: 2 }}>
              {COUNTRY_CODE_TO_NAME[key] || key}: <b>{value}</b>
            </div>
          );
        })}
      </Box>
    );
  }
  return null;
};

const LineChartView: React.FC = () => {
  const selectedCountries = useDashboardStore((s) => s.selectedCountries);
  const selectedIndicator = useDashboardStore((s) => s.selectedIndicators[0]);
  const yearRange = useDashboardStore((s) => s.yearRange);
  const years = React.useMemo(() => {
    const [start, end] = yearRange;
    return ALL_YEARS.filter((y) => y >= start && y <= end);
  }, [yearRange]);

  // Ref callback for chart export (to be used by FooterBar)
  const chartRefCallback = React.useCallback((node: HTMLDivElement | null) => {
    (window as Window & { chartRef?: HTMLDivElement }).chartRef = node || undefined;
  }, []);

  function buildWorldBankUrl() {
    const countryStr = selectedCountries.join(";");
    const yearStr = `${ALL_YEARS[0]}:${ALL_YEARS[ALL_YEARS.length - 1]}`;
    return `https://api.worldbank.org/v2/country/${countryStr}/indicator/${selectedIndicator}?format=json&date=${yearStr}&per_page=1000`;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["line-chart", selectedIndicator, selectedCountries, ALL_YEARS],
    queryFn: async () => {
      const url = buildWorldBankUrl();
      const res = await fetch(url);
      return res.json();
    },
    enabled: selectedCountries.length > 0,
  });

  const chartData = React.useMemo(
    () => (data ? processLineData(data, selectedCountries, years) : []),
    [data, selectedCountries, years]
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box color="error.main" textAlign="center" minHeight={300}>
        Error loading data.
      </Box>
    );
  }
  if (!selectedCountries.length) {
    return (
      <Box textAlign="center" color="text.secondary" minHeight={300}>
        Select at least one country to view the chart.
      </Box>
    );
  }

  return (
    <Box ref={chartRefCallback} sx={{ background: "transparent" }}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          <Legend />
          {selectedCountries.map((code, idx) => (
            <Line
              key={code}
              type="monotone"
              dataKey={code}
              name={COUNTRY_LABELS[code] || code}
              stroke={COUNTRY_COLORS[code] || "#8884d8"}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChartView;
