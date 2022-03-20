var express = require('express');
const {User,Todo}=require('../model/user')
var router = express.Router();
var jwt = require('jsonwebtoken');
const { user } = require('pg/lib/defaults');
const { Op } = require('@sequelize/core');

// CRUD OPERATIONS


module.exports = router;
