const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/skcs-inventory', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Mongoose models
const Inventory = mongoose.model('Inventory', {
  name: String,
  quantity: Number,
  price: Number,
  minQuantity: Number,
});

const Sales = mongoose.model('Sales', {
  productId: mongoose.Schema.Types.ObjectId,
  quantitySold: Number,
  salePrice: Number,
  customerName: String,
  saleDate: { type: Date, default: Date.now },
});

const Debtors = mongoose.model('Debtors', {
  customerName: String,
  amountOwed: Number,
  dueDate: Date,
});

const Capital = mongoose.model('Capital', {
  amount: Number,
  recordedDate: { type: Date, default: Date.now },
});

// Routes for Inventory, Sales, Debtors, and Capital
app.get('/api/inventory', async (req, res) => {
  const inventory = await Inventory.find();
  res.json(inventory);
});

app.post('/api/inventory', async (req, res) => {
  const { name, quantity, price, minQuantity } = req.body;
  const newItem = new Inventory({ name, quantity, price, minQuantity });
  await newItem.save();
  res.json({ message: 'Product added successfully!' });
});

app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const updatedProduct = await Inventory.findByIdAndUpdate(id, { quantity }, { new: true });
  res.json(updatedProduct);
});

app.post('/api/sales', async (req, res) => {
  const { productId, quantitySold, salePrice, customerName } = req.body;
  const sale = new Sales({ productId, quantitySold, salePrice, customerName });
  await sale.save();

  // Update Inventory
  const product = await Inventory.findById(productId);
  product.quantity -= quantitySold;
  await product.save();

  res.json({ message: 'Sale recorded!' });
});

app.get('/api/debtors', async (req, res) => {
  const debtors = await Debtors.find();
  res.json(debtors);
});

app.post('/api/debtors', async (req, res) => {
  const { customerName, amountOwed, dueDate } = req.body;
  const debtor = new Debtors({ customerName, amountOwed, dueDate });
  await debtor.save();
  res.json({ message: 'Debtor added!' });
});

app.post('/api/capital', async (req, res) => {
  const { amount } = req.body;
  const capital = new Capital({ amount });
  await capital.save();
  res.json({ message: 'Capital entry recorded!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
