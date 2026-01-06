export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
    // Optional specific fields

    isNew?: boolean;

    sizes?: Record<string, { price: number; stock: number; sale_price?: number }>;
}


