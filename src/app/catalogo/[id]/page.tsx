import { createClient } from '@/lib/supabase/server'
import { Metadata, ResolvingMetadata } from 'next'
import ProductDetailsClient from '@/components/shop/ProductDetailsClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params

  // Fetch data for SEO
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url, images')
    .eq('id', id)
    .single()

  if (!product) {
    return {
      title: 'Producto No Encontrado | Foodies',
      description: 'El plato solicitado no se pudo encontrar.',
    }
  }

  // Get previous images (e.g. site logo)
  const previousImages = (await parent).openGraph?.images || []

  // Prepare product images
  const productImages = product.images && product.images.length > 0
    ? product.images
    : [product.image_url]

  return {
    title: product.name,
    description: product.description || `Pide ${product.name} en Foodies.`,
    openGraph: {
      title: `${product.name} - Foodies`,
      description: product.description || `Disfruta ${product.name} ahora.`,
      images: [...productImages, ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Get ${product.name} now.`,
      images: productImages,
    }
  }
}

export default async function ProductPage({ params }: Props) {
  // We don't strictly need to fetch data here if the Client Component fetches it too,
  // but to prevent a "flash" we could pre-fetch. 
  // For now, we'll keep the pattern simple: 
  // Server Component handles SEO -> Client Component handles content+interactive state.

  // IMPORTANT: The id param is awaited in Next.js 15+ for params
  const { id } = await params;

  return <ProductDetailsClient />
}
