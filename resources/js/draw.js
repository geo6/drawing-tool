import { formatArea, formatLength } from "./format";

import Collection from "ol/Collection";
import { never, shiftKeyOnly, singleClick } from "ol/events/condition";
import { Circle, Polygon, LineString } from "ol/geom";
import { fromCircle } from "ol/geom/Polygon";
import { Draw, Modify } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import Vector from "ol/source/Vector";
import { Fill, Circle as CircleStyle, Stroke, Style } from "ol/style";

/**
 *
 */
export function load() {
  window.app.features = new Collection();

  const featureOverlay = new VectorLayer({
    source: new Vector({
      features: window.app.features
    }),
    style: new Style({
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.5)"
      }),
      stroke: new Stroke({
        color: "#33ccff",
        width: 2
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: "#33ccff"
        })
      })
    })
  });
  featureOverlay.setMap(window.app.map);
}

/**
 *
 */
export function onChange() {
  $("#municipality, #province").val("");
  $("#main-download").remove();

  window.app.features.clear();

  $("#main-infos-area, #main-infos-radius, #main-infos-length").hide();
  $("#btn-create-export").prop("disabled", true);

  window.app.map.removeInteraction(window.app.interaction.draw);
  window.app.map.removeInteraction(window.app.interaction.modify);

  addInteraction();
}

/**
 *
 */
export function addInteraction() {
  window.app.interaction = {};

  if ($("#geometry").val() !== "") {
    window.app.interaction.draw = new Draw({
      features: window.app.features,
      freehandCondition: never,
      type: /** @type {ol.geom.GeometryType} */ ($("#geometry").val())
    });

    window.app.interaction.draw.on("drawstart", event => {
      window.app.features.clear();

      event.feature.getGeometry().on("change", event => {
        const geom = event.target;

        let output;
        let radius;

        if (geom instanceof Polygon) {
          output = formatArea(geom);

          $("#main-infos-area")
            .show()
            .find("span")
            .html(output);
        } else if (geom instanceof Circle) {
          const circlePolygon = fromCircle(geom);
          const radiusLineString = new LineString([
            geom.getCenter(),
            geom.getLastCoordinate()
          ]);

          output = formatArea(circlePolygon);
          radius = formatLength(radiusLineString);

          $("#main-infos-area")
            .show()
            .find("span")
            .html("&plusmn;" + output);
          $("#main-infos-radius")
            .show()
            .find("span")
            .html(radius);
        } else if (geom instanceof LineString) {
          output = formatLength(geom);

          $("#main-infos-length")
            .show()
            .find("span")
            .html(output);
        }
      });
    });

    window.app.interaction.draw.on("drawend", event => {
      $("#btn-create-export").prop("disabled", false);
    });

    window.app.interaction.modify = new Modify({
      features: window.app.features,
      // the SHIFT key must be pressed to delete vertices, so
      // that new vertices can be drawn at the same position
      // of existing vertices
      deleteCondition: event => {
        return shiftKeyOnly(event) && singleClick(event);
      }
    });

    window.app.map.addInteraction(window.app.interaction.draw);
    window.app.map.addInteraction(window.app.interaction.modify);
  }
}
