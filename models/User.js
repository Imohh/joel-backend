const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Add this import
const {Schema, model} = mongoose;

// Changed to lowercase userSchema to maintain consistency
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  username: { type: String, unique: true, sparse: true },
  photoURL: { type: String },
  addresses: [
    {
      address: String,
      country: String,
      countryCode: String,
    },
  ],
  wallet: { type: Number, default: 0 },
  orders: [
    {
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      status: { type: String, default: 'Pending' },
      totalAmount: { type: Number },
    },
  ],
});

// Now userSchema matches the variable name above
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;