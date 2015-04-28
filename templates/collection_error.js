// Collection JSON error
module.exports =  function () {
    collection = {};
    collection.version = "1.0";
    collection.href = "";

    collection.error = {
	title: '',
	code: '',
	message: ''
    };
    
    return collection;
    
};
