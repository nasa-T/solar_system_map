var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Setting the colors of the planets
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

const sizeSwitch = {
    "Mercury": 0.075,
    "Venus": 0.2,
    "Earth": 0.2,
    "Mars": 0.1,
    "Jupiter": 0.8,
    "Saturn": 0.7,
    "Uranus": 0.6,
    "Neptune": 0.5,
    "Pluto": 0.3,
    "Moon": 0.02,
    "Sun": 0.2

};

var SCALE = canvas.width / 0.7;

function initializeCanvas() {
    canvas.width = canvas.width;
    ctx.transform(SCALE, 0, 0, -SCALE, canvas.width / 2, canvas.height / 2);
    ctx.lineWidth = 1 / SCALE;
}


function GET(date, time="00:00:00") {
    // Reformat time to usee in url
    var timeFormatted = time.replace(/:/g, "%3A") + "%3A00";
    const settings = {
	"async": false,
	"crossDomain": true,
	// Use date and timeFormatted variables in url
	"url": `https://astronomy.p.rapidapi.com/api/v2/bodies/positions?latitude=42.7115&longitude=-73.2017&from_date=${date}&to_date=${date}&elevation=285&time=${timeFormatted}`,
	"method": "GET",
	"headers": {
	    "X-RapidAPI-Key": "1948f0adcfmsha6c2f85eda754c3p1ebb93jsn77a08f207f83",
	    "X-RapidAPI-Host": "astronomy.p.rapidapi.com"
	}
    };
    // initialize answer to be returned
    var answer;
    $.ajax(settings).done(function (response) {
    console.log(response);
	answer = response;
   });
   return answer;
}

function RAtoAngle(RA) {
    // 15 degrees per hour
    return RA * 15;
}

function earthFrameLoc(RA, dist) {
    return {
	// cos and sin take inputs in radians; location from earth's reference frame
	x: dist*Math.cos(RA * Math.PI / 180),
	y: dist*Math.sin(RA * Math.PI / 180)
    };
}

function makeBodies(data, geocentric) {
    // array to append objects with their properties to
    let bodies = [];
    // we want the earth in the center if geocentric is true
    if (geocentric) {
	for (var i = 0; i < data.table.rows.length; i++) {
	    // grab object's data
	    var object = data.table.rows[i].cells[0];
	    // earth is a special case; can't be a distance or angle from itself, so position is hard coded in the center
	    if (object.name == "Earth") {
		bodies.push({
		    color: colorSwitch.Earth,
		    radius: sizeSwitch.Earth,
		    x: 0,
		    y: 0,
		    dist: 0		    
		})
		continue;
	    }
	    
	    var objName = object.name;
	    var objPos = earthFrameLoc(RAtoAngle(parseFloat(object.position.equatorial.rightAscension.hours)), parseFloat(object.distance.fromEarth.au));
	    console.log(objName, Math.sqrt(objPos.x**2 + objPos.y**2));
	    // brightness to scale with radius
	    var mag = parseFloat(object.extraInfo.magnitude);
	    if (object.name == "Sun") {
		bodies.push({
		    color: colorSwitch.Sun,
		    // special case; sun is too bright to have its radius scale with its brightness
		    radius: sizeSwitch.Sun,
		    x: objPos.x,
		    y: objPos.y,
		    dist: object.distance.fromEarth.au		    
		});
		continue;
	    }
	    bodies.push({
		color: colorSwitch[objName],
		// magnitude to flux conversion (kind of)
		radius: sizeSwitch[objName],
		x: objPos.x,
		y: objPos.y,
		dist: object.distance.fromEarth.au		
	    });
	}
    } else {
	// the sun needs to be found and its position is necessary to save as a variable for the other objects
	let sunPos;
	let theSun;
	for (var i = 0; i < data.table.rows.length; i++) {
	    var object = data.table.rows[i].cells[0];
	    if (object.name == "Sun") {
		bodies.push({
		    color: colorSwitch.Sun,
		    radius: sizeSwitch.Sun,
		    x: 0,
		    y: 0,
		    dist: object.distance.fromEarth.au		    
		});
		sunPos = earthFrameLoc(RAtoAngle(object.position.equatorial.rightAscension.hours), object.distance.fromEarth.au);
		theSun = object;
		break;
	    }
	}
	for (var i = 0; i < data.table.rows.length; i++) {
	    var object = data.table.rows[i].cells[0];
	    // don't double count the sun
	    if (object.name == "Sun") {
		continue;
	    }
	    // earth is a special case since the data I have is distance and angle relative to the earth, so I rather not try to reference that data for earth
	    if (object.name == "Earth") {
		bodies.push({
		    color: colorSwitch.Earth,
		    radius: sizeSwitch.Earth,
		    x: -sunPos.x,
		    y: -sunPos.y,
		    dist: 0		    
		});
		continue;
	    }
	    var objName = object.name;
	    var objPos = earthFrameLoc(RAtoAngle(object.position.equatorial.rightAscension.hours), object.distance.fromEarth.au);
	    var mag = parseFloat(object.extraInfo.magnitude);
	    bodies.push({
		color: colorSwitch[objName],
		radius: sizeSwitch[objName],
		// the positions of the planets relative to the sun are the object's position relative to earth - the sun's position relative to earth
		x: objPos.x - sunPos.x,
		y: objPos.y - sunPos.y,
		dist: object.distance.fromEarth.au
	    });
	}
    }
    // testing stuff with the moon...
    /* for (var i = 0; i < bodies.length; i++) {
   	if (bodies[i].color == "silver") {
    	    bodies[i].radius;
    	}
    } */
    return bodies;
}

function drawBodies(data, geocentric) {
  // get bodies array
  const bodies = makeBodies(data, geocentric);
  // initialize scaling and coordinates of canvas
  initializeCanvas();
  for (var i = 0; i < bodies.length; i++) {
	var body = bodies[i];
	// draw the orbits of the bodies
	ctx.beginPath();
	ctx.arc(0, 0, Math.sqrt(body.x**2 + body.y**2), 0, 2 * Math.PI);
	ctx.strokeStyle = "black";
	ctx.stroke();
  // loop through all bodies and draw them as circles
	ctx.beginPath();
	//ctx.arc(body.x, body.y, 0.25, 0, 2 * Math.PI);
	ctx.arc(body.x, body.y, body.radius, 0, 2 * Math.PI);
	ctx.strokeStyle = body.color;
	ctx.stroke();
	ctx.fillStyle = body.color;
	ctx.fill();
  }

}

var laData = {};
function test(geocentric) {
    const date_time = document.getElementById("dateTime").value.toString();
    const date_time_array = date_time.split("T");
    // if the data has already been made, don't recalculate it
    if (Object.keys(laData).length > 0) {
      console.log(laData);
      drawBodies(laData.data.data, geocentric);
      laData.geocentric = geocentric;
      return;
    }
    // get date and time from user input
    // const data = GET(date_time_array[0], date_time_array[1]);
    // test data
    const data = {
  "data": {
    "observer": {
      "location": {
        "longitude": -73.2017,
        "elevation": 258,
        "latitude": 42.7115
      }
    },
    "dates": {
      "from": "2017-12-20T12:00:00.000-05:00",
      "to": "2017-12-20T12:00:00.000-05:00"
    },
    "table": {
      "rows": [
        {
          "cells": [
            {
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "147175867.48604",
                  "au": "0.98381"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "23° 51' 36\"",
                    "degrees": "23.86"
                  },
                  "azimuth": {
                    "string": "182° 21' 36\"",
                    "degrees": "182.36"
                  }
                },
                "constellation": {
                  "short": "Sgr",
                  "name": "Sagittarius",
                  "id": "sgr"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "17.91",
                    "string": "17h 54m 36s"
                  },
                  "declination": {
                    "string": "-24° 34' 12\"",
                    "degrees": "-23.43"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "23° 51' 36\"",
                    "degrees": "23.86"
                  },
                  "azimuth": {
                    "string": "182° 21' 36\"",
                    "degrees": "182.36"
                  }
                }
              },
              "name": "Sun",
              "extraInfo": {
                "elongation": 0,
                "magnitude": -26.77753
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "403134.46542",
                  "au": "0.00269"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "22° 50' 24\"",
                    "degrees": "22.84"
                  },
                  "azimuth": {
                    "string": "153° 29' 24\"",
                    "degrees": "153.49"
                  }
                },
                "constellation": {
                  "short": "Sgr",
                  "name": "Sagittarius",
                  "id": "sgr"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "19.80",
                    "string": "19h 48m 00s"
                  },
                  "declination": {
                    "string": "-21° 52' 12\"",
                    "degrees": "-20.13"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "22° 50' 24\"",
                    "degrees": "22.84"
                  },
                  "azimuth": {
                    "string": "153° 29' 24\"",
                    "degrees": "153.49"
                  }
                }
              },
              "name": "Moon",
              "extraInfo": {
                "elongation": 26.37692,
                "magnitude": -6.42717,
                "phase": {
                  "fraction": "0.063",
                  "string": "Waxing Crescent",
                  "angel": "26.3144"
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "113458815.16969",
                  "au": "0.75843"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "25° 28' 48\"",
                    "degrees": "25.48"
                  },
                  "azimuth": {
                    "string": "199° 39' 36\"",
                    "degrees": "199.66"
                  }
                },
                "constellation": {
                  "short": "Oph",
                  "name": "Ophiuchus",
                  "id": "oph"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "16.81",
                    "string": "16h 48m 35s"
                  },
                  "declination": {
                    "string": "-20° 33' 0\"",
                    "degrees": "-19.45"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "25° 28' 48\"",
                    "degrees": "25.48"
                  },
                  "azimuth": {
                    "string": "199° 39' 36\"",
                    "degrees": "199.66"
                  }
                }
              },
              "name": "Mercury",
              "extraInfo": {
                "elongation": 15.79975,
                "magnitude": 0.87821
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "254657601.15995",
                  "au": "1.70228"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "23° 37' 48\"",
                    "degrees": "23.63"
                  },
                  "azimuth": {
                    "string": "187° 28' 48\"",
                    "degrees": "187.48"
                  }
                },
                "constellation": {
                  "short": "Oph",
                  "name": "Ophiuchus",
                  "id": "oph"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "17.57",
                    "string": "17h 34m 12s"
                  },
                  "declination": {
                    "string": "-24° 40' 12\"",
                    "degrees": "-23.33"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "23° 37' 48\"",
                    "degrees": "23.63"
                  },
                  "azimuth": {
                    "string": "187° 28' 48\"",
                    "degrees": "187.48"
                  }
                }
              },
              "name": "Venus",
              "extraInfo": {
                "elongation": 4.6911,
                "magnitude": -3.9417
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "6368.60006",
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
                    "string": "360° 0' 0\"",
                    "degrees": "360.00"
                  }
                },
                "constellation": {
                  "short": "Col",
                  "name": "Columba",
                  "id": "col"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "6.08",
                    "string": "06h 04m 48s"
                  },
                  "declination": {
                    "string": "-43° 28' 48\"",
                    "degrees": "-42.52"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "-90° 11' 24\"",
                    "degrees": "-89.81"
                  },
                  "azimuth": {
                    "string": "360° 0' 0\"",
                    "degrees": "360.00"
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "307035673.60110",
                  "au": "2.05241"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "14° 19' 12\"",
                    "degrees": "14.32"
                  },
                  "azimuth": {
                    "string": "236° 38' 24\"",
                    "degrees": "236.64"
                  }
                },
                "constellation": {
                  "short": "Vir",
                  "name": "Virgo",
                  "id": "vir"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "14.32",
                    "string": "14h 19m 12s"
                  },
                  "declination": {
                    "string": "-13° 6' 36\"",
                    "degrees": "-12.89"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "14° 19' 12\"",
                    "degrees": "14.32"
                  },
                  "azimuth": {
                    "string": "236° 38' 24\"",
                    "degrees": "236.64"
                  }
                }
              },
              "name": "Mars",
              "extraInfo": {
                "elongation": 51.90045,
                "magnitude": 1.56568
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "912233450.98546",
                  "au": "6.09790"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "16° 56' 24\"",
                    "degrees": "16.94"
                  },
                  "azimuth": {
                    "string": "228° 59' 24\"",
                    "degrees": "228.99"
                  }
                },
                "constellation": {
                  "short": "Lib",
                  "name": "Libra",
                  "id": "lib"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "14.84",
                    "string": "14h 50m 24s"
                  },
                  "declination": {
                    "string": "-16° 45' 0\"",
                    "degrees": "-15.25"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "16° 56' 24\"",
                    "degrees": "16.94"
                  },
                  "azimuth": {
                    "string": "228° 59' 24\"",
                    "degrees": "228.99"
                  }
                }
              },
              "name": "Jupiter",
              "extraInfo": {
                "elongation": 44.07895,
                "magnitude": -1.76246
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "1652817323.47405",
                  "au": "11.04840"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "24° 47' 24\"",
                    "degrees": "24.79"
                  },
                  "azimuth": {
                    "string": "181° 13' 12\"",
                    "degrees": "181.22"
                  }
                },
                "constellation": {
                  "short": "Sgr",
                  "name": "Sagittarius",
                  "id": "sgr"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "17.99",
                    "string": "17h 59m 23s"
                  },
                  "declination": {
                    "string": "-23° 28' 12\"",
                    "degrees": "-22.53"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "24° 47' 24\"",
                    "degrees": "24.79"
                  },
                  "azimuth": {
                    "string": "181° 13' 12\"",
                    "degrees": "181.22"
                  }
                }
              },
              "name": "Saturn",
              "extraInfo": {
                "elongation": 1.39304,
                "magnitude": 0.31144
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "2910630059.05910",
                  "au": "19.45636"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "-9° 12' 0\"",
                    "degrees": "-8.80"
                  },
                  "azimuth": {
                    "string": "68° 22' 48\"",
                    "degrees": "68.38"
                  }
                },
                "constellation": {
                  "short": "Psc",
                  "name": "Pisces",
                  "id": "psc"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "1.52",
                    "string": "01h 31m 12s"
                  },
                  "declination": {
                    "string": "8° 55' 12\"",
                    "degrees": "8.92"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "-9° 12' 0\"",
                    "degrees": "-8.80"
                  },
                  "azimuth": {
                    "string": "68° 22' 48\"",
                    "degrees": "68.38"
                  }
                }
              },
              "name": "Uranus",
              "extraInfo": {
                "elongation": 115.63739,
                "magnitude": 5.75653
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "4520956589.40955",
                  "au": "30.22073"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "7° 27' 36\"",
                    "degrees": "7.46"
                  },
                  "azimuth": {
                    "string": "108° 4' 48\"",
                    "degrees": "108.08"
                  }
                },
                "constellation": {
                  "short": "Aqr",
                  "name": "Aquarius",
                  "id": "aqr"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "22.88",
                    "string": "22h 52m 48s"
                  },
                  "declination": {
                    "string": "-9° 52' 48\"",
                    "degrees": "-8.12"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "7° 27' 36\"",
                    "degrees": "7.46"
                  },
                  "azimuth": {
                    "string": "108° 4' 48\"",
                    "degrees": "108.08"
                  }
                }
              },
              "name": "Neptune",
              "extraInfo": {
                "elongation": 72.69389,
                "magnitude": 7.9134
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
              "date": "2017-12-20T12:00:00.000-05:00",
              "distance": {
                "fromEarth": {
                  "km": "5145284755.70582",
                  "au": "34.39410"
                }
              },
              "position": {
                "horizontal": {
                  "altitude": {
                    "string": "23° 22' 48\"",
                    "degrees": "23.38"
                  },
                  "azimuth": {
                    "string": "161° 10' 12\"",
                    "degrees": "161.17"
                  }
                },
                "constellation": {
                  "short": "Sgr",
                  "name": "Sagittarius",
                  "id": "sgr"
                },
                "equatorial": {
                  "rightAscension": {
                    "hours": "19.31",
                    "string": "19h 18m 36s"
                  },
                  "declination": {
                    "string": "-22° 15' 36\"",
                    "degrees": "-21.74"
                  }
                },
                "horizonal": {
                  "altitude": {
                    "string": "23° 22' 48\"",
                    "degrees": "23.38"
                  },
                  "azimuth": {
                    "string": "161° 10' 12\"",
                    "degrees": "161.17"
                  }
                }
              },
              "name": "Pluto",
              "extraInfo": {
                "elongation": 19.40497,
                "magnitude": 14.3281
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
        "2017-12-20T12:00:00.000-05:00"
      ]
    }
  },
  "message": "You're using the demo api key. You may run in to rate limits. Visit astronomyapi.com to get your free API keys."
}
    // drawBodies calls on other functions to use the data from GET
    drawBodies(data.data, geocentric);
    // save the data with its settings
    laData = {data: data, geocentric: geocentric};
}


function zoom(direction) {
    if (direction > 0) {
        SCALE *= 1.2;
    }
    if (direction < 0) {
        SCALE /= 1.2;
    }
    drawBodies(laData.data.data, laData.geocentric);
}

