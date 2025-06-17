import React from "react";

const ExportButton: React.FC = () => {
  return (
    <div className="export-button" style={{ margin: "1em 0", textAlign: "right" }}>
      {/* Export buttons will go here */}
      <button
        style={{
          background: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "0.5em 1.5em",
          cursor: "pointer",
        }}
        disabled
      >
        Export (PDF/PNG)
      </button>
    </div>
  );
};

export default ExportButton;
