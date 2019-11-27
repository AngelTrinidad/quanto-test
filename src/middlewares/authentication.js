//=====================================
// Dependencies
//=====================================
const User = require('../models/user');
const log = require('../resources/log');
const jwt = require('jsonwebtoken');
const {jwt_seed} = require('../config')


//=====================================
// Middleware for user with JWT
//=====================================
let verifyUser = (req, res, next) => {
  
  const func = 'Middleware:verifyAgent';

  try {
    
    log.debug(`${func} init`);

    //Header request
    let token = req.headers['x-access-token'];


    //Validation token
    if(!token){
      log.debug(`${func} bad request. x-access-token not defined`);
      //Bad request
      return res.status(400).json({
        status: 'error',
        data: {
          error: 'x-access-token not defined'
        }
      })
    }

    
    //Verify if token is valid
    jwt.verify(token, jwt_seed, (error, decoded) => {
      if(error){
        log.error(`${func} Invalid token`, error);
        return res.status(401).json({
          status: 'error',
          data: {
            error: `Invalid token. ${error}`
          }
        });
      }
      
      
      //Success
      log.debug(`${func} Token decoded successfully`);
      req.user = decoded;
      next();

    });

  } catch (error) {
    log.error(`${func} server error`, error);
    return res.status(500).json({
      status: 'error',
      data: {
        error: `Server error. ${error}`
      }
    });

  }
}


//Return a JS object for more scalability
module.exports = {verifyUser}