var visit = require('../models/visit');
var fm34 = require('../models/fm34');
var fct = require('../models/fct');

module.exports = function(app) {

/**
 * GET lista de visitas
 */
    app.get(app.lookupRoute('visits'), function(req, res) {

	visit.find(function (err,visits) {
	    if (err) return console.error(err);

	    col = req.app.locals.cj();

	    // Links
	    col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	    col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	    col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	    // Items
	    col.items = visits.map(function(visit) {
		return visit.toObject({ transform: visit.tx_cj });
	    });

	    
	    res.json(col);	 
	});

  });

/**
 * POST lista visitas
 */
  app.post(app.lookupRoute('visits'), function(req, res) {
      var item,id,empresa,tipo,distancia,fecha,hora_salida,hora_regreso,localidad,fct_nombre;
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
      item.save(function (err, item) {
	  if (err) {
	      return console.error(err);
	      res.status=400;
	      res.send('error');  
	  }
	  // Buscamos fct asociada y metemos referencia
	  fct.find({ empresa:  empresa}, function (err,fct_items) {

	      console.log(fct_items);
	      if (err) return console.error(err);

	      if (fct_items.length) {
		  for(j=0;j<fct_items.length;j++) {
		      fct_items[j].visitas.push(item._id);
		      fct_items[j].save();
		  }
	      } else {
		  res.status = 400;
		  res.send('error');
		  return console.error(err);
	      }
	  });
      });

      
      // TODO: fallo aquí
      // Creamos fm 34
      // Buscamos si existe
      f = new Date(fecha);
      var day = f.getDay();
      diff = f.getDate() - day + (day == 0 ? -6:1);
      // TODO: mejorar
      fecha_lunes_semana = new Date(f.setDate(diff));
      f = new Date(fecha_lunes_semana);
      day = f.getDay();
      diff2 = f.getDate() + 6;
      fecha_domingo_semana = new Date(f.setDate(diff2));
      var fm34doc;
      fm34.findOne({ semanaDe: fecha_lunes_semana}, function (err,f) {
	  // Comprobar si existe una visita a la misma hora. Futura mejora
	  if (err) return handleError(err);
	  if (f) {
	      f.visitas.push(item._id);
	      f.save(),
	      res.redirect('/visits/', 302);
	  } else {
	      // Creamos fm34
	      fm34doc = new fm34();
	      fm34doc.semanaDe = fecha_lunes_semana;
	      fm34doc.semanaAl = fecha_domingo_semana;
	      fm34doc.visitas.push(item);

	      fm34doc.save(function (err, item) {
		  if (err) {
		      return console.error(err);
		      res.status=400;
		      res.send('error');  
		  } else {
		      res.redirect('/visits/', 302);
		  }
    
	      });
	  }
      });

      


      /* visit.find(function (err,visits) {
      if (err) return console.error(err);
      //res.send(users);
      res.header('content-type',contentType);
      res.render('visits', {
      site: baseUrl + "visits",
      items: visits
      });
      
      });*/
      
      
      

      
      
  });  

    /**
     * GET visita      
     */

    app.get(app.lookupRoute('visit'), function(req, res) {
	var id = req.params.id;
	visit.findOne({ '_id': id }, function (err,visit) {
	    if (err) return console.error(err);
	    res.header('content-type',contentType);
	    res.render('visit', {
		site: req.protocol + '://' + req.get('host') + req.originalUrl + '/..',
		item: visit
	    });    
	});

    });

}
