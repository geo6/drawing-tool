var ol = require("openlayers");

module.exports = function () {
  var scale = new ol.control.ScaleLine();
  var attribution = new ol.control.Attribution({
    collapsible: false
  });

  var map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM({
          url: "https://tile.osm.be/osmbe/{z}/{x}/{y}.png",
          attributions: [ol.source.OSM.ATTRIBUTION, "Tiles courtesy of <a href=\"https://geo6.be/\">GEO-6</a>"]
        })
      })
    ],
    controls: ol.control.defaults({
      attribution: false
    }).extend([attribution, scale]),
    target: "map",
    view: new ol.View({
      center: ol.proj.fromLonLat([4.45, 50.5157]),
      zoom: 8
    })
  });

  return map;
};
