const keys = [
  "alumno",
  "nif_alumno",
  "empresa",
  "dir_empresa",
  "localidad",
  "ciclo",
  "grupo",
  "tutor",
  "instructor",
  "nif_instructor",
  "curso",
  "periodo",
  "fecha_inicio",
  "fecha_fin",
  "horas",
];

const arrayToObject = (arr) =>
  Object.fromEntries(arr.map((val, i) => [keys[i], val]));

// Transformo la lista de FCTs de un CSV a una lista de objetos
module.exports = function (listFEs) {
  let arrayFEs = listFEs.split("\n");
  return arrayFEs.map((el) => arrayToObject(el.split(",")));
};
