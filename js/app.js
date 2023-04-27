(function () {


  // initialize map, centered on Kenya
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

  // Read data from CSV file
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
    heat.addTo(map)
  })

  /*   omnivore
    .csv("data/charlotte_pears_short_latlon.csv")
    .on("ready", function (e) {
      array(e.target.toGeoJSON())

    .on("error", function (e) {
      console.log(e.error[0].message);
    });
  }).addTo(map);

  var heat=L.heatLayer(data, {
    radius:25,
    blur:15,

  }) */

  window.addEventListener("resize", adjustHeight);

  const button = document.querySelector("#legend button")
  button.addEventListener('click', function () {
    const legend = document.querySelector(".leaflet-legend")
    legend.classList.toggle('show-legend')
  })



  function adjustHeight() {
    const mapSize = document.querySelector("#map"),
      contentSize = document.querySelector("#content"),
      removeHeight = document.querySelector("#footer").offsetHeight,
      resize = window.innerHeight - removeHeight;


    if (window.innerWidth >= 768) {
      contentSize.style.height = `${resize}px`;
      mapSize.style.height = `${resize}px`;
    } else {
      contentSize.style.height = `${resize * 0.25}px`;
      mapSize.style.height = `${resize * 0.75}px`;
    }

    //mapSize.style.height = `${resize}px`;
  } //end adjust height




})();