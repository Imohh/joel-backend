const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const ProductSchema = new Schema({
  id: { type: String, required: true },
  name:String,
  slug: { type: String, unique: true },
  summary:String,
  amount:String,
  cover:String,
  contentType: String,
  sizes: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  author:{type:Schema.Types.ObjectId, ref:'User'},
}, {
  timestamps: true,
});

const ProductModel = model('Product', ProductSchema);

module.exports = ProductModel;