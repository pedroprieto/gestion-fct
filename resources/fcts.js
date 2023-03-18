var cps = require('../aux/cursoperiodofct');
const FCT = require("../db/db_dynamo");

let fctsRoute = '/api/users/:user/fcts';
let fctRoute = '/api/users/:user/fcts/items/:curso/:periodo/:fctId';
let visitsRoute = '/api/users/:user/fcts/items/:curso/:periodo/:fctId/visits';
let visitRoute = '/api/users/:user/fcts/items/:curso/:periodo/:fctId/visits/:tipo?';

module.exports = function(router) {
    router.all('/api/users/:user/(.*)', async(ctx, next) => {
        if (ctx.state.user.name != ctx.params.user) {
            ctx.status = 401;
            return;
        }
        return next();
    });

    router.all('/api/users/:user/fcts/items/:curso/:periodo/:fctId/:visits?/:tipo?', async (ctx, next) => {
        ctx.state.usuCursoPeriodo =FCT.getPK(ctx.params.user, ctx.params.curso, ctx.params.periodo);
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
            let [usuario, curso, periodo] = FCT.getDataFromPK(item.usuCursoPeriodo);
            let [fctId, type, visita_tipo] = FCT.getDataFromSK(item.SK);

            it.type = type;
            it.id = fctId;
            it.user = ctx.state.user.name;
            it.curso = curso;
            it.periodo = periodo;
            it.fctId = fctId;
            if (type == "FCT") {
                it.href = router.url('fct', it);
                it.hrefVisit = router.url('visits', it);
                delete it.fctId;
            } else {
                it.tipo = visita_tipo;
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
        await FCT.deleteFCT(ctx.state.usuCursoPeriodo, ctx.params.fctId);
        ctx.status = 200;
        return next();
    });

    router.post('visits', visitsRoute, async (ctx, next) => {

        var visitData = ctx.request.body;
        
        let related_fctIds = visitData.related || [];

        let promesas = [];
        
        for (let fctId of related_fctIds) {
            // TODO: update distancia FCT
            promesas.push(FCT.addVisita(ctx.state.usuCursoPeriodo, fctId, visitData));
        }
        // Añadimos la FCT actual
        promesas.push(FCT.addVisita(ctx.state.usuCursoPeriodo, ctx.params.fctId, visitData));

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
        await FCT.deleteVisita(ctx.state.usuCursoPeriodo, ctx.params.fctId, ctx.params.tipo);
        ctx.status = 200;
        return next();
    });

    router.put(visitRoute, async (ctx, next) => {
        var visitData = ctx.request.body;
        await FCT.updateVisita(ctx.state.usuCursoPeriodo, ctx.params.fctId, ctx.params.tipo, visitData);
        ctx.status = 200;
        return next();
    });
}
