var cps = require('../aux/cursoperiodofct');
const FCT = require("../db/db_dynamo");

let fctsRoute = '/api/users/:user/fcts';
let fctRoute = '/api/users/:user/fcts/items/:curso/:periodo/:nif_alumno/:empresa';
let visitsRoute = '/api/users/:user/fcts/items/:curso/:periodo/:nif_alumno/:empresa/visits';
let visitRoute = '/api/users/:user/fcts/items/:curso/:periodo/:nif_alumno/:empresa/visits/:tipo';

module.exports = function(router) {
    router.all('/api/users/:user/fcts/items/:curso/:periodo/:nif_alumno/:empresa/:visits?/:tipo?', async (ctx, next) => {
        ctx.state.key = FCT.getKey(ctx.params.user, ctx.params.curso, ctx.params.periodo, ctx.params.nif_alumno, ctx.params.empresa, ctx.params.tipo);
        return next();
    });

    router.get('fcts', fctsRoute, async (ctx, next) => {
	var c = ctx.request.query.curso || cps.getCursoActual();
	var p = ctx.request.query.periodo || cps.getPeriodoActual();

        // href
	//col.href = router.url('fcts', ctx.params);

        let response = await FCT.getFCTsByUsuarioCursoPeriodo(ctx.params.user, c, p);
        
        let items = (response.Items || []).map(item => {
            let it = {};
            it = Object.assign(it, item);
            let [usuario, curso, periodo, nif_alumno, empresa, type, visita_tipo] = FCT.getDataFromKey({usuCursoPeriodo: item.usuCursoPeriodo, SK: item.SK});

            it = Object.assign(it, item);
            it.empresa = empresa;
            it.type = type;
            it.id = item.SK;
            it.user = ctx.state.user.name;
            it.curso = curso;
            it.periodo = periodo;
            it.nif_alumno = nif_alumno;
            if (type == "FCT") {
                it.href = router.url('fct', it);
                it.hrefVisit = router.url('visits', it);
            } else {
                it.tipo = visita_tipo;
                let fctKey = FCT.getKey(usuario, curso, periodo, nif_alumno, empresa);
                it.fctId = fctKey.SK;
                it.href = router.url('visit', it);
                delete it.curso;
                delete it.periodo;
                delete it.nif_alumno;
            }
            delete it.user;
            delete it.usuCursoPeriodo;
            delete it.SK;
            return it;
        });

        ctx.body = items;

        return next();
        
    });

    router.delete('fct', fctRoute, async (ctx, next) => {
        await FCT.deleteFCT(ctx.state.key);
        ctx.status = 200;
        return next();
    });

    router.post('visits', visitsRoute, async (ctx, next) => {

        var visitData = ctx.request.body;
        
        let related_fctSKs = visitData.related || [];

        let promesas = [];

        for (let fctSK of related_fctSKs) {
            // TODO: update distancia FCT
            promesas.push(FCT.addVisita({usuCursoPeriodo: ctx.state.key.usuCursoPeriodo, SK: fctSK}, visitData));
        }
        // Añadimos la FCT actual
        promesas.push(FCT.addVisita(ctx.state.key, visitData));

        return Promise.all(promesas).then(res => {
            ctx.status = 201;
            return next();
        }).catch(error => {
            let err = new Error("No se ha podido crear la visita");
            err.status = 400;
            throw err;
        });;
    });

    router.delete('visit', visitRoute, async (ctx, next) => {
        await FCT.deleteItem(ctx.state.key);
        ctx.status = 200;
        return next();
    });

    router.put(visitRoute, async (ctx, next) => {
        var visitData = ctx.request.body;
        await FCT.updateVisita(ctx.state.key, visitData);
        ctx.status = 200;
        return next();
    });
}
