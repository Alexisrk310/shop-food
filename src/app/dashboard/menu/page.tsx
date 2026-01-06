'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Loader2, Search, Upload, X, Image as ImageIcon, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { TableSkeleton } from '@/components/dashboard/skeletons'
// import { useLanguage } from '@/components/LanguageProvider'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  sale_price?: number
  description: string
  category: string
  images: string[]
  is_featured?: boolean
  reviews?: { rating: number }[]
  sizes?: string[]
  stock_by_size?: Record<string, { price: number; stock: number | null; sale_price?: number }>
  stock?: number | null
}

export default function ProductsPage() {
  //   const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')


  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sale_price: '',
    description: '',
    category: '',
    is_featured: false,
    images: [] as string[],
    enableSizes: false,
    sizes: [] as { id: string; name: string; price: string; stock: string; sale_price: string }[],
    stock: '' // Add stock field
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [tempColor, setTempColor] = useState('#000000')

  useEffect(() => {
    fetchProducts()
  }, [])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isModalOpen])

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*, reviews(rating)')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setProducts(data as unknown as Product[])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImageFiles(prev => [...prev, ...files])

      const newPreviews = files.map(file => URL.createObjectURL(file))
      setImagePreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    const urls: string[] = []

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      urls.push(data.publicUrl)
    }

    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const uploadedImages = await uploadImages()
      const allImages = [...formData.images, ...uploadedImages]

      // Prepare Sizes Payload
      let stock_by_size: Record<string, any> = {}
      if (formData.enableSizes) {
        formData.sizes.forEach((size) => {
          if (size.name && size.price) { // Only add if name and price are set
            stock_by_size[size.name] = {
              price: parseFloat(size.price),
              stock: size.stock ? parseInt(size.stock) : null, // empty or null means unlimited
              sale_price: size.sale_price ? parseFloat(size.sale_price) : undefined
            }
          }
        })
      }

      const payload = {
        name: formData.name,
        // Ensure price is never null. If sizes enabled, take lowest price from sizes or default 0.
        price: formData.enableSizes
          ? (Object.values(stock_by_size).length > 0
            ? Math.min(...Object.values(stock_by_size).map((s: any) => s.price))
            : 0)
          : parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        description: formData.description,
        category: formData.category,

        is_featured: formData.is_featured,
        images: allImages,
        stock_by_size: Object.keys(stock_by_size).length > 0 ? stock_by_size : null,
        // For simple products, save stock if sizes are disabled.
        // If enableSizes is true, stock should be null (managed by stock_by_size potentially, or ignored).
        // Actually if sizes are enabled, main stock is usually ignored or sum of sizes.
        // Let's explicitly set it.
        stock: !formData.enableSizes ? (formData.stock ? parseInt(formData.stock) : null) : null
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload)

        if (error) throw error
      }

      await fetchProducts()
      setIsModalOpen(false)
      resetForm()
    } catch (error: any) {
      console.error('Error saving product:', error?.message || error)
      alert(`Error al guardar el producto: ${error?.message || 'Error desconocido'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      sale_price: '',
      description: '',
      category: '',
      is_featured: false,
      images: [],
      enableSizes: false,
      sizes: [],
      stock: ''
    })
    setImageFiles([])
    setImagePreviews([])
    setEditingProduct(null)
  }

  const openModal = (product: Product | null = null) => {
    setEditingProduct(product)
    if (product) {
      // @ts-ignore
      const existingSizes = product.stock_by_size || product.sizes || {};
      const hasSizes = Object.keys(existingSizes).length > 0;
      let parsedSizes: any[] = [];

      if (hasSizes) {
        // Handle array case if it's legacy 'sizes' array of strings, we need to convert to object structure conceptually or just ignore?
        // Actually product.sizes is string[]. product.stock_by_size is JSON.
        // If stock_by_size exists, use it.
        if (product.stock_by_size && Object.keys(product.stock_by_size).length > 0) {
          parsedSizes = Object.entries(product.stock_by_size).map(([name, detail]: [string, any]) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            price: detail.price?.toString() || '',
            stock: detail.stock?.toString() || '',
            sale_price: detail.sale_price?.toString() || ''
          }));
        } else if (Array.isArray(product.sizes) && product.sizes.length > 0) {
          // Fallback for legacy simple sizes array
          parsedSizes = product.sizes.map(size => ({
            id: Math.random().toString(36).substr(2, 9),
            name: size,
            price: product.price?.toString() || '', // Inherit base price
            stock: '',
            sale_price: ''
          }));
        }
      }

      setFormData({
        name: product.name,
        price: product.price?.toString() || '',
        sale_price: product.sale_price ? product.sale_price.toString() : '',
        description: product.description || '',
        category: product.category || '',
        is_featured: product.is_featured || false,
        images: product.images || [],
        enableSizes: hasSizes,
        sizes: parsedSizes,
        stock: product.stock !== null && product.stock !== undefined ? product.stock.toString() : ''
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const getAverageRating = (product: Product) => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    const sum = product.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / product.reviews.length;
  }

  const filteredProducts = products.filter(p => {
    const avgRating = getAverageRating(p)

    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory ? p.category === filterCategory : true
    return matchesSearch && matchesCategory
  })

  const handleDeleteAll = async () => {
    try {
      setLoading(true)
      // Delete all products by selecting those where id is not the nil UUID
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) throw error

      await fetchProducts()
      setIsDeleteModalOpen(false)
      toast.success('Todos los productos han sido eliminados correctamente.')
    } catch (error: any) {
      console.error('Error deleting all products:', error)
      toast.error('Error al eliminar productos: ' + (error.message || error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Menú
          </h1>
          <p className="text-muted-foreground mt-1">Gestiona tu catálogo de platos y bebidas</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-lg shadow-red-500/20 hover:scale-105 font-medium"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">Eliminar Todo</span>
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/25 font-medium"
          >
            <Plus className="w-5 h-5" />
            Agregar Comida
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar platos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todas las Categorías</option>
            <option value="Hamburguesas">Hamburguesas</option>
            <option value="Perros Calientes">Perros Calientes</option>
            <option value="Acompañamientos">Acompañamientos</option>
            <option value="Bebidas">Bebidas</option>
          </select>

        </div>
      </div>

      {/* Table */}
      {/* Table & Cards */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">Plato</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">Categoría</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">Precio</th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">Calificación</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            {product.images[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{product.category}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        ${product.price}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {(() => {
                          const avg = getAverageRating(product);
                          return avg > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold">{avg.toFixed(1)}</span>
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              <span className="text-[10px] text-muted-foreground">({product.reviews?.length})</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sin reseñas</span>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {product.images[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal(product)}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">{product.category}</p>
                  </div>

                  <div className="flex items-center justify-between mt-1">

                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
                <h2 className="text-xl font-bold">
                  {editingProduct ? 'Editar Plato' : 'Agregar Comida'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left Column: Media (5 cols) */}
                  <div className="md:col-span-5 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Imágenes del Plato</label>
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/5">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer block">
                          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm font-medium">Clic para subir imágenes</p>
                          <p className="text-xs text-muted-foreground mt-1">Máximo 5 imágenes</p>
                        </label>
                      </div>
                    </div>

                    {/* Image Previews */}
                    {(formData.images.length > 0 || imagePreviews.length > 0) && (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.images.map((url, i) => (
                          <div key={`existing-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                            <Image src={url} alt="" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {imagePreviews.map((preview, i) => (
                          <div key={`preview-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-primary">
                            <img src={preview} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Details (7 cols) */}
                  <div className="md:col-span-7 space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nombre del Plato</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Hamburguesa Doble Carne"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Descripción</label>
                      <textarea
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descripción"
                      />
                    </div>

                    {/* Pricing Row - Hidden if Sizes Enabled */}
                    {/* Sizes Management Toggle - Moved before Price */}
                    <div className="pt-2"> {/* Removed border-t to fit better here */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="enable-sizes"
                            checked={formData.enableSizes}
                            onChange={e => {
                              const isEnabled = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                enableSizes: isEnabled,
                                // If enabling and empty, add a default row
                                sizes: isEnabled && prev.sizes.length === 0
                                  ? [{ id: Date.now().toString(), name: 'Personal', price: '', stock: '', sale_price: '' }]
                                  : prev.sizes
                              }))
                            }}
                            className="w-5 h-5 rounded border-border accent-primary cursor-pointer"
                          />
                          <label htmlFor="enable-sizes" className="font-semibold cursor-pointer select-none">
                            Gestionar Tamaños
                          </label>
                        </div>
                        {formData.enableSizes && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              sizes: [...prev.sizes, { id: Date.now().toString(), name: '', price: '', stock: '', sale_price: '' }]
                            }))}
                            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar Tamaño
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pricing Row - Hidden if Sizes Enabled */}
                    {!formData.enableSizes ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Precio</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <input
                              type="number"
                              required
                              className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                              value={formData.price}
                              onChange={e => setFormData({ ...formData, price: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Precio de Oferta</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <input
                              type="number"
                              className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                              value={formData.sale_price}
                              onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        {/* Stock for Simple Products */}
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-sm font-semibold mb-2">Stock (Opcional)</label>
                          <input
                            type="number"
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                            value={(formData as any).stock || ''}
                            onChange={e => setFormData({ ...formData, stock: e.target.value } as any)}
                            placeholder="Ilimitado"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">Dejar vacío para stock ilimitado</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.sizes.map((size, index) => (
                          <div key={size.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/20 border border-border/50 rounded-xl">
                            <div className="col-span-4 md:col-span-3">
                              <label className="block text-xs font-semibold mb-1">Nombre</label>
                              <input
                                type="text"
                                placeholder="Ej: Mediano"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={size.name}
                                onChange={e => {
                                  const newSizes = [...formData.sizes]
                                  newSizes[index].name = e.target.value
                                  setFormData({ ...formData, sizes: newSizes })
                                }}
                              />
                            </div>
                            <div className="col-span-4 md:col-span-3">
                              <label className="block text-xs font-semibold mb-1">Precio</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  className="w-full bg-background border border-border rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  value={size.price}
                                  onChange={e => {
                                    const newSizes = [...formData.sizes]
                                    newSizes[index].price = e.target.value
                                    setFormData({ ...formData, sizes: newSizes })
                                  }}
                                />
                              </div>
                            </div>
                            <div className="col-span-4 md:col-span-3">
                              <label className="block text-xs font-semibold mb-1">Stock</label>
                              <input
                                type="number"
                                placeholder="Ilimitado"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={size.stock}
                                onChange={e => {
                                  const newSizes = [...formData.sizes]
                                  newSizes[index].stock = e.target.value
                                  setFormData({ ...formData, sizes: newSizes })
                                }}
                              />
                            </div>
                            <div className="col-span-12 md:col-span-2 flex justify-end md:justify-center pb-1">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }))}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Eliminar tamaño"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {formData.sizes.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                            <p>No hay tamaños agregados</p>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                sizes: [...prev.sizes, { id: Date.now().toString(), name: 'Estándar', price: '', stock: '', sale_price: '' }]
                              }))}
                              className="text-primary hover:underline mt-2 text-sm"
                            >
                              Agregar el primer tamaño
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Meta Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Categoría</label>
                        <select
                          required
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option value="">Seleccionar Categoría</option>
                          <option value="Hamburguesas">Hamburguesas</option>
                          <option value="Perros Calientes">Perros Calientes</option>
                          <option value="Acompañamientos">Acompañamientos</option>
                          <option value="Bebidas">Bebidas</option>
                          <option value="Combos">Combos</option>
                        </select>
                      </div>

                    </div>

                    {/* Favorito de la Casa Only */}
                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is-featured"
                          checked={formData.is_featured}
                          onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                          className="w-5 h-5 rounded border-border accent-primary cursor-pointer"
                        />
                        <label htmlFor="is-featured" className="text-sm font-medium cursor-pointer select-none">
                          Favorito de la Casa
                        </label>
                      </div>
                    </div>



                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted/50 font-semibold transition-all"
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </span>
                    ) : (editingProduct ? 'Guardar Cambios' : 'Crear Comida')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-border shadow-xl rounded-2xl p-6 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">¿Eliminar todos los productos?</h3>
                  <p className="text-muted-foreground text-sm">
                    Esta acción no se puede deshacer. Se eliminarán permanentemente todos los productos de tu menú.
                  </p>
                </div>

                <div className="flex gap-3 w-full pt-4">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Eliminando...
                      </span>
                    ) : 'Sí, Eliminar Todo'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
