/**
 * Created by mehow on 19.11.15.
 */

var x = new google.maps.LatLng(50.0591, 19.93398);

function convertGeoLocationToLatLng(geoLocation) {
  return new google.maps.LatLng(geoLocation.latitude, geoLocation.longitude);
}

function drawStops() {
  $.getJSON("/connections", function (connectionsList) {
    //create array of stops from connections
    var connections = _.map(connectionsList, function (connection) {
      return [connection.source, connection.destination];
    }),
    stops = _.uniq(_.flatten(connections));

    connections.forEach(function (connection) {
      var tramTrack = _.map(connection, function (stop) {
        return convertGeoLocationToLatLng(stop.geoLocation);
      });
      new google.maps.Polyline({
        path: tramTrack,
        geodesic: true,
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      }).setMap(map);
    });

    //create markers
    stops.forEach(function (stop) {
      new google.maps.Marker({
        position: convertGeoLocationToLatLng(stop.geoLocation),
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 2
        }
      });
    })
  });
}

function initialize() {
  var mapProp = {
    center: x,
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false
  };

  window.map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
  drawStops();
}

google.maps.event.addDomListener(window, 'load', initialize);