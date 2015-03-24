var db_config = require('./config.js');
var express = require('express');
var namedRoutes = require('express-named-routes');
var partials = require('express-partials');
var bodyParser = require('body-parser');



var app = exports.app =  express();
namedRoutes.extend(app);

// Collection js template
app.locals.cj = require('./templates/collectionjs.js');

// database connection
var mongoose = require('mongoose');
mongoose.connect(db_config.db.uri);

// Global variables
var baseUrl = 'http://localhost:3000';
contentType = 'application/json';

app.use(partials());

// some environment variables
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({strict: false, type: 'application/collection+json'}));
app.use(bodyParser.text());

// Routes
require('./routes/routes.js')(app);

// Resources
require('./resources/index')(app);

// Cliente de prueba
app.use(express.static(__dirname + '/public'));


var server = app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});



/*var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
  }); */
