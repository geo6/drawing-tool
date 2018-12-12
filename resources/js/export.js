import Collection from 'ol/Collection';
import GeoJSON from 'ol/format/GeoJSON';
import {
    Circle,
} from 'ol/geom';
import {
    fromCircle
} from 'ol/geom/Polygon';

export default function (event) {
    event.preventDefault();

    $('#main-download').remove();

    var featuresClean = new Collection();
    window.app.features.forEach(feature => {
        var featureClean = $.extend(true, {}, feature);

        if (featureClean.getGeometry() instanceof Circle) {
            featureClean.setGeometry(fromCircle(featureClean.getGeometry()));
        }

        featuresClean.push(featureClean);
    });

    var json = (new GeoJSON()).writeFeatures(featuresClean.getArray(), {
        dataProjection: 'EPSG:4326',
        decimals: 6,
        featureProjection: window.app.map.getView().getProjection()
    });

    fetch('export.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                json
            })
        })
        .then(response => response.json())
        .then(json => {
            if (typeof json.id !== 'undefined' && typeof json.filename !== 'undefined') {
                $('#main').append('<div id=\'main-download\'><a href=\'export.php?id=' + json.id + '\'>Download <em>' + json.filename + '</em></a></div>');

                if (typeof json.validGeometry !== 'undefined') {
                    $('#main-download').append('<p><strong>Warning:</strong> Your geometry was validated by PostGIS.</p>');

                    var array = window.app.features.getArray();
                    for (var i = 0; i < json.validGeometry.length; i++) {
                        var geom = (new GeoJSON()).readGeometry(json.validGeometry[i], {
                            dataProjection: 'EPSG:4326',
                            featureProjection: window.app.map.getView().getProjection()
                        });
                        array[i].setGeometry(geom);
                    }
                }
            }
        });
}
