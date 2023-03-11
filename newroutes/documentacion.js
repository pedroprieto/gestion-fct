var cps = require('../aux/cursoperiodofct');
const CJUtils = require('../aux/CJUtils.js');
const FCT = require("../newmodels/fct");

module.exports = function(router) {
    router.get('documentacion', '/api/users/:user/documentacion', async (ctx, next) => {
        let col = CJUtils.CJ();
        
	var c = ctx.request.query.curso || cps.getCursoActual();
	var p = ctx.request.query.periodo || cps.getPeriodoActual();
        
        // Title
	col.title = "Documentación curso " + c + " período " + cps.getNombrePeriodo(p);
        
        // href
	col.href = router.url('documentacion', ctx.params);
        
        // Links
        col.links = [
            ctx.buildLink('fcts', 'Listado de FCTs', {}, {curso: c, periodo: p}),
            ctx.buildLink('import_fcts', 'Importar FCTs'),
            ctx.buildLink('fm34s', 'FM34s'),
            ctx.buildLink('documentacion', 'Documentación'),
        ]
        
        col.items = [];
        
	item = {};
	item.data = [];
	d = {};
	d.name = "certs_alumno";
	d.prompt = "Generar certificados del alumno";
	d.value = "Generar certificados del alumno del curso " + c + " período " + cps.getNombrePeriodo(p) + ".";
	item.data.push(d);
	item.links = [];

        d1 = ctx.buildLink('docs_fct', 'Certificados de alumnado', {doc_name: 'cert_alumno' }, {curso: c, periodo: p}),
	d1.href += "?curso=" + c + "&periodo=" + p;
	item.links.push(d1);
	col.items.push(item);

	item = {};
	item.data = [];
	d = {};
	d.name = "certs_instructor";
	d.prompt = "Generar certificados del instructor";
	d.value = "Generar certificados del instructor del curso " + c + " período " + cps.getNombrePeriodo(p) + ".";
	item.data.push(d);
	item.links = [];
        d1 = ctx.buildLink('docs_fct', 'Certificados de instructor', {doc_name: 'cert_instructor'}, {curso: c, periodo: p}),
	d1.href += "?curso=" + c + "&periodo=" + p;
	item.links.push(d1);
	col.items.push(item);

	item = {};
	item.data = [];
	d = {};
	d.name = "fm18s";
	d.prompt = "Generar FM18s";
	d.value = "Generar FM18s del curso " + c + " período " + cps.getNombrePeriodo(p) + ".";
	item.data.push(d);
	item.links = [];
        d1 = ctx.buildLink('docs_fct', 'FM18s', {doc_name: 'fm18'}, {curso: c, periodo: p}),
	d1.href += "?curso=" + c + "&periodo=" + p;
	item.links.push(d1);
	col.items.push(item);

	item = {};
	item.data = [];
	d = {};
	d.name = "etiquetas";
	d.prompt = "Generar etiquetas";
	d.value = "Generar etiquetas del curso " + c + " período " + cps.getNombrePeriodo(p) + ".";
	item.data.push(d);
	item.links = [];
        d1 = ctx.buildLink('etiquetas', 'Etiquetas', {}, {curso: c, periodo: p}),
	d1.href += "?curso=" + c + "&periodo=" + p;
	item.links.push(d1);
	col.items.push(item);
        
	// Queries
	var c_actual = cps.getCursoActual();
	var p_actual = cps.getPeriodoActual();
	col.queries = [];
	// TODO: queda pendiente problema con valores actuales cuando campos vacíos
	col.queries.push(
	    {
	        href: router.url('documentacion', ctx.params),
		rel: "search",
		name: "search_doc",
		prompt: "Seleccionar curso y período",
		data: [
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

                                 
        ctx.body = {collection: col};
        next();
    });
}
