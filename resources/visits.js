const FCT = require("../db/db_dynamo");

module.exports = function (router) {
    router.post('visits', '/api/users/:user/fcts/items/:fct/visits', async (ctx, next) => {
        var visitData = ctx.request.body;
        
        let related_fctIds = visitData.related || [];
        // Añadimos la FCT actual
        related_fctIds.push(ctx.params.fct);

        let promesas = [];

        for (let fctId of related_fctIds) {
            // TODO: update distancia FCT
            promesas.push(FCT.addVisita(ctx.state.user.name, fctId, visitData));
        }

        return Promise.all(promesas).then(res => {
            ctx.status = 201;
            return next();
        });
    });

    router.delete('visit', '/api/users/:user/fcts/items/:fct/visits/item/:visit', async (ctx, next) => {
        await FCT.deleteItem(ctx.params.visit);
        ctx.status = 200;
        return next();
    });

    router.put('/api/users/:user/fcts/items/:fct/visits/item/:visit', async (ctx, next) => {
        var visitData = ctx.request.body;
        await FCT.updateVisita(visitData);
        ctx.status = 200;
        return next();
    });
}
