//=====================================
// Dependencies
//=====================================
const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const log = require('../resources/log');
const { check, validationResult } = require('express-validator');
const {jwt_seed, brcypt_salt_rounds} = require('../config');
const jwt = require('jsonwebtoken');

//Express instance
const app = express();

const url = 'user';

//Authentication
app.post(`/${url}/auth`, [
  //validation with express validation
  check('email')
    .isEmail().withMessage('must be a valid email')
    .not().isEmpty().withMessage('required'),
  check('password')
    .not().isEmpty().withMessage('required'),
], (req, res) => {
  
  const func = `GET ${url}`;

  try {
  
    log.debug(`${func} init`);

    //validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log.debug(`${func} validation error`);
      return res.status(422).json({
        status: 'error',
        data: {
          err: errors.array()
        }
      });
    }

    //body
    const {email, password} = req.body;

    //check email exists
    User.findOne({email}, (error, userDB) => {

      //Error in query DB
      if(error){
        log.error(`${func} server error when query for email executed`, error);
        return res.status(500).json({
          status: 'error',
          data: {
            error: `Server error. ${error}`
          }
        });
      }


      //User doesnt exist
      if(!userDB){
        log.debug(`${func} incorrect credentials`, req.body);
        return res.status(400).json({
          status: 'error',
          data: {
            error: 'Incorrect credentials'
          }
        });
      }


      //Verify password
      if(!bcrypt.compareSync(password, userDB.password)){
        log.debug(`${func} incorrect credentials`, req.body);
        return res.status(400).json({
          status: 'error',
          data: {
            err: 'Incorrect credentials'
          }
        });
      }

      
      //Success
      //Generate a JWT
      const token = jwt.sign({
        _id: userDB._id,
        name: userDB.name,
        email: userDB.email
      }, jwt_seed)

      log.debug(`${func} Success login, return token: ${token}`);
      return res.json({
        status: 'ok',
        data: {
          token
        }
      });
    })

  } catch (error) {
    log.error(`${func} server error`, error);
    return res.status(500).json({
      status: 'error',
      data: {
        error: `Server error. ${error}`
      }
    });
  }
})

//Create
app.post(`/${url}`, [
  //validation with express validation
  check('email')
    .not().isEmpty(),
  check('password')
    .not().isEmpty()
], (req, res) => {

  const func = `POST /${url}`;

  try {

    //validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        data: {
          error: errors.array()
        }
      });
    }

    //body request
    let body = {
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, brcypt_salt_rounds)
    }

    //Validation email is unique
    User.findOne({ email: body.email }, (error, userDB) => {
      //Error
      if (error) {
        return res.status(500).json({
          status: 'error',
          data: {
            error
          }
        });
      }

      //Email exists
      if (userDB) {
        return res.json({
          status: 'error',
          data: {
            err: 'Email not available'
          }
        });
      }

      //Create new user
      const newUser = new User(body);
      newUser.save((error, newUserDB) => {
        if (error) {
          return res.status(500).json({
            status: 'error',
            data: {
              error
            }
          });
        }

        //success return 
        return res.json({
          status: 'ok',
          data: {
            user: newUserDB
          }
        });

      });

    });

  } catch (error) {
    //Server error
    return res.status(500).json({
      status: 'error',
      data: {
        err: `Server error. ${error.message}`
      }
    });
  }
});

module.exports = app;