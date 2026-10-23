"use strict";

const Koa = require("koa");
var Router = require("koa-router");
const { koaBody } = require("koa-body");
const cors = require("@koa/cors");
const cognitoAuth = require("./auth/auth.js");

// Keep timestamps in UTC to avoid date-related surprises.
process.env.TZ = "UTC";

const app = new Koa();

app.use(koaBody());
app.use(cors());

// ── Authentication ────────────────────────────────────────────────────────────
// Every request must carry a valid Cognito access token.
// cognitoAuth sets ctx.state.user = { name, email, sub, role }.
app.use(cognitoAuth);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { message: err.message || "Error interno" };
    console.log(err);
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
var router = new Router();

// Middleware uppercase username
// Se ejecuta automáticamente si la URL tiene ":user"
router.param("user", async (user, ctx, next) => {
  ctx.params.user = user.toUpperCase();
  await next();
});

require("./resources/fcts")(router);
require("./resources/import_fcts")(router);

app.use(router.routes()).use(router.allowedMethods());

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports.app = app;
module.exports.router = router;
module.exports.startServer = function () {
  return app.listen(3000);
};
module.exports.stopServer = function (server) {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
};
