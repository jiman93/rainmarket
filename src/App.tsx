import "./App.css";
import Header from "./components/Header";
import TabsBar from "./components/TabsBar";
import IndicatorSelector from "./components/IndicatorSelector";
import TableView from "./components/TableView";
import YearSlider from "./components/YearSlider";
import FooterBar from "./components/FooterBar";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import React from "react";

// Skeleton component imports (to be implemented)
import CountrySelector from "./components/CountrySelector";
import TimeRangeSlider from "./components/TimeRangeSlider";
import ChartView from "./components/ChartView";
import MapView from "./components/MapView";
import ExportButton from "./components/ExportButton";
import ScatterPlotView from "./components/ScatterPlotView";

function App() {
  const [mode, setMode] = React.useState<"light" | "dark">("dark");
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === "dark" ? "#181818" : "#fafafa",
            paper: mode === "dark" ? "#232323" : "#fff",
          },
        },
        typography: {
          fontFamily: "Inter, Segoe UI, Arial, sans-serif",
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <IconButton onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
        <Header />
        <TabsBar />
        <IndicatorSelector />
        <TableView />
        <YearSlider />
        <FooterBar />
      </Box>
    </ThemeProvider>
  );
}

export default App;
