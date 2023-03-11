var cps = require('../aux/cursoperiodofct');
const CJUtils = require('../aux/CJUtils.js');
const FCT = require("../newmodels/fct");
var auth_sao = require('../auth/auth_sao');
var get_fcts_sao = require('../aux/get_fcts_sao');
var detallesFCT = require('../aux/get_fct_sao');

module.exports = function(router) {
    router.get('import_fcts', '/api/users/:user/import_fcts', async (ctx, next) => {
        let col = CJUtils.CJ();
        
	var c = ctx.request.query.curso || cps.getCursoActual();
	var p = ctx.request.query.periodo || cps.getPeriodoActual();
        
        // Title
	col.title = "Importar FCTs de SAO";
        
        // href
	col.href = router.url('import_fcts', ctx.params);
        
	// Template
	var data = [];
	
	var itemdata1 = {
	    prompt: "Introduzca el curso que desea importar",
	    name: "curso",
            type: "select",
            suggest: "cursos"
	};

	var itemdata2 = {
	    prompt: "Introduzca el período que desea importar",
	    name: "periodo",
            type: "select",
            suggest: "periodos",
	};
	
	data.push(itemdata1);
	data.push(itemdata2);

        col.template = {};
	col.template.data = data;
        
        col.related = {};
        col.related.periodos = cps.getperiodoslist();
        col.related.cursos = cps.getcursoslist();
        ctx.body = {collection: col};
    });

    router.post('/api/users/:user/import_fcts', async (ctx, next) => {
        let data = ctx.parseCJTemplate();
        
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
                let delay = 0; const delayIncrement = 400;
		lista_fcts.forEach(function(key) {
		    // Para cada FCT de la lista obtenemos sus datos
                    delay += delayIncrement;
		    promises_fct.push(new Promise(resolve => setTimeout(resolve, delay)).then(() => detallesFCT(sao_conn, key[0])));
		});
		return Promise.all(promises_fct);
	    })
	    .then(function(fcts_data) {
		var fcts = [];
		fcts_data.forEach(function(f) {
		    // Hacemos un upsert: si existe FCT con mismo NIF de alumno y nombre de empresa, se actualiza;

                    let fct = FCT.createFCT(f, ctx.state.user.name);
                    fcts.push(fct.save());
		    // En caso contrario, se crea un nuevo registro
		});
		return Promise.all(fcts);
	    })
	    .then(function(fcts) {
		// TODO
		/*res.location(req.buildLink('fcts').href);
		  res.status(201).end();*/
		// Respondemos con una collection con mensaje al usuario
                let col = CJUtils.CJ();

                // Title
	        col.title = "Importación realizada correctamente";
        
                // href
	        col.href = router.url('fcts', ctx.params);

		// Collection Links
		// var l = req.buildLink('fcts');
		// l.href += "?curso=" + curso + "&periodo=" + periodo;
		// col.links.push(req.buildLink('type_mensajes'));
		
		// col.links.push(l);
		var item = {};
		item.data = [];
		var d = {};
		d.name = "mensaje";
		d.prompt = "FCTs importadas correctamente. Haga click en el enlace para visualizar la lista de FCTs.";
		item.data.push(d);
		// item.links = [];		
		// item.links.push(l);
		col.items.push(item);

                ctx.status = 201;
                ctx.set('location', router.url("fcts", ctx.params));
                return next();
                
	    })
	    .catch(error => {
                console.log(error);
            });
    });
}
