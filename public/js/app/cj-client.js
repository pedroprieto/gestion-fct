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

define(["./process_inputs","./render_client"], function(processinput, renderClient) { return {    cj: function() {

    var d = this.domHelp();  
    var g = {};
    
    g.url = '';
    g.cj = null;
    g.ctype = "application/vnd.collection+json";
    // Link rel='profile' de la collection
    g.profile = "";
    // Link rel='type' de la collection
    g.type = "";
    // Flag to display or not the template
    // If there are any links with rel=template, the template form is not displayed
    // In this case, it is assumed that the template is for editing only
    g.showtemplate = true;

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
	//cjClearEdit();
	renderClient();

    }

    // handle response dump
    function dump() {
	var elm = d.find("dump");
	elm.textContent = JSON.stringify(g.cj, null, 2);
	g.profile = "";
	g.type = "";
	g.showtemplate = true;
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
	var local_nav;

	ul = d.find("links");
	local_nav = d.find("local-nav-list");
	d.clear(ul);
	d.clear(local_nav);
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
		    // Type link is in format profile#type
		    g.type = link.href.substr(link.href.indexOf('#')+1);
		}
		
		// render embedded images, if asked
		li = d.node("li");
		if(isImage(link)===true) {
		    img = d.image({href:link.href,className:link.rel});
		    d.push(img, li);
		    d.push(li, ul);
		}
		else if(isAttachment(link)===true) {
		    a = d.anchor({rel:link.rel,href:link.href,text:link.prompt,render: link.render});
		    d.push(a, li);
		    d.push(li, ul);
		} else if(isTemplateLink(link)===true) {
		    a = d.anchor({rel:link.rel,href:link.href,text:link.prompt,render: link.render});
		    a.onclick = httpGet;
		    d.push(a, li);
		    d.push(li,local_nav);
		    // Do not show template
		    g.showtemplate = false;		    
		}
		else {
		    a = d.anchor({rel:link.rel,href:link.href,text:link.prompt,render: link.render});
		    a.onclick = httpGet;
		    d.push(a, li);
		    d.push(li, ul);
		}
		
	    }
	}
    }

    // handle item collection
    function items() {
	var elm, coll;
	var ul, li;
	var dl, dt, dd;
	var p, s1, s2, img;
	var a1, a2, a3;

	elm = d.find("items");
	d.clear(elm);
	if(g.cj.collection.items) {
	    coll = g.cj.collection.items;
	    ul = d.node("ul");
	    ul.className = g.type || "";

	    for(var item of coll) {
		li = d.node("li");
		//dl = d.node("dl");
		//dt = d.node("dt");
		dt = d.node("div");
		dt.className = "item-actions";
		
		// item link
		a1 = d.anchor({href:item.href,rel:item.rel,className:"item-href",text:item.rel});
		a1.onclick = httpGet;
		d.push(a1,dt);
		
		// edit link
		if(isReadOnly(item)===false && hasTemplate(g.cj.collection)===true) {
		    a2 = d.anchor({href:item.href,rel:"edit",className:"item-edit",text:"Edit"});
		    a2.onclick = cjEdit;
		    d.push(a2, dt);
		}

		// delete link
		if(isReadOnly(item)===false) {
		    a3 = d.anchor({href:item.href,className:"item-delete",rel:"delete",text:"Delete"});
		    a3.onclick = httpDelete;
		    d.push(a3,dt);
		}
		//d.push(dt,dl);
		d.push(dt,li);
		
		//dd = d.node("dd");
		dd = d.node("div");
		dd.className = "item-data";
		for(var data of item.data) {
		    p = d.data({className:"item-data-object "+data.name,text:data.prompt+"&nbsp;",value:data.value+"&nbsp;"});
		    d.push(p,dd);
		}
		d.push(dd,li);
		if(item.links) {
		    p = d.node("div");
		    p.className = "item-links";
		    for(var link of item.links) {
			
			// render as images, if asked
			if(isImage(link)===true) {
			    img = d.image({className:"image "+link.rel,rel:link.rel,href:link.href});         
			    d.push(img, p);
			}
			else if(isAttachment(link)===true) {
			    a = d.anchor({className:"item-link",href:link.href,rel:link.rel,text:link.prompt,render: link.render});
			    d.push(a, p);
			} else {
			    a = d.anchor({className:"item-link",href:link.href,rel:link.rel,text:link.prompt,render: link.render});
			    a.onclick = httpGet;
			    d.push(a, p);
			}
			//d.push(p,dd);
			//d.push(d,ul);
		    }
		    d.push(p,li);
		}
		//d.push(dd,dl);
		//d.push(dl,li);
		d.push(li,ul);
	    }
	    d.push(ul,elm);
	}
    }
    
    // handle query collection
    function queries() {
	var elm, coll;
	var ul, li;
	var form, fs, lg, p, lbl, inp;
	var tit;

	elm = d.find("queries");
	d.clear(elm);
	if(g.cj.collection.queries) {
	    ul = d.node("ul");
	    coll = g.cj.collection.queries;
	    for(var query of coll) {
		li = d.node("li");
		li.className = query.name;
		tit = d.node("div");
		tit.className = "query_title";
		tit.innerHTML = query.prompt;
		d.push(tit,li);
		form = d.node("form");
		form.action = query.href;
		form.className = query.rel;
		form.method = "get";
		form.onsubmit = httpQuery;
		fs = d.node("fieldset");
		lg = d.node("legend");
		lg.innerHTML = query.prompt + "&nbsp;";
		d.push(lg,fs);
		for(var data of query.data) {
		    //p = d.input({prompt:data.prompt,name:data.name,value:data.value});
		    p = d.input(data);
		    d.push(p,fs);
		}
		p = d.node("div");
		p.className = "submit-query";
		inp = d.node("button");
		inp.type = "submit";
		inp.className = "submit-query-button";
		d.push(inp,p);
		d.push(p,fs);
		d.push(fs,form);
		d.push(form,li);
		d.push(li,ul);
	    }
	    d.push(ul,elm);
	}
    }

    // handle template object
    // It is only displayed if there are no template links (it is assumed that the template is for editing)
    function template() {
	var elm, coll;
	var form, fs, lg, p, lbl, inp;

	elm = d.find("template");
	d.clear(elm);
	if((hasTemplate(g.cj.collection)===true) && (g.showtemplate === true)) {
	    coll = g.cj.collection.template.data;
	    form = d.node("form");
	    form.action = g.cj.collection.href;
	    form.method = "post";
	    form.className = "add";
	    form.onsubmit = httpPost;
	    fs = d.node("fieldset");
	    lg = d.node("legend");
	    lg.innerHTML = "";
	    d.push(lg,fs);
	    for(var data of coll) { 
		//p = d.input({prompt:data.prompt+"&nbsp;",name:data.name,value:data.value});
		p = d.input(data);
		d.push(p,fs);
	    }
	    p = d.node("p");
	    inp = d.node("button");
	    inp.className = "submit-template-button";
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
	var form, fs, lg, p, lbl, inp, inp2;
	var data, item, dv, tx;
	
	// Display edit form in the place of the item
	elm = e.target.parentNode.parentNode;
	// Hide item data
	d.classes('item-actions',elm)[0].style.display = "none";
	d.classes('item-data',elm)[0].style.display = "none";
	d.classes('item-links',elm)[0].style.display = "none";
	
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
	    inp = d.node("button");
	    inp.className = "submit-edit-button";
	    inp.type = "submit";
	    inp2 = d.node("button");
	    inp2.className = "submit-edit-cancel-button";
	    inp2.onclick = cjCancelEdit;
	    inp2.type = "button";
	    d.push(inp,p);
	    d.push(inp2,p);
	    d.push(p,fs);
	    d.push(fs,form);
	    d.push(form, elm);
	    elm.style.display = "block";
	}
	// Aplicar estilos con render
	renderClient();
	return false;
    }
    function cjCancelEdit(e) {
	var item_el = e.target.parentNode.parentNode.parentNode.parentNode;

	// Delete edit form
	var f = d.classes('edit',item_el)[0];
	item_el.removeChild(f);
	// Show item data
	d.classes('item-actions',item_el)[0].style.display = "block";
	d.classes('item-data',item_el)[0].style.display = "block";
	d.classes('item-links',item_el)[0].style.display = "block";
	return;
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
    function isTemplateLink(link) {
	var rtn = false;
	if(link.rel && link.rel.indexOf("template")>-1) {
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
	//nodes = d.tags("input", form);
	nodes = form.querySelectorAll("input,select");
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
	// Para coger campos que sean textarea en lugar de input
	nodes = d.classes("value",form);
	for(i=0,x=nodes.length;i<x;i++) {
	    if(nodes[i].name && nodes[i].name!=='') {
		if (nodes[i].type == 'checkbox' && !nodes[i].checked)
		    continue;
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
	if(confirm("¿Seguro que desea eliminar?")===true) {
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

    // export function
    var that = {};
    that.init = init;
    return that;
    
},

				       
// **************************
// DOM helpers
// **************************				       
				       domHelp: function() {

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
	p.className += args.name;
	p.className += " input-field";
	lbl = node("label");
	lbl.className = "data";
	lbl.innerHTML = args.prompt||"";
	lbl.setAttribute("for",args.name);
	inp = processinput(args);
	inp.setAttribute("id",args.name);
	//inp.setAttribute("placeholder",args.prompt||"");
	push(inp,p);
	push(lbl,p);

	return p;
    }

    function data(args) {
	var p, s1, s2;

	p = node("div");
	p.className = args.className||"";
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
	var rtn;

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

    // publish functions
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
										     }
				  });

