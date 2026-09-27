"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setConsent } from "./actions";

export function ConsentToggle({
  associationId,
  initialConsented,
  consentedAt,
}: {
  associationId: string;
  initialConsented: boolean;
  consentedAt: string | null;
}) {
  const [consented, setConsentedState] = useState(initialConsented);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !consented;
    startTransition(async () => {
      await setConsent(associationId, next);
      setConsentedState(next);
    });
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <Badge variant={consented ? "success" : "outline"}>
          {consented ? "Compartiendo actualmente" : "No se comparte nada"}
        </Badge>
        {consented && consentedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Autorizado el {new Date(consentedAt).toLocaleString("es-MX")}
          </p>
        )}
      </div>
      <Button variant={consented ? "destructive" : "default"} disabled={pending} onClick={toggle}>
        {pending ? "Guardando..." : consented ? "Revocar" : "Autorizar y compartir"}
      </Button>
    </div>
  );
}
