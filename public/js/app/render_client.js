define(["jquery", "materialize"], function() {

    return function() {
	$("a.button-collapse").sideNav({
            menuWidth: 300
	});
	// Problemas con labels Materialize
	$('input[value!=""]').siblings().addClass("active");
	
	/*	// Problema con labels Materialize
		if (inp.value != "") {
		lbl.className += " active";
		}*/

	// Items container
	$("#items ul").addClass("collection");
	$("#items ul li").addClass("collection-item");

	//$(".item-link").html('<i class="material-icons">delete</i>');
	$(".item-delete").html('<i class="material-icons">delete</i>');
	$("a[rel=visits]").html('<i class="material-icons">phone</i>');
	

	// Queries container
	$("#queries ul").addClass("collapsible").attr("data-collapsible","accordion");
	$(".query_title").addClass("collapsible-header");
	$("#queries form").addClass("collapsible-body");
	$('.collapsible').collapsible();
	$("#queries fieldset").addClass("row");
	$("#queries div").addClass("col s2 input-field");
	$("#queries div.search").addClass("offset-s1 col s5").removeClass("s2");
	$("#queries .submit-query").addClass("col s1").removeClass("s2");
	$(".submit-query-button").addClass("btn waves-effect waves-light").html('<i class="material-icons">search</i>');

	
    };
    
});
