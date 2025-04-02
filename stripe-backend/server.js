const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
require('dotenv').config(); // încarcă .env dacă rulezi local

const app = express();

// Folosește cheia Stripe din .env sau scrisă direct (recomand .env)
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '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');

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.send({ status: 'Serverul funcționează corect' });
});

// Endpoint pentru crearea unui PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  const { total } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Stripe cere bani în baniți (100 RON = 10000)
      currency: 'ron',
      payment_method_types: ['card'],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Eroare la crearea PaymentIntent:', err);
    res.status(500).send({ error: 'Eroare la procesarea plății' });
  }
});

// Portul dinamic pentru Render + fallback pentru localhost
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Serverul rulează pe portul ${PORT}`);
});
