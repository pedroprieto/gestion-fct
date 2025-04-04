const db = require("../db/db_dynamo");

const crypto = require('crypto');
const iterations = 1000;
const keylen = 64;
const digest = 'sha512';

async function getUser(username) {
    let loadedUser = await db.getUser(username);
    if (!loadedUser) {
        return null;
    } else {
        return new User(loadedUser.name, loadedUser.password, loadedUser.salt, loadedUser.role);
    }
}

function User(name, password, salt, role) {
    this.name = name;
    this.password = password;
    this.salt = salt;
    if (role)
      this.role = role
}

User.prototype.updatePass = function(plainPassword) {
    // generate a salt
    var salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(plainPassword, salt, iterations, keylen, digest).toString('hex');
    this.password = hash;
    this.salt = salt;
}

User.prototype.checkPass = function(plainPassword) {
    return this.password == crypto.pbkdf2Sync(plainPassword, this.salt, iterations, keylen, digest).toString('hex');

}

User.prototype.save = async function() {
    await db.saveUser(this);
}

module.exports = {
    User,
    getUser
}
