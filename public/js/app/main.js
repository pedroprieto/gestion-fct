define(["app/cj-client"], function(cjclient) {
    //the jquery.alpha.js and jquery.beta.js plugins have been loaded.
    
    $(function() {
	var pg = cjclient.cj();
	var http = location.protocol;
	var slashes = http.concat("//");
	var host = slashes.concat(window.location.host);
	pg.init(host + "/api");
	$(".button-collapse").sideNav({
            menuWidth: 300
	});
	$(".collapsible").collapsible();

	
    });


    
});
