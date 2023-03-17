const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });
var ddb = new AWS.DynamoDB.DocumentClient();

async function clearTable() {
    var params = {
        TableName: process.env.table,
    };

    var response = await ddb.scan(params).promise();
    for (let item of response.Items) {
        await deleteItem({usuCursoPeriodo: item.usuCursoPeriodo, SK: item.SK});
    }
    return;
}

function getKey(usuario, curso, periodo, nif_alumno, empresa, tipo) {
    let usuCursoPeriodo = `${usuario}_${curso}_${periodo}`;
    let SK = `${nif_alumno}_${empresa}`;
    if (!tipo) {
        SK += "_FCT";
    } else {
        SK += `_VIS_${tipo}`;
    }
    return {
        usuCursoPeriodo,
        SK
    };
}

function getDataFromKey(key) {
    let [usuario, curso, periodo] = key.usuCursoPeriodo.split('_');
    let [nif_alumno, empresa, type, visita_tipo] = key.SK.split('_');
    // item.usuario = usuario
    return [
        usuario, curso, periodo, nif_alumno, empresa, type, visita_tipo
    ]
}

async function getItemsByFCTKey(fctKey) {
    try {
        var params = {
            ExpressionAttributeValues: {
                ':usuCursoPeriodo': fctKey.usuCursoPeriodo,
                ':SK': fctKey.SK.substring(0, fctKey.SK.length - 4)
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

async function getFCTsByUsuarioCursoPeriodo(userName, c, p) {
    try {
        let key = getKey(userName, c, p);
        var params = {
            ExpressionAttributeValues: {
                ':usuCursoPeriodo': key.usuCursoPeriodo
            },
            TableName: process.env.table,
            KeyConditionExpression: 'usuCursoPeriodo= :usuCursoPeriodo'
        };

        return await ddb.query(params).promise();
    } catch (e) {
        console.log(e);
        throw new Error("Error al buscar las FCTs");
    }
}

async function addFCT(usuario, curso, periodo, fctData) {
    try {
        let f = getKey(usuario, curso, periodo, fctData.nif_alumno, fctData.empresa);
        const campos = (({ tutor, ciclo, dir_empresa, localidad, instructor, nif_instructor, alumno, grupo, fecha_inicio, fecha_fin, horas, distancia }) => ({ tutor, ciclo, dir_empresa, localidad, instructor, nif_instructor, alumno, grupo, fecha_inicio, fecha_fin, horas, distancia }))(fctData);
        f = Object.assign(f, campos);

        var params = {
            Item: f,
            TableName: process.env.table,
        };
        await ddb.put(params).promise();
    } catch (e) {
        console.log(e);
        throw new Error("Error al Añadir la FCT");
    }
}


async function deleteFCT(key) {
    let items = await getItemsByFCTKey(key);
    let promesas = [];

    for (let item of items) {
        promesas.push(deleteItem({ usuCursoPeriodo: item.usuCursoPeriodo, SK: item.SK }));
    }
    return Promise.all(promesas)
};

function deleteItem(key) {
    var params = {
        Key: key,
        TableName: process.env.table,
        ConditionExpression: 'attribute_exists(usuCursoPeriodo)'
    };
    return ddb.delete(params).promise();
}

function addVisita(fctKey, visitData) {

    let it = {};
    it.usuCursoPeriodo = fctKey.usuCursoPeriodo;
    it.SK = fctKey.SK.substring(0, fctKey.SK.length - 4)
    

    let tipo = visitData.tipo;
    if (tipo == 'adicional')
        tipo += `_${uuidv4()}`;
    it.SK = `${it.SK}_VIS_${tipo}`;


    it = Object.assign(it, visitData);


    var params = {
        Item: it,
        TableName: process.env.table,
        ConditionExpression: 'attribute_not_exists(usuCursoPeriodo)'
    };
    return ddb.put(params).promise();
}

function updateVisita(key, visita) {

    var params = {
        Key: key,
        UpdateExpression: "set distancia = :distancia, fecha = :fecha, hora_salida = :hora_salida, hora_regreso = :hora_regreso, localidad = :localidad, impresion = :impresion, presencial = :presencial",
        ExpressionAttributeValues: {
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
    clearTable,
    addFCT,
    deleteItem,
    deleteFCT,
    updateVisita,
    addVisita,
    getFCTsByUsuarioCursoPeriodo,
    getDataFromKey,
    getKey,
}
