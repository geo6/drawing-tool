var $ = require("jquery");
var ol = require("openlayers");

module.exports = function (event) {
  event.preventDefault();

  $("#main-download").remove();

  var featuresClean = new ol.Collection();
  global.features.forEach(function (feature) {
    var featureClean = $.extend(true, {}, feature);

    if (featureClean.getGeometry() instanceof ol.geom.Circle) {
      featureClean.setGeometry(new ol.geom.Polygon.fromCircle(featureClean.getGeometry()));
    }

    featuresClean.push(featureClean);
  });

  var json = (new ol.format.GeoJSON()).writeFeatures(featuresClean.getArray(), {
    dataProjection: "EPSG:4326",
    decimals: 6,
    featureProjection: global.map.getView().getProjection()
  });

  $.post("export.php", {
    json: json
  }, function (json) {
    if (typeof json.id !== "undefined" && typeof json.filename !== "undefined") {
      $("#main").append("<div id=\"main-download\"><a href=\"export.php?id=" + json.id + "\">Download <em>" + json.filename + "</em></a></div>");

      if (typeof json.validGeometry !== "undefined") {
        $("#main-download").append("<p><strong>Warning:</strong> Your geometry was validated by PostGIS.</p>");

        var array = global.features.getArray();
        for (var i = 0; i < json.validGeometry.length; i++) {
          var geom = (new ol.format.GeoJSON()).readGeometry(json.validGeometry[i], {
            dataProjection: "EPSG:4326",
            featureProjection: global.map.getView().getProjection()
          });
          array[i].setGeometry(geom);
        }
      }
    }
  });
}
