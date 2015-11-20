define(["jquery", "materialize"], function() {

    return function() {
	$("a.button-collapse").sideNav({
            menuWidth: 300
	});
	// Problemas con labels Materialize
	$("input").filter(function() {
            return this.value.length !== 0;
	}).siblings().addClass("active");

	// Local navs (template links)
	$("#local-nav-list li").css("display", "inline-block");
	$("#local-nav-list a").addClass("btn waves-effect waves-light");
	
	// Items container
	$("#items ul").addClass("collection");
	$("#items ul li").addClass("collection-item");

	//$(".item-href").html('<i class="material-icons">delete</i>');
	// No funciona por el tema de herencia de onclicks. FIX
	//$(".item-delete").html('<i class="material-icons">delete</i>');
	//$("a[rel=visits]").html('<i class="material-icons">phone</i>');
	

	// Queries container
	$("#queries ul").addClass("collapsible").attr("data-collapsible","accordion");
	$(".query_title").addClass("collapsible-header");
	$("#queries form").addClass("collapsible-body");
	$('.collapsible').collapsible();
	$("#queries fieldset").addClass("row");
	$("#queries div").addClass("col s2 input-field");
	$("#queries div.search").addClass("offset-s1 col s5").removeClass("s2");
	$("#queries .submit-query").addClass("col s1").removeClass("s2");
	$(".submit-query-button").html('<i class="material-icons">search</i>');

	// Template
	$(".submit-template-button").html('<i class="material-icons">done</i>');

	// Edit
	$(".submit-edit-button").html('<i class="material-icons">done</i>');

	// General
	$("button").addClass("btn waves-effect waves-light");

	// Select
	$('select').material_select();
	//$('select').addClass('browser-default');

	// Textarea
	$('textarea').addClass('materialize-textarea');
    };
    
});
