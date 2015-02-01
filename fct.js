var http = require('http');
var express = require('express');
var partials = require('express-partials');
var fs = require('fs');
var http = require('http');
var bodyParser = require('body-parser');


var app = express();

// database connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fct');

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



// Resources and routes
// Users collection
var users = require('./resources/users.js');
users.controller(app,'/users',baseUrl);

// User item
var user = require('./resources/user.js');
user.controller(app,'/users/:id',baseUrl);

// Visits collection
var visits = require('./resources/visits.js');
visits.controller(app,'/visits',baseUrl);

// Visit item
var visit = require('./resources/visit.js');
visit.controller(app,'/visits/:id',baseUrl);

// FM34s collection
var fm34s = require('./resources/fm34s.js');
fm34s.controller(app,'/fm34s',baseUrl);

// FM 34 item
var fm34 = require('./resources/fm34.js');
fm34.controller(app,'/fm34s/items/:id',baseUrl);

// FCTs collection
var fcts = require('./resources/fcts.js');
fcts.controller(app,'/fcts',baseUrl);

// dynamically include routes (Controller)
/*fs.readdirSync('./resources').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./resources/' + file);
      route.controller(app,'/' + file.slice(0, -3));
  }
});*/

app.use(express.static(__dirname + '/public'));


var server = app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



/*var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
}); */
