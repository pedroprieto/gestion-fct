var cps = require('../aux/cursoperiodofct');
const FCT = require("../newmodels/fct");
var gendoc = require('../aux/generate_doc');

module.exports = function(router) {
    
    // Certificados de todas las FCT del curso/período
    router.get('docs_fct', '/api/users/:user/fcts/docs/:doc_name', async (ctx, next) => {
        let docfile = ctx.params.doc_name;
	var filename = ctx.state.user.name + "_" + docfile + ".docx";
        var generation_date = new Date().toLocaleDateString("es");
        
	var c = ctx.request.query.curso || cps.getCursoActual();
	var p = ctx.request.query.periodo || cps.getPeriodoActual();

        let fcts = await FCT.getFCTSByUsuarioCursoPeriodo(ctx.state.user.name, c, p);
        
        // Etiquetas
        if (ctx.params.doc_name == 'etiqueta') {
            await ctx.render("labels", {fcts});
            return next();
        }

	var doc= {
	    certs: JSON.parse(JSON.stringify(fcts, function(key, value) {
                if (key == 'fecha_inicio') {
                    return this.showFechaInicio();
                }
                if (key == 'fecha_fin') {
                    return this.showFechaFin();
                }
                return value;
            })),
            generation_date: generation_date
	};
        let certificado = gendoc(doc, docfile);
        

        ctx.body = certificado;
        ctx.response.attachment(filename);
        return next();
    });
    
    // Certificado individual de FCT
    router.get('doc_fct', '/api/users/:user/fcts/items/:fct/documentos/:doc_name', async (ctx, next) => {
        let docfile = ctx.params.doc_name;
	var filename = ctx.state.user.name + "_" + docfile + ".docx";
        var generation_date = new Date().toLocaleDateString("es");
        
        let fcts = [];
        let fct = await FCT.getFCTById(ctx.params.fct);
        fcts.push(fct);

        // Etiquetas
        if (ctx.params.doc_name == 'etiqueta') {
            await ctx.render("labels", {fcts});
            return next();
        }
        
	var doc= {
	    certs: JSON.parse(JSON.stringify(fcts, function(key, value) {
                if (key == 'fecha_inicio') {
                    return this.showFechaInicio();
                }
                if (key == 'fecha_fin') {
                    return this.showFechaFin();
                }
                return value;
            })),
            generation_date: generation_date
	};
        let certificado = gendoc(doc, docfile);
        

        ctx.body = certificado;
        ctx.response.attachment(filename);
        return next();
    });
}
