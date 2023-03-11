const db = require("../db/db");

let FCT = {};

async function getFCTSByUsuarioCursoPeriodo(userName, curso, periodo) {
    let periodos = [periodo];
    if (periodo == -1) {
        periodos = ['1', '2', '3', '4', '5', '6']
    };
    let fctlist = await db.getFCTSByUsuarioCursoPeriodo(userName, curso, periodos);
    return fctlist.map(fct => {
        return createFCT(fct, userName);
    });
}

let createFCT = function (FCTdata, userName) {
    let d = Object.create(FCT);
    d = Object.assign(d, FCTdata, { usuario: userName });
    return d;
};

let getFCTById = async function(id) {
    let fctData = await db.getFCTById(id);
    let fct = Object.create(FCT);
    return Object.assign(fct, fctData);
}

FCT.save = async function () {
    await db.saveFCT(this);
}

FCT.delete = async function () {
    await db.deleteFCT(this);
}

FCT.showFechaInicio = function () {
    return new Date(this.fecha_inicio).toLocaleDateString('es');
}

FCT.showFechaFin = function () {
    return new Date(this.fecha_fin).toLocaleDateString('es');
}

FCT.dataToCJ = function () {
    return [
        { name: 'empresa', prompt: 'Empresa', value: this.empresa },
        { name: 'alumno', prompt: 'Alumno', value: this.alumno },
        { name: 'fecha_inicio', prompt: 'Inicio', value: this.showFechaInicio() },
        { name: 'fecha_fin', prompt: 'Fin', value: this.showFechaFin() },
        { name: 'instructor', prompt: 'Instructor', value: this.instructor },
        { name: 'localidad', prompt: 'Localidad', value: this.localidad },
        { name: 'direccion', prompt: 'Dirección', value: this.direccion },
    ];
}

module.exports = {
    createFCT,
    getFCTById,
    getFCTSByUsuarioCursoPeriodo,
}
