// dynamically include routes (Controller)
module.exports = function(app) { 
    require('fs').readdirSync(__dirname + '/').forEach(function(file) {
	if (file.substr(-3) == '.js' && file.indexOf('#') == -1 && file !== 'index.js') {
	    var name = file.replace('.js', '');
	    require('./' + file)(app);
	}
    });
};
