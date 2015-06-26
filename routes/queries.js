// Funciones que devuelven cadenas de consulta para Mongo en función de los parámetros de las queries

var cps = require('../aux/cursoperiodofct');

// Devuelve un vector con los cursosperiodos filtrados de la query
module.exports.cursosperiodos = function (curso, periodo) {
    var cursos = [];
    var periodos = [];
    var cursosperiodos = [];

    // Si no existe parámetro curso, por defecto se indican todos los cursos
    if ((typeof curso === 'undefined') || (curso === "")) {
	if ((typeof periodo === 'undefined') || (periodo === "")) {
	    // Si no existe curso ni período, se indica el actual
	    cursosperiodos.push(cps.getCpActual());
	    return cursosperiodos;
	} else {
	    cursos = cps.getcursoslist();
	    periodos = periodo.split(',');
	}
    } else {
	cursos = curso.split(',');
	if ((typeof periodo === 'undefined') || (periodo === "")) {
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

    
    return cursosperiodos;    
    
};
