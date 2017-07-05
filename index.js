var $ = require("jquery");
var ol = require("openlayers");
var proj4 = require("proj4");

proj4.defs("EPSG:31370","+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs");

var wgs84Sphere = new ol.Sphere(6378137);

var map;

/**
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function(line, proj) {
  var length = 0;
  var coordinates = line.getCoordinates();
  var sourceProj = proj || map.getView().getProjection();

  for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
    var c1 = ol.proj.transform(coordinates[i], sourceProj, "EPSG:4326");
    var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, "EPSG:4326");
    length += wgs84Sphere.haversineDistance(c1, c2);
  }

  var output;

  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) + " " + "km";
  } else {
    output = (Math.round(length * 100) / 100) + " " + "m";
  }

  return output;
};


/**
 * Format area output.
 * @param {ol.geom.Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
var formatArea = function(polygon, proj) {
  var area;
  var sourceProj = proj || map.getView().getProjection();
  var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(sourceProj, "EPSG:4326"));
  var coordinates = geom.getLinearRing(0).getCoordinates();

  area = Math.abs(wgs84Sphere.geodesicArea(coordinates));

  var output;

  if (area > 10000) {
    output = (Math.round(area / 1000000 * 100) / 100) + " " + "km&sup2;";
  } else {
    output = (Math.round(area * 100) / 100) + " " + "m&sup2;";
  }

  return output;
};

/**
 *
 */
$(document).ready(function () {
  var scale = new ol.control.ScaleLine();
  var attribution = new ol.control.Attribution({
    collapsible: false
  });

  map = new ol.Map({
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
      return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
    }
  });

  var draw; // global so we can remove it later
  var listener;

  function addInteraction() {
    if ($("#geometry").val() !== "") {
      draw = new ol.interaction.Draw({
        features: features,
        freehandCondition: ol.events.condition.never,
        type: /** @type {ol.geom.GeometryType} */ ($("#geometry").val())
      });
      draw.on("drawstart", function (event) {
        features.clear();

        listener = event.feature.getGeometry().on("change", function(event) {
          var geom = event.target;
          var output;
          var radius;

          if (geom instanceof ol.geom.Polygon) {
            output = formatArea(geom);

            $("#main-infos-area").show().find("span").html(output);
          } else if (geom instanceof ol.geom.Circle) {
            var circlePolygon = new ol.geom.Polygon.fromCircle(geom);
            var radiusLineString = new ol.geom.LineString([geom.getCenter(), geom.getLastCoordinate()]);

            output = formatArea(circlePolygon);
            radius = formatLength(radiusLineString);

            $("#main-infos-area").show().find("span").html("&plusmn; " + output);
            $("#main-infos-radius").show().find("span").html(radius);
          } else if (geom instanceof ol.geom.LineString) {
            output = formatLength(geom);

            $("#main-infos-length").show().find("span").html(output);
          }
        });
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
    $("#main-download").remove();

    features.clear();
    $("#main-infos-area, #main-infos-radius, #main-infos-length").hide();
    $("#btn-create-export").prop("disabled", true);

    map.removeInteraction(draw);
    map.removeInteraction(modify);

    addInteraction();
  });

  $("#municipality").on("change", function () {
    $("#geometry").val("");
    $("#main-download").remove();

    features.clear();
    $("#btn-create-export").prop("disabled", true);

    map.removeInteraction(draw);
    map.removeInteraction(modify);

    if ($("#municipality").val() !== "") {
      var mun = vectorSource.getFeatureById($(this).val());
      features.push(mun);
      map.getView().fit(mun.getGeometry());

      var output = formatArea(mun.getGeometry());
      $("#main-infos-area").show().find("span").html(output);

      $("#btn-create-export").prop("disabled", false);
    }
  });

  $("#main > form").on("submit", function (event) {
    event.preventDefault();

    $("#main-download").remove();

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
        $("#main").append("<div id=\"main-download\"><a href=\"export.php?id=" + json.id + "\">Download <em>" + json.filename + "</em></a></div>");

        if (typeof json.validGeometry !== "undefined") {
          $("#main-download").append("<p><strong>Warning:</strong> Your geometry was validated by PostGIS.</p>");

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
