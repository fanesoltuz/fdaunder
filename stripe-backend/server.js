const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

// Inițializează aplicația Express
const app = express();

// Înlocuiește cu cheia ta secretă Stripe
const stripe = Stripe('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'); // Cheie de test Stripe

// Middleware pentru a permite cereri cross-origin (CORS) și parsarea JSON
app.use(cors());
app.use(express.json());

// Endpoint pentru a crea un PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  const { total } = req.body; // Totalul plății (de exemplu, 180 pentru 180 RON)

  try {
    // Verifică dacă totalul este valid
    if (!total || isNaN(total)) {
      return res.status(400).send({ error: 'Total invalid' });
    }

    // Creează un PaymentIntent folosind Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Stripe folosește unități minime (de ex. 18000 pentru 180 RON)
      currency: 'ron', // Moneda (RON pentru lei)
      payment_method_types: ['card'], // Acceptă plăți cu cardul
    });

    // Returnează clientSecret către frontend
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Eroare la crearea PaymentIntent:', err);
    res.status(500).send({ error: 'Eroare la procesarea plății' });
  }
});

// Endpoint pentru a verifica starea serverului
app.get('/api/health', (req, res) => {
  res.send({ status: 'Serverul funcționează corect' });
});

// Pornește serverul pe portul 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
