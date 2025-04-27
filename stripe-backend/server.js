const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const axios = require('axios');
require('dotenv').config(); // ca să poți folosi .env dacă vrei

const app = express();

// Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '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');

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.send({ status: 'Serverul funcționează corect 🚀' });
});

// Endpoint pentru PaymentIntent Stripe
app.post('/api/create-payment-intent', async (req, res) => {
  const { total } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100,
      currency: 'ron',
      payment_method_types: ['card'],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('❌ Eroare la crearea PaymentIntent:', error);
    res.status(500).send({ error: 'Eroare la procesarea plății' });
  }
});

// Endpoint pentru creare AWB Sameday
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
    const awbData = {
      parcels: [
        {
          weight: 1, // greutate colet 1 kg
          envelope: false
        }
      ],
      service: {
        id: 7, // Serviciu: NextDay
        name: "NextDay"
      },
      payer: {
        type: paymentType === "CARD" ? 1 : 2 // 1 = plătește expeditor, 2 = plătește destinatar
      },
      receiver: {
        name: `${firstName} ${lastName}`,
        contact_person: `${firstName} ${lastName}`,
        phone: phone,
        email: email,
        address: {
          street: street,
          number: houseNumber,
          block: building,
          entrance: staircase,
          floor: floor,
          apartment: apartment,
          city: city,
          county: county,
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
      cash_on_delivery: paymentType === "CASH" ? true : false
    };

    const response = await axios.post(
      'https://sameday-api.sameday.ro/api/client_awb', // AICI adresa corectă
      awbData,
      {
        auth: {
          username: 'fdaunderwear@yahoo.com',
          password: 'Eliza1975!',
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ AWB creat cu succes:', response.data);
    res.send({ message: 'AWB creat cu succes!', data: response.data });

  } catch (error) {
    console.error('❌ Eroare creare AWB:', error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Eroare la crearea AWB' });
  }
});

// Pornire server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Serverul rulează pe portul ${PORT}`);
});
