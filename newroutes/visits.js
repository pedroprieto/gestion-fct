var cps = require('../aux/cursoperiodofct');
const CJUtils = require('../aux/CJUtils.js');
const FCT = require("../newmodels/fct");
const db = require("../db/db");

module.exports = function (router) {
    router.get('visits', '/api/users/:user/fcts/items/:fct/visits', async (ctx, next) => {
        let col = CJUtils.CJ();

        var c = ctx.request.query.curso || cps.getCursoActual();
        var p = ctx.request.query.periodo || cps.getPeriodoActual();

        // Obtener FCT con visitas
        let fct = await FCT.getFCTConVisitasById(ctx.params.fct);

        // Title
        col.title = `Visitas FCT  ${fct.empresa} - ${fct.alumno}`

        // href
        col.href = router.url('visits', ctx.params);

        // Links
        col.links = [
            ctx.buildLink('fcts', 'Listado de FCTs', {}, { curso: c, periodo: p }),
            ctx.buildLink('import_fcts', 'Importar FCTs'),
            ctx.buildLink('fm34s', 'FM34s'),
            ctx.buildLink('documentacion', 'Documentación', {}, { curso: c, periodo: p }),
        ]

        col.items = fct.visitas.map(v => {
            let item = {};
            item.data = fct.visitToCJ(v);
            item.href = router.url('visit', Object.assign(ctx.params, { visit: v.id }));
            return item;
        });

        // Template para edición


        // Links
        if (!fct.inicial) {
            col.links.push(ctx.buildLink('template_visita', 'Crear visita inicial', { tipo: 'inicial' }, {}, 'secondary'));
        }

        if (!fct.seguimiento) {
            col.links.push(ctx.buildLink('template_visita', 'Crear visita de seguimiento', { tipo: 'seguimento' }, {}, 'secondary'));
        }

        if (!fct.final) {
            col.links.push(ctx.buildLink('template_visita', 'Crear visita final', { tipo: 'final' }, {}, 'secondary'));
        }

        // Links a templates para visitas específicas
        col.links.push(ctx.buildLink('template_visita', 'Crear visita adicional', { tipo: 'otra' }, {}, 'secondary')),

            ctx.body = { collection: col };

        return next();
    });


    // GET - Templates para crear visitas     
    router.get('template_visita', '/api/users/:user/fcts/items/:fct/visits/templates/:tipo', async (ctx, next) => {
        let col = CJUtils.CJ();

        var c = ctx.request.query.curso || cps.getCursoActual();
        var p = ctx.request.query.periodo || cps.getPeriodoActual();

        // Obtener FCT 
        let fct = await FCT.getFCTById(ctx.params.fct);

        // Title
        col.title = `Crear visita de tipo '${ctx.params.tipo}' en FCT ${fct.empresa} - ${fct.alumno}`

        col.type = "template";

        // href
        col.href = router.url('visits', ctx.params);

        // Links
        col.links = [
            ctx.buildLink('fcts', 'Listado de FCTs', {}, { curso: c, periodo: p }),
            ctx.buildLink('import_fcts', 'Importar FCTs'),
            ctx.buildLink('fm34s', 'FM34s'),
            ctx.buildLink('documentacion', 'Documentación', {}, { curso: c, periodo: p }),
            ctx.buildLink('visits', 'Volver', {}, {}, 'secondary'),
        ]

        // Template para creación
        let related_fcts = await fct.getFCTsMismaEmpresa();

        // Quitamos la fct actual y las relacionadas si ya tienen una visita de tipo distinto de 'otra' que coincida con el tipo de visita que estemos creando
        related_fcts = related_fcts.filter(function (fct) {
            // Quitamos misma empresa
            if (fct.id == ctx.params.fct)
                return false;
            if (ctx.params.tipo !== 'otra') {
                if (fct[ctx.params.tipo])
                    return false;
            }
            return true;
        })
        col.template = fct.genTemplateVisit(ctx.params.tipo, related_fcts);

        ctx.body = { collection: col };

        return next();
    });

    router.post('/api/users/:user/fcts/items/:fct/visits', async (ctx, next) => {

        var visitData = ctx.parseCJTemplate();

        let fct = await FCT.getFCTById(ctx.params.fct);

        if ((visitData.tipo != 'otra') && (fct[visitData.tipo])) {
            let err = new Error(`No se pueden crear más visitas de tipo ${visitData.tipo}`);
            err.status = 400;
            throw err;
        }

        // Si no se envía el campo 'presencial', se considera que es 'false'
        visitData.presencial = visitData.presencial || false;

        // Añadimos el usuario
        visitData.usuario = ctx.state.user.name;

        // Añadimos la empresa (no está puesta en el template)
        visitData.empresa = fct.empresa;

        // Añadimos ciclo y tutor
        visitData.ciclo = fct.ciclo;
        visitData.tutor = fct.tutor;

        // Comprobamos si se quieren crear visitas relacionadas
        // Las propiedades 'related-ID' indican, con valor booleano, si se quiere crear
        // una visita en la FCT con identificador ID relacionada

        let list_fcts = Object.entries(visitData).filter(function (a) {
            return ((a[0].indexOf('related') > -1) && (a[1] === true));
        }).map(function (ob) {
            // Obtenemos el ID, que es la substring que empieza después de related- (carácter número 8)
            return ob[0].substr(8);
        });

        // Añadimos la FCT actual
        list_fcts.push(ctx.params.fct);

        let fcts = await FCT.getFCTSByUsuarioCursoPeriodo(ctx.state.user.name, fct.curso, fct.periodo);
        fcts = fcts.filter(fct => {
            return list_fcts.includes(fct.id);
        });

        let promesas = [];

        for (let f of fcts) {
            f[visitData.tipo] = true;
            f.distancia = visitData.distancia;
            promesas.push(f.save());
            promesas.push(f.saveVisit(visitData));
        }

        return Promise.all(promesas).then(res => {
            ctx.status = 201;
            ctx.set('location', router.url("visits", ctx.params));
            return next();
        });

    });

    router.delete('visit', '/api/users/:user/fcts/items/:fct/visits/item/:visit', async (ctx, next) => {
        let fct = await FCT.getFCTById(ctx.params.fct);
        let visita = await FCT.getVisitById(ctx.params.visit);
        fct[visita.tipo] = false;
        await fct.save();
        await db.deleteVisit(ctx.params.visit);
        ctx.status = 200;
        return next();
    });

    router.put('/api/users/:user/fcts/items/:fct/visits/item/:visit', async (ctx, next) => {
        var visitData = ctx.parseCJTemplate();
        visitData.id = ctx.params.visit;
        visitData.fctId = ctx.params.fct;
        delete visitData.tipo;
        await FCT.updateVisit(visitData);
        ctx.status = 200;
        return next();
    });
}
