
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


const colorSwitch = {
    "Mercury": "gray",
    "Venus": "coral",
    "Earth": "blue",
    "Mars": "red",
    "Jupiter": "orange",
    "Saturn": "peru",
    "Uranus": "paleturquoise",
    "Neptune": "slateblue",
    "Pluto": "slategray",
    "Moon": "silver",
    "Sun": "yellow"
};

const SCALE = canvas.width / 101;

function initializeCanvas() {
    ctx.transform(SCALE, 0, 0, -SCALE, canvas.width / 2, canvas.height / 2);
    ctx.lineWidth = 1 / SCALE;
}


function GET(date, time="00:00:00") {
    var timeFormatted = time.replace(/:/g, "%3A");
    const settings = {
	"async": true,
	"crossDomain": true,
	"url": `https://astronomy.p.rapidapi.com/api/v2/bodies/positions?latitude=42.7115&longitude=-73.2017&from_date=${date}&to_date=${date}&elevation=285&time=${timeFormatted}`,
	"method": "GET",
	"headers": {
	    "X-RapidAPI-Key": "1948f0adcfmsha6c2f85eda754c3p1ebb93jsn77a08f207f83",
	    "X-RapidAPI-Host": "astronomy.p.rapidapi.com"
	}
    };

    $.ajax(settings).done(function (response) {
	return response;
    });
}

function RAtoAngle(RA) {
    return RA/24 * 360;
}

function earthFrameLoc(RA, dist) {
    return {
	x: dist*Math.cos(RA),
	y: dist*Math.sin(RA)
    };
}

function makeBodies(data, geocentric) {
    initializeCanvas();
    let bodies = [];
    if (geocentric) {
	for (var i = 0; i < data.table.rows.length; i++) {
	    var object = data.table.rows[i].cells[0];
	    if (object.name == "Earth") {
		bodies.push({
		    color: colorSwitch.Earth,
		    radius: 5 / SCALE,
		    x: 0,
		    y: 0
		})
		continue
	    }
	    var objName = object.name;
	    var objPos = earthFrameLoc(parseFloat(object.position.equatorial.rightAscension.hours), parseFloat(object.distance.fromEarth.au));
	    var mag = parseFloat(object.extraInfo.magnitude);
	    bodies.push({
		color: colorSwitch.objName,
		radius: 10**(mag/-2.5),
		x: objPos.x,
		y: objPos.y
	    });
	}
    } else {
	for (var i = 0; i < data.table.rows.length; i++) {
	    var object = data.table.rows[i].cells[0];
	    if (object.name == "Sun") {
		bodies.push({
		    color: colorSwitch.Sun,
		    radius: 5 / SCALE,
		    x: 0,
		    y: 0
		});
		const sunPos = earthFrameLoc(parseFloat(object.position.equatorial.rightAscension.hours), parseFloat(object.distance.fromEarth.au));
		const theSun = object;
		break;
	    }
	}
	for (var i = 0; i < data.table.rows.length; i++) {
	    var object = data.table.rows[i].cells[0];
	    if (object.name == "Sun") {
		continue;
	    }
	    if (object.name == "Earth") {
		bodies.push({
		    color: colorSwitch.Earth,
		    radius: 5 / SCALE,
		    x: -sunPos.x,
		    y: -sunPos.y
		});
		continue;
	    }
	    var objName = object.name;
	    var objPos = earthFrameLoc(parseFloat(object.position.equatorial.rightAscension.hours), parseFloat(object.distance.fromEarth.au));
	    var mag = parseFloat(object.extraInfo.magnitude);
	    bodies.push({
		color: colorSwitch.objName,
		radius: 10**(mag/-2.5),
		x: objPos.x - sunPos.x,
		y: objPos.y - sunPos.y
	    });
	}
    }
    return bodies;
}

function drawBodies(data, geocentric) {
    const bodies = makeBodies(data, geocentric);
    for (var i = 0; i < bodies.length; i++) {
	var body = bodies[i];
	ctx.arc(body.x, body.y, body.radius / SCALE, 0, 2 * Math.pi);
	ctx.strokeStyle = body.color;
	ctx.stroke();
	ctx.fillStyle = body.color;
	ctx.fill();
    }
}

function test(geocentric) {
    const date_time = document.getElementById("dateTime").value.toString();
    const date_time_array = date_time.split("T");
    var data = GET(date_time_array[0], date_time_array[1]);
    drawBodies(data, geocentric);
}
