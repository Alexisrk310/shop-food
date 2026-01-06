import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StoreConfigState {
  storeName: string
  storeType: 'clothing' | 'restaurant' | 'tech' | 'other'
  currency: string
  setStoreName: (name: string) => void
  setStoreType: (type: 'clothing' | 'restaurant' | 'tech' | 'other') => void
}

export const useStoreConfig = create<StoreConfigState>()(
  persist(
    (set) => ({
      storeName: 'NEXUS STORE',
      storeType: 'clothing',
      currency: 'USD',
      setStoreName: (name) => set({ storeName: name }),
      setStoreType: (type) => set({ storeType: type }),
    }),
    {
      name: 'store-config',
    }
  )
)
