var cps = require('../aux/cursoperiodofct');


module.exports = function(app) {


    /**
     * GET para generar enlaces de documentación (certificado alumno, instructor y FM18)
     */
    app.get(app.lookupRoute('documentacion'), function(req, res, next) {

	var col = res.app.locals.cj();

	// Collection href
	col.href = req.buildLink('documentacion').href;

	var c = req.query.curso || cps.getCursoActual();
	var p = req.query.periodo || cps.getPeriodoActual();

	// Collection title
	col.title = "Documentación curso " + c + " período " + p;
	
	// Collection Links
	var fctlink = req.buildLink('fcts');
	fctlink.href += "?curso=" + c + "&periodo=" + p;
	col.links.push(fctlink);
	col.links.push(req.buildLink('import_fcts'));
	col.links.push(req.buildLink('fm34s'));
	var doclink = req.buildLink('documentacion');
	doclink.href += "?curso=" + c + "&periodo=" + p;
	col.links.push(doclink);
	col.links.push(req.buildLink('type_mensajes'));

	// Items
	col.items = [];

	var item,d,d1;

	// TODO: pulir
	item = {};
	item.data = [];
	d = {};
	d.name = "certs_alumno";
	d.prompt = "Generar certificados del alumno";
	d.value = "Generar certificados del alumno del curso " + c + " período " + p + ".";
	item.data.push(d);
	item.links = [];
	d1 = req.buildLink('certs_alumno');
	d1.href += "?curso=" + c + "&periodo=" + p;
	item.links.push(d1);
	col.items.push(item);

	item = {};
	item.data = [];
	d = {};
	d.name = "certs_instructor";
	d.prompt = "Generar certificados del instructor";
	d.value = "Generar certificados del instructor del curso " + c + " período " + p + ".";
	item.data.push(d);
	item.links = [];
	d1 = req.buildLink('certs_instructor');
	d1.href += "?curso=" + c + "&periodo=" + p;
	item.links.push(d1);
	col.items.push(item);

	item = {};
	item.data = [];
	d = {};
	d.name = "fm18s";
	d.prompt = "Generar FM18s";
	d.value = "Generar FM18s del curso " + c + " período " + p + ".";
	item.data.push(d);
	item.links = [];
	d1 = req.buildLink('fm18s');
	d1.href += "?curso=" + c + "&periodo=" + p;
	item.links.push(d1);
	col.items.push(item);

	item = {};
	item.data = [];
	d = {};
	d.name = "etiquetas";
	d.prompt = "Generar etiquetas";
	d.value = "Generar etiquetas del curso " + c + " período " + p + ".";
	item.data.push(d);
	item.links = [];
	d1 = req.buildLink('etiquetas');
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
		href: req.buildLink('documentacion').href,
		rel: "search",
		name: "search_doc",
		prompt: "Seleccionar curso y período",
		data: [
		    {
			name: "curso",
			value: (typeof req.query.curso!== 'undefined' && req.query.curso !== "") ? req.query.curso : c_actual,
			prompt: "Curso",
			options: cps.getcursoslist()
		    },
		    {
			name: "periodo",
			value: (typeof req.query.periodo!== 'undefined' && req.query.periodo !== "") ? req.query.periodo : p_actual,
			prompt: "Período",
			options: cps.getperiodoslist()
		    }
		    
		]
	    }
	);

	// Template

	// Return collection object
	res.json({collection: col});


    });


};
