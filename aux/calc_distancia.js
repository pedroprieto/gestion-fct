var OSRM = require('osrm-client');
var osrm2 = new OSRM("http://router.project-osrm.org");
var promise = require('bluebird');
var osrm = promise.promisifyAll(osrm2);

module.exports = function(dir, cp, ciudad) {
    var geocoderProvider = 'nominatimmapquest';
    var httpAdapter = 'http';
    // Opciones extra
    var extra = {
    };

    var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
    
    var cp_ciudad = cp + "," + ciudad;

    // Coordenadas instituto
    var marenostrum = [38.3332889,-0.513169779915];
    
    var r = {};
    r.aprox = false;
    r.distancia = 0;
    
    return geocoder.geocode(dir + "," + cp_ciudad)
	.then(function(res) {
	    if (res.length === 0) {
		// Buscamos CP + ciudad sólo
		return geocoder.geocode(cp_ciudad)
		    .then(function(res) {
			r.aprox = true;
			var des = res[0];
			var destino = [des.latitude, des.longitude];
			var query = {coordinates: [marenostrum, destino]};
			return osrm.routeAsync(query);
		    });
	    } else {
		var des = res[0];
		var destino = [des.latitude, des.longitude];
		
		var query = {coordinates: [marenostrum, destino]};
		return osrm.routeAsync(query);
	    }
	})
	.then(function(result) {
	    r.distancia = result.route_summary.total_distance/1000;
	    return r;	    
	});
    
};
