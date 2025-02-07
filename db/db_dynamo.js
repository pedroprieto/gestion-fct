const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });
var ddb = new AWS.DynamoDB.DocumentClient();
const crypto = require('crypto');

async function clearTable() {
    var params = {
        TableName: process.env.table,
    };

    var response = await ddb.scan(params).promise();
    for (let item of response.Items) {
        await deleteItem(item.usuCursoPeriodo, item.SK );
    }
    return;
}

function saveUser(user) {
    let it = {
        usuCursoPeriodo: user.name,
        SK: "USER",
        password: user.password,
        salt: user.salt
    }

    var params = {
        Item: it,
        TableName: process.env.table,
    };
    return ddb.put(params).promise();
}

async function getUser(userName) {
    try {
        var params = {
            ExpressionAttributeValues: {
                ':usuCursoPeriodo': userName,
                ':SK': 'USER'
            },
            TableName: process.env.table,
            KeyConditionExpression: 'usuCursoPeriodo= :usuCursoPeriodo and SK= :SK'
        };

        var response = await ddb.query(params).promise();
        if (response.Items && response.Items.length) {
            let user = response.Items[0];
            user.name = user.usuCursoPeriodo;
            return user;
        } else {
            return null;
        }
    } catch (e) {
        console.log(e);
        throw new Error("Error al buscar el usuario");
    }
}

function getPK(usuario, curso, periodo) {
    return `${usuario}_${curso}_${periodo}`;
}

function getDataFromPK(usuCursoPeriodo) {
    return usuCursoPeriodo.split('_');
}

function getDataFromSK(fctIdTipo) {
    return fctIdTipo.split('_');
}

function getFctId(nif_alumno, empresa) {
    let shasum = crypto.createHash('sha1');
    shasum.update(`${nif_alumno}_${empresa}`);
    return shasum.digest('hex');
}

function getSK(fctId, tipo) {
    if (!tipo) {
        return `${fctId}_FCT`;
    } else {
        return `${fctId}_VIS_${tipo}`;
    }
}

async function getItemsByFCTUsuCursoPeriodoId(usuCursoPeriodo, fctId) {
    try {
        var params = {
            ExpressionAttributeValues: {
                ':usuCursoPeriodo': usuCursoPeriodo,
                ':SK': fctId 
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
        var params = {
            ExpressionAttributeValues: {
                ':usuCursoPeriodo': getPK(userName, c, p)
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
        let f = {};
        f.usuCursoPeriodo = getPK(usuario, curso, periodo);
        f.SK = getSK(getFctId(fctData.nif_alumno, fctData.empresa));
      const campos = (({ tutor, ciclo, empresa, nif_alumno, nif_alumno_dni, dir_empresa, localidad, instructor, nif_instructor, alumno, grupo, fecha_inicio, fecha_fin, horas, distancia }) => ({ tutor, ciclo, empresa, nif_alumno, nif_alumno_dni, dir_empresa, localidad, instructor, nif_instructor, alumno, grupo, fecha_inicio, fecha_fin, horas, distancia }))(fctData);
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


async function deleteFCT(usuCursoPeriodo, fctId) {
    let items = await getItemsByFCTUsuCursoPeriodoId(usuCursoPeriodo, fctId)
    let promesas = [];
    
    for (let item of items) {
        promesas.push(deleteItem( usuCursoPeriodo, item.SK));
    }
    return Promise.all(promesas)
};

function deleteVisita(usuCursoPeriodo, fctId, tipo ) {
    return deleteItem(usuCursoPeriodo, getSK(fctId, tipo));
}

function deleteItem(usuCursoPeriodo, SK ) {
    var params = {
        Key: {usuCursoPeriodo, SK},
        TableName: process.env.table,
        ConditionExpression: 'attribute_exists(usuCursoPeriodo)'
    };
    return ddb.delete(params).promise();
}

function addVisita(usuCursoPeriodo, fctId,  visitData) {
    let it = {};
    it.usuCursoPeriodo = usuCursoPeriodo;

    let tipo = visitData.tipo;
    if (tipo == 'adicional')
        tipo += `-${uuidv4()}`;
    
    it.SK = getSK(fctId, tipo);

    it = Object.assign(it, visitData);


    var params = {
        Item: it,
        TableName: process.env.table,
        ConditionExpression: 'attribute_not_exists(usuCursoPeriodo)'
    };
    return ddb.put(params).promise().then(() => {
        return it;
    });
}

function updateVisita(usuCursoPeriodo, fctId, tipo, visita) {

    var params = {
        Key: {usuCursoPeriodo, SK: getSK(fctId, tipo)},
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
    getUser,
    saveUser,
    clearTable,
    addFCT,
    deleteVisita,
    deleteFCT,
    updateVisita,
    addVisita,
    getFCTsByUsuarioCursoPeriodo,
    getDataFromPK,
    getDataFromSK,
    getPK,
    getSK
}
