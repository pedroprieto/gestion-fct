define(function() {

    return function processinput(args) {
	var inp;
	var name;
	
	inp = document.createElement("input");

	name = args.name;
	// Transform related-0, related-1,... into related
	if (args.name.indexOf('related') > -1)
	    name = 'related';
	
	switch(name) {
	case 'periodo':
	case 'curso':
	    inp = document.createElement("select");
	    var op,t;
	    if (typeof args.options !== 'undefined') {
		for (var i of args.options) {
		    op = document.createElement("option");
		    op.value = i.value;
		    t = document.createTextNode(i.prompt);
		    op.appendChild(t);
		    inp.appendChild(op);
		}
	    }
	    break;
	case 'related':
	    inp.type = "checkbox";
	    inp.setAttribute("checked","checked");
	    break;
	case 'presencial':
	    inp.type = "checkbox";
	    if (args.value == 'true')
		inp.setAttribute("checked","checked");
	    // Como se muestra como checkbox, el cliente enviará o no el datos si el checkbox está pulsado.
	    // Por tanto, si se activa el checkbox, se enviará presencial=true siempre
	    // Si no se envía el checkbox, no se envía nada
	    // Por ello, cambiamos el valor a 'true'; si el servidor envía 'false' como sugerencia, el checkbox se mostrará desactivado
	    // y aún así su valor será true por si el usuario lo activa.
	    args.value = 'true';
	    break;
	case 'impresion':
	    inp = document.createElement("textarea");
	    break;	
	case 'hora_salida':
	case 'hora_regreso':
	    inp.type = "time";
	    break;
	case 'mes':
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
	inp.className = "value validate";
	inp.value = args.value||"";
	if (args.required === true)
	    inp.setAttribute("required", "true");
	if (typeof args.match !== 'undefined')
	    inp.setAttribute("pattern", args.match);
	
	return inp;
    }
});
