const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const PostSchema = new Schema({
  id: { type: String, required: true },
  name:String,
  summary:String,
  amount:String,
  cover:String,
  author:{type:Schema.Types.ObjectId, ref:'User'},
}, {
  timestamps: true,
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;