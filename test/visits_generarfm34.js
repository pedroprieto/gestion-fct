'use strict';

var utils = require('./utils');
var should = require('should');
var User = require('../models/user');
var Fct = require('../models/fct');
var Visit = require('../models/visit');
var Promise = require("bluebird");

describe('Comprobar la correcta generación de FM 34s', function () {

    var user_test1 = new User({
	username: 'testuser1',
	password: 'testuser1'
    });
    
    var fct1 = new Fct({
	tutor: "Tutor test",
	ciclo: "Ciclo test",
	empresa: "Empresa test",
	dir_empresa: "Dir empresa 1",
	alumno: "alumno test",
	nif_alumno: "12345678k",
	instructor: "instructor test",
	nif_instructor: "12345678k",
	grupo: "grupo test",
	curso: "2014-2015",
	periodo: "1",
	fecha_inicio: new Date(),
	fecha_fin:new Date(),
	horas: 400
    });

    var fct2 = new Fct({
	tutor: "Tutor test 2",
	ciclo: "Ciclo test 2",
	empresa: "Empresa test 2",
	dir_empresa: "Dir empresa 2",
	alumno: "alumno test 2",
	nif_alumno: "12345678k",
	instructor: "instructor test 2",
	nif_instructor: "12345678k",
	grupo: "grupo test 2",
	curso: "2014-2015",
	periodo: "2",
	fecha_inicio: new Date(),
	fecha_fin:new Date(),
	horas: 400
    });

    var v1 = new Visit({
	empresa: 'empresa1',
	tipo: 'inicial',
	distancia: 30,
	fecha: new Date(2015,4,8),
	hora_salida: '09:00',
	hora_regreso: '11:00',
	localidad: 'localidad test 1',
	impresion: 'texto impresión test 1'
    });

    var v2_same_date = new Visit({
	empresa: 'empresa1',
	tipo: 'seguimiento',
	distancia: 30,
	fecha: new Date(2015,4,8),
	hora_salida: '09:00',
	hora_regreso: '11:00',
	localidad: 'localidad test 1',
	impresion: 'texto impresión test 2'
    });

    var v3_other_hour = new Visit({
	empresa: 'empresa3',
	tipo: 'final',
	distancia: 30,
	fecha: new Date(2015,4,8),
	hora_salida: '15:00',
	hora_regreso: '17:00',
	localidad: 'localidad test 3',
	impresion: 'texto impresión test 3'
    });

    var v4_same_week = new Visit({
	empresa: 'empresa4',
	tipo: 'inicial',
	distancia: 30,
	fecha: new Date(2015,4,5),
	hora_salida: '15:00',
	hora_regreso: '17:00',
	localidad: 'localidad test 4',
	impresion: 'texto impresión test 4'
    });

    var v5_other_week = new Visit({
	empresa: 'empresa5',
	tipo: 'seguimiento',
	distancia: 30,
	fecha: new Date(2015,3,8),
	hora_salida: '15:00',
	hora_regreso: '17:00',
	localidad: 'localidad test 5',
	impresion: 'texto impresión test 5'
    });

    var v6_same_week = new Visit({
	empresa: 'empresa6',
	tipo: 'final',
	distancia: 30,
	fecha: new Date(2015,4,7),
	hora_salida: '15:00',
	hora_regreso: '17:00',
	localidad: 'localidad test 6',
	impresion: 'texto impresión test 6'
    });

    var usuario;

    it('Debe generar un FM34 al crear 3 visitas', function () {
	return user_test1.saveAsync()
	    .then(function(user) {
		usuario = user[0];
		fct1.usuario = usuario._id;
		fct2.usuario = usuario._id;
		return Promise.join(fct1.saveAsync(),fct2.saveAsync());
	    })
	    .then(function(f) {
		var f1 = f[0][0];
		var f2 = f[1][0];
		v1._fct = f1._id;
		v2_same_date._fct = f1._id;
		v3_other_hour._fct = f1._id;
		v4_same_week._fct = f2._id;
		v5_other_week._fct = f2._id;
		v6_same_week._fct = f2._id;
		v1._usuario = usuario._id;
		v2_same_date._usuario = usuario._id;
		v3_other_hour._usuario = usuario._id;
		v4_same_week._usuario = usuario._id;
		v5_other_week._usuario = usuario._id;
		v6_same_week._usuario = usuario._id;
		return Promise.join(v1.saveAsync(), v2_same_date.saveAsync(), v3_other_hour.saveAsync(), v4_same_week.saveAsync(), v5_other_week.saveAsync(), v6_same_week.saveAsync());
	    })
	    .then(function(vs) {
		return Visit.genfm34Async(usuario._id);
	    })
	    .then(function(fm34s) {
		console.log(fm34s);
		fm34s.should.have.a.lengthOf(2);
		var fm341 = fm34s.filter(function( obj ) {
		    return obj._id.semana == 15;
		})[0];
		var fm342 = fm34s.filter(function( obj ) {
		    return obj._id.semana == 19;
		})[0];
		fm341.visits.should.have.a.lengthOf(1);
		fm342.visits.should.have.a.lengthOf(4);
	    });

    });
});
