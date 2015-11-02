define(["jquery", "materialize"], function() {

    return function(itemtype,item) {
	switch(itemtype) {
	default:
	    return renderItemCollectionMaterial(item);
	}

    }

    function defaultItemContainer() {
	//TODO Copiar de Mamund
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
	
	/*// edit link
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
	d.push(dt,dl);*/
	
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

/*    function renderItem(item) {
	var li,dl,dt,ca,a1;
	
	li = d.node("div");
	li.className = "card blue-grey darken-1";
	dl = d.node("div");
	dl.className = "card-content white-text";
	dt = d.node("span");
	dt.className = "card-title";
	ca = d.node("div");
	ca.className = "card-action";
	
	
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

*/

});
