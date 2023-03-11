const Koa = require('koa');
var Router = require('koa-router');
const { koaBody } = require('koa-body');
const passport = require('koa-passport')
var auth = require("./auth/auth.js");
const CJUtils = require('./aux/CJUtils.js');


// Timezone para UTC y que no haya problemas con fechas
process.env.TZ = 'UTC';

const app = new Koa();
app.use(koaBody());
app.use(passport.initialize());

var router = new Router();


app.use(passport.authenticate('basic', { session: false }), function (ctx, next) {
    return next();
});

// buildLink CJ
app.context.buildLink = function(routeName, prompt, params={}, query, rel='collection') {
    return CJUtils.buildLink(prompt, rel, this.router.url(routeName, Object.assign(this.params, params), { query: query }));
}

// Parse CJ template
app.context.parseCJTemplate = function () {
    var data;
    if (this.request.type.indexOf("multipart") < 0) {
        if ((typeof this.request.body.template === 'undefined') || (typeof this.request.body.template.data === 'undefined') || (!Array.isArray(this.request.body.template.data))) {
            this.throw(400, 'Los datos no están en formato CJ');
        }

        var CJdata = this.request.body.template.data;

        // Convert CJ format to JS object
        data = CJdata.reduce(function (a, b) {
            a[b.name] = b.value;
            return a;
        }, {});
    } else {
        data = {
            data: this.request.body,
            files: this.request.files
        };
    }

    return data;
}


// Error processing
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.log(err);
        ctx.status = err.status || 500;
        // Show info if error is not 500
        if (err.expose) {
            if (!(ctx.body && ctx.body.collection)) {
                ctx.body = {};
                ctx.body.collection = {};
                ctx.body.collection.version = "1.0";
            }
            var err_col = {};
            err_col.title = ctx.i18n.__("Error");
            err_col.code = err.status;
            err_col.message = ctx.i18n.__(err.message);

            ctx.body.collection.error = err_col;
        }
        ctx.app.emit('error', err, ctx);
    }
});

// Resources
require('./newroutes/root')(router);
require('./newroutes/fcts')(router);
require('./newroutes/import_fcts')(router);


app
    .use(router.routes())
    .use(router.allowedMethods());

// Start server and export for testing
var server = module.exports.server = app.listen(3000);

// export app for testing
module.exports.app = app;
