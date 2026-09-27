"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { simulateAllPings } from "./actions";

export function SimulateButton({ associationId }: { associationId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() => startTransition(() => simulateAllPings(associationId))}
    >
      {pending ? "Simulando..." : "Simular ronda de avisos"}
    </Button>
  );
}
