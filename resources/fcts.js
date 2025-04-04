const AWS = require("aws-sdk");
const s3 = new AWS.S3();
var cps = require("../aux/cursoperiodofct");
const FCT = require("../db/db_dynamo");

let fctsRoute = "/api/users/:user/fcts";
let fctRoute = "/api/users/:user/fcts/items/:curso/:periodo/:fctId";
let visitsRoute = "/api/users/:user/fcts/items/:curso/:periodo/:fctId/visits";
let visitRoute =
  "/api/users/:user/fcts/items/:curso/:periodo/:fctId/visits/:visitaId?";
let visitTicket =
  "/api/users/:user/fcts/items/:curso/:periodo/:fctId/visits/:visitaId?/ticket";
let getTicket =
  "/api/users/:user/fcts/items/:curso/:periodo/:fctId/visits/:visitaId?/ticketget";
let subirKmsImporteRoute = "/api/users/:user/kmsimporte/:curso/:periodo";
let viewKmsImporteRoute = "/api/kmsimporte/:curso/:periodo";

function responseItem(item, ctx) {
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
    it.href = ctx.router.url("fct", it);
    it.hrefVisit = ctx.router.url("visits", it);
    delete it.fctId;
  } else {
    it.visitaId = visita_tipo;
    it.href = ctx.router.url("visit", it);
    it.tipo = visita_tipo.split("-")[0];
    delete it.curso;
    delete it.periodo;
    delete it.nif_alumno;
  }
  delete it.user;
  delete it.usuCursoPeriodo;
  delete it.SK;
  return it;
}

module.exports = function (router) {
  router.all("/api/users/:user/(.*)", async (ctx, next) => {
    if (ctx.state.user.name != ctx.params.user) {
      ctx.status = 401;
      return;
    }
    return next();
  });

  router.all(
    "/api/users/:user/fcts/items/:curso/:periodo/:fctId/:visits?/:visitaId?",
    async (ctx, next) => {
      ctx.state.usuCursoPeriodo = FCT.getPK(
        ctx.params.user,
        ctx.params.curso,
        ctx.params.periodo,
      );
      return next();
    },
  );

  router.all(
    "/api/users/:user/fcts/items/:curso/:periodo/:fctId/:visits?/:visitaId?/ticket",
    async (ctx, next) => {
      ctx.state.usuCursoPeriodo = FCT.getPK(
        ctx.params.user,
        ctx.params.curso,
        ctx.params.periodo,
      );
      return next();
    },
  );

  router.all(
    "/api/users/:user/kmsimporte/:curso/:periodo",
    async (ctx, next) => {
      ctx.state.usuCursoPeriodo = FCT.getPK(
        ctx.params.user,
        ctx.params.curso,
        ctx.params.periodo,
      );
      return next();
    },
  );

  router.get("fcts", fctsRoute, async (ctx, next) => {
    var c = ctx.request.query.curso || cps.getCursoActual();
    var p = ctx.request.query.periodo || cps.getPeriodoActual();

    // href
    //col.href = router.url('fcts', ctx.params);

    let response = await FCT.getFCTsByUsuarioCursoPeriodo(
      ctx.params.user,
      c,
      p,
    );

    let items = (response.Items || []).map((item) => {
      return responseItem(item, ctx);
    });

    ctx.body = items;

    return next();
  });

  router.delete("fct", fctRoute, async (ctx, next) => {
    await FCT.deleteFCT(ctx.state.usuCursoPeriodo, ctx.params.fctId);
    ctx.status = 200;
    return next();
  });

  router.post("visits", visitsRoute, async (ctx, next) => {
    var visitData = ctx.request.body;

    let related_fctIds = visitData.related || [];

    // Quito campo para que no se guarde en la BD
    delete visitData.related;

    let promesas = [];

    // Añadimos la FCT actual
    promesas.push(
      FCT.addVisita(ctx.state.usuCursoPeriodo, ctx.params.fctId, visitData),
    );
    // Quitamos la distancia a las relacionadas para que no cuente en el total
    visitData.distancia = 0;

    for (let fctId of related_fctIds) {
      // TODO: update distancia FCT
      promesas.push(FCT.addVisita(ctx.state.usuCursoPeriodo, fctId, visitData));
    }

    return Promise.all(promesas)
      .then((visits) => {
        let data = [];
        for (let v of visits) {
          data.push(responseItem(v, ctx));
        }
        ctx.body = data;
        ctx.status = 201;
        return next();
      })
      .catch((error) => {
        console.log(error);
        let err = new Error("No se ha podido crear la visita");
        err.status = 400;
        throw err;
      });
  });

  router.delete("visit", visitRoute, async (ctx, next) => {
    await FCT.deleteVisita(
      ctx.state.usuCursoPeriodo,
      ctx.params.fctId,
      ctx.params.visitaId,
    );
    ctx.status = 200;
    return next();
  });

  router.get("visitTicket", visitTicket, async (ctx, next) => {
    const fileName = `${ctx.params.fctId}_${ctx.params.visitaId}`;

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      ContentType: ctx.query.type,
      Expires: 300, // URL expires in 5 minutes
    };
    const url = await s3.getSignedUrlPromise("putObject", params);

    ctx.body = url;
    ctx.status = 200;
    return next();
  });

  router.get("getTicket", getTicket, async (ctx, next) => {
    const key = `${ctx.params.fctId}_${ctx.params.visitaId}`;

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Expires: 300, // URL expires in 5 minutes
    };
    const url = await s3.getSignedUrlPromise("getObject", params);
    ctx.body = url;
    ctx.status = 200;
    return next();
  });

  router.put(visitTicket, async (ctx, next) => {
    await FCT.addComprobanteToVisita(
      ctx.state.usuCursoPeriodo,
      ctx.params.fctId,
      ctx.params.visitaId,
      ctx.request.body.importe,
    );
    ctx.status = 200;
    return next();
  });

  router.put(visitRoute, async (ctx, next) => {
    var visitData = ctx.request.body;
    await FCT.updateVisita(
      ctx.state.usuCursoPeriodo,
      ctx.params.fctId,
      ctx.params.visitaId,
      visitData,
    );
    ctx.status = 200;
    return next();
  });

  router.put(subirKmsImporteRoute, async (ctx, next) => {
    await FCT.addKmsImporte(
      ctx.state.usuCursoPeriodo,
      ctx.request.body.kms,
      ctx.request.body.importe,
    );
    ctx.status = 200;
    return next();
  });

  router.get("viewKmsImporteRoute", viewKmsImporteRoute, async (ctx, next) => {
    let response = await FCT.getKmsImporteByCursoPeriodo(
      ctx.params.curso,
      ctx.params.periodo,
      ctx.state.user.role != "admin" ? ctx.state.user.name : undefined,
    );

    let items = (response.Items || []).map((item) => {
      return { usuario: item.SK, kms: item.kms, importe: item.importe };
    });

    ctx.body = items;

    return next();
  });
};
