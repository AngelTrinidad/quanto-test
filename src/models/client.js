//=====================================
// Dependencies
//=====================================
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//=====================================
// Schema
//=====================================
let clientSchema = new Schema({
  detail: {type: String, required: true},
  active: {type: Boolean, default: true},
  category: {type: Schema.Types.ObjectId, ref: 'Category', required: true}
});


module.exports = mongoose.model('Client', clientSchema);