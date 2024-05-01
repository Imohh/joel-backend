const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const orderSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  cartItem: { type: Object, required: true },
  // cartInfo: { type: Object },
  // userData: { type: Object, required: true },
  reference: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
});

const OrderModel = model('Order', orderSchema);

module.exports = OrderModel;