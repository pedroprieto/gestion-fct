fecha = function(d) {
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1;
    var curr_year = d.getFullYear();
    return curr_date + "-" + curr_month + "-" + curr_year;
}

exports.reemplaza = function(key, value) {
    if (key === "semanaDe") {
	return fecha(new Date(value));
    }
    if (key === "semanaAl") {
	return fecha(new Date(value));
    }
    if (key === "fecha") {
	return fecha(new Date(value));
    }
    return value;
}
