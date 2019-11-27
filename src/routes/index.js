//=====================================
// Dependencies
//=====================================
const express = require('express');
const app = express();


//=====================================
// Require routes files 
//=====================================
app.use(require('./user'));
app.use(require('./category'));
app.use(require('./client'));
app.use(require('./transaction'));


module.exports = app;