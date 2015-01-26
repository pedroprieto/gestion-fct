var mongoose = require('mongoose');
var visit = require('../models/visit');
var fm34 = require('../models/fm34');
module.exports.controller = function(app,route,baseUrl) {

/**
 * GET
 */
  app.get(route, function(req, res) {

     visit.find(function (err,visits) {
      if (err) return console.error(err);
      //res.send(users);
      res.header('content-type',contentType);
      res.render('visits', {
	  site: baseUrl + "visits",
	  items: visits
      });
	 
    });

  });

/**
 * POST
 */
  app.post(route, function(req, res) {
      var item,id,empresa,tipo,distancia,fecha,hora_salida,hora_regreso,localidad;
      var fecha_lunes_semana;

     // get data array
  data = req.body.template.data; 
    
  // pull out values we want
  for(i=0,x=data.length;i<x;i++) {
    switch(data[i].name) {
      case 'empresa' :
        empresa = data[i].value;
        break;
      case 'tipo' :
        tipo = data[i].value;
        break;
      case 'distancia' :
        distancia = data[i].value;
        break;
      case 'fecha' :
        fecha = data[i].value;
        break;
      case 'hora_salida' :
        hora_salida = data[i].value;
        break;
      case 'hora_regreso' :
        hora_regreso = data[i].value;
        break;
      case 'localidad' :
        localidad = data[i].value;
        break;
	
    }    
  }
      // Creamos elemento visita en la base de datos
      item = new visit();
      item.empresa=empresa;
      item.tipo = tipo;
      item.distancia = distancia;
      item.fecha = new Date(fecha);
      item.hora_salida = hora_salida;
      item.hora_regreso = hora_regreso;
      item.localidad = localidad;


      // Creamos fm 34
      // Buscamos si existe
      f = new Date(fecha);
      var day = f.getDay();
      diff = f.getDate() - day + (day == 0 ? -6:1);
      fecha_lunes_semana = new Date(f.setDate(diff));
      console.log(fecha_lunes_semana);
      
      
      item.save(function (err, item) {
	  if (err) {
	      return console.error(err);
	      res.status=400;
	      res.send('error');  
	  } else {
	      res.redirect('/visits/', 302);
	  }
    
      });

      
      
  });  

}
