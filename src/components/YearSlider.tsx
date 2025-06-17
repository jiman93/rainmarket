import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { useDashboardStore } from "../store";

const MIN_YEAR = 2011;
const MAX_YEAR = 2021;

const YearSlider: React.FC = () => {
  const yearRange = useDashboardStore((s) => s.yearRange);
  const setYearRange = useDashboardStore((s) => s.setYearRange);

  return (
    <Box display="flex" alignItems="center" gap={2} mt={2} mb={2}>
      <Slider
        min={MIN_YEAR}
        max={MAX_YEAR}
        value={yearRange}
        onChange={(_, v) => setYearRange(v as [number, number])}
        sx={{ width: 240 }}
        valueLabelDisplay="auto"
        marks={[
          { value: MIN_YEAR, label: MIN_YEAR.toString() },
          { value: MAX_YEAR, label: MAX_YEAR.toString() },
        ]}
      />
    </Box>
  );
};

export default YearSlider;
