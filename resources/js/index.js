import '../css/style.css';

import initMap from './map';
import {
    addInteraction,
    load as loadFeature,
    onChange as onChangeFeature
} from './draw';
import exportFunction from './export';
import geocodeFunction from './geocode';
import {
    load as loadMunicipality,
    onChange as onChangeMunicipality
} from './municipality';

window.app = window.app || {};

$(document).ready(() => {
    initMap();

    addInteraction();

    loadFeature();
    loadMunicipality();

    $('#geometry').on('change', onChangeFeature);
    $('#municipality').on('change', onChangeMunicipality);

    $('#main > form').on('submit', exportFunction);
    $('#gc > form').on('submit', geocodeFunction);
});
