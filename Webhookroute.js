import { verifyStripeWebhook } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return Response.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event;
  try {
    event = verifyStripeWebhook(body, sig);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object;
          if (session.mode === 'subscription') {
            const subscriptionId = session.subscription;
            const customerEmail = session.customer_details?.email;
            const priceId = session.line_items?.data[0]?.price?.id;

            // Cari user berdasarkan email
            const { data: user } = await supabase
              .from('users')
              .select('id')
              .eq('email', customerEmail)
              .single();

            if (user) {
              const { error } = await supabase
                .from('subscriptions')
                .upsert({
                  id: subscriptionId,
                  user_id: user.id,
                  stripe_subscription_id: subscriptionId,
                  status: 'incomplete',
                  price_id: priceId,
                  current_period_end: new Date().toISOString(),
                  created_at: new Date().toISOString()
                });

              if (error) throw error;
            }
          }
        }
        break;

      case 'invoice.paid':
        {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;

          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) throw error;
        }
        break;

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed':
        {
          const subscription = event.data.object;
          const status = event.type === 'customer.subscription.deleted' ? 'canceled' : 'past_due';

          const { error } = await supabase
            .from('subscriptions')
            .update({ status })
            .eq('stripe_subscription_id', subscription.id);

          if (error) throw error;
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
                  }
