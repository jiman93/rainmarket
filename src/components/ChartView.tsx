import React from "react";

const ChartView: React.FC = () => {
  return (
    <div
      className="chart-view"
      style={{
        margin: "2em 0",
        background: "#181818",
        borderRadius: "12px",
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
      }}
    >
      [Chart (Line/Bar) visualization placeholder]
    </div>
  );
};

export default ChartView;
