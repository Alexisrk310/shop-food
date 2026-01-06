import { Product } from '../entities/Product'

export interface IProductRepository {
    getProducts(): Promise<Product[]>
    getProductById(id: string): Promise<Product | null>
    getProductsByCategory(category: string): Promise<Product[]>
    createProduct(product: Product): Promise<Product>
    updateProduct(id: string, product: Partial<Product>): Promise<Product>
    deleteProduct(id: string): Promise<boolean>
}
