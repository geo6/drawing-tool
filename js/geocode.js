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
      var ul = document.createElement("ul");

      json.forEach(function (item) {
        var li = document.createElement("li");

  /*
        if (typeof item.icon !== "undefined") {
          $(li).append("<img src=\"" + item.icon + "\"> ");
        }
  */

        $(li).
          append(item.display_name).
          data({
            "lat": parseFloat(item.lat),
            "lng": parseFloat(item.lon)
          });

        $(li).on("click", function (event) {
          event.preventDefault();

          var data = $(this).data();

          global.map.getView().animate({
            "center": ol.proj.fromLonLat([data.lng, data.lat]),
            "duration": 0,
            "zoom": 18
          });
        });

        $(ul).append(li)
      });

      $("#gc-result").html(ul);
    });
  }
}
