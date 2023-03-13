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
    d = Object.assign(d, FCTdata, { usuario: userName, visitas:[] });
    return d;
};

let getFCTById = async function(id) {
    let fctData = await db.getFCTById(id);
    let fct = Object.create(FCT);
    return Object.assign(fct, fctData);
}

let getVisitById = async function(visitId) {
    return await db.getVisitById(visitId);
}

let getVisitsByUserFromTo = async function(username, start, end) {
    return await db.getVisitsByUserFromTo(username, start, end);
}

let updateVisit = async function(visitData) {
    return await db.updateVisit(visitData);
}

let getFCTConVisitasById = async function(fctId) {
    let fctData = await db.getFCTById(fctId);
    let fct = Object.create(FCT);
    fct = Object.assign(fct, fctData);
    fct.visitas = await db.getVisitasByFCTId(fctId);
    return fct;
}

FCT.getFCTsMismaEmpresa = async function() {
    let fctlist = await db.getFCTSByUsuarioCursoPeriodoEmpresa(this.usuario, this.curso, this.periodo, this.empresa);
    return fctlist.map(fct => {
        return createFCT(fct, this.usuario);
    });
}

FCT.save = async function () {
    await db.saveFCT(this);
}

FCT.saveVisit = async function (visitData) {
    await db.saveVisit({...visitData, fctId: this.id});
}

FCT.delete = async function () {
    await db.deleteFCT(this.id);
}

FCT.deleteVisits = async function () {
    let promises = [];
    for (let v of this.visitas) {
        promises.push(db.deleteVisit(v.id));
    }
    return Promise.all(promises);
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

FCT.visitToCJ = function (visitData) {
    return [
        { name: 'tipo', prompt: 'Tipo', value: visitData.tipo, type: 'hidden' },
        { name: 'distancia', prompt: 'Distancia', value: visitData.distancia || 0, type: 'number' },
        { name: 'fecha', prompt: 'Fecha', value: new Date(visitData.fecha).toLocaleDateString('es'), type: 'text' },
        { name: 'salida', prompt: 'Salida', value: visitData.salida, type: 'time' },
        { name: 'regreso', prompt: 'Regreso', value: visitData.regreso, type: 'time' },
        { name: 'localidad', prompt: 'Localidad', value: visitData.localidad, type: 'text' },
        { name: 'impresion', prompt: 'Impresión', value: visitData.impresion, type: 'textarea' },
        { name: 'presencial', prompt: 'Presencial', value: visitData.presencial ? 'Sí' : 'No', type: 'text' },
    ];
}

FCT.genTemplateVisit = function(tipo, related) {
    let template = {
            data: [
                { name: 'tipo', prompt: 'Tipo', value: tipo, type: 'hidden' },
                { name: 'distancia', prompt: 'Distancia', value: this.distancia || 0, type: 'number' },
                { name: 'fecha', prompt: 'Fecha', value: new Date().toISOString(), type: 'date' },
                { name: 'salida', prompt: 'Salida', value: undefined, type: 'time' },
                { name: 'regreso', prompt: 'Regreso', value: undefined, type: 'time' },
                { name: 'localidad', prompt: 'Localidad', value: this.localidad, type: 'text' },
                { name: 'impresion', prompt: 'Impresión', value: '', type: 'textarea' },
                { name: 'presencial', prompt: 'Presencial', value: tipo == 'otra' ? false : true, type: 'checkbox' },
            ]
    };

    // Añadimos FCTs relacionadas en el campo 'related' de la plantilla
    if ((typeof related) && (related.length > 0)) {
	for (let fct of related) {
	    template.data.push({
		name : `related-${fct.id}`,
		value : true,
		prompt : `${fct.empresa}-${fct.alumno}`,
                type: 'checkbox'
	    });
	}
    }

    return template;
}

module.exports = {
    createFCT,
    getFCTById,
    getVisitById,
    getVisitsByUserFromTo,
    updateVisit,
    getFCTConVisitasById,
    getFCTSByUsuarioCursoPeriodo,
}
