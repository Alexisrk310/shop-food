import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Truck, MessageCircle, AlertCircle } from 'lucide-react'

export const metadata = {
    title: 'Domicilios | Foodies Cartagena',
    description: 'Información sobre envíos y domicilios en Cartagena de Indias.',
}

export default function DomiciliosPage() {
    return (
        <main className="min-h-screen bg-background pt-24 pb-16">
            {/* Hero Section */}
            <section className="relative h-[40vh] min-h-[400px] w-full overflow-hidden flex items-center justify-center mb-16">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1619646176605-b7417fb5381f?q=80&w=2670&auto=format&fit=crop"
                        alt="Food Delivery"
                        fill
                        className="object-cover brightness-50"
                        priority
                    />
                </div>
                <div className="relative z-10 text-center px-6 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                        Domicilios <span className="text-primary">Foodies</span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
                        Llevamos el sabor directo a tu puerta con rapidez y cuidado.
                    </p>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 space-y-16">
                {/* Main Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-card border border-border/50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                            <MapPin className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Cobertura Local</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Realizamos envíos <strong>exclusivamente en Cartagena de Indias</strong>. Consulta nuestra lista de barrios para ver tarifas específicas.
                        </p>
                    </div>

                    <div className="bg-card border border-border/50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Clock className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Horarios</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            El tiempo de entrega depende de la demanda y la hora del pedido. Nos esforzamos por entregar en <strong>menos de 45 minutos</strong>.
                        </p>
                    </div>

                    <div className="bg-card border border-border/50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Truck className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Seguimiento</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Recibirás actualizaciones de tu pedido vía WhatsApp. Mantente atento a tu teléfono para recibir tu comida caliente.
                        </p>
                    </div>
                </div>

                {/* Special Notice Section */}
                <div className="bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-4 text-primary">
                                <AlertCircle className="w-6 h-6" />
                                <span className="font-bold tracking-wider uppercase text-sm">Información Importante</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                ¿Vives fuera de nuestras zonas?
                            </h2>
                            <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                                Si tu ubicación no aparece en el listado de barrios al pagar, ¡no te preocupes! Podemos coordinar un envío especial para ti.
                            </p>
                            <Link
                                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573012266530'}?text=Hola,%20quisiera%20pedir%20un%20domicilio%20para%20una%20zona%20fuera%20de%20cobertura.`}
                                target="_blank"
                                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg shadow-green-500/20"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Coordinar por WhatsApp
                            </Link>
                        </div>
                        <div className="relative w-full md:w-1/3 aspect-square max-w-[300px]">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
                            <Image
                                src="https://images.unsplash.com/photo-1542834369-f10eb5c6f355?q=80&w=2601&auto=format&fit=crop"
                                alt="Delivery Map"
                                fill
                                className="object-cover rounded-full border-4 border-white/10"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
