// mongoexport -d fct -c fcts -o fcts.json --jsonArray

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
var ddb = new AWS.DynamoDB.DocumentClient();

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

var fcts = require('./fcts.json');
var users = require('./users.json');
var visits = require('./visits.json');

let fctsProcesadas = [];
let visitasProcesadas = [];

for (let fct of fcts) {
    let f = {};
    f = Object.assign(f, fct);
    delete f._id;
    delete f.usuario;
    delete f.fecha_fin;
    delete f.fecha_inicio;
    delete f.__v;
    delete f.visitas;
    delete f.curso;
    delete f.periodo;
    let periodo = fct.periodo;
    if (periodo == 1)
        periodo = 6;
    if (periodo == 2)
        periodo = 5;
    f.fecha_inicio = fct.fecha_inicio['$date'];
    f.fecha_fin = fct.fecha_fin['$date'];
    let usuario = users.find( u => u._id['$oid'] == fct.usuario['$oid']);
    f.usuCursoPeriodo = `${usuario.username}_${fct.curso}_${periodo}`;
    // SK

    let shasum = crypto.createHash('sha1');
    shasum.update(`${fct.nif_alumno}_${fct.empresa}`);
    let fctId = shasum.digest('hex');
    f.SK = `${fctId}_FCT`;
    
    fctsProcesadas.push(f);
    
    // Visitas
    for (let visitId of (fct.visitas || [])) {
        let visit = visits.find(v => v._id['$oid'] == visitId['$oid']);
        if (!visit)
            continue;
        let v = {};
        v = Object.assign(v, visit);
        delete v._id;
        delete v.anyo;
        delete v.semana;
        delete v.fecha;
        v.fecha = visit.fecha['$date'];
        delete v._usuario;
        delete v._fct;
        delete v.__v;
        if (v.tipo == 'otra')
            v.tipo = 'adicional';
        
        v.usuCursoPeriodo = f.usuCursoPeriodo;
        v.SK = `${fctId}_VIS_${v.tipo}`;
        
        if (v.tipo == 'adicional') {
            v.SK += `-${uuidv4()}`;
        }
        visitasProcesadas.push(v);
    }
}

let items = visitasProcesadas.concat(fctsProcesadas);

let promises = [];
for (let it of items) {
    var params = {
        Item: it,
        TableName: "gestionfct"
    };
    promises.push(ddb.put(params).promise());
}

Promise.all(promises).then(() => {
    console.log('Terminado');
    return;
})
