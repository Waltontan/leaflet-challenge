// Add a tile layer (the background map image) to our map
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
})

var street = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
})

// Set url for to query the earthquake data
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Function to scale the size of the cirlce marker to the earth quake magnitude
function EQuakeMage(mag){return mag*30000}

// function to determine colour as per the magnitude of the Earthquake
function magcolour(mag){
    if (mag < 1) {
        return "#00ED01";
      } else if (mag < 2) {
        return "#CEFB02";
      } else if (mag < 3) {
        return "#FEFB01";
      } else if (mag < 4) {
        return "#FFCE03";
      } else if (mag < 5) {
        return "#FD9A01";
      } else {
        return "#F00505";
      }
    }

// Grabbing our earthquake GeoJSON data..
d3.json(url).then(function(data) {

    // Grabbing tectonic plate data
    d3.json("static/data/PB2002_plate.json").then(function(platedata) {
        EQuake = data.features;
        
        console.log(EQuake);
        console.log(platedata);

        var EarthquakeMarkers = [];
        
        // Create markers for each earthquake listed
        for (var i = 0; i < EQuake.length; i++) {
            EarthquakeMarkers.push(
            L.circle([EQuake[i].geometry.coordinates[1], EQuake[i].geometry.coordinates[0]], {
                color: "black",
                weight:1,
                fillColor: magcolour(EQuake[i].properties.mag),
                fillOpacity: 1,
                radius: EQuakeMage(EQuake[i].properties.mag)
            }).bindPopup("<h3>Magnitude: "+ EQuake[i].properties.mag +  "</h3>" + 
            "<p> Location: " + EQuake[i].properties.place + "</p>" )
            );
        }
  
    // Create Earthquake later
    var geojson = L.layerGroup(EarthquakeMarkers);

    // Create Tectonic plate layer
    var plateplot = L.geoJson(platedata, {
        // Style each feature
        style: function(feature) {
        return {
            color: "orange",
            fillOpacity: 0,
            weight: 3
        };
        },
    })

    // Creating a selection of baseMaps
    var baseMaps = {
        Street: street,
        Satellite: satellite
    };

    // Creating a list of overlay maps
    var overlayMaps = {
        Earthquakes: geojson,
        Plates: plateplot
    };

    // Create map object and set default layers
        var myMap = L.map("map", {
            center: [40.429067, -102.044522],
            zoom: 3,
            layers: [street, geojson, plateplot]
    });

    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    //Create the legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
            magrange = ["0", "1", "2", "3", "4", "5"],

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magrange.length; i++) {
            div.innerHTML +=
                "<i style='background:" + magcolour(magrange[i]) + "'></i> " +
                magrange[i] + (magrange[i + 1] ? "&ndash;" + magrange[i + 1] + "<br>" : "+");
        }

        return div;
    };

    legend.addTo(myMap);


    }); // Closing d3 function used to call tectonic plate numbers

}); //Closing d3 function used to call earthquake data