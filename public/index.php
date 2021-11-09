<!DOCTYPE html>
<html>
    <head>
        <title>Drawing Tool</title>
        <link rel="stylesheet" href="./drawing-tool.css" type="text/css">
    </head>
    <body>
        <div id="loader-wrapper">
            <div id="loader"></div>
        </div>
        <div id="map" class="map">
            <div id="overlay">
                <div id="main" class="overlay">
                    <h1><?= _('Drawing tool') ?></h1>
                    <form action="export.php" method="post" autocomplete="off">
                        <div class="form-group">
                            <label for="geometry"><?= _('What do you want to draw ?') ?></label>
                            <select id="geometry">
                                <option value=""></option>
                                <option value="Circle"><?= _('Circle') ?></option>
                                <option value="Polygon"><?= _('Polygon') ?></option>
                            </select>
                        </div>

                        <div style="text-align: center;">
                            or
                        </div>

                        <div class="form-group">
                            <label for="municipality"><?= _('Select a municipality :') ?></label>
                            <select id="municipality">
                                <option value=""></option>
<?php
$municipalities = json_decode(file_get_contents('./data/municipalities.geojson'));
function cmp($a, $b)
{
    return strcasecmp($a->properties->name, $b->properties->name);
}
usort($municipalities->features, 'cmp');
foreach ($municipalities->features as $m) {
    ?>
                                <option value="<?= $m->id ?>"><?= htmlentities($m->properties->name) ?></option>
<?php
}
?>
                            </select>
                        </div>

                        <div style="text-align: center;">
                            or
                        </div>

                        <div class="form-group">
                            <label for="province"><?= _('Select a province :') ?></label>
                            <select id="province">
                                <option value=""></option>
<?php
$provinces = json_decode(file_get_contents('./data/provinces.geojson'));
usort($provinces->features, 'cmp');
foreach ($provinces->features as $p) {
    ?>
                                <option value="<?= $p->id ?>"><?= htmlentities($p->properties->name) ?></option>
<?php
}
?>
                            </select>
                        </div>

                        <div id="main-infos">
                            <div id="main-infos-area" style="display: none;">
                                <strong><?= _('Area') ?> :</strong> <span></span>
                            </div>
                            <div id="main-infos-radius" style="display: none;">
                                <strong><?= _('Radius') ?> :</strong> <span></span>
                            </div>
                        </div>

                        <div class="form-group">
                            <button type="submit" id="btn-create-export" disabled="disabled"><?= _('Create export') ?></button>
                        </div>
                    </form>
                </div>

                <div id="gc" class="overlay">
                    <h2><?= _('Geocoder') ?></h2>
                    <form autocomplete="off">
                        <div class="form-group">
                            <input type="text" name="search" id="gc-search">
                        </div>
                        <div class="form-group">
                            <button type="submit" id="btn-geocoder"><?= _('Search') ?></button>
                        </div>
                    </form>
                    <div id="gc-result"></div>
                    <div style="text-align: right; font-size: smaller;">Data © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</div>
                </div>
            </div>
        </div>
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha256-3edrmyuQ0w65f8gfBsqowzjJe2iM6n0nKciPUp8y+7E=" crossorigin="anonymous"></script>
        <script src="./drawing-tool.js"></script>
    </body>
</html>
