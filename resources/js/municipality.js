import GeoJSON from "ol/format/GeoJSON";
import Vector from "ol/source/Vector";

import { formatArea } from "./format";

/**
 *
 */
export function load() {
  fetch("./data/municipalities.geojson")
    .then(response => response.json())
    .then(json => {
      window.app.municipality = new Vector({
        features: new GeoJSON().readFeatures(json, {
          dataProjection: "EPSG:4326",
          featureProjection: window.app.map.getView().getProjection()
        })
      });
    });
}

/**
 *
 */
export function onChange() {
  $("#geometry, #province").val("");
  $("#main-download").remove();

  window.app.features.clear();
  $("#btn-create-export").prop("disabled", true);

  window.app.map.removeInteraction(window.app.interaction.draw);
  window.app.map.removeInteraction(window.app.interaction.modify);

  if ($("#municipality").val() !== "") {
    const mun = window.app.municipality.getFeatureById($(this).val());

    window.app.features.push(mun);
    window.app.map
      .getView()
      .fit(mun.getGeometry(), { padding: [50, 50, 50, 50] });

    const output = formatArea(mun.getGeometry());

    $("#main-infos-area")
      .show()
      .find("span")
      .html(output);

    $("#btn-create-export").prop("disabled", false);
  }
}
