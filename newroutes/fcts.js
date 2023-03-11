var cps = require('../aux/cursoperiodofct');
const CJUtils = require('../aux/CJUtils.js');
const FCT = require("../newmodels/fct");

module.exports = function(router) {
    router.get('fcts', '/api/users/:user/fcts', async (ctx, next) => {
        let col = CJUtils.CJ();
        
	var c = ctx.request.query.curso || cps.getCursoActual();
	var p = ctx.request.query.periodo || cps.getPeriodoActual();
        
        // Title
	col.title = "FCTs " + c + " período " + cps.getNombrePeriodo(p);
        
        // href
	col.href = router.url('fcts', ctx.params);
        
        // FCTs
        let fcts = await FCT.getFCTSByUsuarioCursoPeriodo(ctx.state.user.name, c, p); 
        
        
        // Links
        col.links = [
            ctx.buildLink('fcts', 'Listado de FCTs', {}, {curso: c, periodo: p}),
            ctx.buildLink('import_fcts', 'Importar FCTs'),
            ctx.buildLink('fm34s', 'FM34s'),
            ctx.buildLink('documentacion', 'Documentación', {}, {curso: c, periodo: p}),
        ]
        
	col.items = fcts.map( f=> {
            let item = {};
            item.data = f.dataToCJ();
	    item.href = router.url('fct', Object.assign(ctx.params, {fct: f.id}));
            
            item.links = [
                ctx.buildLink('visitas', 'Visitas', {fct: f.id}),
                ctx.buildLink('doc_fct', 'Certificado de alumno', {fct: f.id, doc_name: 'cert_alumno'}),
                ctx.buildLink('doc_fct', 'Certificado de instructor', {fct: f.id, doc_name: 'cert_instructor'}),
                ctx.buildLink('doc_fct', 'FM 18', {fct: f.id, doc_name: 'fm18'}),
                ctx.buildLink('doc_fct', 'Etiqueta', {fct: f.id, doc_name: 'etiqueta'}),
            ];
            
            return item;
        });
        
        
	// If no items
	if (fcts.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "mensaje";
	    d.prompt = "No hay FCTs en este período. Si desea importar, haga click aquí en el enlace de importar";
	    item.data.push(d);
	    item.links = [
                ctx.buildLink('import_fcts', 'Importar FCTs'),
            ];
	    col.items.push(item);
	}

	// Queries
	var c_actual = cps.getCursoActual();
	var p_actual = cps.getPeriodoActual();
	col.queries = [];
	// TODO: queda pendiente problema con valores actuales cuando campos vacíos
	col.queries.push(
	    {
	        href: router.url('fcts', ctx.params),
		rel: "search",
		name: "searchfct",
		prompt: "Búsqueda de FCTs",
		data: [
		    {
			name: "datosfct",
			value: ctx.request.query.datosfct || "",
			prompt: "Búsqueda por texto"
		    },
		    {
			name: "curso",
			value: (typeof ctx.request.query.curso!== 'undefined' && ctx.request.query.curso !== "") ? ctx.request.query.curso : c_actual,
			prompt: "Curso",
			options: cps.getcursoslist()
		    },
		    {
			name: "periodo",
			value: (typeof ctx.request.query.periodo!== 'undefined' && ctx.request.query.periodo !== "") ? ctx.request.query.periodo : p_actual,
			prompt: "Período",
			options: cps.getperiodoslist()
		    }
		    
		]
	    }
	);


	// Queries de búsquedas por id
	col.queries.push(
	    {
	        href: router.url('certs_alumno', ctx.params),
		rel: "search searchids",
		name: "search_certs_alumno_ids",
		prompt: "Certs. alumno",
		render: "attachment",
		data: [
		    {
			name: "fctsid",
			value: "",
			prompt: "Búsqueda por ids separados por comas"
		    }
		]
	    }
	);
	col.queries.push(
	    {
	        href: router.url('certs_instructor', ctx.params),
		rel: "search searchids",
		name: "search_certs_instructor_ids",
		prompt: "Certs. instructor",
		render: "attachment",
		data: [
		    {
			name: "fctsid",
			value: "",
			prompt: "Búsqueda por ids separados por comas"
		    }
		]
	    }
	);
	col.queries.push(
	    {
	        href: router.url('fm18s', ctx.params),
		rel: "search searchids",
		name: "search_fm18s_ids",
		prompt: "FM18",
		render: "attachment",
		data: [
		    {
			name: "fctsid",
			value: "",
			prompt: "Búsqueda por ids separados por comas"
		    }
		]
	    }
	);
	col.queries.push(
	    {
	        href: router.url('etiquetas', ctx.params),
		rel: "search searchids",
		name: "search_etiquetas_ids",
		prompt: "Etiquetas",
		render: "attachment",
		data: [
		    {
			name: "fctsid",
			value: "",
			prompt: "Búsqueda por ids separados por comas"
		    }
		]
	    }
	);
                                 
        ctx.body = {collection: col};
    });
}
