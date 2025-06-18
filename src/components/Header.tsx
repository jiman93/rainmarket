import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Header: React.FC = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="flex-start"
    mb={2}
    sx={{ textAlign: "left" }}
  >
    <Box sx={{ textAlign: "left" }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ textAlign: "left" }}>
        ASEAN Economic Indicator Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: "left" }}>
        Explore and compare key macroeconomic indicators for ASEAN countries using live data from
        the World Bank. Select an indicator and time range to visualize trends and summary
        statistics.
      </Typography>
    </Box>
  </Box>
);

export default Header;
