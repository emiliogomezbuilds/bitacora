export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-foreground">
      <h1 className="mb-6 text-2xl font-semibold">Aviso de privacidad — Bitácora</h1>

      <p className="mb-4">
        Bitácora es un proyecto académico (Week 7, Business Bending). Este aviso describe, de
        forma simple, qué datos se usan y cómo.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-semibold">Qué guardamos</h2>
      <p className="mb-4">
        Al iniciar sesión con Google, guardamos tu correo (para identificar tu cuenta) y creamos
        una asociación de ejemplo con unidades y telemetría simulada — no datos reales de
        vehículos, rutas o personas. No se recopila información de conductores reales ni
        identidad de terceros.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-semibold">Con quién se comparte</h2>
      <p className="mb-4">
        Nada de tu información se comparte con nadie hasta que tú, explícitamente, autorizas
        compartir un resumen agregado desde la pantalla &ldquo;Compartir&rdquo; dentro de la
        aplicación. Puedes revocar esa autorización en cualquier momento.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-semibold">Contacto</h2>
      <p>
        Para preguntas sobre este proyecto: emilio.gmz.gnz@gmail.com
      </p>
    </div>
  );
}
