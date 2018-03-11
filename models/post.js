const mongoose = require('mongoose');

// svhema
var PostSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageName: {
    type: String
  },
  hashtags: {
    type: String
  }
});

var Post = module.exports = mongoose.model('Post', PostSchema);
