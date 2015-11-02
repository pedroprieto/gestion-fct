define(["jquery", "materialize"], function() {

    return function(coltype) {
	switch(coltype) {
	default:
	    return default_collection();
	}

    }

    function default_collection() {
	
	var a = $('<ul class="collection">');
	return a;
    }

});
