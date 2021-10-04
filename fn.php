<?php

use Geo6\GDAL\ogr2ogr;

/**
 *
 */
function export($source, $file, $format, $srs = 'EPSG:4326', $params = array())
{
  global $warnings;

  $dir = dirname($file);
  $fname = basename($file);

  switch ($format) {
    case "ESRI Shapefile":
      $file .= ".shp";
      break;
    case "GML":
      $file .= ".gml";
      break;
    case "KML":
    case "LIBKML":
      $file .= ".kml";
      break;
    case "MapInfo File":
      if (isset($params['dsco']) && in_array('FORMAT=MIF', $params['dsco'])) {
        $file .= ".mif";
      } else {
        $file .= ".tab";
      }
      break;
    default:
      break;
  }

  try {
    if (!file_exists($dir) || !is_dir($dir)) {
      mkdir($dir, 0777, TRUE);
    }

    $ogr2ogr = new ogr2ogr($file, $source);
    $ogr2ogr->setOption('f', $format === 'KML' ? 'LIBKML' : $format);

    if ($srs !== 'EPSG:4326') {
      $ogr2ogr->setOption('s_srs', 'EPSG:4326');
      $ogr2ogr->setOption('t_srs', $srs);
    }

    foreach ($params as $key => $param) {
      if (is_array($param)) {
        foreach ($param as $p) {
          $ogr2ogr->setOption($key, $p);
        }
      } else {
        $ogr2ogr->setOption($key, $param);
      }
    }

    $ogr2ogr->run();
  } catch (Exception $e) {
    $warnings[] = $e->getMessage();
  }
}

/**
 *
 */
function export_proximus($kml, $file) {
  global $warnings;

  if (!file_exists($kml) || !is_readable($kml)) {
    $warnings[] = 'Can\'t open KML file to generate Proximus file.';
  } else {
    $xml = simplexml_load_string(file_get_contents($kml));

    $coordinates = (string) $xml->Document->Document->Placemark->Polygon->outerBoundaryIs->LinearRing->coordinates;
    $coordinates = explode(PHP_EOL, $coordinates);

    $filter = array_filter(array_map(function($coords) { return trim($coords); }, $coordinates), function ($coords) { return strlen($coords) > 0; });

    $transform = array_map(function ($coords) { $c = explode(',', $coords); return implode(',', [$c[1], $c[0]]); }, $filter);

    $result = implode(' ', $transform);

    file_put_contents($file, '<polygon>' . $result . '</polygon>');
  }
}