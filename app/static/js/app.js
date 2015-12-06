
    domain = window.location.hostname;

    // An example of using the MQA.EventUtil to hook into the window load event and execute the defined
    // function passed in as the last parameter. You could alternatively create a plain function here and
    // have it executed whenever you like (e.g. <body onload="yourfunction">).
 
    MQA.EventUtil.observe(window, 'load', function() {

        // create an object for options
        var options = {
            elt: document.getElementById('map'),           // ID of map element on page
          zoom: 5,                                      // initial zoom level of the map
          latLng: {lat: 50, lng: 19},  					// center of map in latitude/longitude   { lat: 52, lng: 21 },
            mtype: 'map',                                  // map type (map, sat, hyb); defaults to map
            bestFitMargin: 0,                              // margin offset from map viewport when applying a bestfit on shapes
            zoomOnDoubleClick: true                        // enable map to be zoomed in when double-clicking on map
        };

        // construct an instance of MQA.TileMap with the options object
        window.map = new MQA.TileMap(options);
        MQA.withModule('largezoom', function () {
                map.addControl(new MQA.LargeZoom());

            });
            MQA.withModule('mousewheel', function () {
                map.enableMouseWheelZoom();

            });
            loc(map);
            //console.log("jest2");


        });
    function addrow(locations) {
        var x = document.getElementById("myTable");
        //console.log(locations.length);
        var tableRows = x.getElementsByTagName('tr');
        var rowCount = tableRows.length;
        for(var i=rowCount-1;i>0;i--){
            x.deleteRow(i);

        }
        for(var i=0;i<locations.length;i++) {
            //console.log(locations[i].username);
            var row = x.insertRow(1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var img = new Image();
            if(locations[i].active > 30){
                img = img.src='/static/img/grayDot.png';
            }
            else{
                 img = img.src='/static/img/greenDot.png';


            }
            cell1.innerHTML ="<img src='" + img + "' width=\"12\" height=\"12\"/>";
            cell2.innerHTML = locations[i].username;

        }
    }



function loc(map) {

    $.getJSON('https://' + domain + ':8443/last', function(locations) {
        locations = locations["locations"];


        addrow(locations);
        map.removeAllShapes();
	for(var i = 0;i<locations.length;i++) {
        var basic = new MQA.Poi({lat: locations[i].lat, lng: locations[i].long});
        basic.setRolloverContent(locations[i].username + "\nLast Seen:\n" + locations[i].time);
        if (locations[i].active > 30) {
            var icon = new MQA.Icon('/static/img/grayDot.png', 20, 20);
        }
        else {

        var icon = new MQA.Icon('/static/img/blueDot.png', 20, 20);
        }
        // set the POI to use the MQA.Icon object instead of its default icon
        basic.setIcon(icon);

        map.addShape(basic);

        MQA.withModule('shapes', function() {
            var circle = new MQA.CircleOverlay();
            circle.radiusUnit = 'KM';
           // console.log(i);
            circle.radius = [locations[i].precision/1000];
            //console.log(locations[i].precision);
            circle.shapePoints = [locations[i].lat, locations[i].long];
            circle.color=['#0000FF'];

            // set the alpha transparency of the border
            circle.colorAlpha = 0.3;

            // set the width of the border
            circle.borderWidth = 4;

            // set the fill color
            circle.fillColor = '#0000FF';

            // set the alpha transparency of the fill
            circle.fillColorAlpha = 0.2;

            map.addShape(circle);
        });


	};
    });

    setTimeout("loc(map)",1000);
};

