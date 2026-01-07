import { NextResponse } from 'next/server';
import { createPreference } from '@/lib/mercadopago';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '@/lib/dashboard-logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
    try {
        const { items, metadata, total, shippingCost, paymentMethod } = await req.json();

        // Metadata contains: { name, email, phone, city, address, neighborhood, user_id }

        // Validate Email basic format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (metadata?.email && !emailRegex.test(metadata.email)) {
            return NextResponse.json({ error: 'validation.email_invalid' }, { status: 400 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'cart.empty_error' }, { status: 400 });
        }

        // Only check MP token if NOT whatsapp
        if (paymentMethod !== 'whatsapp' && !process.env.MERCADO_PAGO_ACCESS_TOKEN) {
            console.error("Missing MERCADO_PAGO_ACCESS_TOKEN")
            return NextResponse.json({ error: 'error.config_missing' }, { status: 500 });
        }

        // Use Admin Client for Order Creation to bypass RLS if needed, or stick to Anon if policies allow.
        // Ideally Service Role ensures we can always write orders even if user is guest?
        // Guest RLS usually allows INSERT if policies are set right. 
        // Let's use Service Role to be SAFE against "Order Not Found" issues due to RLS.
        const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

        // --- Server-Side Validation & Price Enforcement ---
        const validatedItems: any[] = [];
        let calculatedSubtotal = 0;
        const orderItemsData: any[] = [];
        const orderId = uuidv4();

        for (const item of items) {
            if (item.id === 'shipping') {
                // Skip shipping in item validation loop, handle separately
                continue;
            }

            if (!item.id || !item.quantity) continue;

            const { data: product, error } = await supabase
                .from('products')
                .select('stock, stock_by_size, name, price, sale_price, description, category')
                .eq('id', item.id)
                .single();

            if (error || !product) {
                console.error(`Product validation failed for ${item.id}`, error);
                return NextResponse.json({ error: 'product.not_found_dynamic', params: { item: item.title || 'Unknown' } }, { status: 400 });
            }

            let availableStock = product.stock;
            let finalPrice = product.sale_price || product.price;

            // Handle Size-specific Stock/Price
            if (item.size && product.stock_by_size) {
                console.log(`[Checkout Debug] Processing Size: "${item.size}" for Product: "${product.name}"`);
                const availableKeys = Object.keys(product.stock_by_size);
                console.log(`[Checkout Debug] Stock By Size keys available:`, availableKeys);

                // Try exact match
                let sizeData = product.stock_by_size[item.size];

                // Try Case-Insensitive Match if not found
                if (!sizeData) {
                    const lowerSize = item.size.toLowerCase();
                    const matchedKey = availableKeys.find(k => k.toLowerCase() === lowerSize);
                    if (matchedKey) {
                        console.log(`[Checkout Debug] Found case-insensitive match: "${matchedKey}" for "${item.size}"`);
                        sizeData = product.stock_by_size[matchedKey];
                    }
                }

                console.log(`[Checkout Debug] Size Data found:`, sizeData);

                if (typeof sizeData === 'number') {
                    availableStock = sizeData;
                } else if (sizeData && typeof sizeData === 'object') {
                    // @ts-ignore
                    availableStock = sizeData.stock ?? 0;
                    // @ts-ignore
                    if (sizeData.sale_price) finalPrice = sizeData.sale_price;
                    // @ts-ignore
                    else if (sizeData.price) finalPrice = sizeData.price;
                } else {
                    console.log(`[Checkout Debug] Size "${item.size}" NOT found in stock_by_size. Keys: [${availableKeys.join(', ')}]. Falling back to global stock: ${product.stock}`);
                }
            } else {
                console.log(`[Checkout Debug] No size selected or no stock_by_size. Using global stock: ${product.stock}`);
            }

            // Fallback for null stock
            if (availableStock === null || availableStock === undefined) {
                console.log(`[Checkout Debug] Available stock was null/undefined, treating as UNLIMITED (999999)`);
                availableStock = 999999;
            }

            console.log(`[Checkout Debug] Final Check -> Item Quantity: ${item.quantity}, Available: ${availableStock}`);

            if (availableStock < item.quantity) {
                console.error(`[Checkout Debug] validation failed. Stock: ${availableStock} < Qty: ${item.quantity}`);
                return NextResponse.json({
                    error: 'cart.error_stock_dynamic',
                    params: { product: product.name, stock: availableStock },
                    debug_info: {
                        product: product.name,
                        requested_size: item.size,
                        available_stock_resolved: availableStock,
                        available_sizes_in_db: product.stock_by_size ? Object.keys(product.stock_by_size) : 'No sizes',
                        global_stock: product.stock
                    }
                }, { status: 400 });
            }

            // Price already calculated above as finalPrice
            calculatedSubtotal += finalPrice * item.quantity

            // Prepare Item for MP
            validatedItems.push({
                id: item.id,
                name: product.name,
                description: product.description?.substring(0, 250),
                category_id: product.category,
                quantity: Number(item.quantity),
                price: Number(finalPrice),
            });

            // Prepare Item for DB
            orderItemsData.push({
                order_id: orderId,
                product_id: item.id,
                quantity: item.quantity,
                price_at_time: finalPrice,
                size: item.size || 'Estándar' // We need size passed from client item
            });
        }

        // Use passed shipping cost (trusting client for now as it depends on city which we have)
        // Ideally verify city matches cost.
        const trustedShippingCost = Number(shippingCost) || 0;
        const finalTotal = calculatedSubtotal + trustedShippingCost;

        // --- CREATE ORDER IN DB ---
        const { name, email, phone, city, address, neighborhood, user_id, notes } = metadata || {};
        const fullAddress = neighborhood ? `${address}, ${neighborhood}` : address;
        const addressWithNotes = notes ? `${fullAddress} || NOTAS: ${notes}` : fullAddress;

        // 1. Insert Order
        const { error: insertError } = await supabase
            .from('orders')
            .insert({
                id: orderId,
                user_id: user_id || null,
                status: 'pending',
                total: finalTotal,
                customer_name: name,
                customer_email: email,
                shipping_address: addressWithNotes,
                city: city,
                phone: phone,
                shipping_cost: trustedShippingCost,
                payment_method: paymentMethod || 'mercadopago'
                // language? We can pass it in metadata if needed
            });

        if (insertError) {
            console.error('DB Insert Order Error:', insertError);
            return NextResponse.json({
                error: 'checkout.error.create_order',
                details: insertError,
                message: insertError.message,
                hint: insertError.hint
            }, { status: 500 });
        }

        // 2. Insert Items
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData);

        if (itemsError) {
            console.error('DB Insert Items Error:', itemsError);
            return NextResponse.json({
                error: 'checkout.error.create_items',
                details: itemsError,
                message: itemsError.message,
                hint: itemsError.hint
            }, { status: 500 });
        }

        console.log(`Order ${orderId} created successfully. Payment Method: ${paymentMethod}`);

        // Log Activity for Dashboard
        await logActivity(
            'NEW_ORDER',
            `Nuevo pedido de ${name || 'Cliente'} ($${finalTotal})`,
            { order_id: orderId, total: finalTotal, customer: name || 'Cliente' }
        );

        // Handle WhatsApp Payment immediately
        if (paymentMethod === 'whatsapp') {
            return NextResponse.json({ orderId: orderId, whatsapp: true });
        }

        // 3. Create Preference (Mercado Pago)
        console.log('Generating MP Preference...');

        // Add shipping as item for MP if needed, or let MP handle logic. 
        // We didn't add shipping to validatedItems loop. Let's add it now.
        if (trustedShippingCost > 0) {
            validatedItems.push({
                id: 'shipping',
                name: 'Costo de envío',
                quantity: 1,
                price: trustedShippingCost
            });
        }

        const preference = await createPreference(validatedItems, orderId);

        return NextResponse.json({ url: preference.init_point, orderId: orderId });
    } catch (error: any) {
        console.error('Mercado Pago Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Payment initialization failed', details: error }, { status: 500 });
    }
}
