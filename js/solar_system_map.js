var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const colorSwitch = {
    "mercury": "gray",
    "venus": "coral",
    "earth": "blue",
    "mars": "red",
    "jupiter": "orange",
    "saturn": "peru",
    "uranus": "paleturquoise",
    "neptune": "slateblue",
    "pluto": "slategray",
    "moon": "silver"
};

const SCALE = canvas.width / 101;

function initializeCanvas() {
    ctx.transform(SCALE, 0, 0, -SCALE, canvas.width / 2, canvas.height / 2);
    ctx.lineWidth = 1 / SCALE;
}

const date_time = ctx.getElementById("dateTime");

function GET(

const settings = {
	"async": true,
	"crossDomain": true,
	"url": "https://astronomy.p.rapidapi.com/api/v2/bodies/positions?latitude=42.7115&longitude=-73.2017&from_date=2023-01-23&to_date=2023-01-23&elevation=285&time=12%3A00%3A00",
	"method": "GET",
	"headers": {
		"X-RapidAPI-Key": "1948f0adcfmsha6c2f85eda754c3p1ebb93jsn77a08f207f83",
		"X-RapidAPI-Host": "astronomy.p.rapidapi.com"
	}
};

$.ajax(settings).done(function (response) {
	console.log(response);
});
