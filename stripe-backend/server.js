const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe('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'); // Cheie de test Stripe

app.use(cors());
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  const { total } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100,
      currency: 'ron',
      payment_method_types: ['card'],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Eroare la crearea PaymentIntent:', err);
    res.status(500).send({ error: 'Eroare la procesarea plății' });
  }
});

app.get('/api/health', (req, res) => {
  res.send({ status: 'Serverul funcționează corect' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
