// const db = require("../db/db");
const db = require("../db/db_dynamo");

async function getFCTSByUsuarioCursoPeriodo(userName, curso, periodo) {
    // let fctlist = await db.getFCTSByUsuarioCursoPeriodo(userName, curso, periodos);
    let fctlist = await db.getFCTsByUsuariorCursoPeriodo(userName, curso, periodo);
    return fctlist.map(item => {
        let it = {};
        let [usuario, curso, periodo] = item.usuCursoPeriodo.split('_');
        let [nif_alumno, empresa, type, visita_tipo] = item.SK.split('_');
        // item.usuario = usuario
        it.id = item.usuCursoPeriodo + "*" + item.SK;
        it.type = type;
        it = Object.assign(it, item);
        it.empresa = empresa;
        if (type == "FCT") {
            it.curso = curso;
            it.periodo = periodo;
            it.nif_alumno = nif_alumno;
        } else {
            it.tipo = visita_tipo;
            it.fctId = `${item.usuCursoPeriodo}*${nif_alumno}_${empresa}_FCT`;
        }
        delete it.usuCursoPeriodo;
        delete it.SK;
        return it;
    });
}

async function deleteFCT(fctId) {
    return db.deleteFCT(fctId);
}

function addFCT(userName, curso, periodo, fct) {
    return db.addFCT(userName, curso, periodo, fct);
}

function addVisita(userName, fctId, visitData) {
    return db.addVisita(userName, fctId, visitData);
}

function deleteVisita(visitaId) {
    return db.deleteItem(visitaId);
}

function updateVisita(visita) {
    return db.updateVisita(visita);
}

module.exports = {
    getFCTSByUsuarioCursoPeriodo,
    deleteFCT,
    addFCT,
    addVisita,
    deleteVisita,
    updateVisita
}
