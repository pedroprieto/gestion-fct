var moment = require('moment');

module.exports.getcursoslist =  function() {
    var curso_inicial = 2012;
    var now = moment();
    var curso_final = now.year();
    var mes_actual = now.month();

    var cps = [];
    var cp;

    for (var i=curso_inicial; i<=curso_final; i++) {
	cp = {};
	cp.value = cp.prompt = (i - 1) + '-' + (i);
	cps.push(cp);
    }

    if (mes_actual >= 7) {
	cp = {};
	cp.value = cp.prompt = (curso_final) + '-' + (curso_final + 1);
	cps.push(cp);
    }

    return cps;
}

module.exports.getperiodoslist =  function() {
    //return [1,2];
    var ps = [];
    
    var c1 = {};
    c1.value = "1";
    c1.prompt = "1";

    var c2 = {};
    c2.value = "2";
    c2.prompt = "2";

    var todos = {};
    todos.value = "1,2";
    todos.prompt = "Todos";

    ps.push(c1);
    ps.push(c2);
    ps.push(todos);

    return ps;
    
}

module.exports.getCursoActual = function() {
    var now = moment();
    var curso_final = now.year();
    var mes_actual = now.month();

    if (mes_actual >= 7) {
	return (curso_final) + '-' + (curso_final + 1);
    } else {
	return (curso_final - 1) + '-' + (curso_final);
    }
}

module.exports.getPeriodoActual = function() {
    var now = moment();
    var curso_final = now.year();
    var mes_actual = now.month();
    
    if (mes_actual >= 7) {
	return 1;
    } else {
	return 2;
    }
}
