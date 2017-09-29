var db_config = require('./config.js');
var express = require('express');
var namedRoutes = require('./aux/named-routes-cj.js');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var authSaoFct = require('./auth/auth.js')(passport, BasicStrategy);
var error_handling = require('./errors/error_middleware.js');
var Ractive = require('ractive');
Ractive.DEBUG = false;
var Ractiveload = require( 'ractive-load' );

// Timezone para UTC y que no haya problemas con fechas
process.env.TZ = 'UTC';

var app = exports.app =  express();
namedRoutes.extend(app);

// Collection js template
app.locals.cj = require('./templates/collectionjs.js');
app.locals.errcj = require('./templates/collection_error.js');

// database connection
var mongoose = require('mongoose');
mongoose.connect(process.env.NODE_ENV!='test'? db_config.db.uri : db_config.db.testuri);

// Global variables
var contentType = 'application/vnd.collection+json';

app.use(partials());

// some environment variables
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
app.set('protocol', process.env.NODE_ENV!='test'? 'https' : 'http');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({strict: false, type: contentType}));
//app.use(bodyParser.text());

app.use(passport.initialize());

// Check authentication for all routes but /login
/*app.all('*', function(req, res, next) {
    if (/^\/login/g.test(req.url)) {
	return next();
    } else if (req.isAuthenticated()) {
	return next();
    } else {
	// TODO: posibilidad de cambiar y poner error 401
	return res.redirect("/login");
    }
});*/

app.all('*',passport.authenticate('basic', { session: false }), function(req,res,next) {
    return next();
});

// Default content type for all routes but /client
app.use(/^(?!\/client)(.+)$/, function(req, res, next) {
    res.type(contentType);
    // Cabecera Vary: Accept para que funcione correctamente la caché de navegadores.
    // Si se accede vía JSON al recurso y luego se accede a una url externa, al volver el navegador intenta cargar la versión JSON
    // otra vez en lugar de la HTML.
    // Así se soluciona (aunque sin ella en Firefox también iba. Parece que express mete la cabecera Vary por defecto.
    res.vary('Accept' );
    next();
});


// Routes
require('./routes/routes.js')(app);

// Parameters
require('./routes/params.js')(app);

// Hacer disponible la función lookupRoute en locals
// para que esté disponible en las plantillas
app.locals.lookupRoute = app.lookupRoute;

// Resources
require('./resources/index')(app);

// API or HTML
app.use(function htmlOrApi(req,res,next) {
    if (typeof res.locals.col === 'undefined')  // If not found
	return next('route');

    //return res.json(res.locals.col);
    
    res.format({
	'application/vnd.collection+json': function(){
	    return res.json(res.locals.col);
	},
	'text/html': function(){

	    Ractiveload.baseUrl = 'public/js/components/';
	    // TODO: Para corregir: Cargar modules desde Node
	    // Éste es un mero hack para que funcione en servidor
	    // Funciona porque Ractive no llama a estas funciones al renderizar
	    // Sí que llama a 'moment', pero ésta se carga en la aplicación en otros lugares.
	    Ractiveload.modules.fetch = './public/js/lib/fetch';
	    Ractiveload.modules.pikaday = './public/js/lib/pikaday';
	    Ractiveload('root.html').then(function(c) {
		//Ractive.components['component'] = c;

		// var ractive = new Ractive({
		var ractive = new c({
		    /*el: '#app',
		    template: '<component collection="{{collection}}"/>',*/
		    data: res.locals.col
		});

		var renderedHTML = ractive.toHTML();
		res.send(renderedHTML);
	    }).catch( next );
	},
	'default': function() {
	    // log the request and respond with 406
	    res.status(406).send('Not Acceptable');
	}
    });
});

// Cliente de prueba
var static_ops = {
    extensions: ['html'],
    index: ['cj-client.html']
};

app.use(app.lookupRoute('cliente'), express.static('public', static_ops));

// Página 404 - not found
app.use(function handleNotFound(req, res){
    res.status(404);
    // if (req.accepts('html')) {
    // res.render('404', { url: req.url });
    // return;
    // }
    if (req.accepts('json')) {
	res.send({ error: 'Not found' });
	return;
    }
    res.type('txt').send('Not found');
});


// Error handling
app.use(error_handling.logErrors);
app.use(error_handling.respondError);

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";
var server = app.listen(app.get('port'), ipaddress, function(){
    console.log('Express server listening on port ' + app.get('port'));
});

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});
