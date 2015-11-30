define(["app/cj-client", "jquery", "materialize"], function(cjclient) {
    
    $(function() {
	var pg = cjclient.cj();
	var http = location.protocol;
	var slashes = http.concat("//");
	var host = slashes.concat(window.location.host);
	pg.init(host + "/api");

	// Materialize sideNav
	$("a.button-collapse").sideNav({
            menuWidth: 240
	});
	
	
    });


    
});
