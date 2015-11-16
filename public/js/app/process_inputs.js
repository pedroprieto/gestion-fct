define(function() {

    return function processinput(args) {
	var inp;
	
	inp = document.createElement("input");
	
	switch(args.name) {
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
	case 'presencial':
	    inp.type = "checkbox";
	    break;
	case 'impresion':
	    inp = document.createElement("textarea");
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
	inp.className = "value validate";
	inp.value = args.value||"";
	
	return inp;
    }
});
