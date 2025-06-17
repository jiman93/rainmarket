import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useQuery } from "@tanstack/react-query";
import { useDashboardStore } from "../store";

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
  // apiData[1] is the array of results
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
  // Build table rows
  return COUNTRY_CODES.map((c) => {
    const yearValues: Record<number, number | null> = {};
    for (const y of ALL_YEARS) {
      yearValues[y] = byCountry[c.name][y] ?? null;
    }
    return {
      country: c.name,
      values: yearValues,
    };
  });
}

function calcSummary(values: Record<number, number | null>, years: number[]) {
  const vals = years.map((y) => values[y]).filter((v): v is number => v != null);
  if (vals.length === 0) return { avg: null, min: null, max: null, change: null };
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const change =
    values[years[0]] != null && values[years[years.length - 1]] != null
      ? values[years[years.length - 1]]! - values[years[0]]!
      : null;
  return { avg, min, max, change };
}

const TableView: React.FC = () => {
  const yearRange = useDashboardStore((s) => s.yearRange);
  const searchTerm = useDashboardStore((s) => s.searchTerm).toLowerCase();
  const selectedIndicator = useDashboardStore((s) => s.selectedIndicators[0]);
  const years = React.useMemo(() => {
    const [start, end] = yearRange;
    return ALL_YEARS.filter((y) => y >= start && y <= end);
  }, [yearRange]);

  const [sortBy, setSortBy] = React.useState<string>("country");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  function buildWorldBankUrl() {
    const countryStr = COUNTRY_CODES.map((c) => c.code).join(";");
    const yearStr = `${ALL_YEARS[0]}:${ALL_YEARS[ALL_YEARS.length - 1]}`;
    return `https://api.worldbank.org/v2/country/${countryStr}/indicator/${selectedIndicator}?format=json&date=${yearStr}&per_page=1000`;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["indicator-table", selectedIndicator, ALL_YEARS],
    queryFn: async () => {
      const url = buildWorldBankUrl();
      const res = await fetch(url);
      return res.json();
    },
  });

  const rows = React.useMemo(() => {
    let r = data ? processData(data) : [];
    // Filter by search
    if (searchTerm) {
      r = r.filter((row) => row.country.toLowerCase().includes(searchTerm));
    }
    // Sorting
    r = [...r].sort((a, b) => {
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
        const aSummary = calcSummary(a.values, years)[sortBy as "avg" | "min" | "max" | "change"];
        const bSummary = calcSummary(b.values, years)[sortBy as "avg" | "min" | "max" | "change"];
        aVal = aSummary;
        bVal = bSummary;
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
    return r;
  }, [data, searchTerm, sortBy, sortDir, years]);

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box color="error.main" textAlign="center" minHeight={200}>
        Error loading data.
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table stickyHeader size="small" aria-label="ASEAN FDI Table">
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
          {rows.map((row) => {
            const summary = calcSummary(row.values, years);
            return (
              <TableRow key={row.country}>
                <TableCell component="th" scope="row">
                  {row.country}
                </TableCell>
                {years.map((year) => (
                  <TableCell key={year} align="right">
                    {row.values[year] != null ? row.values[year]?.toFixed(2) : "-"}
                  </TableCell>
                ))}
                <TableCell align="right">
                  {summary.avg != null ? summary.avg.toFixed(2) : "-"}
                </TableCell>
                <TableCell align="right">
                  {summary.min != null ? summary.min.toFixed(2) : "-"}
                </TableCell>
                <TableCell align="right">
                  {summary.max != null ? summary.max.toFixed(2) : "-"}
                </TableCell>
                <TableCell align="right">
                  {summary.change != null ? summary.change.toFixed(2) : "-"}
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
