'use client'

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl min-h-screen">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
          Política de Devoluciones
        </h1>
        <p className="text-lg text-muted-foreground">
          Nuestra garantía de satisfacción
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Garantía de Calidad</h2>
          <p className="leading-relaxed">
            Si no estás completamente satisfecho con tu pedido, por favor contáctanos inmediatamente. Nos esforzamos por asegurar que cada comida cumpla con nuestros altos estándares de calidad.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Condiciones</h2>
          <p className="leading-relaxed">
            Debido a la naturaleza perecedera de nuestros productos, no podemos aceptar devoluciones de alimentos. Sin embargo, si hubo un error en tu pedido o problemas de calidad, emitiremos un reembolso o reemplazo según corresponda.
          </p>
        </section>
      </div>
    </div>
  )
}
