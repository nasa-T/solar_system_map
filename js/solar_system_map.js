import axios from "axios";

const options = {
  method: 'GET',
  url: 'https://astronomy.p.rapidapi.com/api/v2/bodies/positions',
  params: {
    latitude: '33.775867',
    longitude: '-84.39733',
    from_date: '2017-12-20',
    to_date: '2017-12-21',
    elevation: '166',
    time: '12:00:00'
  },
  headers: {
    'X-RapidAPI-Key': '1948f0adcfmsha6c2f85eda754c3p1ebb93jsn77a08f207f83',
    'X-RapidAPI-Host': 'astronomy.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});
// const options = {
// 	method: 'GET',
// 	headers: {
// 		'X-RapidAPI-Key': '1948f0adcfmsha6c2f85eda754c3p1ebb93jsn77a08f207f83',
// 		'X-RapidAPI-Host': 'astronomy.p.rapidapi.com'
// 	}
// };

// fetch('https://astronomy.p.rapidapi.com/api/v2/bodies/positions?latitude=33.775867&longitude=-84.39733&from_date=2017-12-20&to_date=2017-12-21&elevation=166&time=12%3A00%3A00', options)
// 	.then(response => response.json())
// 	.then(response => console.log(response))
// 	.catch(err => console.error(err));
// const settings = {
// 	"async": true,
// 	"crossDomain": true,
// 	"url": "https://astronomy.p.rapidapi.com/api/v2/bodies/positions?latitude=33.775867&longitude=-84.39733&from_date=2017-12-20&to_date=2017-12-21&elevation=166&time=12%3A00%3A00",
// 	"method": "GET",
// 	"headers": {
// 		"X-RapidAPI-Key": "1948f0adcfmsha6c2f85eda754c3p1ebb93jsn77a08f207f83",
// 		"X-RapidAPI-Host": "astronomy.p.rapidapi.com"
// 	}
// };

// $.ajax(settings).done(function (response) {
// 	console.log(response);
// });
