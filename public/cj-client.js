/*
  fully-compliant Collection+JSON client 
  stand-alone client code
  cj-full.js 
  @mamund
  
  NOTES:
  - uses no external libs/frameworks
  - built/tested for chrome browser (YMMV on other browsers)
  - designed to act as a "validator" for a human-driven Cj client.
  - not production robust (missing error-handling, perf-tweaking, etc.)
  - report issues to https://github.com/collection-json/cj-client
*/

function cj() {

    var d = domHelp();  
    var g = {};
    
    g.url = '';
    g.cj = null;
    g.ctype = "application/vnd.collection+json";
    // Link rel='profile' de la collection
    g.profile = "";
    // Link rel='type' de la collection
    g.type = "";

    // init library and start
    function init(url) {
	if(!url || url==='') {
	    alert('*** ERROR:\n\nMUST pass starting URL to the Cj library');
	}
	else {
	    g.url = url;
	    req(g.url,"get");
	}
    }

    // primary loop
    function parseCj() {
	dump();
	title();
	links();
	items();
	queries();
	template();
	error();
	cjClearEdit();
	$(".collapsible").collapsible();

    }

    // handle response dump
    function dump() {
	var elm = d.find("dump");
	elm.innerText = JSON.stringify(g.cj, null, 2);
	g.profile = "";
	g.type = "";
    }
    
    // handle title
    function title() {
	var elm;
	
	if(hasTitle(g.cj.collection)===true) {
	    elm = d.find("title");
	    elm.innerText = g.cj.collection.title;
	    elm = d.tags("title");
	    elm[0].innerText = g.cj.collection.title;
	}
    }
    
    // handle link collection
    function links() {
	var elm, coll;
	var ul, li, a, img;
	var head, lnk;
	
	ul = d.find("links");
	d.clear(ul);
	if(g.cj.collection.links) {
	    coll = g.cj.collection.links;
	    //ul.onclick = httpGet;
	    
	    for(var link of coll) {

		// stuff render=none Cj link elements in HTML.HEAD
		if(isHiddenLink(link)===true) {
		    head = d.tags("head")[0];
		    lnk = d.link({rel:link.rel,href:link.href,title:link.prompt});
		    d.push(lnk,head);
		    continue;
		}

		// Store collection profile
		if(isProfileLink(link)===true) {
		    g.profile = link.href;
		}

		// Store collection type
		if(isTypeLink(link)===true) {
		    g.type = link.href;
		}
		
		// render embedded images, if asked
		li = d.node("li");
		if(isImage(link)===true) {
		    img = d.image({href:link.href,className:link.rel});
		    d.push(img, li);
		}
		else if(isAttachment(link)===true) {
		    a = d.anchor({rel:link.rel,href:link.href,text:link.prompt,render: link.render});
		    d.push(a, li);
		} else {
		    a = d.anchor({rel:link.rel,href:link.href,text:link.prompt,render: link.render});
		    a.onclick = httpGet;
		    d.push(a, li);
		}
		d.push(li, ul);
	    }
	}
	$( "#links li" ).clone().appendTo( "#mobile-links" );
    }

    // handle item collection
    function items() {
	var elm, coll;
	var el;
	var col_container;

	elm = $("#items");
	elm.empty();

	col_container = render["fcts"]();
	elm.append(col_container);
	
	if(g.cj.collection.items) {
	    coll = g.cj.collection.items;
	    for(var item of coll) {
		el = render["fct"](item);
		col_container.append(el);
	    }
	}
    }
    
    // handle query collection
    function queries() {
	var elm, coll,li;
	var queries_container;

	elm = $("#queries");
	elm.empty();
	if(g.cj.collection.queries) {
	    queries_container = renderQueriesContainer();
	    //ul = d.node("ul");
	    coll = g.cj.collection.queries;
	    for(var query of coll) {
		li = renderQuery(query);
		queries_container.append(li);
	    }
	    elm.append(queries_container);
	}
    }

    // handle template object
    function template() {
	var elm, coll;
	var form, fs, lg, p, lbl, inp;

	elm = d.find("template");
	d.clear(elm);
	if(hasTemplate(g.cj.collection)===true) {
	    coll = g.cj.collection.template.data;
	    form = d.node("form");
	    form.action = g.cj.collection.href;
	    form.method = "post";
	    form.className = "add";
	    form.onsubmit = httpPost;
	    fs = d.node("fieldset");
	    lg = d.node("legend");
	    lg.innerHTML = "Add";
	    d.push(lg,fs);
	    for(var data of coll) { 
		p = d.input({prompt:data.prompt+"&nbsp;",name:data.name,value:data.value});
		d.push(p,fs);
	    }
	    p = d.node("p");
	    inp = d.node("input");
	    inp.type = "submit";
	    d.push(inp,p);
	    d.push(p,fs);
	    d.push(fs,form);
	    d.push(form, elm);
	}
    }
    
    // handle error object
    function error() {
	var elm, obj;

	elm = d.find("error");
	d.clear(elm);
	if(g.cj.collection.error) {
	    obj = g.cj.collection.error;

	    p = d.para({className:"code",text:obj.code});
	    d.push(p,elm);

	    p = d.para({className:"title",text:obj.title});
	    d.push(p,elm);

	    p = d.para({className:"url",text:obj.url});
	    d.push(p,elm);
	}
    }

    // ***************************
    // cj helpers
    // ***************************
    
    // render editable form for an item
    function cjEdit(e) {
	var elm, coll;
	var form, fs, lg, p, lbl, inp;
	var data, item, dv, tx;
	
	elm = d.find("edit");
	d.clear(elm);
	
	// get data from selected item
	item = cjItem(e.target.href);
	if(item!==null) {
	    form = d.node("form");
	    form.action = item.href;
	    form.method = "put";
	    form.className = "edit";
	    form.onsubmit = httpPut;
	    fs = d.node("fieldset");
	    lg = d.node("legend");
	    lg.innerHTML = "Edit";
	    d.push(lg,fs);
	    
	    // get template for editing
	    coll = g.cj.collection.template.data;
	    for(var data of coll) {
		dv = cjData(item, data.name);
		tx=(dv!==null?dv.value+"":"");
		p = d.input({prompt:data.prompt,name:data.name,value:tx});
		d.push(p,fs);
	    }
	    p = d.node("p");
	    inp = d.node("input");
	    inp.type = "submit";
	    d.push(inp,p);
	    d.push(p,fs);
	    d.push(fs,form);
	    d.push(form, elm);
	    elm.style.display = "block";
	}
	return false;
    }
    function cjClearEdit() {
	var elm;
	elm = d.find("edit");
	d.clear(elm);
	elm.style.display = "none";
	return;
    }
    function hasTitle(collection) {
	return (collection.title && collection.title.length!==-1);
    }
    function hasTemplate(collection) {
	return (collection.template && Array.isArray(collection.template.data)===true);
    }
    function isHiddenLink(link) {
	var rtn = false;
	if(link.render && (link.render==="none" || link.render==="hidden" || link.rel==="stylesheet")) {
	    rtn = true;
	}
	return rtn;
    }
    function isAttachment(link) {
	var rtn = false;
	if(link.render && link.render==="attachment") {
	    rtn = true;
	}
	return rtn;
    }
    function isProfileLink(link) {
	var rtn = false;
	if(link.rel && link.rel==="profile") {
	    rtn = true;
	}
	return rtn;
    }
    function isTypeLink(link) {
	var rtn = false;
	if(link.rel && link.rel==="type") {
	    rtn = true;
	}
	return rtn;
    }
    function isReadOnly(item) {
	var rtn = false;
	if(item.readOnly && (item.readOnly==="true" || item.readOnly===true)) {
	    rtn = true;
	}
	return rtn;
    }
    function isImage(link) {
	var rtn = false;
	if(link.render && (link.render==="image" || link.render==="embed")) {
	    rtn = true;
	}
	return rtn;
    }
    function cjItem(url) {
	var coll, rtn;
	
	rtn = null;
	coll = g.cj.collection.items;
	for(var item of coll) {
	    if(item.href.replace('http:','').replace('https:','')===url.replace('http:','').replace('https:','')) {
		rtn = item;
		break;
	    }
	}
	return rtn;
    }
    function cjData(item,name) {
	var coll, rtn;
	
	rtn = null;
	coll = item.data;
	for(var data of coll) {
	    if(data.name === name) {
		rtn = data;
		break;
	    }
	}
	return rtn;
    }
    
    // ********************************
    // ajax helpers
    // ********************************
    
    // mid-level HTTP handlers
    function httpGet(e) {
	req(e.target.href, "get", null);
	return false;
    }
    function httpQuery(e) {
	var form, coll, query, i, x, q;

	q=0;
	form = e.target;
	query = form.action+"/?";
	nodes = d.tags("input", form);
	for(i=0, x=nodes.length;i<x;i++) {
	    if(nodes[i].name && nodes[i].name!=='') {
		if(q++!==0) {
		    query += "&";
		}
		query += nodes[i].name+"="+escape(nodes[i].value);
	    }
	}
	req(query,"get",null);
	return false;
    }
    function httpPost(e) {
	var form, nodes, data;

	data = [];
	form = e.target;
	//nodes = d.tags("input",form);
	nodes = d.classes("value",form);
	for(i=0,x=nodes.length;i<x;i++) {
	    if(nodes[i].name && nodes[i].name!=='') {
		data.push({name:nodes[i].name,value:nodes[i].value+""});
	    }
	}
	req(form.action,'post',JSON.stringify({template:{data:data}}));
	return false;
    }
    function httpPut(e) {
	var form, nodes, data;

	data = [];
	form = e.target;
	//nodes = d.tags("input",form);      
	nodes = d.classes("value",form);
	for(i=0,x=nodes.length;i<x;i++) {
	    if(nodes[i].name && nodes[i].name!=='') {
		data.push({name:nodes[i].name,value:nodes[i].value+""});
	    }
	}
	req(form.action,'put',JSON.stringify({template:{data:data}}));
	return false;
    }
    function httpDelete(e) {
	if(confirm("Ready to delete?")===true) {
	    req(e.target.href, "delete", null);
	}
	return false;
    }
    // low-level HTTP stuff
    function req(url, method, body) {
	var ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function(){rsp(ajax)};
	ajax.open(method, url);
	ajax.setRequestHeader("accept",g.ctype);
	if(body && body!==null) {
	    ajax.setRequestHeader("content-type", g.ctype);
	}
	ajax.send(body);
    }
    function rsp(ajax) {
	if(ajax.readyState===4) {
	    g.cj = JSON.parse(ajax.responseText);
	    parseCj();
	}
    }

    var render = {
	fcts: renderCollection,
	fct: renderItemCollectionMaterial,
	query: renderQuery
	//search: renderQueryItem
    };

    
    function renderQuery(query) {
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


    function renderCollapsible() {
	
	var a = $('<ul class="collapsible" data-collapsible="accordion">');
	return a;
    }

    function renderCollection() {
	
	var a = $('<ul class="collection">');
	return a;
    }

    function renderQueriesContainer() {
	var a;
	switch (g.type) {
	default:
	    a = $('<ul>');
	    a.addClass("collapsible");
	    a.attr("data-collapsible","accordion");
	    $('.collapsible').collapsible();
	    
	}

	return a;

    }
    


    function renderItem(item) {
	var li,dl,dt,ca,a1;
	
	li = d.node("div");
	li.className = "card blue-grey darken-1";
	dl = d.node("div");
	dl.className = "card-content white-text";
	dt = d.node("span");
	dt.className = "card-title";
	ca = d.node("div");
	ca.className = "card-action";
	
	// item link
	a1 = d.anchor({href:item.href,rel:item.rel,className:"item link",text:item.rel});
	a1.onclick = httpGet;
	d.push(a1,ca);    
	
	// edit link
	if(isReadOnly(item)===false && hasTemplate(g.cj.collection)===true) {
	    a2 = d.anchor({href:item.href,rel:"edit",className:"item action",text:"Edit"});
	    a2.onclick = cjEdit;
	    d.push(a2, ca);
	}

	// delete link
	if(isReadOnly(item)===false) {
	    a3 = d.anchor({href:item.href,className:"item action",rel:"delete",text:"Delete"});
	    a3.onclick = httpDelete;
	    d.push(a3,ca);
	}
	d.push(dt,dl);
	
	dd = dl;
	for(var data of item.data) {
	    p = d.data({className:"item "+data.name,text:data.prompt+"&nbsp;",value:data.value+"&nbsp;"});
	    d.push(p,dd);
	}
	if(item.links) {
	    for(var link of item.links) {
		p = d.node("p");
		p.className = "item";
		
		// render as images, if asked
		if(isImage(link)===true) {
		    img = d.image({className:"image "+link.rel,rel:link.rel,href:link.href});         
		    d.push(img, p);
		}
		else {
		    a = d.anchor({className:"item",href:link.href,rel:link.rel,text:link.prompt});
		    a.onclick = httpGet;
		    d.push(a, ca);
		}
		d.push(p,dd);
	    }
	}
	//d.push(dd,dl);
	d.push(dl,li);
	d.push(ca,li);
	return li;

    }

    function renderItem2(item) {
	var li,dl,dt,ca,a1;
	
	li = d.node("li");
	li.className = "";
	dl = d.node("div");
	dl.className = "collapsible-body container";
	dt = d.node("div");
	dt.className = " row";
	ca = d.node("div");
	ca.className = "collapsible-header";
	
	// item link
	a1 = d.anchor({href:item.href,rel:item.rel,className:"item link",text:'<i class="material-icons">info_outline</i>'});//ERROR!!! HAY QUE PONER item.rel
	a1.onclick = httpGet;
	d.push(a1,ca);    
	
	// edit link
	if(isReadOnly(item)===false && hasTemplate(g.cj.collection)===true) {
	    a2 = d.anchor({href:item.href,rel:"edit",className:"item action",text:'<i class="material-icons">call_made</i>'});
	    a2.onclick = cjEdit;
	    d.push(a2, ca);
	}

	// delete link
	if(isReadOnly(item)===false) {
	    a3 = d.anchor({href:item.href,className:"item action",rel:"delete",text:'<i class="material-icons">call_made</i>'});
	    a3.onclick = httpDelete;
	    d.push(a3,ca);
	}
	d.push(dt,dl);
	
	dd = dl;
	for(var data of item.data) {
	    p = d.data({className:"item "+data.name,text:data.prompt+"&nbsp;",value:data.value+"&nbsp;"});
	    if ((data.name === "empresa") || (data.name === "alumno")) {
		p.className = "item empresa";
		d.push(p,ca);
	    } else {
		d.push(p,dt);
	    }
	}
	if(item.links) {
	    for(var link of item.links) {
		
		
		// render as images, if asked
		if(isImage(link)===true) {
		    p = d.node("p");
		    p.className = "item";
		    img = d.image({className:"image "+link.rel,rel:link.rel,href:link.href});         
		    d.push(img, p);
		    d.push(p,dd);
		}
		else {
		    a = d.anchor({className:"item",href:link.href,rel:link.rel,text:link.prompt});
		    a.onclick = httpGet;
		    d.push(a, ca);
		}
		//d.push(p,dd);
	    }
	}
	//d.push(dd,dl);

	d.push(ca,li);
	d.push(dl,li);
	return li;

    }

    function renderItemCollectionMaterial(item) {
	var li,dl,dt,ca,a1;
	
	li = d.node("li");
	li.className = "collection-item";
	dl = d.node("div");
	dl.className = "";
	dt = d.node("div");
	dt.className = " row";
	ca = d.node("div");
	ca.className = "";
	
	// item link
	/*a1 = d.anchor({href:item.href,rel:item.rel,className:"item link secondary-content",text:'<i class="material-icons">info_outline</i>'});//ERROR!!! HAY QUE PONER item.rel
	  a1.onclick = httpGet;
	  d.push(a1,ca); */   
	
	// edit link
	if(isReadOnly(item)===false && hasTemplate(g.cj.collection)===true) {
	    a2 = d.anchor({href:item.href,rel:"edit",className:"item action secondary-content",text:'<i class="material-icons">call_made</i>'});
	    a2.onclick = cjEdit;
	    d.push(a2, ca);
	}

	// delete link
	if(isReadOnly(item)===false) {
	    a3 = d.anchor({href:item.href,className:"item action secondary-content",rel:"delete",text:'<i class="material-icons">delete</i>'});
	    a3.onclick = httpDelete;
	    d.push(a3,ca);
	}
	d.push(dt,dl);
	
	dd = dl;
	for(var data of item.data) {
	    p = d.data({className:"item "+data.name,text:data.prompt+"&nbsp;",value:data.value+"&nbsp;"});
	    if ((data.name === "empresa") || (data.name === "alumno")) {
		p.className = "item empresa";
		d.push(p,ca);
	    } else {
		d.push(p,dt);
	    }
	}
	if(item.links) {
	    for(var link of item.links) {
		
		
		// render as images, if asked
		if(isImage(link)===true) {
		    p = d.node("p");
		    p.className = "item";
		    img = d.image({className:"image "+link.rel,rel:link.rel,href:link.href});         
		    d.push(img, p);
		    d.push(p,dd);
		}
		else {
		    a = d.anchor({className:"item secondary-content",href:link.href,rel:link.rel,text:link.prompt});
		    a.onclick = httpGet;
		    d.push(a, ca);
		}
		//d.push(p,dd);
	    }
	}
	//d.push(dd,dl);

	d.push(ca,li);
	d.push(dl,li);
	return li;

    }




    // export function
    var that = {};
    that.init = init;
    return that;
}


// **************************
// DOM helpers
// **************************
function domHelp() {

    function para(args) {
	var p;
	
	p = node("p");
	p.className = args.className||"";
	p.innerHTML = args.text||"";

	return p;  
    }
    
    function input(args) {
	var p, lbl, inp;

	p = node("div");
	p.className += "input-field";
	lbl = node("label");
	lbl.className = "data";
	lbl.innerHTML = args.prompt||"";
	lbl.setAttribute("for",args.name);
	inp = processinput(args);
	inp.setAttribute("id",args.name);
	push(lbl,p);
	push(inp,p);
	
	return p;
    }

    function processinput(args) {
	var inp;
	
	inp = node("input");
	
	switch(args.name) {
	case 'impresion':
	    inp = node("textarea");
	    break;	
	case 'hora_salida':
	case 'hora_regreso':
	    inp.type = "time";
	    break;
	case 'distancia':
	    inp.type = "number";
	    break;
	case 'fecha':
	    inp.type = 'date';
	    break;
	case 'empresa':
	case 'tipo':
	case 'localidad':
	default:
	    inp.type = "text";
	    break;

	}

	inp.name = args.name||"";
	inp.className = "value";
	inp.value = args.value||"";
	
	return inp;
    }
    
    function data(args) {
	var p, s1, s2;

	p = node("span");
	p.className = args.className||"";
	p.className += " col s3";
	s1 = node('span');
	s1.className = "prompt title";
	s1.innerHTML = args.text||"";;
	s2 = node("span");
	s2.className = "value";
	s2.innerHTML = args.value||"";
	push(s1,p);
	push(s2,p);

	return p;
    }
    
    function anchor(args) {
	var a;

	a = node("a");
	a.rel = args.rel||"";
	a.href = args.href||"";
	a.className = args.className||"";
	//push(text(args.text||"link"), a);
	a.innerHTML = args.text || "link";

	return a;
    }
    
    function image(args) {
	var img;

	img = node("img")
	img.src = args.href||"";
	img.className = args.rel||"";
	img.title = args.title||"";

	return img;
    }
    
    function link(args) {
	var lnk;  

	lnk = node("link");
	lnk.rel = args.rel||"";
	lnk.href = args.href||"";
	lnk.title = args.title||"";
	lnk.className = args.className||"";

	return lnk;
    }
    function push(source,target) {
	target.appendChild(source);
    }

    function tags(tag,elm) {
	if(elm) {
	    rtn = elm.getElementsByTagName(tag);
	}
	else {
	    rtn = document.getElementsByTagName(tag);
	}
	return rtn;
    }

    function classes(c,elm) {
	if(elm) {
	    rtn = elm.getElementsByClassName(c);
	}
	else {
	    rtn = document.getElementsByClassName(c);
	}
	return rtn;
    }

    function find(id) {
	return document.getElementById(id);
    }

    function text(txt) {
	return document.createTextNode(txt);
    }

    function node(type) {
	return document.createElement(type);
    }

    function clear(elm) {
	while (elm.firstChild) {
	    elm.removeChild(elm.firstChild);
	}
    }

    // publish
    that = {};
    that.push = push;
    that.tags = tags;
    that.classes = classes;
    that.find = find;
    that.text = text;
    that.node = node;
    that.clear = clear;
    that.link = link;
    that.image = image;
    that.anchor = anchor;
    that.data = data;    
    that.input = input;
    that.para = para;
    
    return that;
}

