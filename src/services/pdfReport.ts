import { jsPDF } from 'jspdf';
import type { BypassActionLog, DiagnosticScan, ObdCodeEntry, Vehicle } from '../types/autosense';
import { findObdCodeDetails } from '../data/obdCodes';

export function downloadDiagnosticPdf(
  scan: DiagnosticScan,
  vehicle: Vehicle | undefined,
  customCodes: ObdCodeEntry[] = []
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 44;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  let y = 48;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 780) {
      doc.addPage();
      y = 48;
    }
  };

  // Header
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, 88, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('AutoSense Diagnostic Report', margin, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Understand Your Car. Drive With Confidence.', margin, 56);
  if (scan.isDemoData) {
    doc.setTextColor(96, 165, 250);
    doc.text('DEMO DATA REPORT — SIMULATED OBD-II TELEMETRY', margin, 72);
  }

  y = 114;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Vehicle & Scan Summary', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const scanDate = scan.scannedAtIso
    ? new Date(scan.scannedAtIso).toLocaleString()
    : 'Recorded Scan';

  const summaryLines = [
    `Vehicle: ${scan.vehicleLabel}`,
    `Registration: ${vehicle?.registrationNumber ?? 'N/A'}   |   Odometer: ${vehicle ? `${vehicle.odometerKm.toLocaleString()} km` : 'N/A'}`,
    `Scan Date: ${scanDate}   |   Connection Mode: ${scan.connectionMode}`,
    `Overall Health Score: ${scan.overallHealthScore}/100   |   Engine Health: ${scan.engineHealthScore}/100`,
    `Battery Voltage: ${scan.supportedSensors.battery ? `${scan.batteryVoltage} V` : 'Unsupported / Unavailable'}`,
    `Coolant Temperature: ${scan.supportedSensors.coolantTemp ? `${scan.coolantTempC} °C` : 'Unsupported / Unavailable'}`,
    `Fuel Trim: ${scan.supportedSensors.fuelSystem ? `${scan.fuelTrimPct}%` : 'Unsupported'}   |   Emissions: ${scan.supportedSensors.emissions ? scan.emissionReadiness : 'Unsupported'}`,
  ];

  for (const line of summaryLines) {
    doc.text(line, margin, y);
    y += 15;
  }

  y += 8;
  const wrappedSummary = doc.splitTextToSize(`Summary: ${scan.summary}`, maxLineWidth);
  doc.text(wrappedSummary, margin, y);
  y += wrappedSummary.length * 14 + 16;

  // Trouble Codes
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Detected Trouble Codes (${scan.detectedCodes.length})`, margin, y);
  y += 18;

  if (scan.detectedCodes.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No diagnostic trouble codes detected in this scan.', margin, y);
    y += 20;
  } else {
    for (const codeStr of scan.detectedCodes) {
      const info = findObdCodeDetails(codeStr, customCodes);
      const isResolved = scan.resolvedCodes.includes(codeStr);
      checkPageBreak(130);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(
        `${info.code} — ${info.name} [${info.severity}${isResolved ? ' · Resolved' : ''}]`,
        margin,
        y
      );
      y += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const meaning = doc.splitTextToSize(`What it means: ${info.meaning}`, maxLineWidth);
      doc.text(meaning, margin, y);
      y += meaning.length * 12 + 4;

      const causes = doc.splitTextToSize(
        `Possible reasons: ${info.possibleCauses.join('; ')}`,
        maxLineWidth
      );
      doc.text(causes, margin, y);
      y += causes.length * 12 + 4;

      const nextSteps = doc.splitTextToSize(`Next steps: ${info.nextSteps}`, maxLineWidth);
      doc.text(nextSteps, margin, y);
      y += nextSteps.length * 12 + 4;

      const mech = doc.splitTextToSize(`Mechanic guidance: ${info.mechanicAdvice}`, maxLineWidth);
      doc.text(mech, margin, y);
      y += mech.length * 12 + 14;
    }
  }

  checkPageBreak(50);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const disclaimer = doc.splitTextToSize(
    'Safety Notice: OBD-II trouble codes identify a reported circuit or system anomaly and do not alone confirm a specific mechanical part failure. Never attempt unsafe roadside or mechanical repairs. Always consult a qualified technician for inspection.',
    maxLineWidth
  );
  doc.text(disclaimer, margin, y);

  const safeFile = scan.vehicleLabel.replace(/[^a-zA-Z0-9_-]+/g, '_');
  doc.save(`AutoSense_Report_${safeFile}.pdf`);
}

export function downloadBypassAuditPdf(
  logs: BypassActionLog[],
  customCodes: ObdCodeEntry[] = []
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 44;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  let y = 48;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 780) {
      doc.addPage();
      y = 48;
    }
  };

  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, 82, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('AutoSense Mechanic Audit — Bypass Actions Log', margin, 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated: ${new Date().toLocaleString()}   |   Total Events: ${logs.length}`,
    margin,
    56
  );

  y = 108;

  if (logs.length === 0) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text('No controlled bypass or Mode $04 reset actions recorded.', margin, y);
  } else {
    for (const log of logs) {
      checkPageBreak(150);
      const ts = log.occurredAtIso ? new Date(log.occurredAtIso).toLocaleString() : 'Recorded';
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(
        `${ts} — ${log.vehicleLabel}${log.isDemoData ? ' [DEMO DATA]' : ''}`,
        margin,
        y
      );
      y += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const sensorNames = log.modifiedSensors
        .map((c) => `${c} (${findObdCodeDetails(c, customCodes).name})`)
        .join('; ');
      const lines = [
        `Action: ${log.actionType === 'mode04_reset' ? 'Mode $04 Indicator Reset' : 'Controlled Transit Bypass'} | Profile: ${log.transitProfileLabel} (${log.maxSpeedKmh} km/h, ${log.maxRpm} RPM)`,
        `Modified Sensors: ${sensorNames}`,
        `Blocked High-Risk Sensors: ${log.blockedSensors.length > 0 ? log.blockedSensors.join(', ') : 'None'}`,
        `Vehicle Status Snapshot: Health ${log.vehicleStatusSnapshot.overallHealthScore}/100, Engine ${log.vehicleStatusSnapshot.engineHealthScore}/100, Coolant ${log.vehicleStatusSnapshot.coolantTempC} C, Battery ${log.vehicleStatusSnapshot.batteryVoltage > 0 ? `${log.vehicleStatusSnapshot.batteryVoltage}V` : 'Unsupported'}, Odometer ${log.vehicleStatusSnapshot.odometerKm.toLocaleString()} km`,
      ];
      for (const line of lines) {
        const wrapped = doc.splitTextToSize(line, maxLineWidth);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 12 + 2;
      }

      const notes = doc.splitTextToSize(`Mechanic Note: ${log.notes}`, maxLineWidth);
      doc.text(notes, margin, y);
      y += notes.length * 12 + 12;

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 14;
    }
  }

  doc.save('AutoSense_Bypass_Actions_Audit.pdf');
}

