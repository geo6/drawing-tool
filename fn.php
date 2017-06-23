<?php
/**
 *
 */
function ogr2ogr($format, $dst, $src, $params = NULL, &$stdout = NULL, &$stderr = NULL) {
  if (is_array($src)) {
    $source = escapeshellarg($src[0]);
    $source .= ' ';
    $layers = explode(' ', $src[1]); foreach ($layers as $l) $source .= escapeshellarg($l);
  } else {
    $source = escapeshellarg($src);
  }

  $descriptorspec = array(
    0 => array('pipe', 'r'), // stdin
    1 => array('pipe', 'w'), // stdout
    2 => array('pipe', 'w')  // stderr
  );

  $process = proc_open('ogr2ogr -f '.escapeshellarg($format).' '.$params.' '.escapeshellarg($dst).' '.$source, $descriptorspec, $pipes);

  if (is_resource($process)) {
    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);

    $stderr = stream_get_contents($pipes[2]) ;
    fclose($pipes[2]);

    $return_value = proc_close($process);
  } else {
    return FALSE;
  }

  return ($return_value === 0);
}

/**
 *
 */
function export($source, $file, $format, $srs = 'EPSG:4326', $params = array()) {
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
    if (!file_exists($dir) || !is_dir($dir)) { mkdir($dir, 0777, TRUE); }

    $params = '';
    if ($srs !== 'EPSG:4326') {
      $params .= ' -s_srs EPSG:4326';
      $params .= ' -t_srs '.$srs;
    }

    $ogr = ogr2ogr($format, $file, $source, $params, $stdout, $stderr);
    if ($ogr === FALSE) {
      throw new Exception($stderr);
    }
  } catch (Exception $e) {
    $warnings[] = $e->getMessage();
  }
}
