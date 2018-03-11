const mongoose = require('mongoose');

// svhema
var ImageSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: String,
    required: true
  },
  dgidgitalisationMongoDBId: {
    type: String,
    required: true
  },
  image: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String
  }
});

var Image = module.exports = mongoose.model('Image', ImageSchema);
