import React from "react";
import { useDashboardStore } from "../store";
import CountrySelector from "./CountrySelector";
import IndicatorSelector from "./IndicatorSelector";
import YearSlider from "./YearSlider";
import LineChartView from "./LineChartView";
import BarChartView from "./BarChartView";
import TableView from "./TableView";
import FooterBar from "./FooterBar";
import { Box, Tabs, Tab } from "@mui/material";
import { TABS } from "./TabsBar";

const App: React.FC = () => {
  const { tab, setTab } = useDashboardStore();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={handleTabChange}>
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }}>
        <CountrySelector />
        <IndicatorSelector />
        <YearSlider />
        {tab === 0 && <TableView />}
        {tab === 1 && <LineChartView />}
        {tab === 2 && <BarChartView />}
        <FooterBar />
      </Box>
    </Box>
  );
};

export default App;
