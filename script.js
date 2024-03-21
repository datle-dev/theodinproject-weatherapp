const WeatherApp = function () {
  const BASE_URL = 'http://api.weatherapi.com/v1';
  const API_METHOD = '/forecast.json?';
  const API_KEY = 'e46ab5f68f6a4b749d7201624241403';
  const FORECAST_DAYS = '3';
  let url = '';

  const set_url = (query) => {
    url = BASE_URL.concat(
      API_METHOD,
      'key=',
      API_KEY,
      '&days=',
      FORECAST_DAYS,
      '&q=',
      query,
    );
  };

  const submit_query = (query) => {
    set_url(query);
    return fetch_weather(url);
  };

  const fetch_weather = async function (url) {
    console.log(url);
    try {
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
      // console.log(`Status: ${response.status}`);
      const weatherData = await response.json();
      return await process_response(weatherData);
    } catch (error) {
      // console.log(`Error status: ${response.status}`);
      console.log(`Error: ${error}`);
    }
  };

  const process_response = function (weather) {
    result = {
      'location': {
        'name': weather.location.name,
        'region': weather.location.region,
        'country': weather.location.country,
        'lat': weather.location.lat, // positive east, negative west
        'lon': weather.location.lon, // positive north, negative south
      },
      'current': {
        'condition': weather.current.condition.text,
        'last_updated': weather.current.last_updated,
        'temp_c': weather.current.temp_c,
        'temp_f': weather.current.temp_f,
        'wind_mph': weather.current.wind_mph,
        'wind_kph': weather.current.wind_kph,
        'pressure_mb': weather.current.pressure_mb, // pressure in mbar
        'pressure_in': weather.current.pressure_in,
        'humidity': weather.current.humidity,
        'cloud': weather.current.cloud, // cloud cover as percentage
        'feelslike_c': weather.current.feelslike_c,
        'feelslike_f': weather.current.feelslike_f,
        'vis_km': weather.current.vis_km,
        'vis_miles': weather.current.vis_miles,
        'uv': weather.current.uv,
      },
    };

    result['forecast'] = {};

    for (let i = 0; i < 3; i++) {
      let condition = [];
      let hourlyTempC = [];
      let hourlyTempF = [];
      let chanceRain = [];
      let chanceSnow = [];
      let precipMM = [];
      let precipIN = [];
      let snowCM = [];
      let snowIN = [];
      let cloud = [];

      for (let j = 0; j < 24; j++) {
        condition.push(weather['forecast']['forecastday'][i]['hour'][j]['condition']['text'])
        hourlyTempC.push(weather['forecast']['forecastday'][i]['hour'][j]['temp_c'])
        hourlyTempF.push(weather['forecast']['forecastday'][i]['hour'][j]['temp_f'])
        chanceRain.push(weather['forecast']['forecastday'][i]['hour'][j]['chance_of_rain'])
        chanceSnow.push(weather['forecast']['forecastday'][i]['hour'][j]['chance_of_snow'])
        precipMM.push(weather['forecast']['forecastday'][i]['hour'][j]['precip_mm'])
        precipIN.push(weather['forecast']['forecastday'][i]['hour'][j]['precip_in'])
        snowCM.push(weather['forecast']['forecastday'][i]['hour'][j]['snow_cm'])
        snowIN.push(Number(weather['forecast']['forecastday'][i]['hour'][j]['snow_cm']) / 2.54) // convert cm to in
        cloud.push(weather['forecast']['forecastday'][i]['hour'][j]['cloud'])
      }

      result['forecast'][i] = {}

      result['forecast'][i]['day'] = {}
      result['forecast'][i]['day']['condition'] = weather['forecast']['forecastday'][i]['day']['condition']['text'];
      result['forecast'][i]['day']['maxtemp_c'] = weather['forecast']['forecastday'][i]['day']['maxtemp_c']
      result['forecast'][i]['day']['maxtemp_f'] = weather['forecast']['forecastday'][i]['day']['maxtemp_f']
      result['forecast'][i]['day']['mintemp_c'] = weather['forecast']['forecastday'][i]['day']['mintemp_c']
      result['forecast'][i]['day']['mintemp_f'] = weather['forecast']['forecastday'][i]['day']['mintemp_f']
      result['forecast'][i]['day']['daily_chance_of_rain'] = weather['forecast']['forecastday'][i]['day']['daily_chance_of_rain']
      result['forecast'][i]['day']['daily_chance_of_snow'] = weather['forecast']['forecastday'][i]['day']['daily_chance_of_snow']
      result['forecast'][i]['day']['totalprecip_mm'] = weather['forecast']['forecastday'][i]['day']['totalprecip_mm']
      result['forecast'][i]['day']['totalprecip_in'] = weather['forecast']['forecastday'][i]['day']['totalprecip_in']
      result['forecast'][i]['day']['totalsnow_cm'] = weather['forecast']['forecastday'][i]['day']['totalsnow_cm']
      result['forecast'][i]['day']['totalsnow_in'] = Number(weather['forecast']['forecastday'][i]['day']['totalsnow_cm']) / 2.54// convert cm to in

      result['forecast'][i]['hour'] = {}
      result['forecast'][i]['hour']['condition'] = condition;
      result['forecast'][i]['hour']['temp_c'] = hourlyTempC;
      result['forecast'][i]['hour']['temp_f'] = hourlyTempF;
      result['forecast'][i]['hour']['chance_of_rain'] = chanceRain;
      result['forecast'][i]['hour']['chance_of_snow'] = chanceSnow;
      result['forecast'][i]['hour']['precip_mm'] = precipMM;
      result['forecast'][i]['hour']['precip_in'] = precipIN;
      result['forecast'][i]['hour']['snow_cm'] = snowCM;
      result['forecast'][i]['hour']['snow_in'] = snowIN;
      result['forecast'][i]['hour']['cloud'] = cloud;

    }

    return result;

  };

  return {
    submit_query,
  };

}();

const GUIController = function () {
  const form = document.querySelector('form');
  const search = document.querySelector('#search');

  const location = document.querySelector('#location');
  const current = document.querySelector('#current');
  const threeDay = document.querySelector('#three-day');
  const hourly = document.querySelector('#hourly');

  let unitsSI = true;
  let data;

  form.onsubmit = (event) => {
    event.preventDefault();
    clear();
    let query = search.value;
    console.log(query);
    updateWeather(query);
    
  };

  const initialize = () => {
    updateWeather('Boston');
  };

  const clear = () => {
    [location, current, threeDay, hourly].forEach((section) => {
      while (section.firstChild) {
        section.removeChild(section.firstChild);
      }
    })
  };

  const updateWeather = async (query) => {
    data = await WeatherApp.submit_query(query);
    console.log(data);
    updateLocation();
    updateCurrent();
    updateThreeDay();
    updateHourly();
  };

  const updateLocation = () => {
    // const heading = document.createElement('h1');
    const locName = document.createElement('p');
    const locRegion = document.createElement('p');
    const locCountry = document.createElement('p');
    const lat = document.createElement('p')
    const lon = document.createElement('p')

    // heading.innerText = 'Location';
    locName.innerText = data.location.name;
    locRegion.innerText = data.location.region;
    locCountry.innerText = data.location.country;

    if (data.location.lat > 0) {
      lat.innerText = String(Math.abs(data.location.lat)) + '°N';
    } else {
      lat.innerText = String(Math.abs(data.location.lat)) + '°S';
    }

    if (data.location.lon > 0) {
      lon.innerText = String(Math.abs(data.location.lon)) + '°E';
    } else {
      lon.innerText = String(Math.abs(data.location.lon)) + '°W';
    }

    // location.appendChild(heading);
    location.appendChild(locName);
    location.appendChild(locRegion);
    location.appendChild(locCountry);
    location.appendChild(lat);
    location.appendChild(lon);
  };

  const updateCurrent = () => {
    // const heading = document.createElement('h1');
    const condition = document.createElement('p');
    const lastUpdated = document.createElement('p');
    const temp = document.createElement('p');
    const feelsLike = document.createElement('p');
    const pressure = document.createElement('p');
    const humidity = document.createElement('p');
    const uv = document.createElement('p');
    const cloud = document.createElement('p');
    const vis = document.createElement('p');
    const wind = document.createElement('p');

    // heading.innerText = 'Current Conditions';
    condition.innerText = data.current.condition;
    lastUpdated.innerText = data.current.last_updated;
    humidity.innerText = data.current.humidity + '%';
    uv.innerText = data.current.uv;
    cloud.innerText = data.current.cloud + '%';

    if (unitsSI) {
      temp.innerText = data.current.temp_c + '°C';
      feelsLike.innerText = data.current.feelslike_c + '°C';
      pressure.innerText = data.current.pressure_mb + ' mbar';
      vis.innerText = data.current.vis_km + ' km';
      wind.innerText = data.current.wind_kph + ' km/h';
    } else {
      temp.innerText = data.current.temp_f + '°F';
      feelsLike.innerText = data.current.feelslike_f + '°F';
      pressure.innerText = data.current.pressure_in + ' inHg';
      vis.innerText = data.current.vis_miles + ' mi';
      wind.innerText = data.current.wind_mph + ' mph';
    }

    // current.appendChild(heading);
    current.appendChild(lastUpdated);
    current.appendChild(condition);
    current.appendChild(temp);
    current.appendChild(feelsLike);
    current.appendChild(cloud);
    current.appendChild(humidity);
    current.appendChild(wind);
    current.appendChild(pressure);
    current.appendChild(vis);
    current.appendChild(uv);

  };

  const updateThreeDay = () => {

    // const heading = document.createElement('h1');
    // heading.innerText = '3-Day Forecast';
    // threeDay.appendChild(heading);

    for (let i = 0; i < 3; i++) {
      const subHeading = document.createElement('h2');
      const condition = document.createElement('p');
      const minTemp = document.createElement('p');
      const maxTemp = document.createElement('p');
      const dailyChanceRain = document.createElement('p');
      const dailyChanceSnow = document.createElement('p');
      const totalPrecip = document.createElement('p');
      const totalSnow = document.createElement('p');
      const dayDiv = document.createElement('div');

      subHeading.innerText = 'Day ' + String(i);
      condition.innerText = data.forecast[i].day.condition;
      dailyChanceRain.innerText = data.forecast[i].day.daily_chance_of_rain + '%';
      dailyChanceSnow.innerText = data.forecast[i].day.daily_chance_of_snow + '%';

      if (unitsSI) {
        minTemp.innerText = data.forecast[i].day.mintemp_c + '°C';
        maxTemp.innerText = data.forecast[i].day.maxtemp_c + '°C';
        totalPrecip.innerText = data.forecast[i].day.totalprecip_mm + ' mm';
        totalSnow.innerText = data.forecast[i].day.totalsnow_cm + ' cm';
      } else {
        minTemp.innerText = data.forecast[i].day.mintemp_f + '°F';
        maxTemp.innerText = data.forecast[i].day.maxtemp_f + '°F';
        totalPrecip.innerText = data.forecast[i].day.totalprecip_in + ' in';
        totalSnow.innerText = data.forecast[i].day.totalsnow_in + ' in';
      }

      dayDiv.appendChild(subHeading);
      dayDiv.appendChild(condition);
      dayDiv.appendChild(minTemp);
      dayDiv.appendChild(maxTemp);
      dayDiv.appendChild(dailyChanceRain);
      dayDiv.appendChild(dailyChanceSnow);
      dayDiv.appendChild(totalPrecip);
      dayDiv.appendChild(totalSnow);

      threeDay.appendChild(dayDiv);
    }


  };

  const updateHourly = () => {
    const chartTemp = document.createElement('canvas');

    if (unitsSI) {
      tempXText = 'Temperature (°C)';
      tempData = data.forecast[0].hour.temp_c;
    } else {
      tempLabel = 'Temperature (°F)';
      tempData = data.forecast[0].hour.temp_f;
    }

    new Chart(chartTemp, {
      type: 'line',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        datasets: [{
          label: 'Day 1',
          data: tempData,
          borderWidth: 1,
        },
      ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hour',
            },
          },
          y: {
            // beginAtZero: true,
            title: {
              display: true,
              text: tempXText,
            },
          },
        },
      },
    });

    hourly.appendChild(chartTemp);
  };



  initialize();

}();


