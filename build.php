<?php

/**
 * Create `municipalities.json` file based on export from municipality database.
 *
 * ```cmd
 * ogr2ogr -f "GeoJSON" municipality.geojson PG:dbname=address view_municipality -lco COORDINATE_PRECISION=6 -simplify 0.0001 -progress
 * ```
 */

$mun = json_decode(file_get_contents('municipality.geojson'), true);

$geojson = [
  'type' => 'FeatureCollection',
  'features' => [],
];

foreach($mun['features'] as $m) {
  $feature = [
    'type' => 'Feature',
    'id' => intval($m['properties']['nis5']),
    'properties' => [],
    'geometry' => $m['geometry'],
  ];

  if (in_array($m['properties']['parent'], ['10000', '20001', '30000', '40000', '70000'])) {
    if ($m['properties']['name_nl'] === $m['properties']['name_fr']) {
      $feature['properties']['name'] = $m['properties']['name_nl'];
    } else {
      $feature['properties']['name'] = sprintf('%s (%s)', $m['properties']['name_nl'], $m['properties']['name_fr']);
    }
  } else if (in_array($m['properties']['parent'], ['20002', '50000', '60000', '80000', '90000'])) {
    if ($m['properties']['name_fr'] === $m['properties']['name_nl']) {
      $feature['properties']['name'] = $m['properties']['name_fr'];
    } else {
      $feature['properties']['name'] = sprintf('%s (%s)', $m['properties']['name_fr'], $m['properties']['name_nl']);
    }
  } else if ($m['properties']['parent'] === '04000') {
    if ($m['properties']['name_fr'] === $m['properties']['name_nl']) {
      $feature['properties']['name'] = $m['properties']['name_fr'];
    } else {
      $feature['properties']['name'] = sprintf('%s - %s', $m['properties']['name_fr'], $m['properties']['name_nl']);
    }
  } else {
    throw new ErrorException(sprintf('Invalid parent "%s".', $m['properties']['parent']));
  }

  $geojson['features'][] = $feature;
}

file_put_contents('public/data/municipalities.json', json_encode($geojson));

exit();
