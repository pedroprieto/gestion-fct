var fecha = require('../aux/convert_date.js');
var Fm34 = require('../models/fm34');
var Visit = require('../models/visit');
var moment = require('moment');
var gendoc = require('../aux/generate_doc');

var fm34docfile = 'prueba';


module.exports = function(app) {
    // TODO
    route = '';
    baseUrl = '';
    
    /**
     * GET lista de FM 34
     */
    app.get(app.lookupRoute('fm34s'), function(req, res, next) {

	Visit.genfm34Async(res.locals.user._id)
	    .then(function (fm34s) {

		var col = req.app.locals.cj();

		// Links
		//col.links.push(req.app.buildLink('visits'));
		// col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
		// col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
		// col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

		// Items
		col.items = fm34s.map(function(v) {
		    return Visit.genfm34_cj(v);
		});

		// Queries

		// Template		

		res.json({collection: col});
	    })
	    .catch(next);
	

    });

    /**
     * GET para versión DOCX del FM34
     */
    app.get(app.lookupRoute('fm34sdocx'), function(req, res, next) {
	var fs=require('fs');

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

		var fd = gendoc(doc, fm34docfile);
		if (fd) {
		    res.download(fd, function(err){
			if (err) {
			    // handle error, keep in mind the response may be partially-sent
			    // so check res.headerSent
			} else {
			    // descarga completada
			    fs.unlink(fd);
			}
		    });
		}

		else {
		    throw new Error('error');
		}

	
	    
	    })
	    .catch(next);

    });
    



    /**
     * GET
     */
    app.get(app.lookupRoute('fm34'), function(req, res, next) {

	var fm34 = res.locals.fm34;
	var col = req.app.locals.cj();

	// Links
	//col.links.push(req.app.buildLink('fcts', {user: res.locals.user.username}));
	col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	// Items

	var item = fm34.toObject({transform: Fm34.tx_cj});
//	item.links.push(req.app.buildLink('visits', {user: res.locals.user.username, fct: visit._id.toString()}));
	col.items.push(item);
	

	// Queries

	// Template
	
	res.json({collection: col});

    });

    /**
     * GET para versión DOCX del FM34
     */
    app.get(app.lookupRoute('fm34') + "/docx", function(req, res) {
	var id = req.params.id;
	fs=require('fs');
 	Docxtemplater=require('docxtemplater');

	//Load the docx file as a binary
	content=fs
	    .readFileSync(__dirname+"/../office_templates/prueba.docx","binary")

	doc=new Docxtemplater(content);

	fm34.findOne({ '_id': id }, function (err,fm34) {
	    if (err) return console.error(err);


	    
	    //set the templateVariables
	    
	    doc.setData({
		"fm34s" : [
		    // Para cambiar el formato de la fecha
		    JSON.parse(JSON.stringify(fm34,fecha.reemplaza))
		]
	    });

	    //apply them (replace all occurences of {first_name} by Hipp, ...)
	    doc.render();

	    var buf = doc.getZip()
		.generate({type:"nodebuffer"});

	    fs.writeFile("test.docx", buf, function(err) {
		if (err) throw err;
		//res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
		//res.download("test.docx");
		res.download("test.docx", function(err){
		    if (err) {
			// handle error, keep in mind the response may be partially-sent
			// so check res.headerSent
		    } else {
			// descarga completada
			fs.unlink("test.docx");
		    }
		});
	    });
	    
	});

    });
	    


}

