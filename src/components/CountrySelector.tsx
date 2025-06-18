import React from "react";
import { useDashboardStore } from "../store";
import type { CountryCode } from "../store";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const COUNTRY_LABELS: Record<CountryCode, string> = {
  MY: "Malaysia",
  ID: "Indonesia",
  SG: "Singapore",
  TH: "Thailand",
  MM: "Myanmar",
  VN: "Vietnam",
  BN: "Brunei",
  LA: "Lao PDR",
  KH: "Cambodia",
  PH: "Philippines",
};

const CountrySelector: React.FC = () => {
  const selectedCountries = useDashboardStore((s) => s.selectedCountries);
  const setSelectedCountries = useDashboardStore((s) => s.setSelectedCountries);
  const [search, setSearch] = React.useState("");

  const handleToggle = (code: CountryCode) => {
    if (selectedCountries.includes(code)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== code));
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  const handleClear = () => setSelectedCountries([]);

  const filteredCountries = Object.entries(COUNTRY_LABELS).filter(([, label]) =>
    label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: 220,
        minWidth: 160,
        maxWidth: 240,
        bgcolor: "background.paper",
        borderLeft: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        py: 1,
        px: 1,
        boxShadow: 1,
        height: "100%",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6" fontWeight={500} fontSize={15}>
          Countries
        </Typography>
        <Tooltip title="Clear all">
          <IconButton size="small" onClick={handleClear}>
            <ClearAllIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <TextField
        size="small"
        placeholder="Search country"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1 }}
      />
      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        {filteredCountries.length === 0 ? (
          <Typography color="text.secondary" fontSize={12} textAlign="center" mt={1}>
            No countries found
          </Typography>
        ) : (
          filteredCountries.map(([code, label]) => (
            <Box
              key={code}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 0.5,
                px: 0.5,
                borderRadius: 1,
                bgcolor: selectedCountries.includes(code as CountryCode)
                  ? "action.selected"
                  : undefined,
                transition: "background 0.2s",
              }}
            >
              <Checkbox
                checked={selectedCountries.includes(code as CountryCode)}
                onChange={() => handleToggle(code as CountryCode)}
                size="small"
                sx={{ mr: 0.5, p: 0.5 }}
                inputProps={{ "aria-label": label }}
              />
              <Typography
                fontSize={13}
                color={
                  selectedCountries.includes(code as CountryCode) ? "primary.main" : "text.primary"
                }
              >
                {label}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default CountrySelector;
