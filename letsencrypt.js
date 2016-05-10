
var express = require('express');
var app = express();
var prompt = require('prompt');

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
app.set('protocol', process.env.NODE_ENV!='test'? 'https' : 'http');

prompt.start();

prompt.get(['ruta', 'clave'], function (err, result) {

  app.get(result.ruta, function (req, res) {
    res.send(result.clave);
  });

  var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";
  var server = app.listen(app.get('port'), ipaddress, function(){
    console.log('Express server listening on port ' + app.get('port'));
  });

});
