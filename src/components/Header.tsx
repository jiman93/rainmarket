import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Header: React.FC = () => (
  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        ASEAN Economic Indicator Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Explore and compare key macroeconomic indicators for ASEAN countries using live data from
        the World Bank. Select an indicator and time range to visualize trends and summary
        statistics.
      </Typography>
    </Box>
  </Box>
);

export default Header;
