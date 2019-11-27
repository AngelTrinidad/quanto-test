//=====================================
// Dependencies
//=====================================
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//=====================================
// Schema
//=====================================
let categorySchema = new Schema({
  detail: {type: String, required: true}
});


module.exports = mongoose.model('Category', categorySchema);