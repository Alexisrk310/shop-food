'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trash2, ArrowRight, Loader2 } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase/client'
import { SHIPPING_RATES, DEFAULT_SHIPPING_COST } from '@/config/shipping'
import { useRouter } from 'next/navigation'
import { isStoreOpen } from '@/lib/store-config'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, isLoading, clearCart } = useCartStore()
  const { addToast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  // Store status check
  const { isOpen, message: closedMessage } = isStoreOpen()

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'whatsapp'>('mercadopago')

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    neighborhood: '',
    city: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    // Check for user and pre-fill address
    const checkUserAndAddress = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: address } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single()

        if (address) {
          setFormData(prev => ({
            ...prev,
            name: address.recipient_name,
            phone: address.phone,
            address: address.address_line1,
            neighborhood: address.neighborhood || '',
            city: address.city,
            email: user.email || ''
          }))
        }
      }
    }
    checkUserAndAddress()
  }, [])

  // Calculate dynamic shipping cost
  const shippingCost = useMemo(() => {
    if (!formData.city) return 0
    // @ts-ignore
    return (SHIPPING_RATES[formData.city] || DEFAULT_SHIPPING_COST) as number
  }, [formData.city])

  const handleCheckout = async () => {
    if (!isOpen) {
      addToast(closedMessage || 'La tienda está cerrada', 'error')
      return
    }

    // Guest Checkout Allowed - Removed blocking check
    // if (!user) { ... }

    // Validate Form
    // Validate Form
    // 1. Basic Empty Check
    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city || !formData.phone.trim()) {
      addToast('Por favor completa todos los campos de envío', 'error')
      return
    }

    // 2. Name Validation (at least 3 chars)
    if (formData.name.trim().length < 3) {
      addToast('Por favor ingresa un nombre válido (mínimo 3 letras)', 'error')
      return
    }

    // 3. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      addToast('Por favor ingresa un correo electrónico válido', 'error')
      return
    }

    // 4. Phone Validation (Strict 10 digits for Colombia)
    const phoneRegex = /^\d{10}$/
    const cleanPhone = formData.phone.replace(/\D/g, '') // Remove non-digits for check
    if (!phoneRegex.test(cleanPhone)) {
      addToast('El teléfono debe tener exactamente 10 números (Ej: 3001234567)', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          shippingCost: shippingCost,
          paymentMethod: paymentMethod,
          metadata: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
            neighborhood: formData.neighborhood,
            notes: formData.notes,
            user_id: user?.id || null
          }
        }),
      })

      const data = await response.json()

      // Helper to save guest order
      const saveGuestOrder = (id: string) => {
        if (!user && id) {
          const currentGuests = JSON.parse(localStorage.getItem('guest_orders') || '[]')
          if (!currentGuests.includes(id)) {
            currentGuests.push(id)
            localStorage.setItem('guest_orders', JSON.stringify(currentGuests))
          }
        }
      }

      if (data.whatsapp) {
        // WhatsApp Flow
        if (data.orderId) saveGuestOrder(data.orderId)

        addToast('Redirigiendo a WhatsApp...', 'success')

        const orderIdShort = data.orderId.substring(0, 8).toUpperCase()
        const totalFormatted = formatCurrency(total() + shippingCost)

        const message = `hola, quiero confirmar mi pedido #${orderIdShort}
          
Nombre: ${formData.name}
Total: ${totalFormatted}
Método de Pago: WhatsApp (Transferencia/Contraentrega)
          
Detalles de Envío:
Dirección: ${formData.address}
Barrio: ${formData.neighborhood}
Zona: ${formData.city} (Cartagena)
Tel: ${formData.phone}
${formData.notes ? `Notas: ${formData.notes}` : ''}`

        // PHONE NUMBER: TODO replace with env
        const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573012266530'
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

        // Clear cart and redirect
        clearCart()
        // Use full page redirect to avoid popup blockers
        window.location.href = url

      } else if (data.url) {
        // Mercado Pago Flow
        if (data.orderId) saveGuestOrder(data.orderId)

        addToast('Redirigiendo a MercadoPago...', 'success')
        window.location.href = data.url
      } else {
        console.error('Checkout failed. Server response:', JSON.stringify(data, null, 2))
        const serverError = data.error || 'Error al iniciar el checkout'
        addToast(serverError, 'error')
      }
    } catch (error: any) {
      console.error('Full Checkout Error:', JSON.stringify(error, null, 2))
      addToast(`Error: ${error.message || 'Desconocido'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12">Carrito de Compras</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <span className="text-4xl">🛒</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Tu carrito está vacío</h2>
            <p className="text-muted-foreground max-w-md">
              Parece que aún no has agregado nada delicioso a tu carrito. ¡Explora nuestro menú y encuentra algo que te encante!
            </p>
            <Link href="/catalogo" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white transition-colors bg-primary rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Volver al Menú
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.id}-${item.size}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 rounded-2xl bg-card border border-border/50 shadow-sm"
                >
                  <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.image_url || '/placeholder.jpg'}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between gap-4 sm:gap-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                          <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs font-mono uppercase">
                            Tamaño: {item.size || 'Estándar'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-md transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-md transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-lg">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Checkout & Shipping Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                {/* Shipping Info */}
                <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-xl">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Información de Envío
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Nombre Completo</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        placeholder="ejemplo@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Dirección</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none mb-2"
                        placeholder="Dirección de entrega"
                      />
                      <input
                        type="text"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        placeholder="Barrio"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Barrio</label>
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        >
                          <option value="">Selecciona tu barrio</option>
                          {Object.keys(SHIPPING_RATES).map(zone => (
                            <option key={zone} value={zone}>{zone} - ${SHIPPING_RATES[zone].toLocaleString()}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-muted-foreground mt-1">Solo envíos en Cartagena, Bolívar</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Teléfono</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            // Only allow numbers
                            const val = e.target.value.replace(/\D/g, '')
                            if (val.length <= 10) {
                              setFormData({ ...formData, phone: val })
                            }
                          }}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          placeholder="3001234567"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kitchen Instructions */}
                <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-xl">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Notas del Pedido
                  </h2>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none h-24 resize-none"
                    placeholder="Ej: Sin cebolla, salsa aparte, servilletas extra..."
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-xl leading-relaxed">
                  <h2 className="text-xl font-bold mb-4">Método de Pago</h2>

                  <div className="space-y-3">
                    {/* Mercado Pago */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden ${paymentMethod === 'mercadopago' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="mercadopago"
                        checked={paymentMethod === 'mercadopago'}
                        onChange={() => setPaymentMethod('mercadopago')}
                        className="w-5 h-5 accent-primary z-10"
                      />
                      <div className="flex-1 z-10">
                        <span className="font-bold text-foreground block">Mercado Pago</span>
                        <span className="text-xs text-muted-foreground">Tarjetas de crédito, débito, PSE (Pagos seguros)</span>
                      </div>
                    </label>

                    {/* WhatsApp */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden ${paymentMethod === 'whatsapp' ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm' : 'border-border bg-card'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="whatsapp"
                        checked={paymentMethod === 'whatsapp'}
                        onChange={() => setPaymentMethod('whatsapp')}
                        className="w-5 h-5 accent-[#25D366] z-10"
                      />
                      <div className="flex-1 z-10">
                        <span className="font-bold text-foreground block">Pagar por WhatsApp</span>
                        <span className="text-xs text-muted-foreground">Finaliza tu compra directamente con un asesor (Transferencia / Contraentrega)</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-xl">
                  <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(total())}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Envío</span>
                      <span className={!formData.city ? 'text-xs italic' : ''}>
                        {formData.city
                          ? formatCurrency(shippingCost)
                          : 'Selecciona ciudad'
                        }
                      </span>
                    </div>
                    <div className="border-t border-border/50 pt-4 flex justify-between font-bold text-xl">
                      <span>Total a Pagar</span>
                      <span>{formatCurrency(total() + shippingCost)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className={`w-full font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white
                    ${paymentMethod === 'whatsapp'
                        ? 'bg-[#25D366] shadow-[#25D366]/25'
                        : 'bg-gradient-to-r from-primary to-accent shadow-primary/25'
                      }
                  `}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : paymentMethod === 'whatsapp' ? (
                      <>
                        Pedir por WhatsApp <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        Pagar con MercadoPago <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    {paymentMethod === 'mercadopago'
                      ? 'Pagos procesados de forma segura por MercadoPago'
                      : 'Serás redirigido a WhatsApp para coordinar el pago'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
