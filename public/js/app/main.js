define(["app/cj-client", "jquery", "materialize"], function(cjclient) {
    
    $(function() {
	var pg = cjclient.cj();
	var http = location.protocol;
	var slashes = http.concat("//");
	var host = slashes.concat(window.location.host);
	var url = location.hash.substr(1) || host + '/api';
	pg.init(url);

	// Materialize sideNav
	$("a.button-collapse").sideNav({
            menuWidth: 240
	});

	window.onpopstate = function (event) {
	    var url = location.hash.substr(1) || host + '/api';
	    pg.init(url);
	}
	
	
    });


    
});
