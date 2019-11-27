//=====================================
// Dependencies
//=====================================
const express = require('express');
const Category = require('../models/category');
const {verifyUser} = require('../middlewares/authentication');
const log = require('../resources/log');
const { check, validationResult } = require('express-validator');


//Express instance
const app = express();


const url = 'category';


//Get List
app.get(`/${url}`, verifyUser, (req, res) => {
    const func = `GET /${url}`;
    
    try {
      log.debug(`${func} init`);

      Category.find((error, categories) => {

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
        log.debug(`${func} Success response`);
        res.json({
          status: 'ok',
          data: {
            categories
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

        //body
        let category = new Category({
          detail: req.body.detail
        });

        //Save
        log.debug(`${func} save new row`);
        category.save((error, categoryDB) => {
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
          log.debug(`${func} Success response, return new category`);
          res.json({
            status: 'ok',
            data: {
              category: categoryDB
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
  verifyUser
], (req, res) => {
    
    const func = `PUT /${url}/:id`;

    try {
      log.debug(`${func} init`);

      //Id and new values
      let id = req.params.id;
      let newCategory = {
        detail: req.body.detail
      }

      //find and update
      log.debug(`${func} update category with id:${id}`);
      Category.findByIdAndUpdate(id, newCategory, {new: true, runValidators: true}, (error, categoryDB) => {
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
        if(!categoryDB){
          log.debug(`${func} 404`);
          return res.json({
            status: 'error',
            data: {
              error: 'not found'
            }
          });
        }
    
        //Success response
        log.debug(`${func} Success response, category updated`);
        return res.json({
          status: 'ok',
          data: {
            category: categoryDB
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
      log.debug(`${func} remove category with id:${id}`);
      Category.findOneAndRemove(id, (error, categoryDB) => {
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
        log.debug(`${func} Success response, category removed`);
        return res.json({
          status: 'ok',
          data: {
            category: categoryDB
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