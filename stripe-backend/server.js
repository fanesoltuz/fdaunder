const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe('sk_test_tu_cheisk_live_51QxsPEJtEb8nTuaeIgeOmzVnpQ5pS3iVgaJl0VDrTiPXlCk0YUr6lEUlRK7bFTnQyM6p3kBzKhm6iAhgisRacMHQ005qk1gtRae_secreta'); // Înlocuiește cu cheia ta secretă Stripe

app.use(cors());
app.use(express.json());

// Endpoint pentru a crea un PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  const { total } = req.body; // Totalul plății (în unități minime, de ex. 18000 pentru 180 RON)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Stripe folosește unități minime (de ex. 18000 pentru 180 RON)
      currency: 'ron', // Moneda (RON pentru lei)
      payment_method_types: ['card'],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Eroare la crearea PaymentIntent' });
  }
});

// Pornește serverul
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});