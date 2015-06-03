'use strict';

var utils = require('./utils');
var should = require('should');
var User = require('../models/user');
var Fct = require('../models/fct');
var Visit = require('../models/visit');
var Promise = require("bluebird");
var req = require('supertest-as-promised');
var app = require('../fct.js').app;

describe('Comprobar el borrado de FCT y sus visitas asociadas.', function () {

    var user_test1 = new User({
	username: 'testuser1',
	password: 'testuser1'
    });
    
    var fct1 = new Fct({
	tutor: "Tutor test",
	ciclo: "Ciclo test",
	empresa: "Empresa test",
	alumno: "alumno test",
	instructor: "instructor test",
	grupo: "grupo test",
	periodo: "periodo test",
	fecha_inicio: new Date(),
	fecha_fin:new Date(),
	horas: '400'
    });

   

    var v1 = new Visit({
	empresa: 'empresa1',
	tipo: 'inicial',
	distancia: 'distancia test 1',
	fecha: new Date(2015,4,8),
	hora_salida: '09:00',
	hora_regreso: '11:00',
	localidad: 'localidad test 1',
	impresion: 'texto impresión test 1'
    });


    var usuario;

    it('Debe borrar FCT y visitas asociadas.', function () {
	this.timeout(40000);
	var request = req('');
	var f1;
	return user_test1.saveAsync()
	    .then(function(user) {
		usuario = user[0];
		fct1.usuario = usuario._id;
		return fct1.saveAsync();
	    })
	    .then(function(f) {
		f1 = f[0];
		v1._fct = f1._id;
		v1._usuario = usuario._id;
		return v1.saveAsync();
	    })
	    .then(function(v) {
		v1=v[0];
		// Actualizamos vector de visitas de la FCT
		f1.visitas.push(v1._id);
		return f1.saveAsync();
	    })
	    .then(function(f) {
		return Visit.findAsync();
	    })
	    .then(function(vs) {
		// Comprobamos que hay una visita en la BD
		vs.length.should.be.equal(1);
		return request
		// Delete FCT
		    .delete(app.buildLink('fct',{user: user_test1.username, fct: f1._id}).href)
		    .set("Authorization", "basic " + new Buffer(user_test1.username + ':' + user_test1.password).toString("base64"))
		    .expect(204);
	    })
	    .then(function(r) {
		return Visit.findAsync();
	    })
	    .then(function(vs) {
		// Comprobamos que no hay visitas
		vs.length.should.be.equal(0);
		return Fct.findAsync();
	    })
	    .then(function(fs) {
		// Comprobamos que no hay fcts
		fs.length.should.be.equal(0);
	    });

    });
});
