module.exports.getcursoslist = function () {
    var curso_inicial = 2012;
    var now = new Date();
    var curso_final = now.getFullYear();
    var mes_actual = now.getMonth() + 1;

    var cps = [];
    var cp;

    for (var i = curso_inicial; i <= curso_final; i++) {
        cp = {};
        cp.value = cp.text = (i - 1) + '-' + (i);
        cps.push(cp);
    }

    if (mes_actual >= 7) {
        cp = {};
        cp.value = cp.text = (curso_final) + '-' + (curso_final + 1);
        cps.push(cp);
    }

    return cps;
}

function getperiodoslist() {
    //return [1,2];
    // Cambian a 5, 6 y -1 (todos)
    var ps = [];

    var c1 = {};
    c1.value = "5";
    c1.text = "Ordinario";

    var c2 = {};
    c2.value = "6";
    c2.text = "Extraordinario";

    var todos = {};
    todos.value = "-1";
    todos.text = "Todos";

    ps.push(c1);
    ps.push(c2);
    ps.push(todos);

    return ps;

}

module.exports.getperiodoslist = getperiodoslist;

module.exports.getCursoActual = function () {
    var now = new Date();
    var curso_final = now.getFullYear();
    var mes_actual = now.getMonth() + 1;

    if (mes_actual >= 7) {
        return (curso_final) + '-' + (curso_final + 1);
    } else {
        return (curso_final - 1) + '-' + (curso_final);
    }
}

module.exports.getPeriodoActual = function () {
    var now = new Date();
    var mes_actual = now.getMonth() + 1;

    if (mes_actual >= 7) {
        return 6;
    } else {
        return 5;
    }
}

module.exports.getNombrePeriodo = function (codigo) {
    return getperiodoslist().filter(function (el) {
        return el.value == codigo;
    })[0].text;

}
