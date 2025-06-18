import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useDashboardStore } from "../store";

const TabsBar: React.FC = () => {
  const tab = useDashboardStore((s) => s.tab || 0);
  const setTab = useDashboardStore((s) => s.setTab);
  return (
    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
      <Tab label="Table" />
      <Tab label="Line" />
      <Tab label="Bar" />
      <Tab label="Map" />
    </Tabs>
  );
};

export default TabsBar;
