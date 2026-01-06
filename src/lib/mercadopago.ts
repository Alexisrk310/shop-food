import MercadoPagoConfig, { Preference } from 'mercadopago';

const isProd = process.env.MP_ENV === 'production';

const accessToken = (isProd 
  ? process.env.MP_ACCESS_TOKEN_PROD 
  : (process.env.MP_ACCESS_TOKEN_TEST || process.env.MERCADO_PAGO_ACCESS_TOKEN)) || '';

const client = new MercadoPagoConfig({ 
  accessToken: accessToken
});

export const createPreference = async (items: { id: string; name: string; quantity: number; price: number; description?: string; category_id?: string }[], orderId: string) => {
  const preference = new Preference(client);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://thunderxis.store';

  const response = await preference.create({
    body: {
      items: items.map(item => ({
        id: item.id,
        title: item.name,
        description: item.description,
        category_id: item.category_id,
        quantity: item.quantity,
        unit_price: Number(item.price),
        currency_id: 'COP' 
      })),
      external_reference: orderId,
      back_urls: {
        success: `${baseUrl}/cart/success`,
        failure: `${baseUrl}/cart/failure`,
        pending: `${baseUrl}/cart/pending`,
      },
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      auto_return: 'approved',
    }
  });

  return response;
};
