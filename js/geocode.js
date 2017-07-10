var $ = require("jquery");
var ol = require("openlayers");

/*
 * Source: https://wiki.openstreetmap.org/wiki/Nominatim
 */
module.exports = function (event) {
  event.preventDefault();

  $("#gc-result").empty();

  if ($.trim($("#gc-search").val()).length > 0) {
    $.getJSON("//nominatim.openstreetmap.org/search", {
      "countrycodes": "BE",
      "format": "json",
      "q": $("#gc-search").val()
    }, function (json) {
      if (json.length === 0) {
        $("#gc-result").html("No result.");
      } else {
        var ul = document.createElement("ul");

        json.forEach(function (item) {
          var li = document.createElement("li");

          if (typeof item.icon !== "undefined") {
            $(li).css("background", "url(" + item.icon + ") no-repeat left");
          }

          $(li).
            attr("title", item.class + " : " + item.type).
            append(item.display_name).
            data({
              "lat": parseFloat(item.lat),
              "lng": parseFloat(item.lon)
            });

          $(li).on("click", function (event) {
            event.preventDefault();

            var data = $(this).data();

            if (item.class !== "boundary") {
              global.map.getView().
                animate({
                  "center": ol.proj.fromLonLat([data.lng, data.lat]),
                  "duration": 0,
                  "zoom": 18
                });
            } else {
              global.map.getView().
                fit(ol.proj.transformExtent([parseFloat(item.boundingbox[2]), parseFloat(item.boundingbox[0]), parseFloat(item.boundingbox[3]), parseFloat(item.boundingbox[1])], "EPSG:4326", global.map.getView().getProjection()), {
                  "minResolution": 18
                });
            }
          });

          $(ul).append(li)
        });

        $("#gc-result").html(ul);
      }
    });
  }
}
