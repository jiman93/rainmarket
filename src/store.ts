import { create } from "zustand";

export type CountryCode = "MY" | "ID" | "SG" | "TH" | "MM" | "VN" | "BN" | "LA" | "KH" | "PH";

export type IndicatorCode =
  | "NE.EXP.GNFS.ZS" // Export of goods and services (% of GDP)
  | "NY.GDP.PCAP.CD" // GDP per capita (current USD$)
  | "SP.POP.TOTL" // Population, total
  | string; // allow for more

interface DashboardState {
  selectedCountries: CountryCode[];
  setSelectedCountries: (countries: CountryCode[]) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedIndicators: IndicatorCode[];
  setSelectedIndicators: (indicators: IndicatorCode[]) => void;
  yearRange: [number, number];
  setYearRange: (range: [number, number]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedCountries: ["MY", "ID", "SG", "TH", "MM", "VN", "BN", "LA", "KH", "PH"],
  setSelectedCountries: (countries) => set({ selectedCountries: countries }),
  selectedYear: 2021,
  setSelectedYear: (year) => set({ selectedYear: year }),
  selectedIndicators: ["NE.EXP.GNFS.ZS", "NY.GDP.PCAP.CD", "SP.POP.TOTL"],
  setSelectedIndicators: (indicators) => set({ selectedIndicators: indicators }),
  yearRange: [2011, 2021],
  setYearRange: (range) => set({ yearRange: range }),
  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),
}));
