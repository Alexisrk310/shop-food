import React from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react'

export const metadata = {
    title: 'Contáctanos | Foodies Cartagena',
    description: 'Ponte en contacto con nosotros. Estamos listos para atenderte.',
}

export default function ContactanosPage() {
    return (
        <main className="min-h-screen bg-background pt-24 pb-16">
            {/* Header */}
            <div className="text-center mb-16 space-y-4 px-6">
                <h1 className="text-5xl font-extrabold tracking-tight">
                    Estamos Aquí <span className="text-primary">Para Ti</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    ¿Tienes alguna pregunta, sugerencia o simplemente quieres saludar? Nos encantaría escucharte.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="bg-card border border-border/50 p-8 rounded-3xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Ubicación</h3>
                                    <p className="text-muted-foreground">Cartagena de Indias, Colombia</p>
                                    <p className="text-sm text-muted-foreground/80 mt-1">Sede Principal: Bocagrande, Av. San Martín #5-23</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Llámanos</h3>
                                    <p className="text-muted-foreground">+57 300 987 6543</p>
                                    <p className="text-sm text-muted-foreground/80 mt-1">Lun - Dom: 11:00 AM - 10:00 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Escríbenos</h3>
                                    <p className="text-muted-foreground">hola@foodies.com.co</p>
                                    <p className="text-sm text-muted-foreground/80 mt-1">Respondemos en menos de 24 horas.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border/50 p-8 rounded-3xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">Redes Sociales</h2>
                        <div className="flex gap-4">
                            <Link href="#" className="flex-1 py-4 bg-[#1877F2]/10 text-[#1877F2] rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#1877F2] hover:text-white transition-all group">
                                <Facebook className="w-6 h-6" />
                                <span className="font-bold text-sm">@foodies_ctg</span>
                            </Link>
                            <Link href="#" className="flex-1 py-4 bg-[#E4405F]/10 text-[#E4405F] rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#E4405F] hover:text-white transition-all group">
                                <Instagram className="w-6 h-6" />
                                <span className="font-bold text-sm">@foodies.cartagena</span>
                            </Link>
                            <Link href="#" className="flex-1 py-4 bg-black/5 text-black dark:text-white dark:bg-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group">
                                {/* X Logo simulation with Lucide Twitter or just text */}
                                <Twitter className="w-6 h-6" />
                                <span className="font-bold text-sm">@foodies_co</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Action Card */}
                <div className="bg-gradient-to-br from-primary to-orange-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/20">
                            <MessageCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                            ¿Prefieres Chat?
                        </h2>
                        <p className="text-white/90 text-lg mb-8 leading-relaxed">
                            Gestiona tu pedido, consulta el estado o resuelve dudas al instante a través de nuestro WhatsApp oficial.
                        </p>
                        <Link
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573012266530'}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-zinc-100 transition-transform hover:scale-105 shadow-lg"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Chatear Ahora
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    )
}
