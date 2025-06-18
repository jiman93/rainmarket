import * as React from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useDashboardStore } from "../store";

const INDICATORS = [
  {
    code: "BX.KLT.DINV.WD.GD.ZS",
    label: "Foreign direct investment, net inflows (% of GDP)",
  },
  {
    code: "NE.EXP.GNFS.ZS",
    label: "Export of goods and services (% of GDP)",
  },
  {
    code: "BN.GSR.GNFS.CD",
    label: "Net trade in goods and services (BoP, current US$)",
  },
  {
    code: "EG.ELC.HYRO.ZS",
    label: "Electricity production from hydroelectric sources (% of total)",
  },
];

const FilterBar: React.FC = () => {
  const searchTerm = useDashboardStore((s) => s.searchTerm);
  const setSearchTerm = useDashboardStore((s) => s.setSearchTerm);
  const selectedIndicator = useDashboardStore((s) => s.selectedIndicators[0]);
  const setSelectedIndicators = useDashboardStore((s) => s.setSelectedIndicators);

  return (
    <Box display="flex" gap={2} mb={2}>
      <FormControl size="small" sx={{ minWidth: 320, flex: 2 }}>
        <InputLabel>Indicator</InputLabel>
        <Select
          value={selectedIndicator}
          label="Indicator"
          onChange={(e) => setSelectedIndicators([e.target.value])}
        >
          {INDICATORS.map((ind) => (
            <MenuItem key={ind.code} value={ind.code}>
              {ind.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="Search for a country or region"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ flex: 1 }}
      />
    </Box>
  );
};

export default FilterBar;
 