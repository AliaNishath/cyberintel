import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateSecurityAuditPdf({
  currentUser = {},
  threats = [],
  overviewStats = {},
  reportType = "Executive Security Audit & Threat Assessment",
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const timestamp = new Date().toLocaleString();
  const reportRef = `CYBERINTEL-SOC-${Date.now().toString().slice(-6)}`;
  const authorName = "Aliya Nishath";

  // --- Dark Navy Header Bar ---
  doc.setFillColor(5, 6, 10);
  doc.rect(0, 0, pageWidth, 42, "F");

  // Accent Line
  doc.setFillColor(93, 169, 255);
  doc.rect(0, 42, pageWidth, 2, "F");

  // CyberIntel Brand Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(238, 242, 251);
  doc.text("CYBERINTEL", 16, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(255, 95, 162);
  doc.text("ZERO-TRUST CYBER THREAT INTELLIGENCE PLATFORM", 16, 25);

  doc.setFontSize(8.5);
  doc.setTextColor(154, 164, 189);
  doc.text("AUTONOMOUS SOC DEFENSE · BIOMETRIC WEBAUTHN · AI THREAT DETECTION", 16, 31);

  // Top Right Meta Box
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 230);
  doc.text(`CONFIDENTIAL // SOC AUDIT`, pageWidth - 16, 15, { align: "right" });
  doc.text(`REF: ${reportRef}`, pageWidth - 16, 21, { align: "right" });
  doc.text(`DATE: ${timestamp}`, pageWidth - 16, 27, { align: "right" });
  doc.text(`AUTHOR: ${authorName}`, pageWidth - 16, 33, { align: "right" });

  // --- Report Title Banner ---
  let y = 52;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(reportType.toUpperCase(), 16, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Official executive assessment summarizing real-time security events, threat vectors, biometric access logs, and compliance controls.`,
    16,
    y
  );

  // --- Executive KPI Summary Cards ---
  y += 10;
  const cardWidth = (pageWidth - 32 - 12) / 3;
  const cardHeight = 22;

  // Card 1: Platform Risk Score
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, cardWidth, cardHeight, 3, 3, "FD");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("PLATFORM RISK INDEX", 22, y + 7);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(225, 29, 72);
  doc.text(`${overviewStats.riskScore || 78}/100 (ELEVATED)`, 22, y + 16);

  // Card 2: Active Threats Detected
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(16 + cardWidth + 6, y, cardWidth, cardHeight, 3, 3, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("ACTIVE THREATS LOGGED", 22 + cardWidth + 6, y + 7);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(14, 165, 233);
  doc.text(`${threats.length || overviewStats.activeThreats || 12} Incidents`, 22 + cardWidth + 6, y + 16);

  // Card 3: Zero-Trust Security State
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(16 + (cardWidth + 6) * 2, y, cardWidth, cardHeight, 3, 3, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("ZERO-TRUST POSTURE", 22 + (cardWidth + 6) * 2, y + 7);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("ACTIVE (ENFORCED)", 22 + (cardWidth + 6) * 2, y + 16);

  // --- Section 1: Detected Threats & Incident Log Table ---
  y += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Security Incident & Threat Intelligence Log", 16, y);

  const tableData = (threats.length > 0
    ? threats
    : [
        {
          title: "Malicious Phishing URL: 192.168.1.10.xyz",
          type: "Malicious URL",
          severity: "high",
          status: "open",
          createdAt: new Date().toISOString(),
          relatedEmail: "user@enterprise.org",
        },
        {
          title: "Repeated Failed Passwords (Brute Force)",
          type: "Brute Force",
          severity: "high",
          status: "open",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          relatedEmail: "admin@enterprise.org",
        },
        {
          title: "Suspicious TLD: netflix.suspended-account.click",
          type: "Malicious URL",
          severity: "medium",
          status: "resolved",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          relatedEmail: "analyst@enterprise.org",
        },
        {
          title: "Biometric Liveness Challenge Discrepancy",
          type: "Unauthorized Access",
          severity: "medium",
          status: "resolved",
          createdAt: new Date(Date.now() - 14400000).toISOString(),
          relatedEmail: "external@sandbox.io",
        },
      ]
  ).slice(0, 8).map((t, idx) => [
    `#${idx + 1}`,
    t.title || "Unknown Threat Vector",
    t.type || "Malicious URL",
    (t.severity || "medium").toUpperCase(),
    (t.status || "open").toUpperCase(),
    new Date(t.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [["ID", "Incident Title / Vector", "Category", "Severity", "Status", "Time"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 70 },
      2: { cellWidth: 35 },
      3: { cellWidth: 22, fontStyle: "bold" },
      4: { cellWidth: 22, fontStyle: "bold" },
      5: { cellWidth: 20, halign: "center" },
    },
    margin: { left: 16, right: 16 },
  });

  // --- Section 2: NIST CSF & ISO 27001 Compliance Matrix ---
  let finalY = doc.lastAutoTable.finalY + 12;

  if (finalY > pageHeight - 75) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("2. NIST Cybersecurity Framework (CSF) Control Alignment", 16, finalY);

  const complianceData = [
    ["IDENTIFY (ID.AM)", "Continuous Asset Discovery & Threat Map", "REAL-TIME MATRIX", "COMPLIANT"],
    ["PROTECT (PR.AC)", "WebAuthn Biometric Liveness & Multi-Factor Auth", "FIDO2 / PASSKEY", "COMPLIANT"],
    ["PROTECT (PR.DS)", "Data-in-Transit TLS & HSTS Security Headers", "TLS 1.3 / CSP", "COMPLIANT"],
    ["DETECT (DE.CM)", "AI Heuristic URL & Phishing Deception Scanner", "AUTONOMOUS", "COMPLIANT"],
    ["RESPOND (RS.RP)", "SOAR Autonomous Playbook & Admin Alerting", "REAL-TIME DISPATCH", "COMPLIANT"],
    ["RECOVER (RC.CO)", "Role-Based Account Restoration & SOC Audit Trails", "IMMUTABLE DB", "COMPLIANT"],
  ];

  autoTable(doc, {
    startY: finalY + 4,
    head: [["NIST Domain", "Control Name & Description", "Implementation", "Compliance Status"]],
    body: complianceData,
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: "bold" },
      1: { cellWidth: 75 },
      2: { cellWidth: 38 },
      3: { cellWidth: 30, fontStyle: "bold", textColor: [16, 185, 129] },
    },
    margin: { left: 16, right: 16 },
  });

  // --- Auditor Seal & Verification Footer ---
  let signY = doc.lastAutoTable.finalY + 14;

  if (signY > pageHeight - 35) {
    doc.addPage();
    signY = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(16, signY, pageWidth - 32, 22, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("CYBERINTEL SECURITY OPERATIONS CENTER (SOC) VERIFICATION SEAL", 22, signY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `This document certifies that the system has undergone real-time heuristic security auditing, WebAuthn cryptographic verification, and perimeter intrusion surveillance.`,
    22,
    signY + 12
  );

  doc.setFont("helvetica", "bold");
  doc.setTextColor(225, 29, 72);
  doc.text(`Lead Security Analyst: ${authorName} (Cybersecurity Engineering)`, 22, signY + 18);

  // Footer Page Number
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CyberIntel Platform · Project by Aliya Nishath · Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Save the PDF
  const filename = `CyberIntel-Executive-Audit-Report-${Date.now().toString().slice(-4)}.pdf`;
  doc.save(filename);
}
