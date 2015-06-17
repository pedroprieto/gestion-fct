var moment = require('moment');
var getlist;

module.exports.getlist = getlist =  function() {
    var curso_inicial = 2012;
    var now = moment();
    var curso_final = now.year();
    var mes_actual = now.month();

    var cps = [];
    var cp;

    for (var i=curso_inicial; i<=curso_final; i++) {
	cp = (i - 1) + '-' + (i);
	cps.push(cp + '_1');
	cps.push(cp + '_2');
    }    

    // Si el mes es igual o mayor que 7, es decir, Agosto o superior
    // añadimos el primer período del curso siguiente
    if (mes_actual >= 7) {
	cp = (curso_final) + '-' + (curso_final + 1);
	cps.push(cp + '_1');
    }


    return cps;
}

module.exports.getcursoslist =  function() {
    var curso_inicial = 2012;
    var now = moment();
    var curso_final = now.year();

    var cps = [];
    var cp;

    for (var i=curso_inicial; i<=curso_final; i++) {
	cp = (i - 1) + '-' + (i);
	cps.push(cp);
    }

    return cps;
}

module.exports.validate = function(cursoperiodo) {
    if (getlist().indexOf(cursoperiodo) >=0) {
	return true;
    } else {
	return false;
    }
};

module.exports.getcurso = function(cursoperiodo) {
    return cursoperiodo.substring(0, cursoperiodo.indexOf('_'));
}

module.exports.getperiodo = function(cursoperiodo) {
    return cursoperiodo.substring(cursoperiodo.indexOf('_')+1, cursoperiodo.length);
}

module.exports.setCursoperiodo = function(curso, periodo) {
    return curso.concat('_').concat(periodo);
}

module.exports.getCpActual = function() {
    var now = moment();
    var curso_final = now.year();
    var mes_actual = now.month();
    var cp = (curso_final - 1) + '-' + (curso_final);

    if (mes_actual >= 7) {
	return (curso_final) + '-' + (curso_final + 1) + '_1';
    } else {
	return (curso_final - 1) + '-' + (curso_final) + '_2';
    }
}
