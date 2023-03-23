const Koa = require('koa');
var Router = require('koa-router');
const { koaBody } = require('koa-body');
const passport = require('koa-passport')
require("./auth/auth.js");
const cors = require("@koa/cors");

// Timezone para UTC y que no haya problemas con fechas
process.env.TZ = 'UTC';

const app = new Koa();
app.use(koaBody());
app.use(cors());
app.use(passport.initialize());

var router = new Router();

app.use(passport.authenticate('basic', { session: false }), function (ctx, next) {
    return next();
});

// Error processing
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        // Show info if error is not 500
        // if (err.expose) {
        if (true) {
            ctx.body = {};
            ctx.body.message = err.message || "Error interno"; 
            console.log(err);
        }
        // ctx.app.emit('error', err, ctx);
    }
});

// Resources
require('./resources/fcts')(router);
require('./resources/import_fcts')(router);


app
    .use(router.routes())
    .use(router.allowedMethods());

// export app for testing
module.exports.app = app;
module.exports.router = router;
module.exports.startServer = function () {
    return app.listen(3000);
};
module.exports.stopServer = function (server) {
    return new Promise((resolve) => {
        server.close(() => {
            resolve();
        });
    });
}
