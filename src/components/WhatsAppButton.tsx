'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Show after a delay for a smoother entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center pr-2">
          {/* Tooltip / Label */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                className="mr-4 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 px-4 py-2 rounded-xl shadow-xl font-medium text-sm whitespace-nowrap border border-zinc-100 dark:border-zinc-700 hidden md:block"
              >
                ¿Necesitas ayuda? ¡Contáctanos!
              </motion.div>
            )}
          </AnimatePresence>

          <motion.a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573012266530'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group flex items-center justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 0 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulse Rings */}
            <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping duration-[3000ms] delay-75"></span>
            <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping duration-[3000ms] delay-500"></span>

            {/* Main Button */}
            <div className={`
              w-16 h-16 rounded-full 
              bg-gradient-to-tr from-[#25D366] to-[#128C7E]
              shadow-[0_8px_30px_rgb(37,211,102,0.4)]
              flex items-center justify-center
              text-white
              transition-shadow duration-300
              group-hover:shadow-[0_8px_40px_rgb(37,211,102,0.6)]
            `}>
              <MessageCircle className="w-8 h-8 fill-white/20" />
            </div>

            {/* Notification Badge */}
            <motion.div
              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md border-2 border-white dark:border-zinc-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.5, type: "spring" }}
            >
              1
            </motion.div>
          </motion.a>
        </div>
      )}
    </AnimatePresence>
  )
}
