const FCT = require("../db/db_dynamo");

module.exports = function (router) {
    router.post('visits', '/api/users/:user/fcts/items/:curso/:periodo/:nif_alumno/:empresa/visits', async (ctx, next) => {

        var visitData = ctx.request.body;
        
        let related_fctKeys = visitData.related || [];

        let promesas = [];

        for (let fctKey of related_fctKeys) {
            // TODO: update distancia FCT
            promesas.push(FCT.addVisita(FCT.getKeyFromId(fctKey), visitData));
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

    router.delete('visit', '/api/users/:user/fcts/items/:curso/:periodo/:nif_alumno/:empresa/visits/:tipo', async (ctx, next) => {
        await FCT.deleteItem(ctx.state.key);
        ctx.status = 200;
        return next();
    });

    router.put('/api/users/:user/fcts/items/:curso/:periodo/:nif_alumno/:empresa/visits/:tipo', async (ctx, next) => {
        var visitData = ctx.request.body;
        await FCT.updateVisita(ctx.state.key, visitData);
        ctx.status = 200;
        return next();
    });
}
