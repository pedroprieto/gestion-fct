var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
const db = require("./db/db");

async function getUser(username) {
    let loadedUser = await db.getUser(username);
    if (!loadedUser) {
        return null;
    } else {
        return new User(loadedUser.name, loadedUser.password);
    }
}

function User(name, password) {
    this.name = name;
    this.password = password;
}

User.prototype.updatePass = function(plainPassword) {
    // generate a salt
    var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    var hash = bcrypt.hashSync(plainPassword, salt);
    console.log(hash);
    this.password = hash;
}

User.prototype.checkPass = function(plainPassword) {
    return bcrypt.compareSync(plainPassword, this.password);
}

User.prototype.save = async function() {
    await db.saveUser(this);
}

module.exports = {
    setDB,
    User,
    getUser
}
