[![Build Status](https://scrutinizer-ci.com/g/geo6/drawing-tool/badges/build.png?b=master)](https://scrutinizer-ci.com/g/geo6/drawing-tool/build-status/master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/geo6/drawing-tool/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/geo6/drawing-tool/?branch=master)

# Drawing tool

Easy tool to draw and export the result in several formats using `ogr2ogr`.

## Configuration

Create `config.yml` file in root directory.

### PostgreSQL

*PostgreSQL* is used to validate the geometry. You'll need to specify the configuration to connect to the database with `PostGIS` extension enabled.

### Export formats

The application allows you to export the geometry in several formats. Those formats are the format produced by `ogr2ogr`. You can find the list here : <http://www.gdal.org/ogr_formats.html>.

To add a format in the resulting ZIP file, you just have to add it (according to the code defined by "OGR Vector Formats") in the configuration file.

If you want to export the geometry with several Spatial Reference Systems (SRS), you just have to specify it in the configuration file (as long as the format allows it, `KML` is always in `EPSG:4326`). You can find more information about SRS here : <https://epsg.io/>.

### Example

```
---
postgresql:
  host: "localhost"
  port: 5432
  dbname: "mydatabase"
  user: "myusername"
  password: "mypassword"

formats:
  - code: "GML"
    srs:
      - "EPSG:4326"
      - "EPSG:31370"
  - code: "KML"
  - code: "MapInfo File"
    srs:
      - "EPSG:4326"
      - "EPSG:31370"
  - code: "ESRI Shapefile"
    srs:
      - "EPSG:4326"
      - "EPSG:31370"
```
