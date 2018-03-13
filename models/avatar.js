const mongoose = require('mongoose');

// svhema
var AvatarSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
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

var Avatar = module.exports = mongoose.model('Avatar', AvatarSchema);
