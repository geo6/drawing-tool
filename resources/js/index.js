import "../sass/style.scss";

import initMap from "./map";
import {
  addInteraction,
  load as loadFeature,
  onChange as onChangeFeature
} from "./draw";
import exportFunction from "./export";
import geocodeFunction from "./geocode";
import {
  load as loadMunicipality,
  onChange as onChangeMunicipality
} from "./municipality";
import {
  load as loadProvince,
  onChange as onChangeProvince
} from "./province";

window.app = window.app || {};

$(document).ready(() => {
  initMap();

  addInteraction();

  loadFeature();
  loadMunicipality();
  loadProvince();

  $("#geometry").on("change", onChangeFeature);
  $("#municipality").on("change", onChangeMunicipality);
  $("#province").on("change", onChangeProvince);

  $("#main > form").on("submit", exportFunction);
  $("#gc > form").on("submit", geocodeFunction);

  $("body").addClass("loaded");
});
