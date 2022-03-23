var express = require('express');
var {User,Todo}=require('../model/user')
const { Sequelize } = require('sequelize');
const { Op } = require('@sequelize/core');
var jwt = require('jsonwebtoken');


var router = express.Router();

router.get('/', function(req, res, next) {
    res.status(200).json({success:'deployed successfully'})
   })

   
module.exports = router;
