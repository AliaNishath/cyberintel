import React from "react";
import { Download, FileText } from "lucide-react";

// Helper to trigger download of a file from a given URL
function triggerDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ReportsPage() {
  const handlePdfDownload = () => {
    triggerDownload("/api/reports/download-pdf", "cyberintel-report.pdf");
  };

  const handleJsonDownload = () => {
    triggerDownload("/api/reports/download-activity", "activity-log.json");
  };

  return (
    <div className="reports-page" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#0d0f1a" }}>Reports</h1>
      <p style={{ color: "#6b7488", marginBottom: "2rem" }}>
        Generate and download security reports for the current data set. You can download a detailed PDF summary or a raw JSON activity log.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={handlePdfDownload}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "linear-gradient(135deg, #5da9ff, #0d0f1a)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.25rem",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          <Download size={18} /> Download PDF Report
        </button>
        <button
          onClick={handleJsonDownload}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "linear-gradient(135deg, #ff5fa2, #0d0f1a)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.25rem",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          <FileText size={18} /> Download Activity Log (JSON)
        </button>
      </div>
    </div>
  );
}
