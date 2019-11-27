//=====================================
// Dependencies
//=====================================
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const status = {
  values: ['pendiente', 'consolidado', 'cancelado'],
  message: '{VALUE} is not a valid status'
};

//=====================================
// Schema
//=====================================
let transactionSchema = new Schema({
  detail: {type: String, required: true},
  status: {type: String, enum: status},
  client: {type: Schema.Types.ObjectId, ref: 'Client', required: true}
});


module.exports = {
  Transaction: mongoose.model('Transaction', transactionSchema),
  status: status.values
};