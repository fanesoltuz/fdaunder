// server.js FINAL - Stripe + SameDay AWB Generator

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const axios = require('axios');
require('dotenv').config(); // pentru variabilele din .env

const app = express();

// Stripe config
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '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');

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.send({ status: 'Serverul funcționează corect 🚀' });
});

// Stripe - Creare PaymentIntent
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

// SameDay - Creare AWB
app.post('/api/create-awb', async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    email,
    street,
    houseNumber,
    city,
    county,
    postalCode,
    building,
    staircase,
    floor,
    apartment,
    paymentType
  } = req.body;

  try {
    // 1. Login SameDay
    const loginResponse = await axios.post('https://api.sameday.ro/login', {
      username: 'fdaunderwear@yahoo.com',
      password: 'Eliza1975!'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const token = loginResponse.data.token;
    console.log('Token SameDay obtinut:', token);

    // 2. Creare AWB cu token
    const awbResponse = await axios.post('https://api.sameday.ro/awb', {
      parcels: [
        { weight: 1, envelope: false }
      ],
      service: {
        id: 7,
        name: 'NextDay'
      },
      payer: {
        type: paymentType === 'CARD' ? 1 : 2
      },
      receiver: {
        name: `${firstName} ${lastName}`,
        contact_person: `${firstName} ${lastName}`,
        phone,
        email,
        address: {
          street,
          number: houseNumber,
          block: building,
          entrance: staircase,
          floor,
          apartment,
          city,
          county,
          postal_code: postalCode,
          country: 'RO'
        }
      },
      sender: {
        name: 'FDA UNDERWEAR',
        contact_person: 'FDA UNDERWEAR',
        phone: '0727757960',
        email: 'fdaunderwear@yahoo.com',
        address: {
          street: 'Strada Crizantemelor',
          number: '7',
          city: 'Bucuresti',
          county: 'Sector 5',
          postal_code: '051831',
          country: 'RO'
        }
      },
      cash_on_delivery: paymentType === 'CASH'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-TOKEN': token
      }
    });

    console.log('✅ AWB creat:', awbResponse.data);
    res.send({ message: 'AWB creat cu succes!', data: awbResponse.data });

  } catch (err) {
    console.error('❌ Eroare la crearea AWB:', err.response ? err.response.data : err.message);
    res.status(500).send({ error: 'Eroare la crearea AWB' });
  }
});

// Pornim serverul
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Serverul rulează pe portul ${PORT}`);
});
