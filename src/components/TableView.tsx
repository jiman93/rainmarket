import * as React from "react";
import { useDashboardStore } from "../store";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const COUNTRY_CODES = [
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
const ALL_YEARS = Array.from({ length: 2021 - 2011 + 1 }, (_, i) => 2011 + i);

function processData(apiData: unknown) {
  const data = apiData as { [key: number]: unknown[] };
  const byCountry: Record<string, Record<number, number | null>> = {};
  for (const c of COUNTRY_CODES) {
    byCountry[c.name] = {};
  }
  const arr = Array.isArray((data as { [key: number]: unknown[] })[1])
    ? (data as { [key: number]: unknown[] })[1]
    : [];
  for (const row of arr as Array<{
    country: { value: string };
    date: string;
    value: number | null;
  }>) {
    const country = row.country.value;
    const year = Number(row.date);
    const value = row.value;
    if (byCountry[country] && ALL_YEARS.includes(year)) {
      byCountry[country][year] = value ?? null;
    }
  }
  return COUNTRY_CODES.map((c) => {
    const yearValues: Record<number, number | null> = {};
    for (const y of ALL_YEARS) {
      yearValues[y] = byCountry[c.name][y] ?? null;
    }
    return {
      code: c.code,
      country: c.name,
      values: yearValues,
    };
  });
}

const TableView: React.FC = () => {
  const selectedIndicator = useDashboardStore((s) => s.selectedIndicators[0]);
  const yearRange = useDashboardStore((s) => s.yearRange);
  const selectedCountries = useDashboardStore((s) => s.selectedCountries as string[]);

  const [sortBy, setSortBy] = React.useState<string>("country");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const { data, isLoading, error } = useQuery({
    queryKey: ["indicator-table", selectedIndicator, ALL_YEARS],
    enabled: !!selectedIndicator,
    queryFn: async () => {
      const countryStr = COUNTRY_CODES.map((c) => c.code).join(";");
      const yearStr = `${ALL_YEARS[0]}:${ALL_YEARS[ALL_YEARS.length - 1]}`;
      const url = `https://api.worldbank.org/v2/country/${countryStr}/indicator/${selectedIndicator}?format=json&date=${yearStr}&per_page=1000`;
      const res = await fetch(url);
      return res.json();
    },
  });

  const processedData = React.useMemo(() => (data ? processData(data) : []), [data]);
  const years = React.useMemo(() => {
    const [start, end] = yearRange;
    return ALL_YEARS.filter((y) => y >= start && y <= end);
  }, [yearRange]);

  const filteredData = React.useMemo(() => {
    return processedData.filter((row) => selectedCountries.includes(row.code));
  }, [processedData, selectedCountries]);

  // Sorting logic
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal: number | string | null = "";
      let bVal: number | string | null = "";
      if (sortBy === "country") {
        aVal = a.country;
        bVal = b.country;
      } else if (sortBy.startsWith("y")) {
        const year = Number(sortBy.slice(1));
        aVal = a.values[year];
        bVal = b.values[year];
      } else if (["avg", "min", "max", "change"].includes(sortBy)) {
        const aVals = years.map((y) => a.values[y]).filter((v): v is number => v !== null);
        const bVals = years.map((y) => b.values[y]).filter((v): v is number => v !== null);
        if (sortBy === "avg") {
          aVal = aVals.length ? aVals.reduce((x, y) => x + y, 0) / aVals.length : null;
          bVal = bVals.length ? bVals.reduce((x, y) => x + y, 0) / bVals.length : null;
        } else if (sortBy === "min") {
          aVal = aVals.length ? Math.min(...aVals) : null;
          bVal = bVals.length ? Math.min(...bVals) : null;
        } else if (sortBy === "max") {
          aVal = aVals.length ? Math.max(...aVals) : null;
          bVal = bVals.length ? Math.max(...bVals) : null;
        } else if (sortBy === "change") {
          const aFirst = a.values[years[0]];
          const aLast = a.values[years[years.length - 1]];
          const bFirst = b.values[years[0]];
          const bLast = b.values[years[years.length - 1]];
          aVal = aFirst !== null && aLast !== null ? aLast - aFirst : null;
          bVal = bFirst !== null && bLast !== null ? bLast - bFirst : null;
        }
      }
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredData, sortBy, sortDir, years]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

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

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell onClick={() => handleSort("country")} style={{ cursor: "pointer" }}>
              Country {sortBy === "country" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </TableCell>
            {years.map((year) => (
              <TableCell
                key={year}
                onClick={() => handleSort("y" + year)}
                align="right"
                style={{ cursor: "pointer" }}
              >
                {year} {sortBy === "y" + year ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </TableCell>
            ))}
            <TableCell
              onClick={() => handleSort("avg")}
              align="right"
              style={{ cursor: "pointer" }}
            >
              Average {sortBy === "avg" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </TableCell>
            <TableCell
              onClick={() => handleSort("min")}
              align="right"
              style={{ cursor: "pointer" }}
            >
              Min {sortBy === "min" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </TableCell>
            <TableCell
              onClick={() => handleSort("max")}
              align="right"
              style={{ cursor: "pointer" }}
            >
              Max {sortBy === "max" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </TableCell>
            <TableCell
              onClick={() => handleSort("change")}
              align="right"
              style={{ cursor: "pointer" }}
            >
              Change {sortBy === "change" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row) => {
            const values = years.map((year) => row.values[year]);
            const validValues = values.filter((v): v is number => v !== null);
            const average =
              validValues.length > 0
                ? validValues.reduce((a, b) => a + b, 0) / validValues.length
                : null;
            const min = validValues.length > 0 ? Math.min(...validValues) : null;
            const max = validValues.length > 0 ? Math.max(...validValues) : null;
            const firstValue = values[0];
            const lastValue = values[values.length - 1];
            const change =
              firstValue !== null && lastValue !== null
                ? ((lastValue - firstValue) / firstValue) * 100
                : null;

            return (
              <TableRow key={row.country}>
                <TableCell component="th" scope="row">
                  {row.country}
                </TableCell>
                {values.map((value, idx) => (
                  <TableCell key={idx} align="right">
                    {value?.toFixed(2) ?? "-"}
                  </TableCell>
                ))}
                <TableCell align="right">{average?.toFixed(2) ?? "-"}</TableCell>
                <TableCell align="right">{min?.toFixed(2) ?? "-"}</TableCell>
                <TableCell align="right">{max?.toFixed(2) ?? "-"}</TableCell>
                <TableCell align="right">
                  {change !== null ? `${change.toFixed(2)}%` : "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableView;
