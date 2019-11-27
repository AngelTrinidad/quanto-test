//=====================================
// Dependencies
//=====================================
const express = require('express');
const Client = require('../models/client');
const {Transaction} = require('../models/transaction')
const {verifyUser} = require('../middlewares/authentication');
const log = require('../resources/log');
const { check, validationResult } = require('express-validator');
const ObjectId = require('mongoose').Types.ObjectId;


//Express instance
const app = express();


const url = 'client';


//Get List
app.get(`/${url}`, verifyUser, (req, res) => {
    const func = `GET /${url}`;
    
    try {
        log.debug(`${func} init`);

        //payload for filter in find method
        let payload = {active: true};

        //Params
        let from = Number(req.query.from) || 0;
        let limit = Number(req.query.limit) || null;
        let categoryId = req.query.categoryId || null;

        //Se deberia validar que categoryId sea un id valido, pero por ahora no es importante


        //Verify filters
        if(categoryId){
          payload = {
            "$and": [
              {active: true},
              {category: new ObjectId(categoryId)}
            ]
          }
        }


        //Find clients
        log.debug(`${func} request DB with filter: ${JSON.stringify(payload)} | limit: ${limit} | from: ${from}`);
        let requestDB = Client.find(payload).lean();
        if(limit) requestDB.skip(from).limit(limit);

        requestDB.exec(async (error, clients) => {

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

            //Get transactions for all clients
            for (let i = 0; i < clients.length; i++) {
              const client = clients[i];

              const transactions = await Transaction.find({client: new ObjectId(client._id)})

              clients[i].transactions = transactions;
              
            }

            //Success response
            log.debug(`${func} Success response`);
            res.json({
              status: 'ok',
              data: {
                clients
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
  check('detail')
    .not().isEmpty().withMessage('required'),
  check('category')
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

        //Se deberia verificar que el id categoria exista, pero por ahora no es importante

        //body
        let client = new Client({
          detail: req.body.detail,
          category: req.body.category
        });

        //Save
        log.debug(`${func} save new row`);
        client.save((error, clientDB) => {
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
          log.debug(`${func} Success response, return new client`);
          res.json({
            status: 'ok',
            data: {
              client: clientDB
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
  check('category')
    .not().isEmpty().withMessage('required')
    .isMongoId().withMessage('must be a valid ID'),
  verifyUser
], (req, res) => {
    
    const func = `PUT /${url}/:id`;

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

      //Id and new values
      let id = req.params.id;
      let newClient = {
        detail: req.body.detail,
        category: req.body.category,
      }

      //find and update
      log.debug(`${func} update client with id:${id}`);
      Client.findByIdAndUpdate(id, newClient, {new: true, runValidators: true}, (error, clientDB) => {
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
        if(!clientDB){
          log.debug(`${func} 404`);
          return res.json({
            status: 'error',
            data: {
              error: 'not found'
            }
          });
        }
    
        //Success response
        log.debug(`${func} Success response, client updated`);
        return res.json({
            status: 'ok',
            data: {
              client: clientDB
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

        //Change status active
        let id = req.params.id;
        let client = {
            active: false
        }

        //Find and update status
        Client.findByIdAndUpdate(id, client, {new: true, runValidators: true}, (error, clientDB) => {
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
          if(!clientDB){
            log.debug(`${func} 404`);
            return res.json({
              status: 'error',
              data: {
                error: 'not found'
              }
            });
          }
      
          //Success response
          log.debug(`${func} Success response, client updaed status to active: false`);
          return res.json({
              status: 'ok',
              data: {
                client: clientDB
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