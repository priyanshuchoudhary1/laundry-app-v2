const express = require('express');
const router = express.Router();

// Only initialize Stripe if the secret key is available
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.warn('Stripe not configured. Payment features will be disabled.');
}

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ 
      error: 'Payment service is not configured',
      message: 'Stripe is not configured. Please contact the administrator.'
    });
  }

  try {
    const { amount } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Error creating payment intent' });
  }
});

// Webhook to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ 
      error: 'Payment service is not configured',
      message: 'Stripe is not configured. Please contact the administrator.'
    });
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      // Here you would typically update your database to mark the order as paid
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router; 