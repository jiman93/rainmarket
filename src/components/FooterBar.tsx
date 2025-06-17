import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useDashboardStore } from "../store";
import { useQuery } from "@tanstack/react-query";
import DownloadIcon from "@mui/icons-material/Download";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

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
      country: c.name,
      values: yearValues,
    };
  });
}

const FooterBar: React.FC = () => {
  const selectedIndicator = useDashboardStore((s) => s.selectedIndicators[0]);
  const { data } = useQuery({
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

  // Download JSON handler
  const handleDownload = () => {
    if (!data) return;
    const processed = processData(data);
    const blob = new Blob([JSON.stringify(processed, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asean-indicator-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fullscreen handler
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  React.useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <Box
      mt={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={2}
    >
      <Box>
        <Typography variant="body2" color="text.secondary">
          Data source: World Bank Open Data –{" "}
          <a href="https://data.worldbank.org/" target="_blank" rel="noopener noreferrer">
            https://data.worldbank.org/
          </a>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Note: Data is fetched live from the World Bank API for ASEAN countries and selected
          indicators. Created by Zul Hafiz.
        </Typography>
      </Box>
      <Box display="flex" gap={2}>
        <Tooltip title="Download JSON">
          <IconButton color="default" onClick={handleDownload} size="large">
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isFullscreen ? "Exit Full-Screen" : "Enter Full-Screen"}>
          <IconButton color="default" onClick={handleFullscreen} size="large">
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default FooterBar;
