const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });
var ddb = new AWS.DynamoDB.DocumentClient();

async function getItemsByFCTId(fctId) {
    try {
        let keys = fctId.split('*');
        let usuCursoPeriodo = keys[0];
        let SK = keys[1];

        var params = {
            ExpressionAttributeValues: {
                ':usuCursoPeriodo': usuCursoPeriodo,
                ':SK': SK.substring(0, SK.length-4)
            },
            TableName: process.env.table,
            KeyConditionExpression: 'usuCursoPeriodo= :usuCursoPeriodo and begins_with(SK, :SK)'
        };

        var response = await ddb.query(params).promise();
        return response.Items || [];
    } catch (e) {
        console.log(e);
        throw new Error("Error al buscar los items");
    }
}

async function getFCTsByUsuariorCursoPeriodo (usuario, curso, periodo) {
    try {
        var params = {
            ExpressionAttributeValues: {
                ':usuCursoPeriodo': `${usuario}_${curso}_${periodo}`
            },
            TableName: process.env.table,
            KeyConditionExpression: 'usuCursoPeriodo= :usuCursoPeriodo'
        };

        var response = await ddb.query(params).promise();
        return response.Items || [];
    } catch (e) {
        throw new Error("Error al buscar las FCTs");
    }
}

function addFCT(usuario, curso, periodo, fct) {
        let f = {};
        f.usuCursoPeriodo = `${usuario}_${curso}_${periodo}`;
        f.SK = `${fct.nif_alumno}_${fct.empresa}_FCT`;
        const campos = (({ tutor, ciclo, dir_empresa, localidad, instructor, nif_instructor, alumno, grupo, fecha_inicio, fecha_fin, horas, distancia }) => ({ tutor, ciclo, dir_empresa, localidad, instructor, nif_instructor, alumno, grupo, fecha_inicio, fecha_fin, horas, distancia }))(fct);
        f = Object.assign(f, campos);

        var params = {
            Item: f,
            TableName: process.env.table,
        };
        return ddb.put(params).promise();
}

function deleteItem(itemId) {
        let f = {};
    let keys = itemId.split('*');
    f.usuCursoPeriodo = keys[0];
    f.SK = keys[1];
    var params = {
        Key: f,
        TableName: process.env.table,
        ConditionExpression: 'attribute_exists(usuCursoPeriodo)'
    };
    return ddb.delete(params).promise();
}

function addVisita(usuario, fctId, visitData) {
    let v = {};

    let keys = fctId.split('*');
    let fctKey = keys[1].substring(0, keys[1].length-4);
    let it = {};
    it.usuCursoPeriodo = keys[0];

    let tipo = visitData.tipo;
    if (tipo == 'adicional')
        tipo += `_${uuidv4()}`;
    it.SK = `${fctKey}_VIS_${tipo}`;


    it = Object.assign(it, visitData);


    var params = {
        Item: it,
        TableName: process.env.table,
        ConditionExpression: 'attribute_not_exists(usuCursoPeriodo)'
    };
    return ddb.put(params).promise();
}

function updateVisita(visita) {
    let v = {};
    let keys = visita.id.split('*');
    v.usuCursoPeriodo = keys[0];
    v.SK = keys[1];


    var params = {
        Key: v,
        UpdateExpression: "set empresa = :empresa, distancia = :distancia, fecha = :fecha, hora_salida = :hora_salida, hora_regreso = :hora_regreso, localidad = :localidad, impresion = :impresion, presencial = :presencial",
        ExpressionAttributeValues: {
            ":empresa": visita.empresa,
            ":distancia": visita.distancia,
            ":fecha": visita.fecha,
            ":hora_salida": visita.hora_salida,
            ":hora_regreso": visita.hora_regreso,
            ":localidad": visita.localidad,
            ":impresion": visita.impresion,
            ":presencial": visita.presencial
        },
        ConditionExpression: 'attribute_exists(usuCursoPeriodo)',
        TableName: process.env.table,
    };
    return ddb.update(params).promise();
}

module.exports = {
    addFCT,
    deleteItem,
    updateVisita,
    addVisita,
    getFCTsByUsuariorCursoPeriodo,
    getItemsByFCTId
}
