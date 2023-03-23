'use strict'
const serverless = require('aws-serverless-koa')
const app = require('./index').app
module.exports.handler = serverless(app);
