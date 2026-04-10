const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.json({ status: 'TowGo payment server running!' })
})

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
      metadata: { app: 'TowGo' }
    })
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/calculate-price', async (req, res) => {
  try {
    const { serviceType, miles } = req.body
    let basePrice = 95
    let perMile = 4
    switch(serviceType) {
      case 'Standard tow': basePrice = 95; perMile = 4; break
      case 'Flatbed premium': basePrice = 125; perMile = 5; break
      case 'Heavy duty': basePrice = 175; perMile = 6; break
      case 'Jump start': basePrice = 65; perMile = 0; break
      case 'Tire change': basePrice = 75; perMile = 0; break
      case 'Fuel delivery': basePrice = 45; perMile = 0; break
    }
    const totalPrice = basePrice + (perMile * miles)
    res.json({
      basePrice,
      perMile,
      miles,
      totalPrice: Math.round(totalPrice * 100) / 100
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    )
    res.json({ status: paymentIntent.status })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`TowGo payment server running on port ${PORT}`)
})
