var express = require('express');
var {User,Todo}=require('../model/user')
const { Sequelize } = require('sequelize');
const { Op } = require('@sequelize/core');
var jwt = require('jsonwebtoken');


var router = express.Router();


module.exports = router;
