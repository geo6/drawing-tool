var ol = require('openlayers');
var $ = require('jquery');

$(document).ready(function () {
  var scale = new ol.control.ScaleLine();
  var attribution = new ol.control.Attribution({
    collapsible: false
  });
  var map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM({
          url: "//tile.osm.be/osmbe/{z}/{x}/{y}.png",
          attributions: [ ol.source.OSM.ATTRIBUTION, "Tiles courtesy of <a href=\"https://geo6.be/\">GEO-6</a>" ]
        })
      })
    ],
    controls: ol.control.defaults({attribution: false}).extend([attribution, scale]),
    target: "map",
    view: new ol.View({
      center: ol.proj.fromLonLat([4.45, 50.5157]),
      zoom: 8
    })
  });

  var vectorSource;
  var vectorLayer;
  $.getJSON("./data/municipalities.json", function (json) {
    vectorSource = new ol.source.Vector({
      features: (new ol.format.GeoJSON()).readFeatures(json, {
        dataProjection: "EPSG:4326",
        featureProjection: map.getView().getProjection()
      })
    });
    /*
    vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });
    vectorLayer.setMap(map);
    */
  });

  var features = new ol.Collection();
  var featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector({features: features}),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(255, 255, 255, 0.5)"
      }),
      stroke: new ol.style.Stroke({
        color: "#33ccff",
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: "#33ccff"
        })
      })
    })
  });
  featureOverlay.setMap(map);

  var modify = new ol.interaction.Modify({
    features: features,
    // the SHIFT key must be pressed to delete vertices, so
    // that new vertices can be drawn at the same position
    // of existing vertices
    deleteCondition: function (event) {
      return ol.events.condition.shiftKeyOnly(event) &&
          ol.events.condition.singleClick(event);
    }
  });

  var draw; // global so we can remove it later

  function addInteraction() {
    if ($("#geometry").val() !== "") {
      draw = new ol.interaction.Draw({
        features: features,
        freehandCondition: ol.events.condition.never,
        type: /** @type {ol.geom.GeometryType} */ ($("#geometry").val())
      });
      draw.on("drawstart", function () {
        features.clear();
      });
      draw.on("drawend", function (event) {
        $("#btn-create-export").prop("disabled", false);
      });
      map.addInteraction(draw);
      map.addInteraction(modify);
    }
  }

  addInteraction();

  $("#geometry").on("change", function () {
    $("#municipality").val("");
    $("#main > .download").remove();

    features.clear();
    $("#btn-create-export").prop("disabled", true);

    map.removeInteraction(draw);
    map.removeInteraction(modify);

    addInteraction();
  });

  $("#municipality").on("change", function () {
    $("#geometry").val("");
    $("#main > .download").remove();

    features.clear();
    $("#btn-create-export").prop("disabled", true);

    map.removeInteraction(draw);
    map.removeInteraction(modify);

    if ($("#municipality").val() !== "") {
      var mun = vectorSource.getFeatureById($(this).val());
      features.push(mun);
      map.getView().fit(mun.getGeometry());

      $("#btn-create-export").prop("disabled", false);
    }
  });

  $("#main > form").on("submit", function (event) {
    event.preventDefault();

    $("#main > .download").remove();

    var featuresClean = new ol.Collection();
    features.forEach(function (feature) {
      var featureClean = $.extend(true, {}, feature);

      if (featureClean.getGeometry() instanceof ol.geom.Circle) {
        featureClean.setGeometry(new ol.geom.Polygon.fromCircle(featureClean.getGeometry()));
      }

      featuresClean.push(featureClean);
    });

    var json = (new ol.format.GeoJSON()).writeFeatures(featuresClean.getArray(), {
      dataProjection: "EPSG:4326",
      decimals: 6,
      featureProjection: map.getView().getProjection()
    });

    $.post("export.php", {
      json: json
    }, function (json) {
      if (typeof json.id !== "undefined" && typeof json.filename !== "undefined") {
        $("#main").append("<div class=\"download\"><a href=\"export.php?id=" + json.id + "\">Download <em>" + json.filename + "</em></a></div>");

        if (typeof json.validGeometry !== "undefined") {
          $("#main > .download").append("<p><strong>Warning:</strong> Your geometry was validated by PostGIS.</p>");

          var array = features.getArray();
          for (var i = 0; i < json.validGeometry.length; i++) {
            var geom = (new ol.format.GeoJSON()).readGeometry(json.validGeometry[i], {
              dataProjection: "EPSG:4326",
              featureProjection: map.getView().getProjection()
            });
            array[i].setGeometry(geom);
          }
        }
      }
    });
  });
});
