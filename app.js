const app = require("./server.js");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (_req, res) => {
  res.json({ test: "Hello World!" });
});

app.post("/incomplete-subscriptions", async (req, res) => {
  const customer = await stripe.customers.create({});

  const subscriptionResult = await stripe.subscriptions
    .create({
      customer: customer.id,
      items: [{ price: req.body.priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    })
    .catch((err) => {
      const errorStatusCode = err.statusCode;
      const errorMessage = err.raw.message;
      return { error: errorMessage, statusCode: errorStatusCode };
    });

  res.statusCode = subscriptionResult.error ? 400 : 200;
  res.json(subscriptionResult);
});

app.get("/subscriptions", async (_req, res) => {
  const product = await stripe.products.create({
    name: "Jelly Bean",
  });

  const price = await stripe.prices.create({
    currency: "usd",
    product: product.id,
    unit_amount: 2000,
    recurring: {
      interval: "month",
    },
  });

  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      number: "4242424242424242",
      exp_month: 7,
      exp_year: 2023,
      cvc: "314",
    },
  });

  const customer = await stripe.customers.create({
    email: "jojobob@example.com",
    name: "Jojo Bob",
    payment_method: paymentMethod.id,
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id }],
    default_payment_method: paymentMethod.id,
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });

  res.json(subscription);
});

app.get("/payment-intent", async (_req, res) => {
  const paymentIntentResult = await stripe.paymentIntents.create({
    amount: 2000,
    currency: "usd",
  });
  res.json({ clientSecret: paymentIntentResult.client_secret });
});

app.post("/payment-intent", async (req, res) => {
  const paymentIntentResult = await stripe.paymentIntents
    .create({
      amount: req.body.amount,
      currency: "usd",
    })
    .catch((err) => {
      const errorStatusCode = err.statusCode;
      const errorMessage = err.raw.message;
      return { error: errorMessage, statusCode: errorStatusCode };
    });

  res.statusCode = paymentIntentResult.error ? 400 : 200;
  res.json(paymentIntentResult);
});

app.get("/stripe-client-secret", async (_req, res) => {
  const paymentIntentResult = await stripe.paymentIntents
    .create({
      amount: 1000,
      currency: "usd",
    })
    .then((data) => {
      return { ...data, clientSecret: data.client_secret };
    })
    .catch((err) => {
      const errorStatusCode = err.statusCode;
      const errorMessage = err.raw.message;
      return { error: errorMessage, errorStatusCode };
    });

  res.statusCode = paymentIntentResult.error ? 400 : 200;
  res.json(paymentIntentResult);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
