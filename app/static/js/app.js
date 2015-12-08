var pullInterval = 1000,
activeTime = 30;
MQA.EventUtil.observe(window, 'load', function () {

  // create an object for options
  var options = {
    elt: document.getElementById('map'),           // ID of map element on page
    zoom: 11,                                      // initial zoom level of the map
    latLng: {lat: 50.05, lng: 20},  					     // center of map in latitude/longitude   { lat: 52, lng: 21 },
    mtype: 'map',                                  // map type (map, sat, hyb); defaults to map
    bestFitMargin: 0,                              // margin offset from map viewport when applying a bestfit on shapes
    zoomOnDoubleClick: true                        // enable map to be zoomed in when double-clicking on map
  };

  window.map = new MQA.TileMap(options);
  MQA.withModule('largezoom', function () {
    map.addControl(new MQA.LargeZoom());
  });
  MQA.withModule('mousewheel', function () {
    map.enableMouseWheelZoom();
  });
  getLastLocations(map);
});

function addFriendToList(location) {
  var friend = {
    username: location.username,
    active: location.active < activeTime
  };
  angular.element(document.getElementById('myTable')).scope().addFriend(friend);
}

function clearFriendsTable() {
  angular.element(document.getElementById('myTable')).scope().removeFriends();
}

function addLocationToMap(map, location) {

  var basic = new MQA.Poi({lat: location.lat, lng: location.long}),
  radius = parseFloat((location.precision / 1000).toFixed(2));
  basic.setRolloverContent(location.username + "\nLast Seen:\n" + location.time);
  basic.setIcon(new MQA.Icon(location.active > activeTime ? '/static/img/grayDot.png' : '/static/img/blueDot.png', 20, 20));

  map.addShape(basic);

  if (radius > 0.01) {
    MQA.withModule('shapes', function () {
      var circle = new MQA.CircleOverlay();
      circle.shapePoints = [ location.lat, location.long ];
      circle.radius = radius;
      circle.colorAlpha = 0.3;
      circle.fillColorAlpha = 0.3;
      map.addShape(circle);
    });
  }
}

function getLastLocations(map) {

  $.getJSON('/last', function (locations) {
    locations = locations["locations"];
    map.removeAllShapes();
    clearFriendsTable();
    locations.forEach(function (location) {
      addLocationToMap(map, location);
      addFriendToList(location);
    });
    setTimeout(function () {
      getLastLocations(map);
    }, pullInterval);
  });
}