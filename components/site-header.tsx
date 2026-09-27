import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader({ email }: { email?: string | null }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-semibold">
          Bitácora
        </Link>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Panel
          </Link>
          <Link href="/consent" className="hover:text-foreground">
            Compartir
          </Link>
          <Link href="/gov" className="hover:text-foreground">
            Vista gobierno (simulada)
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {email && <span className="text-sm text-muted-foreground">{email}</span>}
        <form action="/logout" method="post">
          <Button variant="outline" size="sm" type="submit">
            Salir
          </Button>
        </form>
      </div>
    </header>
  );
}
