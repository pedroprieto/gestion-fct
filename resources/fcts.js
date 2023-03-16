var cps = require('../aux/cursoperiodofct');
const FCT = require("../db/db_dynamo");

module.exports = function(router) {
    router.get('fcts', '/api/users/:user/fcts', async (ctx, next) => {
	var c = ctx.request.query.curso || cps.getCursoActual();
	var p = ctx.request.query.periodo || cps.getPeriodoActual();
        
        // href
	//col.href = router.url('fcts', ctx.params);
        
        // FCTs
        let fcts = await FCT.getFCTsByUsuarioCursoPeriodo(ctx.state.user.name, c, p);
        ctx.body = fcts;

        return next();
        
    });

    router.delete('fct', '/api/users/:user/fcts/items/:fct', async (ctx, next) => {
        try {
            await FCT.deleteFCT(ctx.params.fct);
        } catch (error) {
            console.log(error);
            throw new Error("Error al borrar la FCT.");
        }
        ctx.status = 200;
        return next();
    });
}
