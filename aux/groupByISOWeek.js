require('./weeknumber');

module.exports = function (visits) {

    let visitsNoDuplicates = visits.reduce((acc, visit) => {
        let fecha = new Date(visit.fecha).toISOString().substr(0, 10);
        let clave = `${fecha}-${visit.hora_salida}-${visit.hora_regreso}`;
        let exist = Boolean(acc[clave]);
        acc[clave] = exist ? acc[clave] : {
            ...visit
        };
        acc[clave].tipo = exist ? [...new Set([...acc[clave].tipo, visit.tipo])] : [visit.tipo];
        return acc;
    }, {});
    

    let groups = Object.entries(visitsNoDuplicates).sort().reduce((acc, [clave, visita]) => {
        let f = new Date(visita.fecha);
        let c1 = `${f.getWeekYear()}W${f.getWeek()}`;
        let startWeek = new Date(f);
        startWeek.setDate(f.getDate() - f.getDay() + 1);
        let endWeek = new Date(f);
        endWeek.setDate(f.getDate() - f.getDay() + 7);
        acc[c1] = acc[c1] || {start: startWeek, end: endWeek, visits: []};
        acc[c1].visits.push(visita);
        return acc;
    }, {});
    
    return groups;
}
