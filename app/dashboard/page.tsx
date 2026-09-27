import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CoverageMapClient from "@/components/coverage-map-client";
import { ensureAssociationAndUnits } from "./actions";
import { statusForUnit, statusLabel, statusBadgeVariant, coverageSummary } from "@/lib/status";
import { SimulateButton } from "./simulate-button";
import { ExportButton } from "./export-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const associationId = await ensureAssociationAndUnits();

  const { data: association } = await supabase
    .from("associations")
    .select("id, name")
    .eq("id", associationId)
    .single();

  const { data: units } = await supabase
    .from("units")
    .select("id, label, expected_interval_minutes")
    .eq("association_id", associationId)
    .order("label");

  const unitIds = (units ?? []).map((u) => u.id);
  const { data: pings } = await supabase
    .from("telemetry_pings")
    .select("unit_id, pinged_at, lat, lng")
    .in("unit_id", unitIds.length > 0 ? unitIds : ["00000000-0000-0000-0000-000000000000"])
    .order("pinged_at", { ascending: false });

  const lastPingByUnit = new Map<string, { pinged_at: string; lat: number; lng: number }>();
  for (const p of pings ?? []) {
    if (!lastPingByUnit.has(p.unit_id)) {
      lastPingByUnit.set(p.unit_id, { pinged_at: p.pinged_at, lat: p.lat, lng: p.lng });
    }
  }

  const rows = (units ?? []).map((u) => {
    const lastPing = lastPingByUnit.get(u.id);
    const status = statusForUnit({
      id: u.id,
      label: u.label,
      expected_interval_minutes: u.expected_interval_minutes,
      last_ping_at: lastPing?.pinged_at ?? null,
    });
    return {
      id: u.id,
      label: u.label,
      status,
      lat: lastPing?.lat ?? null,
      lng: lastPing?.lng ?? null,
      lastPingAt: lastPing?.pinged_at ?? null,
    };
  });

  const summary = coverageSummary(rows.map((r) => r.status));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <SiteHeader email={user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{association?.name}</h1>
            <p className="text-sm text-muted-foreground">
              {summary.total} unidades registradas · {summary.active} en cumplimiento ·{" "}
              {summary.silent} sin señal
              {summary.unseen > 0 ? ` · ${summary.unseen} sin datos aún` : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <ExportButton associationName={association?.name ?? "asociacion"} rows={rows} />
            <SimulateButton associationId={associationId} />
          </div>
        </div>

        <div className="mb-6">
          <CoverageMapClient units={rows} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Unidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-muted-foreground">
                    {r.lastPingAt
                      ? `Último aviso: ${new Date(r.lastPingAt).toLocaleTimeString("es-MX")}`
                      : "Sin aviso todavía"}
                  </span>
                  <Badge variant={statusBadgeVariant(r.status)}>{statusLabel(r.status)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-xs text-muted-foreground">
          Esta vista es solo tuya. Nada de esto llega a una autoridad o aseguradora hasta que tú
          lo autorices explícitamente en “Compartir”.
        </p>
      </main>
    </div>
  );
}
