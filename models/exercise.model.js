var mongoose = require("mongoose");

var exerciseSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "USER" },
  date: {type: 'Date' , default: Date.now},
  duration: {type: 'number'},
  description: {type: 'string'},
});

module.exports = mongoose.model("Exercise", exerciseSchema)
