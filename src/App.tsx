import "./App.css";
import Header from "./components/Header";
import TabsBar from "./components/TabsBar";
import IndicatorSelector from "./components/IndicatorSelector";
import TableView from "./components/TableView";
import LineChartView from "./components/LineChartView";
import YearSlider from "./components/YearSlider";
import FooterBar from "./components/FooterBar";
import CountrySelector from "./components/CountrySelector";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import React from "react";
import { useDashboardStore } from "./store";
import BarChartView from "./components/BarChartView";
import MapView from "./components/MapView";
import ScatterPlotView from "./components/ScatterPlotView";
import useMediaQuery from "@mui/material/useMediaQuery";

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

  const tab = useDashboardStore((s) => s.tab);
  const muiTheme = useTheme();
  const isSmall = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            maxWidth: 1300,
            mx: "auto",
            p: isSmall ? 0.5 : 2,
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <IconButton onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
              {" "}
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}{" "}
            </IconButton>
          </Box>
          <Header />
          <TabsBar />
          {tab !== 4 && <IndicatorSelector />}

          <Box display="flex" gap={2} flex={1} flexDirection={isSmall ? "column" : "row"}>
            <Box flex={1} display="flex" flexDirection="column">
              {tab === 0 ? <TableView /> : null}
              {tab === 1 ? <LineChartView /> : null}
              {tab === 2 ? <BarChartView /> : null}
              {tab === 3 ? <MapView /> : null}
              {tab === 4 ? <ScatterPlotView /> : null}
              {tab !== 3 && tab !== 4 && (
                <Box>
                  <YearSlider />
                </Box>
              )}
              <Box sx={{ width: "100%", mt: 2 }}>
                <FooterBar />
              </Box>
            </Box>
            {tab !== 3 && tab !== 4 && !isSmall && <CountrySelector />}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
