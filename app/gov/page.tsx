import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simulated government/insurer viewer. Deliberately has no separate account
// type this week (see docs/PACKET.md scope cut) — any signed-in user can
// load this page, but RLS on share_consents is what actually decides what
// shows up: only rows an association has explicitly consented to. This page
// itself queries nothing else. That is the entire proof of the shadow clause.
export default async function GovPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: consented } = await supabase
    .from("share_consents")
    .select("association_id, consented_at, snapshot")
    .eq("consented", true)
    .order("consented_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <SiteHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <h1 className="mb-1 text-xl font-semibold">Vista de gobierno (simulada)</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Esto representa lo que vería SITRAMyTEM o SEMOVI si esta asociación decidiera
          compartir. Solo aparecen asociaciones que ya autorizaron explícitamente, y solo el
          resumen agregado que ellas mismas vieron primero en “Compartir.”
        </p>

        {(!consented || consented.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Ninguna asociación ha autorizado compartir nada todavía.
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          {(consented ?? []).map((row) => {
            const snap = row.snapshot as {
              association_name: string;
              generated_at: string;
              total_units: number;
              units_en_cumplimiento: number;
              units_sin_senal: number;
              units_sin_datos: number;
            } | null;
            if (!snap) return null;
            return (
              <Card key={row.association_id}>
                <CardHeader>
                  <CardTitle>{snap.association_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Autorizado</dt>
                    <dd>{new Date(row.consented_at).toLocaleString("es-MX")}</dd>
                    <dt className="text-muted-foreground">Unidades totales</dt>
                    <dd>{snap.total_units}</dd>
                    <dt className="text-muted-foreground">En cumplimiento</dt>
                    <dd>{snap.units_en_cumplimiento}</dd>
                    <dt className="text-muted-foreground">Sin señal</dt>
                    <dd>{snap.units_sin_senal}</dd>
                  </dl>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
