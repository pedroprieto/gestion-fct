// Function that returns buffer with docx document rendered
const PizZip = require("pizzip");
const fs = require('fs');
const Docxtemplater = require('docxtemplater');

module.exports = function (model, template_file_name) {
    let content = fs.readFileSync(__dirname + "/../office_templates/" + template_file_name + ".docx", "binary");
    const zip = new PizZip(content);
    var doc = new Docxtemplater(zip);
    doc.render(model);
    const buf = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    return buf;
};
