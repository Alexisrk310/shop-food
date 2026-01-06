'use client'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl min-h-screen">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
          Términos y Condiciones
        </h1>
        <p className="text-lg text-muted-foreground">
          Última actualización: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Introducción</h2>
          <p className="mb-4 leading-relaxed">
            Bienvenido a Foodies. Al acceder a nuestro sitio web, aceptas estar obligado por estos términos de servicio, todas las leyes y regulaciones aplicables, y aceptas que eres responsable del cumplimiento de las leyes locales aplicables.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Pagos y Facturación</h2>
          <p className="mb-4 leading-relaxed">
            Aceptamos varios métodos de pago. Al proporcionar información de pago, declaras y garantizas que la información es precisa y que estás autorizado a utilizar el método de pago seleccionado.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Contacto</h2>
          <p className="leading-relaxed">
            Si tienes alguna pregunta sobre estos Términos, por favor contáctanos.
          </p>
        </section>
      </div>
    </div>
  )
}
