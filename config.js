exports.db = {};
var dburl = process.env.MONGODB_URL || 'mongodb://localhost/';
exports.db.uri = dburl + 'fct';
exports.db.testuri = dburl + 'testfct';
exports.options = {};
