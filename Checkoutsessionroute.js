import { createCheckoutSession } from '../../../lib/stripe';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`;

    const { url } = await createCheckoutSession({
      customerEmail: email,
      successUrl,
      cancelUrl,
      metadata: { userEmail: email }
    });

    return Response.json({ success: true, url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return Response.json({ error: 'Gagal membuat checkout session' }, { status: 500 });
  }
}
