# Drawing Tool - Data

`municipalities.geojson` and `provinces.geojson` are generated from [_Federal Public Service FINANCE_ administrative units dataset](https://finance.belgium.be/en/private-individuals/property/download-administrative-units) (version `20210101`).

## Process

1. Download dataset (Lambert 2008)
1. Open the file in [QGIS](https://qgis.org/)
    - Municipalities: `Apn_AdMu.shp`
    - Provinces: `Apn_AdPr.shp`
1. Compute `name` column

    For municipalities:
    ```
    if("LangCode" = 'F' or "LangCode" = 'Fd', 
      if("NameFRE" = "NameDUT", "NameFRE", concat("NameFRE", ' (', "NameDUT", ')')),
      if("LangCode" = 'D' or "LangCode" = 'Df',
        if("NameDUT" = "NameFRE", "NameDUT", concat("NameDUT", ' (', "NameFRE", ')')),
        if("LangCode" = 'Gf',
          if("NameGER" = "NameFRE", "NameGER", concat("NameGER", ' (', "NameFRE", ')')),
          if("NameFRE" = "NameDUT", "NameFRE", concat("NameFRE", ' - ', "NameDUT")) -- LangCode = 'DF'
        )
      )
    )
    ```
    For provinces:
    ```
    concat("NameFRE", ' - ', "NameDUT")
    ```
1. Simplify the geometry (10 m.)
1. Export the file in GeoJSON (WGS 84)
    - Set `COORDINATE_PRECISION` to 6 digits
    - Specify the column use as identifier in the `Layer` field:
        - `id_field=AdMuKey` for municipalities
        - `id_field=AdPrKey` for provinces