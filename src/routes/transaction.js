//=====================================
// Dependencies
//=====================================
const express = require('express');
const {Transaction, status} = require('../models/transaction');
const {verifyUser} = require('../middlewares/authentication');
const log = require('../resources/log');
const { check, validationResult } = require('express-validator');


//Express instance
const app = express();


const url = 'transaction';


//Get List
app.get(`/${url}`, verifyUser, (req, res) => {
  const func = `GET /${url}`;
  
  try {
    log.debug(`${func} init`);

    Transaction.find((error, transactions) => {

      if(err){
        //Error DB request
        log.error(`${func} error in DB request`, err);
        return res.status(500).json({
          status: 'error',
          data: {
            error
          }
        });
      }

      //Success response
      log.debug(`${func} Success response`);
      res.json({
        status: 'ok',
        data: {
          transactions
        }
      });

    });

  } catch (error) {
    //Server error
    log.error(`${func} server error`, error);
    return res.status(500).json({
      status: 'error',
      data: {
        err: `Server error. ${error}`
      }
    });
  }
});

//Create
app.post(`/${url}`, [
  //validation with express validation
  check('detail').not().isEmpty().withMessage('required'),
  check('client')
    .not().isEmpty().withMessage('required')
    .isMongoId().withMessage('must be a valid ID'),
  verifyUser
], (req, res) => {

    const func = `POST /${url}`;

    try {
      log.debug(`${func} init`);

      //validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        log.debug(`${func} validation error`);
        return res.status(422).json({
          status: 'error',
          data: {
            error: errors.array()
          }
        });
      }

      //Aqui tb se deberia validar si el id cliente es valido

      //body
      let transaction = new Transaction({
        detail: req.body.detail,
        client: req.body.client,
        status: req.body.status || 'pendiente'
      });

      //Save
      log.debug(`${func} save new row`);
      transaction.save((error, transactionDB) => {
        if(error){
          //Error DB request
          log.error(`${func} error in DB request`, error);
          return res.status(500).json({
              status: 'error',
              data: {
                error
              }
          });
        }
    
        //Success response
        log.debug(`${func} Success response, return new transaction`);
        res.json({
          status: 'ok',
          data: {
            transaction: transactionDB
          }
        });
      
      });

    } catch (error) {
      //Server error
      log.error(`${func} server error`, error);
      return res.status(500).json({
        status: 'error',
        data: {
          error: `Server error. ${error}`
        }
      });
    }
});

//Update
app.put(`/${url}/:id`, [
  //validation with express validation
  check('detail')
    .not().isEmpty().withMessage('required'),
  check('client')
    .not().isEmpty().withMessage('required')
    .isMongoId().withMessage('must be a valid ID'),
  check('status')
    .isIn(status),
  verifyUser
], (req, res) => {
    
    const func = `PUT /${url}/:id`;

    try {
      log.debug(`${func} init`);

      //Id and new values
      let id = req.params.id;
      let newTransaction = {
        detail: req.body.detail,
        status: req.body.status,
        client: req.body.client
      }

      //find and update
      log.debug(`${func} update transaction with id:${id}`);
      Transaction.findByIdAndUpdate(id, newTransaction, {new: true, runValidators: true}, (error, transactionDB) => {
        if(error){
          //Error DB request
          log.error(`${func} error in DB request`, error);
          return res.status(500).json({
            status: 'error',
            data: {
              error
            }
          });
        }

        //If empty, then return a 404
        if(!transactionDB){
          log.debug(`${func} 404`);
          return res.json({
            status: 'error',
            data: {
              error: 'not found'
            }
          });
        }
    
        //Success response
        log.debug(`${func} Success response, transaction updated`);
        return res.json({
          status: 'ok',
          data: {
            transaction: transactionDB
          }
        });
      });

    } catch (error) {
      //Server error
      log.error(`${func} server error`, error);
      return res.status(500).json({
        status: 'error',
        data: {
          error: `Server error. ${error}`
        }
      });
    }

});

//Delete
app.delete(`/${url}/:id`, verifyUser, (req, res) => {

    const func = `DELETE /${url}/:id`;

    try {
        
      log.debug(`${func} init`);

      //Id params
      let id = req.params.id;

      //Find and update status
      log.debug(`${func} remove transaction with id:${id}`);
      Transaction.findOneAndRemove(id, (error, transactionDB) => {
        if(error){
          //Error DB request
          log.error(`${func} error in DB request`, error);
          return res.status(500).json({
            status: 'error',
            data: {
              error
            }
          });
        }
    
        //Success response
        log.debug(`${func} Success response, transaction removed`);
        return res.json({
          status: 'ok',
          data: {
            transaction: transactionDB
          }
        });

      });

    } catch (error) {
      //Server error
      log.error(`${func} server error`, error);
      return res.status(500).json({
        status: 'error',
        data: {
          error: `Server error. ${error}`
        }
      });
    }
});

module.exports = app;