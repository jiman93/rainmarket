import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const TabsBar: React.FC = () => {
  const [value, setValue] = React.useState(0);
  return (
    <Tabs value={value} onChange={(_, v) => setValue(v)} sx={{ mb: 2 }}>
      <Tab label="Table" />
      <Tab label="Map" disabled />
      <Tab label="Line" disabled />
      <Tab label="Slope" disabled />
    </Tabs>
  );
};

export default TabsBar;
