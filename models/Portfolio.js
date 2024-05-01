const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PortfolioSchema = new Schema({
  id: { type: String, required: true },
  image: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  brandName: String,
  name: String,
  description: String,
  amount: String,
  quantity: String,
  contentType: { type: String }
});

const PortfolioModel = model('Portfolio', PortfolioSchema);

module.exports = PortfolioModel;