define(["app/cj-client", "jquery", "materialize"], function(cjclient) {
    
    $(function() {
	var pg = cjclient.cj();
	var http = location.protocol;
	var slashes = http.concat("//");
	var host = slashes.concat(window.location.host);
	pg.init(host + "/api");
	$(".button-collapse").sideNav({
            menuWidth: 300
	});
	/*	// Problema con labels Materialize
	if (inp.value != "") {
	    lbl.className += " active";
	}*/
    });


    
});
