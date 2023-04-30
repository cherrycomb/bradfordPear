(function () {


  // initialize map, centered on Charlotte
  var map = L.map("map", {
    zoom: 11,
    center: [35.22, -80.84],
  });

  // mapbox API access Token
  var accessToken = "pk.eyJ1IjoicmwtbWFydGVucyIsImEiOiJjbDQzNTY0d2YwNG5iM2N1aHYxcGJ1djcwIn0.tAxFsgNvT-dK0JF1vextnQ";

  // request a mapbox raster tile layer and add to map
  L.tileLayer(
    `https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`, {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: "light-v8",
      accessToken: accessToken,
    }
  ).addTo(map);

  // mapped attribute
  var attributeValue = "PCT_WHITE_1990";

  const labels = {
    PCT_WHITE_1990: ["Percent white in 1990"],
    rents_RENTER_OCC: ["Percent of occupied units rented"],
    rents_GRAPI_35PLUS: ["Percent of rental units paying over 35% gross rent as percentage of income(GRAPI)"]
  };

  const units = {
    PCT_WHITE_1990: "%",
    rents_RENTER_OCC: "%",
    rents_GRAPI_35PLUS: "%"
  }


  //add charlotte data
  fetch("data/charlotte_tracts.geojson")
    //   // after it is returned...
    .then(function (response) {
      // Parse the JSON into a useable format, then return it
      return response.json();
    })
    // The returned response is now data in a new then method
    .then(function (data) {
      drawMap(data);
    });


  function drawMap(data) {
    // create Leaflet data layer and add to map
    const tracts = L.geoJson(data, {
      // stle tracts with initial default path options
      style: function (feature) {
        return {
          color: "#262626",
          weight: .5,
          fillOpacity: .8,
          fillColor: "#1f78b4",
        };
      },
      // add hover/touch functionality to each feature layer
      onEachFeature: function (feature, layer) {
        // when mousing over a layer
        layer.on("mouseover", function () {
          // change the stroke color and bring that element to the front
          layer
            .setStyle({
              color: "#ffffff",
            })
            .bringToFront();
        });

        // on mousing off layer
        layer.on("mouseout", function () {
          // reset the layer style to its original stroke color
          layer.setStyle({
            color: "#20282e",
          });
        });
      },
    }).addTo(map);

    // fit the map's bounds and zoom level using the counties extent
    /*    map.fitBounds(counties.getBounds(), {
      padding: [18, 18], // add padding around counties
      animation: false, // disable animating the zoom
    }); */

    const breaks = getClassBreaks(tracts);
    // empty array to hold all our values
    const values = [];

    tracts.eachLayer(function (layer) {
      // shorthand reference to properties
      const props = layer.feature.properties;

      layer.setStyle({
        fillColor: getColor(props[attributeValue], breaks),
      });
    });

    //addUi(tracts); // add the UI controls
    addLegend(breaks); //call drawLegend
    updateLegend(breaks);
    //updateMap(tracts); // draw the map
  } // end drawMap

  // Get class breaks in data
  function getClassBreaks(tracts) {
    // create empty Array for storing values
    const values = [];

    // loop through all the counties
    tracts.eachLayer(function (layer) {
      let value = layer.feature.properties[attributeValue];
      if (value !== null && value !== undefined && value > 0) {
        values.push(Number(value));
      }
    });

    // determine similar clusters
    const clusters = ss.ckmeans(values, 5);

    // create an array of the lowest value within each cluster
    const breaks = clusters.map(function (cluster) {
      return [cluster[0], cluster.pop()];
    });

    //return array of arrays, e.g., [[0.24,0.25], [0.26, 0.37], etc]
    return breaks;
  } ///end getClassBreaks

  // Get color of county
  function getColor(d, breaks) {
    // function accepts a single normalized data attribute value
    // and uses a series of conditional statements to determine which
    // which color value to return to return to the function caller
    if (d < 0) {
      return "lightgray"
    } else if (d <= breaks[0][1]) {
      return '#f0f9e8';
    } else if (d <= breaks[1][1]) {
      return '#bae4bc';
    } else if (d <= breaks[2][1]) {
      return '#7bccc4';
    } else if (d <= breaks[3][1]) {
      return '#43a2ca';
    } else if (d <= breaks[4][1]) {
      return '#0868ac';
    }
  } // end getColor

// Add legend to map
function addLegend(breaks) {
  // check your console to verify the breaks array
  // console.log(breaks);

  // create a new Leaflet control object, and position it top left
  const legendControl = L.control({
    position: "bottomleft",
  });

  // when the legend is added to the map
  legendControl.onAdd = function () {
    // select a div element with an id attribute of legend
    const legend = L.DomUtil.get("legend");

    // disable scroll and click/touch on map when on legend
    L.DomEvent.disableScrollPropagation(legend);
    L.DomEvent.disableClickPropagation(legend);

    // return the selection to the method
    return legend;
  };

  // add the empty legend div to the map
  legendControl.addTo(map);
} //end addLegend

function updateLegend(breaks) {
  // select the legend, add a title, begin an unordered list and assign to a variable
  const legend = document.querySelector("#legend");
  // console.log("LOOK BELOW")
  // console.log(legend)
  //legend.innerHTML = `<h5> hi </h5>`;
  legend.innerHTML = `<h5>${labels[attributeValue]}</h5>`;

  // loop through the Array of classification break values
  for (let i = 0; i <= breaks.length - 1; i++) {
    let color = getColor(breaks[i][0], breaks);

    legend.innerHTML += `<div class="d-flex flex-row justify-content-start">
      <span style="background:${color}"></span>   
      <label>${(breaks[i][0]).toFixed(1)} &mdash; 
      ${(breaks[i][1]).toFixed(1)}${units[attributeValue]}</label>
  </div>`;
  }
}









})();