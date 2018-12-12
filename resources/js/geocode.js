import Point from 'ol/geom/Point';
import {
    fromLonLat,
    transformExtent
} from 'ol/proj';

/** @see https://wiki.openstreetmap.org/wiki/Nominatim */
export default function (event) {
    event.preventDefault();

    $('#gc-result').empty();

    if ($.trim($('#gc-search').val()).length > 0) {
        fetch('https://nominatim.openstreetmap.org/search?' + $.param({
                'countrycodes': 'BE',
                'format': 'json',
                'q': $('#gc-search').val()
            }))
            .then(response => response.json())
            .then(json => {
                if (json.length === 0) {
                    $('#gc-result').html('No result.');
                } else {
                    var ul = document.createElement('ul');

                    json.forEach(item => {
                        var li = document.createElement('li');

                        if (typeof item.icon !== 'undefined') {
                            $(li).css('background', 'url(' + item.icon + ') no-repeat left');
                        }

                        $(li)
                            .attr('title', item.class + ' : ' + item.type)
                            .append(item.display_name);

                        $(li).on('click', event => {
                            event.preventDefault();

                            if (item.class !== 'boundary') {
                                window.app.map.getView()
                                    .fit(
                                        new Point(fromLonLat([
                                            parseFloat(item.lon),
                                            parseFloat(item.lat)
                                        ])),
                                        {
                                            'maxZoom': 18
                                        }
                                    );
                            } else {
                                window.app.map.getView()
                                    .fit(
                                        transformExtent(
                                            [
                                                parseFloat(item.boundingbox[2]),
                                                parseFloat(item.boundingbox[0]),
                                                parseFloat(item.boundingbox[3]),
                                                parseFloat(item.boundingbox[1])
                                            ],
                                            'EPSG:4326',
                                            window.app.map.getView().getProjection()
                                        ), {
                                            'maxZoom': 18
                                        }
                                    );
                            }
                        });

                        $(ul).append(li)
                    });

                    $('#gc-result').html(ul);
                }
            });
    }
}
