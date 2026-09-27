import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { previewSnapshot } from "./actions";
import { ConsentToggle } from "./consent-toggle";

export default async function ConsentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: association } = await supabase
    .from("associations")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!association) redirect("/dashboard");

  const { data: consentRow } = await supabase
    .from("share_consents")
    .select("consented, consented_at, snapshot")
    .eq("association_id", association.id)
    .maybeSingle();

  const preview = await previewSnapshot(association.id);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <SiteHeader email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <h1 className="mb-1 text-xl font-semibold">Compartir con gobierno / aseguradora</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Esto es lo único que otra persona podría llegar a ver, y solo si tú lo autorizas. Nunca
          incluye el mapa, ni el detalle por unidad, ni ningún dato de conductor.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vista previa de lo que se compartiría</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Asociación</dt>
              <dd>{preview.association_name}</dd>
              <dt className="text-muted-foreground">Unidades totales</dt>
              <dd>{preview.total_units}</dd>
              <dt className="text-muted-foreground">En cumplimiento</dt>
              <dd>{preview.units_en_cumplimiento}</dd>
              <dt className="text-muted-foreground">Sin señal</dt>
              <dd>{preview.units_sin_senal}</dd>
              <dt className="text-muted-foreground">Sin datos aún</dt>
              <dd>{preview.units_sin_datos}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Autorización</CardTitle>
          </CardHeader>
          <CardContent>
            <ConsentToggle
              associationId={association.id}
              initialConsented={consentRow?.consented ?? false}
              consentedAt={consentRow?.consented_at ?? null}
            />
            <p className="mt-4 text-xs text-muted-foreground">
              Puedes revocar esto en cualquier momento. En cuanto lo desactives, deja de
              aparecer en la vista de gobierno.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
