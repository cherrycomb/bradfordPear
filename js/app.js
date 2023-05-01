(function () {


  // initialize map, centered on Charlotte
  var map = L.map("map", {
    zoom: 11,
    minZoom: 8,
    center: [35.22, -80.84],
    zoomControl: false,
  });
  L.control.zoom({
    position: 'topright'
}).addTo(map);

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
    PCT_WHITE_2000: ["Percent white in 2000"],
    PCT_WHITE_2010: ["Percent white in 2010"],
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
    .then(function (tracts) {
      processData(tracts)
      //drawMap(data);
    });
    fetch("data/council_district_outline.geojson")

          .then(function (response) {
            return response.json()
          })
          .then(function (data) {
            drawAnotherLayer(data)
          })
      
      .catch(function (error) {
        console.log(`Ruh roh! An error has occurred`, error);
      });
  



  function processData(tracts) {

    console.log(tracts);

    /*  const tractsUpdate = [];

     //attempt to update counties
     tracts.features.forEach(function (tract) {

       // push that attribute value into the array
       tractsUpdate.push(tract);
     });
     console.log("tracts update", tractsUpdate) */


    // empty array to store all the data values
    const values = [];

    ///THIS IS WHERE IM STUCK 

    // iterate through all the TRACTS
    tracts.features.forEach(function (tract) {
      // iterate through all the props of each county
      for (const prop in tract.properties) {
        //console.log(prop);

        // if the attribute is a number and not one of the fips codes or name or null or undefined
        if (prop == "PCT_WHITE_1990" || prop == "PCT_WHITE_2000" || prop == "PCT_WHITE_2010" && prop !== null && prop !== undefined) {

          /*  if (county.properties[prop] == 71) {
             console.log(county.properties)
           } */
          // push that attribute value into the array
          values.push(Number(tract.properties[prop]));
        }

      }
    });
    console.log("LOOK HERE!!!", values);

    // create class breaks
    var breaks = chroma.limits(values, 'q', 5);

    // create color generator function
    var colorize = chroma.scale(chroma.brewer.OrRd)
      .classes(breaks)
      .mode('lab');

    drawMap(tracts, colorize);
    drawLegend(breaks, colorize);

  }; //end processData

  function drawAnotherLayer(data) {
    L.geoJson(data, {
      style: function (feature) {
        return {
          color: "#eeeeee",
          weight: 3,
          fillOpacity: 0,
          // This property allows us control interactivity of layer
          interactive: false,
          zIndex: 400,
        };
      },

    }).addTo(map);
  }





  function drawMap(tracts, colorize) {
    // create Leaflet object with geometry data and add to map
    const dataLayer = L.geoJson(tracts, {
      style: function (feature) {
        return {
          color: "#eeeeee",
          weight: .2,
          fillOpacity: .5,
          fillColor: "#1f78b4",
          zIndex: 1000,
        };
      },
      // add hover/touch functionality to each feature layer
      onEachFeature: function (feature, layer) {
        // when mousing over a layer
        layer.on("mouseover", function () {
          console.log("mouseover") // change the stroke color
          layer.setStyle({
              color: "#262626",
              weight: 1.5,
            })
            .bringToFront();
        });

        // on mousing off layer
        layer.on("mouseout", function () {
          // reset the layer style to its original stroke color
          layer.setStyle({
            color: "#eeeeee",
            weight: .05,
          });
        });
      },
    }).addTo(map)

    createSliderUI(dataLayer, colorize);
    updateMap(dataLayer, colorize, "PCT_WHITE_1990");

  } // end drawMap()





  function updateMap(dataLayer, colorize, currentYear) {
    //console.log("look here:", dataLayer);
    // console.log("current year:", currentYear);
    // loop through each county layer
    console.log(dataLayer)
    dataLayer.eachLayer(function (layer) {
      let props = layer.feature.properties
      //console.log("pct white", Number(props[currentYear]));

      layer.setStyle({
        fillColor: colorize(Number(props[currentYear]))

      })
      // assemble string sequence of info for tooltip (end line break with + operator)
      let tooltipInfo = `<b>${props["NAMELSAD10"]}</b></br>
      ${props[currentYear]}% white`;

      // bind a tooltip to layer with county-specific information
      layer.bindTooltip(tooltipInfo, {
        // sticky property so tooltip follows the mouse
        sticky: true,
      });
    });
  } //end updateMap



  function drawLegend(breaks, colorize) {

    // create a Leaflet control for the legend
    const legendControl = L.control({
      position: "bottomleft",
    });

    // when the control is added to the map
    legendControl.onAdd = function (map) {
      // create a new division element with class of 'legend' and return
      const legend = L.DomUtil.create("div", "legend");
      return legend;
    };

    // add the legend control to the map
    legendControl.addTo(map);


    //console.log("LOOK HERE", breaks);

    // select div and create legend title
    const legend = document.querySelector(".legend");
    //console.log(legend);
    legend.innerHTML = "<h3> <span>1990</span>Percent white </h3><ul>";

    // loop through the break values
    for (let i = 0; i < breaks.length - 1; i++) {
      // determine color value
      const color = colorize(breaks[i], breaks);


      // create legend item
      const classRange = `<li><span style="background:${color}"></span>
        ${breaks[i].toLocaleString()}% &mdash;
        ${breaks[i + 1].toLocaleString()}% </li>`;

      // append to legend unordered list item
      legend.innerHTML += classRange;
    }
    // close legend unordered list
    legend.innerHTML += "</ul>";


  } // end drawLegend


  function createSliderUI(dataLayer, colorize){
 // create Leaflet control for the slider
 const sliderControl = L.control({
  position: "topleft",

});

// when added to the map
sliderControl.onAdd = function (map) {
  // select an existing DOM element with an id of "ui-controls"
  const slider = L.DomUtil.get("ui-controls");

  // disable scrolling of map while using controls
  L.DomEvent.disableScrollPropagation(slider);

  // disable click events while using controls
  L.DomEvent.disableClickPropagation(slider);

  // return the slider from the onAdd method
  return slider;
};

// add the control to the map
sliderControl.addTo(map);
// select the form element
const slider = document.querySelector(".year-slider");

// listen for changes on input element
slider.addEventListener("input", function (e) {
  // get the value of the selected option
  const currentYear = "PCT_WHITE_"+e.target.value;
  // update the map with current timestamp
  updateMap(dataLayer, colorize, currentYear);
  // update timestamp in legend heading
  document.querySelector(".legend h3 span").innerHTML = e.target.value; 
});


  }//end createSliderUI





















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

     //create heatmap
    $.get('./data/charlotte_pears_short_latlon.csv', function (csvString) {

      // Use PapaParse to transform file into arrays
      var data = Papa.parse(csvString.trim()).data.filter(
        function (row) {
          return row.length === 2
        }
      ).map(function (a) {
        return [parseFloat(a[0]), parseFloat(a[1])]
      })

      //the above code that uses Jquery and papaParse was modified and borrowed from a leaflet heatmap tutorial after several failed attempts using this and other heatmap API's https://github.com/HandsOnDataViz/leaflet-heatmap

      // Add all points into a heat layer
      var heat = L.heatLayer(data, {
        radius: 25
        
      })

      // Add the heatlayer to the map
      heat.addTo(map);
    }) 









})();