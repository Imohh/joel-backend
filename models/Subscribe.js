const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const SubscribeSchema = new Schema({
  email: {type: String, required: true},
});

const SubscribeModel = model('Subscribe', SubscribeSchema);

module.exports = SubscribeModel;