// Shared gap/anomaly scoring logic. This is the whole "ML" component from
// the packet: no model, no vendor claim of predicting anything, just an
// honest threshold on top of each unit's own declared expected interval.
// A unit is flagged "sin señal" only when it has gone quiet for more than
// twice as long as it itself is supposed to check in.

export type UnitWithLastPing = {
  id: string;
  label: string;
  expected_interval_minutes: number;
  last_ping_at: string | null;
};

export type UnitStatus = "sin_datos" | "en_cumplimiento" | "sin_senal";

export function statusForUnit(unit: UnitWithLastPing, now: Date = new Date()): UnitStatus {
  if (!unit.last_ping_at) return "sin_datos";
  const lastPing = new Date(unit.last_ping_at);
  const minutesSince = (now.getTime() - lastPing.getTime()) / 60000;
  const threshold = unit.expected_interval_minutes * 2;
  return minutesSince > threshold ? "sin_senal" : "en_cumplimiento";
}

export function statusLabel(status: UnitStatus): string {
  switch (status) {
    case "en_cumplimiento":
      return "En cumplimiento";
    case "sin_senal":
      return "Sin señal";
    case "sin_datos":
      return "Sin datos aún";
  }
}

export function statusBadgeVariant(status: UnitStatus): "success" | "destructive" | "outline" {
  switch (status) {
    case "en_cumplimiento":
      return "success";
    case "sin_senal":
      return "destructive";
    case "sin_datos":
      return "outline";
  }
}

export function coverageSummary(units: UnitStatus[]) {
  const total = units.length;
  const active = units.filter((s) => s === "en_cumplimiento").length;
  const silent = units.filter((s) => s === "sin_senal").length;
  const unseen = units.filter((s) => s === "sin_datos").length;
  return { total, active, silent, unseen };
}
