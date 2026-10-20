const FCT = require("../db/db_dynamo");
var createFEsFromList = require("../aux/createFEsFromList");

module.exports = function (router) {
  router.post("/api/users/:user/import_fcts", async (ctx, next) => {
    let data = ctx.request.body;

    const listFEsProcessed = createFEsFromList(data.listFEs.trim());

    let FEPromises = [];
    listFEsProcessed.forEach((FE) =>
      FEPromises.push(
        FCT.addFCT(ctx.state.user.name, data.curso, data.periodo, FE),
      ),
    );

    return Promise.all(FEPromises).then(function (fcts) {
      ctx.status = 201;
      ctx.set(
        "location",
        router.url("fcts", ctx.params, {
          query: { curso: data.curso, periodo: data.periodo },
        }),
      );
      return next();
    });
  });
};
