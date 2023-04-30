
//HEATMAP FROM CSV DATA BELOW


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


//add individual pears

/*     return fetch("data/pears.geojson")
  })
  .then(function (response) {
    return response.json()
  })
  .then(function (data) {
    const pearLayer = L.geoJson(data,{

    }).addTo(map); */





       //add AJAX request for geoJSON to map

/* $.ajax({
  url: 'data/charlotte_tracts.geojson',
  dataType: 'json',
  success: function (response) {
      geojsonLayer = L.geoJson(response).addTo(map);
      map.fitBounds(geojsonLayer.getBounds());
  }
}); */

/* $.ajax("data/pears.geojson", {
  dataType: "json",
  success: function(response) {
    L.geoJson(response, {
      pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {
          radius: 5,
          color: '#FF0000'
        });
      },
      onEachFeature: onEachFeature
    }).addTo(mymap);
  }
}); */




  //fetch attempt

  fetch("data/charlotte_tracts.geojson")
  //   // after it is returned...
   .then(function (response) {
     // Parse the JSON into a useable format, then return it
     return response.json();
   })
   // The returned response is now data in a new then method
   .then(function (data) {
     const dataLayer = L.geoJson(data, {
 
       style: function (feature) {
         return {
           color: "#222",
           weight: .4,
           fillOpacity: .2,
           fillColor: "#1f78b4",
         };
       },
 
     }).addTo(map).bringToBack();
     //     // Pass the data to the drawMap function
     //drawMap(dataLayer);
  });
 
 /* 
 
 function drawMap(dataLayer) {
 } */
  
     
 
 
  /*  window.addEventListener("resize", adjustHeight);
 
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
  */
     //mapSize.style.height = `${resize}px`;
    //end adjust height
 
 
 
