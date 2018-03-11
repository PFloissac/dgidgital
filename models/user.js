const mongoose = require('mongoose');

// svhema
var UserSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  encPassword: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  avatar: {
    type: Buffer
  },
  avatarContentType: {
    type: String
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

var User = module.exports = mongoose.model('User', UserSchema);
