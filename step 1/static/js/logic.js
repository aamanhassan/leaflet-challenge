const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let map = L.map("map", {
    center: [40.7,-94.5],
    zoom: 5
});

let basMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy;'
});
basMap.addTo(map);
function getcolor(depth){
    if (depth>90){
        return "#ea2c2c"
    } else if (depth >70){
        return "#ea82cc"
    } else if (depth >50){
        return "#ee9c00"
    } else if (depth >30){
        return "#eecc00"
    } else if (depth>10){
        return "#d4ee00"
    }
    else {
        return "#98ee00"
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

    }).addTo(map);

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
});

