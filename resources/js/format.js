import { getArea, getLength } from "ol/sphere";

/**
 * Format area output.
 * @param {ol.geom.Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
export function formatArea(polygon, proj) {
  const sourceProj = proj || window.app.map.getView().getProjection();
  const geom = polygon.clone().transform(sourceProj, "EPSG:4326");

  const area = getArea(geom, {
    projection: "EPSG:4326"
  });

  let output;

  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + " " + "km&sup2;";
  } else {
    output = Math.round(area * 100) / 100 + " " + "m&sup2;";
  }

  return output;
}

/**
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
export function formatLength(line, proj) {
  const sourceProj = proj || window.app.map.getView().getProjection();
  const geom = line.clone().transform(sourceProj, "EPSG:4326");

  const length = getLength(geom, {
    projection: "EPSG:4326"
  });

  let output;

  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + " " + "km";
  } else {
    output = Math.round(length * 100) / 100 + " " + "m";
  }

  return output;
}
