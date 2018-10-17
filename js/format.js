var ol = require("openlayers");

var wgs84Sphere = new ol.Sphere(6378137);

/**
 * Format area output.
 * @param {ol.geom.Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
exports.formatArea = function (polygon, proj) {
  var area;
  var sourceProj = proj || global.map.getView().getProjection();
  var geom = /** @type {ol.geom.Polygon} */ (polygon.clone().transform(sourceProj, "EPSG:4326"));
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
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
exports.formatLength = function (line, proj) {
  var length = 0;
  var coordinates = line.getCoordinates();
  var sourceProj = proj || global.map.getView().getProjection();

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
