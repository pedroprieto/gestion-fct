var utils = require('./utils');
var req = require('supertest-as-promised');
var should = require('should');
var app = require('../fct.js').app;
var routes = require('../routes/routes');
var Visit = require('../models/visit');
var User = require('../models/user');
var Fct = require('../models/fct');
var Promise = require("bluebird");
var contenttype ='application/vnd.collection+json';


describe('Crear una visita en una FCT', function () {

    var user_test1 = new User({
	username: 'test',
	password: 'test'
    });

    var user_test2 = new User({
	username: 'test2',
	password: 'test2'
    });

    var fct1 = new Fct({
	tutor: "Tutor test",
	ciclo: "Ciclo test",
	empresa: "Empresa test",
	dir_empresa: "Dir empresa ",
	alumno: "alumno test ",
	nif_alumno: "12345678k",
	instructor: "instructor test ",
	nif_instructor: "12345678k",
	curso: "2014-2015",
	periodo: "1",
	grupo: "grupo test",
	fecha_inicio: new Date(),
	fecha_fin:new Date(),
	horas: 400
    });

    // Misma empresa
    var fct2 = new Fct({
	tutor: "Tutor test 2",
	ciclo: "Ciclo test 2",
	empresa: "Empresa test",
	dir_empresa: "Dir empresa 2",
	nif_alumno: "12345678k",
	nif_instructor: "12345678k",
	instructor: "instructor test 2",
	alumno: "alumno test 2",
	instructor: "instructor test 2",
	grupo: "grupo test 2",
	curso: "2014-2015",
	periodo: "2",
	fecha_inicio: new Date(),
	fecha_fin:new Date(),
	horas: 400
    });

    // Distinta empresa
    var fct3 = new Fct({
	tutor: "Tutor test 3",
	ciclo: "Ciclo test 3",
	empresa: "Empresa test 2",
	dir_empresa: "Dir empresa ",
	nif_alumno: "12345678k",
	nif_instructor: "12345678k",
	alumno: "alumno test 3",
	instructor: "instructor test 3",
	grupo: "grupo test 3",
	curso: "2014-2015",
	periodo: "2",
	fecha_inicio: new Date(),
	fecha_fin:new Date(),
	horas: 400
    });

    // De otro usuario
    var fct4 = new Fct({
	tutor: "Tutor test 4",
	ciclo: "Ciclo test 4",
	empresa: "Empresa test 4",
	dir_empresa: "Dir empresa ",
	alumno: "alumno test 4",
	nif_alumno: "12345678k",
	instructor: "instructor test ",
	nif_instructor: "123456789k",
	instructor: "instructor test 4",
	grupo: "grupo test 4",
	curso: "2014-2015",
	periodo: "2",
	fecha_inicio: new Date(),
	fecha_fin:new Date(),
	horas: 400
    });

       
    var visit_test_template = {
	template: {
	    data: [
		{name: "tipo", value: "inicial"},
		{name: "distancia", value: "25"},
		{name: "fecha", value:  new Date().toString()},
		{name: "hora_salida", value: "10:00"},
		{name: "hora_regreso", value: "12:00"},
		{name: "localidad", value: "Localidad test"},
		{name: "impresion", value: "Impresión de la visita test"}
	    ]
	}
    };


    it('Debe crear visitas iguales para FCTs con misma empresa', function () {
	this.timeout(20000);
	var request = req('');
	var  f1, f2, f3, f4;

	return Promise.join(user_test1.saveAsync(), user_test2.saveAsync())
	    .then(function(us) {
		var u1  = us[0][0];
		var u2 = us[1][0];
		fct1.usuario = u1._id;
		fct2.usuario = u1._id;
		fct3.usuario = u1._id;
		fct4.usuario = u2._id;
		return Promise.join(fct1.saveAsync(), fct2.saveAsync(), fct3.saveAsync(), fct4.saveAsync());
	    })
	    .then(function(f) {
		f1 = f[0][0];
		f2 = f[1][0];
		f3 = f[2][0];
		f4 = f[3][0];
		// Creamos visita para FCT 1 y hacemos que también se cree para FCTs con la misma empresa (FCT 2)
		// Primero obtenemos template para crear visitas en FCT 1
		return request
		    .get(app.buildLink('template_visita',{user: user_test1.username, fct: f1._id, tipo: 'inicial'}).href)
		    .set("Authorization", "basic " + new Buffer(user_test1.username + ':' + user_test1.password).toString("base64"))
		    .set('Content-Type', contenttype)
		    .expect(200);
	    })
	    .then(function(res) {
		// Obtenemos FCTs relacionadas
		var related_fcts = res.body.collection.template.data.filter(function( obj ) {
		    return obj.name == 'related';
		})[0];
		should.exist(related_fcts);
		// Metemos una referencia a una FCT de otro usuario
		// No debe ser tenida en cuenta a la hora de crear las visitas
		related_fcts.value+= "," + fct4._id.toString();
		// Asociamos ese campo al template de la visita
		visit_test_template.template.data.push(related_fcts);
		return request
		// Petición POST al link de visitas para crear una visita
		    .post(app.buildLink('visits',{user: user_test1.username, fct: f1._id}).href)
		    .set("Authorization", "basic " + new Buffer(user_test1.username + ':' + user_test1.password).toString("base64"))
		    .set('Content-Type', contenttype)
		    .send(JSON.stringify(visit_test_template))
		    .expect(201);
	    })
	    .then(function(res) {
		// Buscamos las visitas creadas
		return Visit.findAsync();
	    })
	    .then(function(vs) {
		// Se deben haber creado dos visitas
		vs.should.have.a.lengthOf(2);
		return Fct.findAsync();
	    })
	    .then(function(fs) {
		// Tres FCTs
		var fc1 = fs.filter(function( obj ) {
		    return obj._id.equals(f1._id);
		})[0];
		var fc2 = fs.filter(function( obj ) {
		    return obj._id.equals(f2._id);
		})[0];
		var fc3 = fs.filter(function( obj ) {
		    return obj._id.equals(f3._id);
		})[0];
		fc1.visitas.should.have.a.lengthOf(1);
		fc2.visitas.should.have.a.lengthOf(1);
		fc3.visitas.should.have.a.lengthOf(0);
	    });
    });
	
    
});
