import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;

export async function createCheckoutSession({ customerEmail, priceId, successUrl, cancelUrl, metadata = {} }) {
  const finalPriceId = priceId || process.env.STRIPE_PRICE_ID;
  if (!finalPriceId) {
    throw new Error('Price ID tidak ditemukan');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price: finalPriceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });

  return { url: session.url };
}

export function verifyStripeWebhook(rawBody, sigHeader) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Webhook secret tidak ditemukan');
  }

  return stripe.webhooks.constructEvent(rawBody, sigHeader, webhookSecret);
}
