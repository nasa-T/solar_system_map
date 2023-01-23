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

const date_time = document.getElementById("dateTime");
const date_time_array = date_time.value.split("T");

function GET(date, time="00:00:00") {
    var timeFormatted = time.replace(/:/g, "%3A");
    const settings = {
	"async": true,
	"crossDomain": true,
	"url": "https://astronomy.p.rapidapi.com/api/v2/bodies/positions?latitude=42.7115&longitude=-73.2017&from_date=${date}&to_date=${date}&elevation=285&time=${timeFormatted}",
	"method": "GET",
	"headers": {
	    "X-RapidAPI-Key": "1948f0adcfmsha6c2f85eda754c3p1ebb93jsn77a08f207f83",
	    "X-RapidAPI-Host": "astronomy.p.rapidapi.com"
	}
    };

    $.ajax(settings).done(function (response) {
	console.log(response);
    });
}

function test() {
    GET(date_time_array[0], date_time_array[1]);
}
