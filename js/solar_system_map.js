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

const SCALE = canvas.width / 20;

function initializeCanvas() {
    canvas.width = canvas.width;
    ctx.transform(SCALE, 0, 0, -SCALE, canvas.width / 2, canvas.height / 2);
    ctx.lineWidth = 1 / SCALE;
}


function GET(date, time="00:00:00") {
    var timeFormatted = time.replace(/:/g, "%3A") + "%3A00";
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

    //$.ajax(settings).done(function (response) {
    //console.log(response);
//	return response;
  //  });
}

function RAtoAngle(RA) {
    return RA * 15;
}

function earthFrameLoc(RA, dist) {
    return {
	x: dist*Math.cos(RA),
	y: dist*Math.sin(RA)
    };
}

function makeBodies(data, geocentric) {
    let bodies = [];
    if (geocentric) {
	for (var i = 0; i < data.table.rows.length; i++) {
	    var object = data.table.rows[i].cells[0];
	    if (object.name == "Earth") {
		bodies.push({
		    color: colorSwitch.Earth,
		    radius: 100 / SCALE,
		    x: 0,
		    y: 0,
		    dist: 0		    
		})
		continue;
	    }
	    
	    var objName = object.name;
	    var objPos = earthFrameLoc(RAtoAngle(parseFloat(object.position.equatorial.rightAscension.hours)), parseFloat(object.distance.fromEarth.au));
	    var mag = parseFloat(object.extraInfo.magnitude);
	    if (object.name == "Sun") {
		bodies.push({
		    color: colorSwitch.Sun,
		    radius: 200 / SCALE,
		    x: objPos.x,
		    y: objPos.y,
		    dist: object.distance.fromEarth.au		    
		});
		continue;
	    }
	    bodies.push({
		color: colorSwitch[objName],
		radius: Math.sqrt(10**(mag/-2.5)),
		x: objPos.x,
		y: objPos.y,
		dist: object.distance.fromEarth.au		
	    });
	}
    } else {
	let sunPos;
	let theSun;
	for (var i = 0; i < data.table.rows.length; i++) {
	    var object = data.table.rows[i].cells[0];
	    if (object.name == "Sun") {
		bodies.push({
		    color: colorSwitch.Sun,
		    radius: 200 / SCALE,
		    x: 0,
		    y: 0,
		    dist: object.distance.fromEarth.au		    
		});
		sunPos = earthFrameLoc(RAtoAngle(parseFloat(object.position.equatorial.rightAscension.hours)), parseFloat(object.distance.fromEarth.au));
		theSun = object;
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
		    radius: 100 / SCALE,
		    x: -sunPos.x,
		    y: -sunPos.y,
		    dist: 0		    
		});
		continue;
	    }
	    var objName = object.name;
	    var objPos = earthFrameLoc(RAtoAngle(parseFloat(object.position.equatorial.rightAscension.hours)), parseFloat(object.distance.fromEarth.au));
	    var mag = parseFloat(object.extraInfo.magnitude);
	    bodies.push({
		color: colorSwitch[objName],
		radius: Math.sqrt(10**(mag/-2.5)),
		x: objPos.x - sunPos.x,
		y: objPos.y - sunPos.y,
		dist: object.distance.fromEarth.au
	    });
	}
    }
    for (var i = 0; i < bodies.length; i++) {
	if (bodies[i].color == "silver") {
	    bodies[i].radius = 200 / SCALE;
	    bodies[i].color = "green";
	}
    }
    return bodies;
}

function drawBodies(data, geocentric) {
    const bodies = makeBodies(data, geocentric);
    initializeCanvas();
    for (var i = 0; i < bodies.length; i++) {
	var body = bodies[i];
	ctx.beginPath();
	ctx.arc(body.x, body.y, 0.25, 0, 2 * Math.PI);
	//ctx.arc(body.x, body.y, body.radius / SCALE, 0, 2 * Math.PI);
	ctx.strokeStyle = body.color;
	ctx.stroke();
	ctx.fillStyle = body.color;
	ctx.fill();
	ctx.beginPath();
	ctx.arc(0, 0, Math.sqrt(body.x**2 + body.y**2), 0, 2 * Math.PI);
	ctx.strokeStyle = "black";
	ctx.stroke();
    }

}

function test(geocentric) {
    const date_time = document.getElementById("dateTime").value.toString();
    const date_time_array = date_time.split("T");
    // const data = GET(date_time_array[0], date_time_array[1]);
    const data = {
  "data": {
      "observer": {
	  "location": {
              "longitude": -73.2017,
              "elevation": 285,
              "latitude": 42.7115
	  }
      },
      "dates": {
	  "from": "2002-03-28T09:39:00.000-05:00",
	  "to": "2002-03-28T09:39:00.000-05:00"
      },
      "table": {
	  "rows": [
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "149322098.18920",
				  "au": "0.99816"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "39° 46' 12\"",
				      "degrees": "39.77"
				  },
				  "azimuth": {
				      "string": "132° 17' 24\"",
				      "degrees": "132.29"
				  }
			      },
			      "constellation": {
				  "short": "Psc",
				  "name": "Pisces",
				  "id": "psc"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "0.47",
				      "string": "00h 28m 12s"
				  },
				  "declination": {
				      "string": "3° 3' 36\"",
				      "degrees": "3.06"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "39° 46' 12\"",
				      "degrees": "39.77"
				  },
				  "azimuth": {
				      "string": "132° 17' 24\"",
				      "degrees": "132.29"
				  }
			      }
			  },
			  "name": "Sun",
			  "extraInfo": {
			      "elongation": 0,
			      "magnitude": -26.74607
			  },
			  "id": "sun"
		      }
		  ],
		  "entry": {
		      "name": "Sun",
		      "id": "sun"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "360812.00706",
				  "au": "0.00241"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "-36° 17' 24\"",
				      "degrees": "-35.71"
				  },
				  "azimuth": {
				      "string": "316° 0' 36\"",
				      "degrees": "316.01"
				  }
			      },
			      "constellation": {
				  "short": "Vir",
				  "name": "Virgo",
				  "id": "vir"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "12.43",
				      "string": "12h 25m 48s"
				  },
				  "declination": {
				      "string": "1° 34' 48\"",
				      "degrees": "1.58"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "-36° 17' 24\"",
				      "degrees": "-35.71"
				  },
				  "azimuth": {
				      "string": "316° 0' 36\"",
				      "degrees": "316.01"
				  }
			      }
			  },
			  "name": "Moon",
			  "extraInfo": {
			      "elongation": 174.64866,
			      "magnitude": -12.74034,
			      "phase": {
				  "fraction": "0.000",
				  "string": "Waxing Gibbous",
				  "angel": "177.7453"
			      }
			  },
			  "id": "moon"
		      }
		  ],
		  "entry": {
		      "name": "Moon",
		      "id": "moon"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "199856442.80496",
				  "au": "1.33596"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "38° 44' 24\"",
				      "degrees": "38.74"
				  },
				  "azimuth": {
				      "string": "144° 55' 12\"",
				      "degrees": "144.92"
				  }
			      },
			      "constellation": {
				  "short": "Psc",
				  "name": "Pisces",
				  "id": "psc"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "23.94",
				      "string": "23h 56m 24s"
				  },
				  "declination": {
				      "string": "-3° 25' 12\"",
				      "degrees": "-2.58"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "38° 44' 24\"",
				      "degrees": "38.74"
				  },
				  "azimuth": {
				      "string": "144° 55' 12\"",
				      "degrees": "144.92"
				  }
			      }
			  },
			  "name": "Mercury",
			  "extraInfo": {
			      "elongation": 9.82364,
			      "magnitude": -0.99704
			  },
			  "id": "mercury"
		      }
		  ],
		  "entry": {
		      "name": "Mercury",
		      "id": "mercury"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "240242877.44464",
				  "au": "1.60592"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "34° 6' 36\"",
				      "degrees": "34.11"
				  },
				  "azimuth": {
				      "string": "111° 10' 48\"",
				      "degrees": "111.18"
				  }
			      },
			      "constellation": {
				  "short": "Psc",
				  "name": "Pisces",
				  "id": "psc"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "1.59",
				      "string": "01h 35m 24s"
				  },
				  "declination": {
				      "string": "9° 12' 36\"",
				      "degrees": "9.21"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "34° 6' 36\"",
				      "degrees": "34.11"
				  },
				  "azimuth": {
				      "string": "111° 10' 48\"",
				      "degrees": "111.18"
				  }
			      }
			  },
			  "name": "Venus",
			  "extraInfo": {
			      "elongation": 17.75107,
			      "magnitude": -3.85299
			  },
			  "id": "venus"
		      }
		  ],
		  "entry": {
		      "name": "Venus",
		      "id": "venus"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "6368.62706",
				  "au": "0.00004"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "-90° 11' 24\"",
				      "degrees": "-89.81"
				  },
				  "azimuth": {
				      "string": "0° 0' 0\"",
				      "degrees": "0.00"
				  }
			      },
			      "constellation": {
				  "short": "Vel",
				  "name": "Vela",
				  "id": "vel"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "10.16",
				      "string": "10h 09m 36s"
				  },
				  "declination": {
				      "string": "-43° 29' 24\"",
				      "degrees": "-42.51"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "-90° 11' 24\"",
				      "degrees": "-89.81"
				  },
				  "azimuth": {
				      "string": "0° 0' 0\"",
				      "degrees": "0.00"
				  }
			      }
			  },
			  "name": "Earth",
			  "extraInfo": {
			      "elongation": null,
			      "magnitude": null
			  },
			  "id": "earth"
		      }
		  ],
		  "entry": {
		      "name": "Earth",
		      "id": "earth"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "319244128.36903",
				  "au": "2.13402"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "23° 48' 36\"",
				      "degrees": "23.81"
				  },
				  "azimuth": {
				      "string": "86° 59' 24\"",
				      "degrees": "86.99"
				  }
			      },
			      "constellation": {
				  "short": "Ari",
				  "name": "Aries",
				  "id": "ari"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "3.08",
				      "string": "03h 04m 48s"
				  },
				  "declination": {
				      "string": "17° 58' 12\"",
				      "degrees": "17.97"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "23° 48' 36\"",
				      "degrees": "23.81"
				  },
				  "azimuth": {
				      "string": "86° 59' 24\"",
				      "degrees": "86.99"
				  }
			      }
			  },
			  "name": "Mars",
			  "extraInfo": {
			      "elongation": 41.17882,
			      "magnitude": 1.45785
			  },
			  "id": "mars"
		      }
		  ],
		  "entry": {
		      "name": "Mars",
		      "id": "mars"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "766315295.56850",
				  "au": "5.12250"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "-7° 52' 48\"",
				      "degrees": "-6.12"
				  },
				  "azimuth": {
				      "string": "49° 10' 12\"",
				      "degrees": "49.17"
				  }
			      },
			      "constellation": {
				  "short": "Gem",
				  "name": "Gemini",
				  "id": "gem"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "6.49",
				      "string": "06h 29m 24s"
				  },
				  "declination": {
				      "string": "23° 26' 24\"",
				      "degrees": "23.44"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "-7° 52' 48\"",
				      "degrees": "-6.12"
				  },
				  "azimuth": {
				      "string": "49° 10' 12\"",
				      "degrees": "49.17"
				  }
			      }
			  },
			  "name": "Jupiter",
			  "extraInfo": {
			      "elongation": 89.04721,
			      "magnitude": -2.21585
			  },
			  "id": "jupiter"
		      }
		  ],
		  "entry": {
		      "name": "Jupiter",
		      "id": "jupiter"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "1417017622.16436",
				  "au": "9.47218"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "9° 24' 0\"",
				      "degrees": "9.40"
				  },
				  "azimuth": {
				      "string": "70° 35' 24\"",
				      "degrees": "70.59"
				  }
			      },
			      "constellation": {
				  "short": "Tau",
				  "name": "Taurus",
				  "id": "tau"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "4.58",
				      "string": "04h 34m 48s"
				  },
				  "declination": {
				      "string": "20° 31' 12\"",
				      "degrees": "20.52"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "9° 24' 0\"",
				      "degrees": "9.40"
				  },
				  "azimuth": {
				      "string": "70° 35' 24\"",
				      "degrees": "70.59"
				  }
			      }
			  },
			  "name": "Saturn",
			  "extraInfo": {
			      "elongation": 62.41263,
			      "magnitude": -0.00054
			  },
			  "id": "saturn"
		      }
		  ],
		  "entry": {
		      "name": "Saturn",
		      "id": "saturn"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "3103134426.59350",
				  "au": "20.74317"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "34° 7' 48\"",
				      "degrees": "34.13"
				  },
				  "azimuth": {
				      "string": "183° 16' 48\"",
				      "degrees": "183.28"
				  }
			      },
			      "constellation": {
				  "short": "Cap",
				  "name": "Capricornus",
				  "id": "cap"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "21.97",
				      "string": "21h 58m 12s"
				  },
				  "declination": {
				      "string": "-14° 51' 36\"",
				      "degrees": "-13.14"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "34° 7' 48\"",
				      "degrees": "34.13"
				  },
				  "azimuth": {
				      "string": "183° 16' 48\"",
				      "degrees": "183.28"
				  }
			      }
			  },
			  "name": "Uranus",
			  "extraInfo": {
			      "elongation": 40.59843,
			      "magnitude": 5.90346
			  },
			  "id": "uranus"
		      }
		  ],
		  "entry": {
		      "name": "Uranus",
		      "id": "uranus"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "4581112210.52203",
				  "au": "30.62284"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "27° 9' 0\"",
				      "degrees": "27.15"
				  },
				  "azimuth": {
				      "string": "201° 0' 0\"",
				      "degrees": "201.00"
				  }
			      },
			      "constellation": {
				  "short": "Cap",
				  "name": "Capricornus",
				  "id": "cap"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "20.85",
				      "string": "20h 51m 00s"
				  },
				  "declination": {
				      "string": "-18° 27' 0\"",
				      "degrees": "-17.55"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "27° 9' 0\"",
				      "degrees": "27.15"
				  },
				  "azimuth": {
				      "string": "201° 0' 0\"",
				      "degrees": "201.00"
				  }
			      }
			  },
			  "name": "Neptune",
			  "extraInfo": {
			      "elongation": 57.31691,
			      "magnitude": 7.95238
			  },
			  "id": "neptune"
		      }
		  ],
		  "entry": {
		      "name": "Neptune",
		      "id": "neptune"
		  }
              },
              {
		  "cells": [
		      {
			  "date": "2002-03-28T09:39:00.000-05:00",
			  "distance": {
			      "fromEarth": {
				  "km": "4509084483.01918",
				  "au": "30.14137"
			      }
			  },
			  "position": {
			      "horizontal": {
				  "altitude": {
				      "string": "2° 18' 36\"",
				      "degrees": "2.31"
				  },
				  "azimuth": {
				      "string": "250° 21' 36\"",
				      "degrees": "250.36"
				  }
			      },
			      "constellation": {
				  "short": "Oph",
				  "name": "Ophiuchus",
				  "id": "oph"
			      },
			      "equatorial": {
				  "rightAscension": {
				      "hours": "17.16",
				      "string": "17h 09m 36s"
				  },
				  "declination": {
				      "string": "-13° 7' 48\"",
				      "degrees": "-12.87"
				  }
			      },
			      "horizonal": {
				  "altitude": {
				      "string": "2° 18' 36\"",
				      "degrees": "2.31"
				  },
				  "azimuth": {
				      "string": "250° 21' 36\"",
				      "degrees": "250.36"
				  }
			      }
			  },
			  "name": "Pluto",
			  "extraInfo": {
			      "elongation": 109.8059,
			      "magnitude": 13.88711
			  },
			  "id": "pluto"
		      }
		  ],
		  "entry": {
		      "name": "Pluto",
		      "id": "pluto"
		  }
              }
	  ],
	  "header": [
              "2002-03-28T09:39:00.000-05:00"
	  ]
      }
  },
	"message": "You're using the demo api key. You may run in to rate limits. Visit astronomyapi.com to get your free API keys."
    }

    drawBodies(data.data, geocentric);
}
