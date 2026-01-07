import React from 'react'
import { SHIPPING_RATES } from '@/config/shipping'
import { MapPin } from 'lucide-react'

// Format price helper
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(price)
}

export const metadata = {
    title: 'Zonas de Cobertura | Foodies Cartagena',
    description: 'Consulta nuestras zonas de cobertura y tarifas de domicilio en Cartagena.',
}

export default function ZonasCoberturaPage() {
    // Sort zones by price for nice display
    const sortedZones = Object.entries(SHIPPING_RATES)
        .filter(([name]) => name !== 'Recogida en Local')
        .sort((a, b) => a[1] - b[1])

    return (
        <main className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight">
                        Zonas de <span className="text-primary">Cobertura</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Llegamos a gran parte de Cartagena. Encuentra tu barrio y conoce la tarifa de envío.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sortedZones.map(([zone, price]) => (
                        <div key={zone} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors group shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-lg">{zone}</span>
                            </div>
                            <span className="font-bold text-lg bg-secondary px-3 py-1 rounded-lg">
                                {price === 0 ? 'Gratis' : formatPrice(price)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center p-8 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <p className="text-muted-foreground">
                        ¿No encuentras tu barrio? Escríbenos a <span className="font-bold text-foreground">WhatsApp</span> para consultar disponibilidad.
                    </p>
                </div>
            </div>
        </main>
    )
}
