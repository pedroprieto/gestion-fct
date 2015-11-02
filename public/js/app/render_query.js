define(["jquery", "materialize"], function() {

    return function(querytype,query) {
	switch(querytype) {
	default:
	    return render_query_material(query);
	}

    }

     function render_query_material(query) {
	var ul, li;
	var form, fs, lg, p, lbl, inp;
	var header,body;
	var div;

	li = $("<li>");
	header = $("<div>").addClass("collapsible-header").html('<i class="material-icons">search</i>' + query.prompt);
	li.append(header);
	body = $("<div>").addClass("collapsible-body");
	form = $("<form>").attr("action",query.href).addClass(query.rel).attr("method","get").submit(httpQuery);
	div = $("<div>").addClass("row");

	for(var data of query.data) {
	    p = d.input({prompt:data.prompt,name:data.name,value:data.value});
	    if (data.name === "search") {
		p.className += " offset-s1 col s5";
	    } else {
		p.className += " col s2";
	    }
	    div.append(p);
	}
	
	p = $("<div>").addClass("col s1 input-field");
	inp = $("<button>").attr("type","submit").addClass("btn waves-effect waves-light").html('<i class="material-icons">search</i>');
	p.append(inp);
	div.append(p);
	form.append(div);
	body.append(form);
	li.append(body);
	return li;
    }

});
