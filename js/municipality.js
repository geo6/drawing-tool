var $ = require("jquery");
var ol = require("openlayers");

var format = require("./format.js");

/**
 *
 */
exports.load = function (callback) {
  var municipalitySource = null;
  var municipalityLayer = null;

  $.getJSON("./data/municipalities.json", function (json) {
    municipalitySource = new ol.source.Vector({
      features: (new ol.format.GeoJSON()).readFeatures(json, {
        dataProjection: "EPSG:4326",
        featureProjection: global.map.getView().getProjection()
      })
    });
    /*
    municipalityLayer = new ol.layer.Vector({
      source: municipalitySource
    });
    municipalityLayer.setMap(global.map);
    */

    callback({
      "layer": municipalityLayer,
      "source": municipalitySource
    });
  });

  return true;
}

/**
 *
 */
exports.onChange = function () {
  $("#geometry").val("");
  $("#main-download").remove();

  global.features.clear();
  $("#btn-create-export").prop("disabled", true);

  global.map.removeInteraction(global.interaction.draw);
  global.map.removeInteraction(global.interaction.modify);

  if ($("#municipality").val() !== "") {
    var mun = global.municipality.source.getFeatureById($(this).val());

    global.features.push(mun);
    global.map.getView().fit(mun.getGeometry());

    var output = format.formatArea(mun.getGeometry());

    $("#main-infos-area").show().find("span").html(output);

    $("#btn-create-export").prop("disabled", false);
  }
}
