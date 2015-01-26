var http = require('http');
var express = require('express');
var partials = require('express-partials');
var fs = require('fs');
var http = require('http');

var app = express();

// database connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fct');

// Global variables
var baseUrl = 'http://localhost:3000/';
contentType = 'application/json';

app.use(partials());

// some environment variables
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + '/public'));


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

// FCTs collection
//var fcts = require('./resources/fcts.js');
//fcts.controller(app,'/users/:id/fcts',baseUrl);

// dynamically include routes (Controller)
/*fs.readdirSync('./resources').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./resources/' + file);
      route.controller(app,'/' + file.slice(0, -3));
  }
});*/


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



/*var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
}); */
