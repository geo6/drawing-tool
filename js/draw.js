var $ = require("jquery");
var ol = require("openlayers");

var format = require("./format.js");

var that = this;

/**
 *
 */
exports.featuresLoad = function () {
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
  featureOverlay.setMap(global.map);

  return features;
}

/**
 *
 */
exports.onChange = function () {
  $("#municipality").val("");
  $("#main-download").remove();

  global.features.clear();

  $("#main-infos-area, #main-infos-radius, #main-infos-length").hide();
  $("#btn-create-export").prop("disabled", true);

  global.map.removeInteraction(global.interaction.draw);
  global.map.removeInteraction(global.interaction.modify);

  global.interaction = that.addInteraction();
}

/**
 *
 */
exports.addInteraction = function () {
  var draw;
  var modify;

  if ($("#geometry").val() !== "") {
    draw = new ol.interaction.Draw({
      features: global.features,
      freehandCondition: ol.events.condition.never,
      type: /** @type {ol.geom.GeometryType} */ ($("#geometry").val())
    });

    draw.on("drawstart", function (event) {
      global.features.clear();

      listener = event.feature.getGeometry().on("change", function(event) {
        var geom = event.target;
        var output;
        var radius;

        if (geom instanceof ol.geom.Polygon) {
          output = format.formatArea(geom);

          $("#main-infos-area").show().find("span").html(output);
        } else if (geom instanceof ol.geom.Circle) {
          var circlePolygon = new ol.geom.Polygon.fromCircle(geom);
          var radiusLineString = new ol.geom.LineString([geom.getCenter(), geom.getLastCoordinate()]);

          output = format.formatArea(circlePolygon);
          radius = format.formatLength(radiusLineString);

          $("#main-infos-area").show().find("span").html("&plusmn; " + output);
          $("#main-infos-radius").show().find("span").html(radius);
        } else if (geom instanceof ol.geom.LineString) {
          output = format.formatLength(geom);

          $("#main-infos-length").show().find("span").html(output);
        }
      });
    });

    draw.on("drawend", function (event) {
      $("#btn-create-export").prop("disabled", false);
    });

    modify = new ol.interaction.Modify({
      features: global.features,
      // the SHIFT key must be pressed to delete vertices, so
      // that new vertices can be drawn at the same position
      // of existing vertices
      deleteCondition: function (event) {
        return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
      }
    });

    global.map.addInteraction(draw);
    global.map.addInteraction(modify);
  }

  return {
    "draw": draw,
    "modify": modify
  };
}
