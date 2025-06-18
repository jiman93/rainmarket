import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useDashboardStore } from "../store";
import { useQuery } from "@tanstack/react-query";
import ActionBar from "./ActionBar";

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

const FooterBar: React.FC = () => {
  const selectedIndicator = useDashboardStore((s) => s.selectedIndicators[0]);
  const tab = useDashboardStore((s) => s.tab);
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

  return (
    <Box
      mt={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={2}
    >
      <Box sx={{ textAlign: "left" }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
          Data source: World Bank Open Data –{" "}
          <a href="https://data.worldbank.org/" target="_blank" rel="noopener noreferrer">
            https://data.worldbank.org/
          </a>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "left" }}>
          Note: Data is fetched live from the World Bank API for ASEAN countries and selected
          indicators. Created by Zul Hafiz.
        </Typography>
      </Box>
      <Box display="flex" gap={2}>
        <ActionBar tab={tab} data={data} />
      </Box>
    </Box>
  );
};

export default FooterBar;
