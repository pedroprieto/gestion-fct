define(["jquery", "materialize"], function() {

   

    function renderCollapsible() {
	
	var a = $('<ul class="collapsible" data-collapsible="accordion">');
	return a;
    }

    

    




    return {
//	fcts: renderCollection,
	fct: renderItemCollectionMaterial,
	query: renderQuery,
	queriescontainer: renderQueriesContainer,
	query: renderQuery
	//search: renderQueryItem
    };
});
