// Funciones que devuelven cadenas de consulta para Mongo en función de los parámetros de las queries

var cps = require('../aux/cursoperiodofct');
var Promise = require('bluebird');

// Devuelve un vector con los cursosperiodos filtrados de la query
module.exports.cursosperiodos = Promise.promisify(function (curso, periodo, cb) {
    try {
	var cursos = [];
	var periodos = [];
	var cursosperiodos = [];

	// Si no existe parámetro curso, por defecto se indican todos los cursos
	if (typeof curso === 'undefined') {
	    if (typeof periodo === 'undefined') {
		// Si no existe curso ni período, se indica el actual
		cursosperiodos.push(cps.getCpActual());
		return cb(null,cursosperiodos);
	    } else {
		cursos = cps.getcursoslist();
		periodos = periodo.split(',');
	    }
	} else {
	    cursos = curso.split(',');
	    if (typeof periodo === 'undefined') {
		periodos = ['1', '2'];
	    } else {
		periodos = periodo.split(',');
	    }

	}
	
	for (var i in cursos) {
	    for (var j in periodos) {
		var cp = cps.setCursoperiodo(cursos[i], periodos[j]);
		if (cps.validate(cp)) {
		    cursosperiodos.push(cp);
		}
	    }
	}

	if (cursosperiodos.length === 0) {
	    //TODO: devolvemos curso último
	    		cursosperiodos.push(cps.getCpActual());
		return cb(null,cursosperiodos);
	    
	    //throw new Error('Query error');
	}
	

	return cb(null,cursosperiodos);

    } catch (e) {
	return cb(e);
    }

    
})
