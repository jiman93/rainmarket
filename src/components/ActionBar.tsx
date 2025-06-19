import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DownloadIcon from "@mui/icons-material/Download";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const COUNTRY_CODES = [
  { code: "MY", name: "Malaysia" },
  { code: "ID", name: "Indonesia" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "MM", name: "Myanmar" },
  { code: "VN", name: "Vietnam" },
  { code: "BN", name: "Brunei" },
  { code: "LA", name: "Lao PDR" },
  { code: "KH", name: "Cambodia" },
  { code: "PH", name: "Philippines" },
];
const ALL_YEARS = Array.from({ length: 2021 - 2011 + 1 }, (_, i) => 2011 + i);

function processData(apiData: unknown) {
  const data = apiData as { [key: number]: unknown[] };
  const byCountry: Record<string, Record<number, number | null>> = {};
  for (const c of COUNTRY_CODES) {
    byCountry[c.name] = {};
  }
  const arr = Array.isArray((data as { [key: number]: unknown[] })[1])
    ? (data as { [key: number]: unknown[] })[1]
    : [];
  for (const row of arr as Array<{
    country: { value: string };
    date: string;
    value: number | null;
  }>) {
    const country = row.country.value;
    const year = Number(row.date);
    const value = row.value;
    if (byCountry[country] && ALL_YEARS.includes(year)) {
      byCountry[country][year] = value ?? null;
    }
  }
  return COUNTRY_CODES.map((c) => {
    const yearValues: Record<number, number | null> = {};
    for (const y of ALL_YEARS) {
      yearValues[y] = byCountry[c.name][y] ?? null;
    }
    return {
      country: c.name,
      values: yearValues,
    };
  });
}

const ActionBar: React.FC<{ tab: number; data: unknown }> = ({ tab, data }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleDownloadClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadJSON = () => {
    if (!data) return;
    const processed = processData(data);
    const blob = new Blob([JSON.stringify(processed, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asean-indicator-data.json";
    a.click();
    URL.revokeObjectURL(url);
    handleMenuClose();
  };

  const handleDownloadPNG = async () => {
    handleMenuClose();
    const chartRef = (window as Window & { chartRef?: HTMLDivElement }).chartRef;
    if (chartRef) {
      const canvas = await html2canvas(chartRef, { backgroundColor: null });
      const link = document.createElement("a");
      link.download = "asean-linechart.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const handleDownloadPDF = async () => {
    handleMenuClose();
    const chartRef = (window as Window & { chartRef?: HTMLDivElement }).chartRef;
    if (chartRef) {
      const canvas = await html2canvas(chartRef, { backgroundColor: null });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight, undefined, "FAST");
      pdf.save("asean-linechart.pdf");
    }
  };

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      {tab !== 3 && tab !== 4 && (
        <>
          <Tooltip title="Download">
            <IconButton color="default" onClick={handleDownloadClick} size="large">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
            {tab === 0 && <MenuItem onClick={handleDownloadJSON}>Download as JSON</MenuItem>}
            {(tab === 1 || tab === 2) && [
              <MenuItem onClick={handleDownloadPNG} key="png">
                Download as PNG
              </MenuItem>,
              <MenuItem onClick={handleDownloadPDF} key="pdf">
                Download as PDF
              </MenuItem>,
            ]}
          </Menu>
        </>
      )}
      <Tooltip title={isFullscreen ? "Exit Full-Screen" : "Enter Full-Screen"}>
        <IconButton color="default" onClick={handleFullscreen} size="large">
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Tooltip>
    </>
  );
};

export default ActionBar;
