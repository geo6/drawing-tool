var $ = require("jquery");
var ol = require("openlayers");
var proj4 = require("proj4");

var exportZIP = require("./export.js");
var geocode = require("./geocode.js");
var draw = require("./draw.js");
var municipality = require("./municipality.js");

proj4.defs("EPSG:31370","+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs");

$(document).ready(function () {
  global.map = require("./map.js")();

  municipality.load(function (data) {
    global.municipality = data;
  });
  global.features = draw.featuresLoad();

  $("#municipality").on("change", municipality.onChange);
  $("#geometry").on("change", draw.onChange);

  global.interaction = draw.addInteraction();

  $("#main > form").on("submit", exportZIP);
  $("#gc > form").on("submit", geocode);
});
