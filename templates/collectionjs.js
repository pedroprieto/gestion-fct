// the basic template for all Cj responses
module.exports =  function (base) {
    collection = {};
    collection.version = "1.0";
    collection.href = "";

    collection.links = [];
    
    if (typeof base !== 'undefined') {
	collection.links.push({'rel':'home', 'href' : base});
    }
 


    collection.items = [];
    collection.queries = [];
    collection.template = {};

    return collection;
    
};
