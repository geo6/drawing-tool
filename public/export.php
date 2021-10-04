<?php
require '../vendor/autoload.php';
require '../fn.php';

use Symfony\Component\Yaml\Yaml;

$config = Yaml::parse(file_get_contents('../config.yml'));

if (isset($_GET['id'])) {
    if (file_exists(sys_get_temp_dir().'/drawing-tool/'.$_GET['id']) && is_dir(sys_get_temp_dir().'/drawing-tool/'.$_GET['id'])) {
        $glob = glob(sys_get_temp_dir().'/drawing-tool/'.$_GET['id'].'/*.zip');
        if (count($glob) === 1) {
            $file = $glob[0];

            if(ini_get('zlib.output_compression')) { ini_set('zlib.output_compression', 'Off'); }

            header('Pragma: public'); // required
            header('Expires: 0'); // no cache
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Last-Modified: '.gmdate ('D, d M Y H:i:s', filemtime($file)).' GMT');
            header('Cache-Control: private', FALSE);
            header('Content-Type: application/zip');
            header('Content-Disposition: attachment; filename="'.basename($file).'"');
            header('Content-Transfer-Encoding: binary');
            header('Content-Length: '.filesize($file));
            header('Connection: close');
            readfile($file); // push it out
            exit();
        } else {
            header("HTTP/1.1 404 Not Found");
            exit();
        }
    } else {
        header("HTTP/1.1 404 Not Found");
        exit();
    }
}
else {
    header('Content-type: application/json');

    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $json = json_decode($input['json']);
        if (is_null($input) || is_null($json)) {
            throw new ErrorException(json_last_error_msg());
        }
    } catch (ErrorException $e) {
        echo json_encode($e);
        exit();
    }

    $warnings = array();
    $temp = sys_get_temp_dir();
    $id = uniqid();
    $time = date('YmdHis');

    $dir = $temp.'/drawing-tool';
    if (!file_exists($dir) || !is_dir($dir)) { mkdir($dir); }

    $dir .= '/'.$id;
    if (!file_exists($dir) || !is_dir($dir)) { mkdir($dir); }

    if (!file_exists($dir.'/GeoJSON') || !is_dir($dir.'/GeoJSON')) { mkdir($dir.'/GeoJSON'); }
    file_put_contents($dir.'/GeoJSON/'.$time.'WGS84.json', json_encode($json));

    $source = $dir.'/GeoJSON/'.$time.'WGS84.json';
    $valid = TRUE;
    $validGeometry = array();

    try {
        $pg = pg_connect('host='.$config['postgresql']['host'].' port='.$config['postgresql']['port'].' dbname='.$config['postgresql']['dbname'].' user='.$config['postgresql']['user'].' password='.$config['postgresql']['password']);

        foreach ($json->features as $i => $feature) {
            $q = pg_query_params($pg, "SELECT ST_IsValid(ST_GeomFromGeoJSON($1))", array(
                json_encode($feature->geometry)
            ));
            $r = pg_fetch_result($q, 0, 0);
            pg_free_result($q);

            if ($r === 'f') {
                $valid = FALSE;

                $q = pg_query_params("SELECT ST_AsGeoJSON(ST_MakeValid(ST_GeomFromGeoJSON($1)), 6)", array(
                    json_encode($feature->geometry)
                ));
                $geom = pg_fetch_result($q, 0, 0);
                pg_free_result($q);

                $feature->geometry = json_decode($geom);
            }

            $validGeometry[$i] = $feature->geometry;
        }

        if ($valid === FALSE) {
            file_put_contents($source, json_encode($json));
        }

        pg_close($pg);
    } catch (ErrorException $e) {
        echo json_encode($e);
        exit();
    }

    foreach ($config['formats'] as $format) {
        $params = (isset($format['params']) ? $format['params'] : array());

        if (isset($format['srs'])) {
            foreach ($format['srs'] as $srs) {
                if ($srs === 'EPSG:31370') {
                    $fname = $time.'Lambert72';
                } else if ($srs === 'EPSG:4326') {
                    $fname = $time.'WGS84';
                } else {
                    $fname = $time;
                }
                export($source, $dir.'/'.$format['code'].'/'.$fname, $format['code'], $srs, $params);
            }
        } else {
            $fname = $time.'WGS84';
            export($source, $dir.'/'.$format['code'].'/'.$fname, $format['code'], 'EPSG:4326', $params);
        }
    }

    // Dedicated export for Proximus (based on KML)
    $fname = $time.'Proximus.txt';
    export_proximus($dir.'/KML/'.$time.'WGS84.kml', $dir.'/'.$fname);

    try {
        $zip = new ZipArchive;
        $zipOpen = $zip->open($dir.'/'.$time.'.zip', ZipArchive::CREATE);
        if ($zipOpen !== TRUE) {
            switch ($zipOpen) {
                case ZipArchive::ER_EXISTS:
                    throw new ErrorException('File already exists.');
                    break;
                /*
                Add missing error codes
                */
                default:
                    throw new ErrorException('Unknown error.');
                    break;
            }
        }

        $glob = glob($dir.'/*/*.*');
        foreach ($glob as $g) {
            $zip->addFile($g, basename(dirname($g)).'/'.basename($g));
        }

        $zip->addFile($dir.'/'.$time.'Proximus.txt', $time.'Proximus.txt');

        $zip->close();

        $result = array(
            'id' => $id,
            'filename' => $time.'.zip'
        );

        if ($valid === FALSE) {
            $result['validGeometry'] = $validGeometry;
        }

        echo json_encode($result);
    } catch (ErrorException $e) {
        echo json_encode($e);
        exit();
    }
}
exit();
