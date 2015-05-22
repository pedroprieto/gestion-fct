// Function that returns buffer with docx document rendered
var Promise = require('bluebird');

module.exports = Promise.promisify(function(model, template_file_name, callback) {

    var fs=require('fs');
    var Docxtemplater=require('docxtemplater');

    //Load the docx file as a binary
    fs.readFile(__dirname + "/../office_templates/" + template_file_name + ".docx","binary", function(err, content) {
	if (err) {
	    callback(new Error('Error opening template file'));
	}

	try {
	    var doc=new Docxtemplater(content);

	    doc.setData(model);
	    doc.render();

	    var buf = doc.getZip()
		.generate({type:"nodebuffer"});

	    callback(null,buf);
	    
	} catch(ex) {
	    callback(ex);
	}
    });

});


