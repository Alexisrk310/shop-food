import { IProductRepository } from '@/core/domain/ports/IProductRepository'
import { Product } from '@/core/domain/entities/Product'
import { supabase } from '@/lib/supabase/client'

export class SupabaseProductRepository implements IProductRepository {

    async getProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')

        if (error) throw new Error(error.message)

        // Map Supabase data to Domain Entity
        return data.map(this.mapToEntity)
    }

    async getProductById(id: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return null

        return this.mapToEntity(data)
    }

    async getProductsByCategory(category: string): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)

        if (error) throw new Error(error.message)

        return data.map(this.mapToEntity)
    }

    async createProduct(product: Product): Promise<Product> {
        // Implementation for Admin
        return product
    }

    async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
        // Implementation for Admin
        return product as Product
    }

    async deleteProduct(id: string): Promise<boolean> {
        // Implementation for Admin
        return true
    }

    private mapToEntity(data: any): Product {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            images: data.images || [data.image_url], // Handle legacy image_url
            category: data.category,
            stock: data.stock || 0,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.created_at),

            isNew: data.is_new,
            sizes: data.stock_by_size
        }
    }
}
