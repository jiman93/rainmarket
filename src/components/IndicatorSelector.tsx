import * as React from "react";
import { useDashboardStore } from "../store";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

const IndicatorSelector: React.FC = () => {
  const selectedIndicator = useDashboardStore((s) => s.selectedIndicators[0]);
  const setSelectedIndicator = useDashboardStore((s) => s.setSelectedIndicator);

  return (
    <Box display="flex" flexDirection="column" gap={1} mb={1}>
      <TextField
        select
        size="small"
        label="Indicator"
        value={selectedIndicator}
        onChange={(e) => setSelectedIndicator(e.target.value)}
        SelectProps={{
          native: true,
        }}
        sx={{ width: { xs: 260, sm: 420 }, fontSize: 13 }}
      >
        <option value="BX.KLT.DINV.WD.GD.ZS">
          Foreign direct investment, net inflows (% of GDP)
        </option>
        <option value="NE.EXP.GNFS.ZS">Exports of goods and services (% of GDP)</option>
        <option value="BN.GSR.GNFS.CD">Net trade in goods and services (BoP, current US$)</option>
        <option value="EG.ELC.HYRO.ZS">Hydroelectricity (% of total electricity output)</option>
      </TextField>
    </Box>
  );
};

export default IndicatorSelector;
