const FCT = require("../db/db_dynamo");
var auth_sao = require('../auth/auth_sao');
var get_fcts_sao = require('../aux/get_fcts_sao');
var detallesFCT = require('../aux/get_fct_sao');

module.exports = function(router) {
    router.post('/api/users/:user/import_fcts', async (ctx, next) => {
        let data = ctx.request.body;
        
	var sao_conn;
        
	return auth_sao(ctx.state.user.name, ctx.state.user.plainpassword)
	    .then(function(sao_conn_data) {
		if (sao_conn_data === false) {
		    var err = new Error();
		    err.name = 'Error al iniciar sesión en SAO';
		    err.message = 'Error al iniciar sesión en SAO';
		    err.status = 500;
		    throw err;
		} else {
		    // Obtenemos la lista de FCTs de SAO
		    sao_conn = sao_conn_data;
		    return get_fcts_sao(sao_conn_data, data.curso, data.periodo);
		}
	    })
	    .then(function(lista_fcts) {
		var promises_fct = [];
                let delay = 0; const delayIncrement = 500;
		lista_fcts.forEach(function(key) {
		    // Para cada FCT de la lista obtenemos sus datos
                    delay += delayIncrement;
		    promises_fct.push(new Promise(resolve => setTimeout(resolve, delay)).then(() => detallesFCT(sao_conn, key[0])));
		});
		return Promise.all(promises_fct);
	    })
	    .then(function(fcts_data) {
		var fcts = [];
		fcts_data.forEach(function(fct) {
		    // Hacemos un upsert: si existe FCT con mismo NIF de alumno y nombre de empresa, se actualiza;
                    fcts.push(FCT.addFCT(ctx.state.user.name, data.curso, data.periodo, fct));
		});
		return Promise.all(fcts);
	    })
	    .then(function(fcts) {
                ctx.status = 201;
                ctx.set('location', router.url("fcts", ctx.params, {query: {curso: data.curso, periodo: data.periodo}}));
                return next();
                
	    })
    });
}
