const mongoose = require('mongoose');

// svhema
var LogSchema = mongoose.Schema({
  dt: {
    type : String,
    required: true
  },
  userId: {
    type: String
  },
  url : {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  }
});

var Log = module.exports = mongoose.model('Log', LogSchema);
