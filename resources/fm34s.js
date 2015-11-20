var Visit = require('../models/visit');
var moment = require('moment');
var gendoc = require('../aux/generate_doc');

var fm34docfile = 'prueba';


module.exports = function(app) {

    function renderFm34Items(req,res,fm34s) {

	var items = fm34s.map(function(f) {
	    // Item data
	    var item =  Visit.genfm34_cj(f);

	    // Item href
	    var isoweek = moment().isoWeek(f._id.semana).isoWeekYear(f._id.anyo);
	    var princ = isoweek.startOf('isoWeek').format("DD-MM-YYYY");
	    item.href = req.buildLink('fm34', {fm34: princ}).href;

	    // Item links
	    item.links.push(req.buildLink('fm34docx', {fm34: princ}));

	    return item;
	});

	return items;

    }


    
    /**
     * GET lista de FM 34
     */
    app.get(app.lookupRoute('fm34s'), function(req, res, next) {

	// Query
	var ultimos_meses = req.query.mes;

	if (isNaN(ultimos_meses))
	    ultimos_meses = 1;

	var end = moment().toDate();
	var start = moment();
	start.month(start.month()-ultimos_meses);
	start = start.toDate();

	Visit.genfm34Async(res.locals.user._id, start, end)
	    .then(function (fm34s) {

		var col = req.app.locals.cj();

		// Collection href
		col.href = req.buildLink('fm34s').href;

		// Collection Links
		col.links.push(req.buildLink('fcts'));
		
		// Items
		col.items = renderFm34Items(req, res, fm34s);

		// Queries
		col.queries = [];
		col.queries.push(
		    {
			href: req.buildLink('fm34s').href,
			rel: "search",
			name: "search",
			prompt: "Búsqueda de FM34s",
			data: [
			    {
				name: "mes",
				value: req.query.mes || "",
				prompt: "Últimos meses"
			    }			    
			]
		    }
		);

		// Template		

		res.json({collection: col});
	    })
	    .catch(next);
	

    });

    /**
     * GET para versión DOCX del FM34
     */
    app.get(app.lookupRoute('fm34sdocx'), function(req, res, next) {

	Visit.genfm34Async(res.locals.user._id)
	    .then(function (fm34s) {
		var f;

		for (var i = 0; i<fm34s.length; i++) {
		    f=fm34s[i];
		    //var isoweek = moment(f._id.anyo + "-W0" + f._id.semana, moment.ISO_8601);
		    var isoweek = moment().isoWeek(f._id.semana).isoWeekYear(f._id.anyo);
		    f.semanaDe = isoweek.startOf('isoWeek').format("DD/MM/YYYY");
		    f.semanaAl = isoweek.endOf('isoWeek').format("DD/MM/YYYY");
		};

		//set the templateVariables
		var doc = {
		    fm34s: fm34s
		};

		return gendoc(doc, fm34docfile);
		
	    })
	    .then(function(buf) {

		var filename = res.locals.user.username + "_fm34s" + ".docx";
		res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
		res.set({"Content-Disposition":"attachment; filename=\"" + filename +  "\""});
		res.send(buf);

	    })
	    .catch(next);

    });
    



    /**
     * GET
     */
    app.get(app.lookupRoute('fm34'), function(req, res, next) {

	var fm34 = res.locals.fm34;

	var fm34s = [];
	fm34s.push(fm34);
	
	var col = req.app.locals.cj();

	// Collection href
	col.href = req.buildLink('fm34s').href;

	// Collection Links
	col.links.push(req.buildLink('fcts'));
	
	// Items
	col.items = renderFm34Items(req, res, fm34s);


	// Queries

	// Template
	
	res.json({collection: col});

    });

    /**
     * GET para versión DOCX del FM34
     */
    app.get(app.lookupRoute('fm34docx'), function(req, res, next) {

	var fm34 = res.locals.fm34;
	var isoweek = moment().isoWeek(fm34._id.semana).isoWeekYear(fm34._id.anyo);
	fm34.semanaDe = isoweek.startOf('isoWeek').format("DD/MM/YYYY");
	fm34.semanaAl = isoweek.endOf('isoWeek').format("DD/MM/YYYY");
	var fm34s = [];
	fm34s.push(fm34);
	//set the templateVariables
	var doc = {
	    fm34s: fm34s
	};

	gendoc(doc, fm34docfile).then(function(buf) {

	    var filename = res.locals.user.username + "_fm34_" + ".docx";
	    res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
	    res.set({"Content-Disposition":"attachment; filename=\"" + filename +  "\""});
	    res.send(buf);

	})
	    .catch(next);

    });
	    


}

