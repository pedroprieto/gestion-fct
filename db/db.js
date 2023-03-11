const { v4: uuidv4 } = require('uuid');

let users = [
    {
        name: "test",
        password: "$2a$10$n6aq.wD2JoHgO5BrvMmJnORuWxzZA5l4xAXUelcTj3FjW9He.YF56" // 1234
    }
];

let fcts = [];

module.exports = {
    async clearDB() {
        fcts = [];
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
            return (fct.usuario == userName) && (fct.curso == curso) && (fct.periodo in periodos);
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
    async deleteFCT(fct) {
        fcts = fcts.filter(f => f.id != fct.id);
    },
}
