"use server";

import { createClient } from "@/lib/supabase/server";
import { statusForUnit, coverageSummary } from "@/lib/status";
import { revalidatePath } from "next/cache";

async function buildSnapshot(supabase: Awaited<ReturnType<typeof createClient>>, associationId: string) {
  const { data: association } = await supabase
    .from("associations")
    .select("name")
    .eq("id", associationId)
    .single();

  const { data: units } = await supabase
    .from("units")
    .select("id, expected_interval_minutes")
    .eq("association_id", associationId);

  const unitIds = (units ?? []).map((u) => u.id);
  const { data: pings } = await supabase
    .from("telemetry_pings")
    .select("unit_id, pinged_at")
    .in("unit_id", unitIds.length > 0 ? unitIds : ["00000000-0000-0000-0000-000000000000"])
    .order("pinged_at", { ascending: false });

  const lastPingByUnit = new Map<string, string>();
  for (const p of pings ?? []) {
    if (!lastPingByUnit.has(p.unit_id)) lastPingByUnit.set(p.unit_id, p.pinged_at);
  }

  const statuses = (units ?? []).map((u) =>
    statusForUnit({
      id: u.id,
      label: "",
      expected_interval_minutes: u.expected_interval_minutes,
      last_ping_at: lastPingByUnit.get(u.id) ?? null,
    }),
  );

  const summary = coverageSummary(statuses);

  // Aggregate only. No unit labels, no coordinates, no driver identity —
  // there is no driver identity field anywhere in this schema to begin with.
  return {
    association_name: association?.name ?? "Asociación",
    generated_at: new Date().toISOString(),
    total_units: summary.total,
    units_en_cumplimiento: summary.active,
    units_sin_senal: summary.silent,
    units_sin_datos: summary.unseen,
  };
}

export async function setConsent(associationId: string, consented: boolean) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("share_consents")
    .select("id")
    .eq("association_id", associationId)
    .maybeSingle();

  if (consented) {
    const snapshot = await buildSnapshot(supabase, associationId);
    if (existing) {
      const { error } = await supabase
        .from("share_consents")
        .update({ consented: true, consented_at: new Date().toISOString(), snapshot, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("share_consents").insert({
        association_id: associationId,
        consented: true,
        consented_at: new Date().toISOString(),
        snapshot,
      });
      if (error) throw error;
    }
  } else if (existing) {
    const { error } = await supabase
      .from("share_consents")
      .update({ consented: false, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
  }

  revalidatePath("/consent");
  revalidatePath("/gov");
}

export async function previewSnapshot(associationId: string) {
  const supabase = await createClient();
  return buildSnapshot(supabase, associationId);
}
