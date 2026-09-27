import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <h1 className="mb-3 text-3xl font-semibold">Bitácora</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        La ruta ya se mide. La pregunta es quién ve ese registro primero. Bitácora le da a tu
        asociación su propio panel de cobertura y cumplimiento, antes que cualquier autoridad.
      </p>
      <Button asChild>
        <Link href="/login">Entrar</Link>
      </Button>
    </div>
  );
}
