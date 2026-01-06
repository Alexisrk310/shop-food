'use client'

import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface InventoryAlertsProps {
  lowStock: { id: string, name: string, stock: number }[]
  outOfStock: { id: string, name: string }[]
}

export function InventoryAlerts({ lowStock, outOfStock }: InventoryAlertsProps) {
  if (lowStock.length === 0 && outOfStock.length === 0) return null

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      {outOfStock.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <h4 className="font-bold text-red-500">Sin Stock ({outOfStock.length})</h4>
          </div>
          <div className="space-y-2">
            {outOfStock.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-red-200 truncate pr-2">{item.name}</span>
                <Link href={`/dashboard/menu?search=${item.name}`} className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1">
                  Ver Todo <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h4 className="font-bold text-yellow-500">Stock Bajo ({lowStock.length})</h4>
          </div>
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-yellow-200 truncate pr-2">{item.name}</span>
                <span className="text-yellow-500 font-mono font-bold">{item.stock} restan</span>
                <Link href={`/dashboard/menu?search=${item.name}`} className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
