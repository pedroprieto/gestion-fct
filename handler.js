const serverlessExpress = require("@codegenie/serverless-express");
const app = require("./index").app;
exports.handler = serverlessExpress({ app: app.callback() });
