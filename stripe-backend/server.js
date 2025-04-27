// server.js
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Stripe pentru plata cu cardul
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Health check
app.get('/api/health', (req, res) => {
  res.send({ status: 'Serverul rulează OK 🚀' });
});

// Creare PaymentIntent (plată cu cardul)
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
    console.error('Eroare PaymentIntent:', err);
    res.status(500).send({ error: 'Eroare la procesarea plății' });
  }
});

// Creare AWB (livrare Sameday)
app.post('/api/create-awb', async (req, res) => {
  const {
    firstName, lastName, phone, email,
    street, houseNumber, city, county,
    postalCode, building, staircase, floor,
    apartment, paymentType
  } = req.body;

  try {
    const payload = {
      parcels: [
        {
          weight: 1, 
          envelope: false
        }
      ],
      service: {
        id: 7,
        name: "NextDay"
      },
      payer: {
        type: paymentType === "CARD" ? 1 : 2
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
          country: "RO"
        }
      },
      sender: {
        name: "FDA UNDERWEAR",
        contact_person: "FDA UNDERWEAR",
        phone: "0727757960",
        email: "fdaunderwear@yahoo.com",
        address: {
          street: "Strada Crizantemelor",
          number: "7",
          block: "",
          entrance: "",
          floor: "",
          apartment: "",
          city: "București",
          county: "Sector 5",
          postal_code: "051831",
          country: "RO"
        }
      },
      cash_on_delivery: paymentType === "CASH"
    };

    const response = await axios.post('https://api.sameday.ro/api/client_awb', payload, {
      auth: {
        username: 'fdaunderwear@yahoo.com',
        password: 'Eliza1975!'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ AWB creat:', response.data);
    res.send({ message: 'AWB creat cu succes!', data: response.data });

  } catch (error) {
    console.error('❌ Eroare creare AWB:', error.response?.data || error.message);
    res.status(500).send({ error: 'Eroare la crearea AWB-ului' });
  }
});

// Pornim serverul
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Serverul rulează pe portul ${PORT}`);
});
