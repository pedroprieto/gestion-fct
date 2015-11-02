define(["jquery", "materialize"], function() {

    return function(coltype) {
	switch(coltype) {
	default:
	    return default_queries();
	}

    }

    function default_queries() {
	var a;

	a = $('<ul>');
	a.addClass("collapsible");
	a.attr("data-collapsible","accordion");
	$('.collapsible').collapsible();
	
	return a;

    }

});
