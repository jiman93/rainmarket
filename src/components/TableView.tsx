import * as React from "react";
import { useDashboardStore } from "../store";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

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

function processData(apiData: any) {
  const byCountry: Record<string, Record<number, number | null>> = {};
  COUNTRY_CODES.forEach((c) => (byCountry[c.name] = {}));
  const arr = Array.isArray(apiData[1]) ? apiData[1] : [];
  arr.forEach((row: any) => {
    const c = row.country.value;
    const y = Number(row.date);
    if (byCountry[c] && ALL_YEARS.includes(y)) {
      byCountry[c][y] = row.value;
    }
  });
  return COUNTRY_CODES.map((c) => ({
    code: c.code,
    country: c.name,
    values: ALL_YEARS.reduce(
      (acc, y) => ({ ...acc, [y]: byCountry[c.name][y] ?? null }),
      {} as Record<number, number | null>
    ),
  }));
}

const TableView: React.FC = () => {
  const selectedIndicator = useDashboardStore((s) => s.selectedIndicators[0]);
  const yearRange = useDashboardStore((s) => s.yearRange);
  const selectedCountries = useDashboardStore((s) => s.selectedCountries as string[]);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const { data, isLoading, error } = useQuery({
    queryKey: ["indicator-table", selectedIndicator, ALL_YEARS],
    enabled: !!selectedIndicator,
    queryFn: async () => {
      const codes = COUNTRY_CODES.map((c) => c.code).join(";");
      const range = `${ALL_YEARS[0]}:${ALL_YEARS.at(-1)}`;
      const res = await fetch(
        `https://api.worldbank.org/v2/country/${codes}/indicator/${selectedIndicator}?format=json&date=${range}&per_page=1000`
      );
      return res.json();
    },
  });

  const processed = React.useMemo(() => (data ? processData(data) : []), [data]);
  const years = React.useMemo(() => {
    const [start, end] = yearRange;
    return ALL_YEARS.filter((y) => y >= start && y <= end);
  }, [yearRange]);
  const displayYears = isSm ? years : years;
  const showStats = !isSm;
  const filtered = React.useMemo(
    () => processed.filter((r) => selectedCountries.includes(r.code)),
    [processed, selectedCountries]
  );

  const [sortBy, setSortBy] = React.useState<string>("country");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aV: any, bV: any;
      if (sortBy === "country") {
        [aV, bV] = [a.country, b.country];
      } else if (sortBy.startsWith("y")) {
        const y = Number(sortBy.slice(1));
        [aV, bV] = [a.values[y], b.values[y]];
      } else {
        const valsA = displayYears.map((y) => a.values[y]).filter((v) => v != null) as number[];
        const valsB = displayYears.map((y) => b.values[y]).filter((v) => v != null) as number[];
        switch (sortBy) {
          case "avg":
            aV = valsA.reduce((x, y) => x + y, 0) / valsA.length;
            bV = valsB.reduce((x, y) => x + y, 0) / valsB.length;
            break;
          case "min":
            aV = Math.min(...valsA);
            bV = Math.min(...valsB);
            break;
          case "max":
            aV = Math.max(...valsA);
            bV = Math.max(...valsB);
            break;
          case "change": {
            const a0 = a.values[displayYears[0]]!,
              aN = a.values[displayYears.at(-1)!]!;
            const b0 = b.values[displayYears[0]]!,
              bN = b.values[displayYears.at(-1)!]!;
            aV = ((aN - a0) / a0) * 100;
            bV = ((bN - b0) / b0) * 100;
            break;
          }
        }
      }
      if (aV == null) return 1;
      if (bV == null) return -1;
      if (typeof aV === "string")
        return sortDir === "asc" ? aV.localeCompare(bV) : bV.localeCompare(aV);
      return sortDir === "asc" ? aV - bV : bV - aV;
    });
  }, [filtered, sortBy, sortDir, displayYears]);

  const handleSort = (col: string) => {
    setSortBy((prev) => (prev === col ? prev : col));
    setSortDir((prev) => (prev === "asc" && sortBy === col ? "desc" : "asc"));
  };

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box color="error.main" textAlign="center" minHeight={300}>
        Error loading data.
      </Box>
    );

  if (isSm) {
    // Card grid on mobile
    return (
      <Box p={1}>
        <Box display="grid" gridTemplateColumns={{ xs: "1fr 1fr" }} gap={2}>
          {sorted.map((r) => (
            <Card key={r.code} sx={{ mb: 0, borderRadius: 2, boxShadow: 3 }}>
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  p: 1.2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} fontSize={16} textAlign="center">
                  {r.country}
                </Typography>
              </Box>
              <CardContent sx={{ p: 1.5 }}>
                <Box display="flex" flexDirection="column" gap={0.5}>
                  {displayYears.map((y) => (
                    <Box
                      key={y}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ bgcolor: "background.default", borderRadius: 1, px: 1, py: 0.5 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {y}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={r.values[y] != null ? "text.primary" : "text.disabled"}
                      >
                        {r.values[y] != null ? r.values[y]!.toFixed(2) : "-"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <TableContainer component={Paper} sx={{ boxShadow: 1, minWidth: 700, display: "block" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => handleSort("country")}
                sx={{ cursor: "pointer", fontSize: 13, p: 0.75 }}
              >
                Country {sortBy === "country" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </TableCell>
              {displayYears.map((y) => (
                <TableCell
                  key={y}
                  onClick={() => handleSort("y" + y)}
                  align="right"
                  sx={{ cursor: "pointer", fontSize: 13, p: 0.75 }}
                >
                  {y}
                  {sortBy === "y" + y ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </TableCell>
              ))}
              <TableCell
                onClick={() => handleSort("avg")}
                align="right"
                sx={{ cursor: "pointer", fontSize: 13, p: 0.75 }}
              >
                Avg {sortBy === "avg" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("min")}
                align="right"
                sx={{ cursor: "pointer", fontSize: 13, p: 0.75 }}
              >
                Min {sortBy === "min" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("max")}
                align="right"
                sx={{ cursor: "pointer", fontSize: 13, p: 0.75 }}
              >
                Max {sortBy === "max" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("change")}
                align="right"
                sx={{ cursor: "pointer", fontSize: 13, p: 0.75 }}
              >
                Change {sortBy === "change" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((r) => {
              const vals = displayYears.map((y) => r.values[y]);
              const valid = vals.filter((v) => v != null) as number[];
              const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
              const mn = valid.length ? Math.min(...valid) : null;
              const mx = valid.length ? Math.max(...valid) : null;
              const first = vals[0],
                last = vals.at(-1);
              const ch = first != null && last != null ? ((last - first) / first) * 100 : null;
              return (
                <TableRow key={r.code}>
                  <TableCell component="th" scope="row">
                    {r.country}
                  </TableCell>
                  {vals.map((v, i) => (
                    <TableCell key={i} align="right">
                      {v != null ? v.toFixed(2) : "-"}
                    </TableCell>
                  ))}
                  <TableCell align="right">{avg != null ? avg.toFixed(2) : "-"}</TableCell>
                  <TableCell align="right">{mn != null ? mn.toFixed(2) : "-"}</TableCell>
                  <TableCell align="right">{mx != null ? mx.toFixed(2) : "-"}</TableCell>
                  <TableCell align="right">{ch != null ? ch.toFixed(2) + "%" : "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableView;
