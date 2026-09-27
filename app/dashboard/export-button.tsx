"use client";

import { Button } from "@/components/ui/button";
import { statusLabel, type UnitStatus } from "@/lib/status";

type ExportRow = {
  label: string;
  status: UnitStatus;
  lastPingAt: string | null;
};

// This is the piece the packet promised and the first build shipped without:
// Don Refugio's own downloadable copy of his operation's record, generated
// entirely client-side from what he can already see on the dashboard, so
// there's nothing to consent to or wait on — it's already his.
export function ExportButton({
  associationName,
  rows,
}: {
  associationName: string;
  rows: ExportRow[];
}) {
  function handleExport() {
    const now = new Date();
    const header = ["Unidad", "Estado", "Ultimo aviso"];
    const lines = rows.map((r) => [
      r.label,
      statusLabel(r.status),
      r.lastPingAt ? new Date(r.lastPingAt).toLocaleString("es-MX") : "Sin aviso todavia",
    ]);

    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const bom = "﻿"; // keeps accents readable when opened in Excel
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = now.toISOString().slice(0, 16).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `bitacora_${associationName.replace(/[^a-z0-9]+/gi, "_")}_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      Exportar mi registro
    </Button>
  );
}
