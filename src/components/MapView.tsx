import React from "react";
import { useDashboardStore } from "../store";
import { useQuery } from "@tanstack/react-query";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleSequential } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Tooltip from "@mui/material/Tooltip";

// ASEAN country codes (ISO Alpha-3)
const ASEAN_CODES = [
  "MY", // Malaysia
  "ID", // Indonesia
  "SG", // Singapore
  "TH", // Thailand
  "MM", // Myanmar
  "VN", // Vietnam
  "BN", // Brunei
  "LA", // Lao PDR
  "KH", // Cambodia
  "PH", // Philippines
];
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
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
const ALL_YEARS = Array.from({ length: 2021 - 2011 + 1 }, (_, i) => 2011 + i);

function processMapData(apiData: unknown) {
  // World Bank API returns [meta, data]
  const data = apiData as { [key: number]: unknown[] };
  const arr = Array.isArray((data as { [key: number]: unknown[] })[1])
    ? (data as { [key: number]: unknown[] })[1]
    : [];
  // Map: { countryCode: value }
  const byCountry: Record<string, number | null> = {};
  for (const row of arr as Array<{ country: { id: string }; value: number | null }>) {
    byCountry[row.country.id] = row.value;
  }
  return byCountry;
}

const MapView: React.FC = () => {
  const selectedIndicator = useDashboardStore((s) => s.selectedIndicators[0]);
  const [year, setYear] = React.useState(2021);
  const { data } = useQuery({
    queryKey: ["map", selectedIndicator, year],
    enabled: !!selectedIndicator,
    queryFn: async () => {
      const countryStr = ASEAN_CODES.join(";");
      const url = `https://api.worldbank.org/v2/country/${countryStr}/indicator/${selectedIndicator}?format=json&date=${year}&per_page=1000`;
      const res = await fetch(url);
      return res.json();
    },
  });
  const valueByCountry = data ? processMapData(data) : {};
  // Compute color scale domain
  const values = Object.values(valueByCountry).filter((v): v is number => v !== null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const colorScale = scaleSequential(interpolateYlOrRd).domain([min, max]);

  return (
    <Box sx={{ background: "transparent", p: 2, borderRadius: 2 }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1200, center: [115, 5] }}
        style={{ width: "100%", height: 500 }}
      >
        <ZoomableGroup>
          <Geographies geography={`${import.meta.env.BASE_URL}southeast-asia.geojson`}>
            {({ geographies }: { geographies: any[] }) => {
              return geographies
                .filter((geo: any) => ASEAN_CODES.includes(geo.properties.ISO_A3))
                .map((geo: any) => {
                  const code = geo.properties.ISO_A3;
                  const value = valueByCountry[code];
                  return (
                    <Tooltip
                      key={code}
                      title={
                        <span>
                          <b>{COUNTRY_CODE_TO_NAME[code]}</b>
                          <br />
                          Year: {year}
                          <br />
                          Value: {value !== null && value !== undefined ? value.toFixed(2) : "-"}
                        </span>
                      }
                      arrow
                    >
                      <Geography
                        geography={geo}
                        fill={value !== null && value !== undefined ? colorScale(value) : "#eee"}
                        stroke="#222"
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", opacity: 0.8 },
                          pressed: { outline: "none" },
                        }}
                      />
                    </Tooltip>
                  );
                });
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
        <Slider
          min={2011}
          max={2021}
          step={1}
          value={year}
          onChange={(_, v) => setYear(v as number)}
          marks={ALL_YEARS.map((y) => ({ value: y, label: y }))}
          valueLabelDisplay="auto"
          sx={{ width: 400 }}
        />
      </Box>
    </Box>
  );
};

export default MapView;
