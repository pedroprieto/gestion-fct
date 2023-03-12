const { v4: uuidv4 } = require('uuid');

let users = [
    {
        name: "test",
        password: "$2a$10$n6aq.wD2JoHgO5BrvMmJnORuWxzZA5l4xAXUelcTj3FjW9He.YF56" // 1234
    }
];

let fcts = [];
let visits = [];

module.exports = {
    async clearDB() {
        fcts = [];
        visits = [];
    },
    async getUser(username) {
        return users.find(user => user.name == username);
    },
    async saveUser(user) {
        let foundUser = users.find(u => u.name == user.name);
        if (foundUser) {
            foundUser.name = user.name;
            foundUser.password = user.password;
        } else {
            users.push({
                name: user.name,
                password: user.password
            });
        }
    },
    async getFCTSByUsuarioCursoPeriodo(userName, curso, periodos) {
        return fcts.filter(fct => {
            return (fct.usuario == userName) && (fct.curso == curso) && (periodos.includes(fct.periodo));
        });
    },
    async getFCTSByUsuarioCursoPeriodoEmpresa(userName, curso, periodos, empresa) {
        return fcts.filter(fct => {
            return (fct.usuario == userName) && (fct.curso == curso) && (periodos.includes(fct.periodo)) && (fct.empresa == empresa);
        });
    },
    async saveFCT(fct) {
        let foundFCT = fcts.find(f => (f.alumno == fct.alumno) && (f.empresa == fct.empresa));
        if (foundFCT) {
            for (let prop of Object.keys(fct)) {
                foundFCT[prop] = fct[prop];
            }
        } else {
            fcts.push({
                ...fct,
                id: uuidv4()
            });
        }
    },
    async deleteFCT(FCTId) {
        fcts = fcts.filter(f => f.id != FCTId);
    },
    async deleteVisit(visitId) {
        visits = visits.filter(v => v.id != visitId);
    },
    async getFCTById(id) {
        return fcts.find(fct => fct.id == id);
    },
    async getVisitasByFCTId(fctId) {
        return visits.filter(visit => visit.fctId == fctId);
    },
    async saveVisit(visitData) {
        visits.push({
            ...visitData,
            id: uuidv4()
        });
    },
}
