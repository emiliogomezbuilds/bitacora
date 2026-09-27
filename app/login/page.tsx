"use client";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Bitácora</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tu propio registro de cobertura y cumplimiento, antes que nadie más lo vea.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={signInWithGoogle} disabled={loading}>
            {loading ? "Conectando..." : "Entrar con Google"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">
            Al entrar, creamos tu propia asociación de ruta. Nadie más ve tus unidades ni tu
            telemetría hasta que tú decidas compartir un resumen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
