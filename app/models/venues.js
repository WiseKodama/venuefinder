var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var venueSchema = new Schema({
  venueCity : String,
  venueName : String,
  venueID : String,
  userList : Array
});

module.exports = mongoose.model('Venue',venueSchema);
