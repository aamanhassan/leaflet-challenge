const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let map = L.map("map", {
    center: [40.7,-94.5],
    zoom: 3
});



let basMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy;'
});
basMap.addTo(map);

let tectonicPlates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

let BaseMaps = {
    'Global Map': basMap 
}

let overlays = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
}

L.control.layers(BaseMaps, overlays).addTo(map);

function getcolor(depth){
    if (depth>90){
        return "#EA2C2C"
    } else if (depth >70){
        return "#EA82CC"
    } else if (depth >50){
        return "#EE9C00"
    } else if (depth >30){
        return "#EECC00"
    } else if (depth>10){
        return "#D4EE00"
    }
    else {
        return "#98EE00"
    }
}
function getRadius(magnitude){
    if (magnitude == 0){
        return 1
    }
    return magnitude * 4
}
d3.json(url).then(function(data){
    console.log(data.features[0].geometry.coordinates[2]);
    function styleInfo(feature){
        return {
            opacity:1,
            fillOpacity: 1,
            fillColor: getcolor(feature.geometry.coordinates[2]) ,
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.6
        }
    }

    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng)
        },
        style : styleInfo,
        onEachFeature: function(feature,layer){
            layer.bindPopup(`
                Magnitude: ${feature.properties.mag} <br>
                Depth : ${feature.geometry.coordinates[2]} <br>
                Location : ${feature.properties.place}
            `);
        } 

    }).addTo(earthquakes);

    earthquakes.addTo(map);

    let legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function(){
        let container = L.DomUtil.create("div", "info legend");
        let grades = [-10, 10, 30, 50, 70, 90];
        let colors = ["#98EE00", "#D4EE00", "#EECC00", "#EE9C00", "#EA822C", "#EA2C2C" ];
        for(let index = 0; index<grades.length; index++){
        let rangeStart = grades[index];
        let rangeEnd = grades[index + 1];

        if (rangeEnd !== undefined) {
            container.innerHTML += `<i style="background: ${colors[index]}"></i> ${rangeStart}-${rangeEnd}<br>`;
        } else {
            container.innerHTML += `<i style="background: ${colors[index]}"></i> ${rangeStart}+ <br>`;
        }
    }

    return container;
    }
    legend.addTo(map);

    
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData){
        L.geoJson(plateData,{
            color: "orange",
            width: 3,
        }).addTo(tectonicPlates);

        tectonicPlates.addTo(map);


    });
});

