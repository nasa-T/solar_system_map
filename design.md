Final Project Short Synopsis

The Astronomy API (https://docs.astronomyapi.com/) is an API that has the potential to give information about the major objects in our Solar System (the Moon, the Sun, the Planets, and Pluto). Using this information, we can make a simplified 2D map of the Solar System. The information returned includes the sky coordinates of all the objects (or a specified object) for a given time/range of times that you request for. The relevant sky coordinate for these objects is right ascension (RA). The RA, in combination with the distance from Earth of the object, can give us the direction and distance from Earth of each object for a given time. The user input will include specifying the date/time of interest.

I will use JavaScript and HTML to implement this Solar System map.

Javascript dependencies:
jQuery

JavaScript File Plan:

scale = in astronomical units (au) / canvas_width # 101au / width


function intialize canvas():
	 can be geocentric (Earth in middle) or heliocentric (Sun in middle)
	 


function GET(date=userInput, time=12:00:00 or userInput2):
	 params: { hard code williams coordinates,
	 	 from_date=to_date: userinput,
		 time: userinput2 optional
		 }
	headers: { use my key
		 host: astronomy.p.rapidapi.com
		 }
	return RA, distance from axios.request
	
function RAtoAngle(RA):
	 RA is given in hours (with decimals);
	 return convert to degrees using RA/24*360

function locRelativeToEarth(RAinDegrees, distanceFromEarth):
	 RA increases towards the East, so RA will increase counterclockwise from the perspective of above the Celestial North Pole (so dist*sine(RA) will give y coord and x is given by dist*cosine(RA))
	 return dist*cos(RA), dist*sin(RA)


function makeBodies(geocentric=True/False):
	 call initialize canvas
	 if geocentric:
	    initialize canvas with Earth in middle (easier to implement)
	    bodies = []
	    for object in data.table.rows:
	    	if cells.name == "Earth":
		   x, y = 0, 0
		   color = blue
		   bodies.push({
			color: color,
			radius: 10**(mag/-2.5),
			x: x,
			y: y
			})
		   continue
	    	distance = cells.distance.fromEarth.au
		ra = cells.position.equatorial.rightAscension.hours
		magnitude = cells.extraInfo.magnitude
		if cells.name == "Sun":
		   x, y = locRelativeToEarth(RAtoAngle(ra), distance)
		   color = yellow
		   bodies.push({...})
		elif cells.name == "Mercury":
		     etc...
	 else:
		initialize canvas with Sun in middle (a bit less trivial)
		bodies = []
		find Sun in data.table.rows:
		     xSun, ySun = locRelativeToEarth of the Sun
		     bodies.push({
			color: yellow,
			radius: 10**(mag/-2.5),
			x: 0,
			y: 0
			})
		for object in data.table.rows:
		    locRelativeToSun = locRelativeToEarth - xSun (or ySun) # for any object
		    bodies.push({...})
	return bodies

function drawObjects(geocentric=True/False) {
	bodies = makeBodies(geocentric)
	for object in bodies:
	    draw some circles...

