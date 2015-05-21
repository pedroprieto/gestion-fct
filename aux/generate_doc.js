// Function that returns 

module.exports = function(model, template_file_name) {

    try {
	var descarga = __dirname+"/output.docx";
	var fs=require('fs');
	var Docxtemplater=require('docxtemplater');

	//Load the docx file as a binary
	var content=fs.readFileSync(__dirname + "/../office_templates/" + template_file_name + ".docx","binary");

	var doc=new Docxtemplater(content);

	doc.setData(model);
	doc.render();

	var buf = doc.getZip()
	    .generate({type:"nodebuffer"});

	fs.writeFileSync(descarga, buf);

	return descarga;

    } catch(ex) {
	console.log(ex);
	return false;
    };

}
