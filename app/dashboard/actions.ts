"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const SEED_UNITS = 12;
// A small jitter box around Naucalpan, Edomex — the packet's named example
// market. Purely illustrative coordinates, no real route geometry.
const CENTER = { lat: 19.4784, lng: -99.2394 };

export async function ensureAssociationAndUnits() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión.");

  const { data: existing } = await supabase
    .from("associations")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  let associationId = existing?.id;

  if (!associationId) {
    const { data: created, error } = await supabase
      .from("associations")
      .insert({ owner_id: user.id, name: "Ruta 11 (asociación de ejemplo)" })
      .select("id")
      .single();
    if (error) throw error;
    associationId = created.id;

    const units = Array.from({ length: SEED_UNITS }, (_, i) => ({
      association_id: associationId,
      label: `Unidad ${i + 1}`,
      expected_interval_minutes: 5,
    }));
    const { error: unitsError } = await supabase.from("units").insert(units);
    if (unitsError) throw unitsError;
  }

  return associationId as string;
}

export async function simulateAllPings(associationId: string) {
  const supabase = await createClient();
  const { data: units, error } = await supabase
    .from("units")
    .select("id")
    .eq("association_id", associationId);
  if (error) throw error;

  // 90% of units ping normally (small jitter near the association's center).
  // The rest are deliberately skipped this round so the dashboard has a real
  // "sin señal" example to show, instead of a demo that always looks perfect.
  const pings = (units ?? [])
    .filter(() => Math.random() > 0.1)
    .map((u) => ({
      unit_id: u.id,
      lat: CENTER.lat + (Math.random() - 0.5) * 0.02,
      lng: CENTER.lng + (Math.random() - 0.5) * 0.02,
    }));

  if (pings.length > 0) {
    const { error: pingError } = await supabase.from("telemetry_pings").insert(pings);
    if (pingError) throw pingError;
  }

  revalidatePath("/dashboard");
}

export async function simulateOnePing(unitId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("telemetry_pings").insert({
    unit_id: unitId,
    lat: CENTER.lat + (Math.random() - 0.5) * 0.02,
    lng: CENTER.lng + (Math.random() - 0.5) * 0.02,
  });
  if (error) throw error;
  revalidatePath("/dashboard");
}
