var moment = require('moment');

    var curso_inicial = 2012;
    var now = moment();
    var curso_final = now.year();
    var mes_actual = now.month();

    var cps = [];
    var cp;

    for (var i=curso_inicial; i<curso_final; i++) {
	cp = (i - 1) + '-' + (i);
	cps.push(cp + '_1');
	cps.push(cp + '_2');
    }

    cp = (curso_final - 1) + '-' + (curso_final);
    cps.push(cp + '_1');

    // Si el mesa es igual o mayor que 7, es decir, Agosto o superior
    // añadimos el segundo período del año actual
    if (mes_actual >= 7) {
	cps.push(cp + '_2');
    }

    module.exports.getlist = function() {
	return cps;
    }

    module.exports.validate = function(cursoperiodo) {
	var i = cps.indexOf(cursoperiodo);
	if (i > -1) {
	    var result = {};
	    result.cursoperiodo = cursoperiodo;
	    result.curso = cursoperiodo.substring(0, cursoperiodo.indexOf('_'));
	    result.periodo = cursoperiodo.substring(cursoperiodo.indexOf('_')+1, cursoperiodo.length);
	    return result;
	} else {
	    return null;
	}
	
    };
