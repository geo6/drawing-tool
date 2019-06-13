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
    $ogr2ogr->setOption('f', $format);

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
