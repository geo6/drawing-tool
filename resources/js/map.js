import "ol/ol.css";

import { Map, View } from "ol";
import {
  defaults as defaultControls,
  Attribution,
  ScaleLine
} from "ol/control";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { ATTRIBUTION } from "ol/source/OSM";
import { VERSION } from "ol/util";

export default function() {
  const scale = new ScaleLine();
  const attribution = new Attribution({
    collapsible: false
  });

  window.app.map = new Map({
    layers: [
      new TileLayer({
        source: new OSM({
          url: "https://tile.osm.be/osmbe/{z}/{x}/{y}.png",
          attributions: [
            ATTRIBUTION,
            'Tiles courtesy of <a href="https://geo6.be/">GEO-6</a>'
          ]
        })
      })
    ],
    controls: defaultControls({
      attribution: false
    }).extend([attribution, scale]),
    target: "map",
    view: new View({
      center: fromLonLat([4.45, 50.5157]),
      zoom: 8
    })
  });

  console.log(VERSION);
}
