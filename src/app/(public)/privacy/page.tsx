'use client'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl min-h-screen">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
          Política de Privacidad
        </h1>
        <p className="text-lg text-muted-foreground">
          Vigente desde: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="text-lg leading-relaxed mb-8">
          Su privacidad es importante para nosotros. Es política de Foodies respetar su privacidad con respecto a cualquier información que podamos recopilar de usted a través de nuestro sitio web.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Información que Recopilamos</h2>
          <p className="mb-4 leading-relaxed">
            Recopilamos información personal que usted nos proporciona voluntariamente cuando se registra en el sitio web, expresa interés en obtener información sobre nosotros o nuestros productos y servicios, cuando participa en actividades en el sitio web o cuando se pone en contacto con nosotros.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Cómo Usamos su Información</h2>
          <p className="mb-4 leading-relaxed">
            Usamos la información que recopilamos o recibimos: Para facilitar la creación de cuentas y el proceso de inicio de sesión, para enviarle información administrativa, para cumplir y gestionar sus pedidos.
          </p>
        </section>
      </div>
    </div>
  )
}
