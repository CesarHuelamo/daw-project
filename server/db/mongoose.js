'use strict';
const mongoose = require('mongoose');
const database = 'Javasquizz';

mongoose.Promise = global.Promise; //setup the default promise library
mongoose.connect('mongodb://localhost:27017/Javasquizz');

module.exports = {mongoose};