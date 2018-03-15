const mongoose = require('mongoose');

// svhema
var PostSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageId: {
    type: String
  },
  likedBy: {
     type: [String]
   },
  hashtags: {
    type: [String]
  },
 youGuys: {
   type: [String]
 }
});

var Post = module.exports = mongoose.model('Post', PostSchema);
