const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const SubPortfolioSchema = new Schema({
  image: { type: String, required: true },
  subbrand: { type: mongoose.Schema.Types.ObjectId, ref: 'SubBrand', required: true },
  subbrandName: String,
  contentType: { type: String }
});

const SubPortfolioModel = model('SubPortfolio', SubPortfolioSchema);

module.exports = SubPortfolioModel;