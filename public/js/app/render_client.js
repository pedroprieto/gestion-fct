define(["jquery", "materialize"], function() {

    return function() {
	$("a.button-collapse").sideNav({
            menuWidth: 300
	});
	/*	// Problema con labels Materialize
		if (inp.value != "") {
		lbl.className += " active";
		}*/

	// Items container
	console.log("aa");
	$("#items ul").addClass("collection");
    };
    
});
