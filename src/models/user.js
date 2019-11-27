//=====================================
// Dependencies
//=====================================
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//=====================================
// Schema
//=====================================
let userSchema = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  active: {type: Boolean, default: true}
});


//Function for remove password info for users when this is in return data
userSchema.methods.toJSON = function(){
  let agentObject = this.toObject();
  delete agentObject.password;

  return agentObject;
}


module.exports = mongoose.model('User', userSchema);