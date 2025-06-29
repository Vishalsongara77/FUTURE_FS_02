import search_icon from "../src/assets/search.png";
import clear_icon from "../src/assets/clear.png";
import drizzle_icon from "../src/assets/drizzle.png";
import humidity_icon from "../src/assets/humidity.png";
import rain_icon from "../src/assets/rain.png";
import cloud_icon from "../src/assets/cloud.png";
import snow_icon from "../src/assets/snow.png";
import wind_icon from "../src/assets/wind.png";
import { useState } from "react";

const WeatherApp = () => {
  const [weatherCondition, setWeatherCondition] = useState("Clear");
  const [weatherDescription, setWeatherDescription] = useState("");
  const [city, setCity] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [weatherIcon, setWeatherIcon] = useState(clear_icon);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favoriteCities");
    return saved ? JSON.parse(saved) : [];
  });

  const iconMap = {
    "01d": clear_icon, "01n": clear_icon,
    "02d": cloud_icon, "02n": cloud_icon,
    "03d": cloud_icon, "03n": cloud_icon,
    "04d": drizzle_icon, "04n": drizzle_icon,
    "09d": rain_icon, "09n": rain_icon,
    "10d": rain_icon, "10n": rain_icon,
    "13d": snow_icon, "13n": snow_icon,
  };

  const addToFavorites = () => {
    if (!city.trim()) return;
    if (!favorites.includes(city)) {
      const updated = [...favorites, city];
      setFavorites(updated);
      localStorage.setItem("favoriteCities", JSON.stringify(updated));
    }
  };

  const removeFavorite = (cityName) => {
    const updated = favorites.filter((c) => c !== cityName);
    setFavorites(updated);
    localStorage.setItem("favoriteCities", JSON.stringify(updated));
  };

  const fetchForecast = async (cityName) => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod === "200") {
        const dailyForecast = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
        setForecastData(dailyForecast);
      } else {
        setForecastData([]);
      }
    } catch (error) {
      setForecastData([]);
    }
  };

  const search = async (cityName) => {
    if (!cityName.trim()) return;
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod === 200) {
        updateWeather(data);
        fetchForecast(cityName);
      } else {
        alert(`City not found: ${data.message}`);
      }
    } catch (error) {
      alert("Error fetching weather data.");
    }
  };

  const updateWeather = (data) => {
    setTemperature(Math.round(data.main.temp));
    setHumidity(data.main.humidity);
    setWindSpeed(data.wind.speed);
    setLocationName(data.name);
    setWeatherCondition(data.weather[0].main);
    setWeatherDescription(data.weather[0].description);
    const iconCode = data.weather?.[0]?.icon;
    setWeatherIcon(iconMap[iconCode] || clear_icon);
  };

  const getBackgroundStyle = () => {
    switch (weatherCondition) {
      case "Clear":
        return { background: "linear-gradient(to top, #f9d423, #ff4e50)" };
      case "Clouds":
        return { background: "linear-gradient(to top, #232526, #304352)" };
      case "Rain":
        return { background: "linear-gradient(to top, #3a7bd5, #3a6073)" };
      case "Snow":
        return { background: "linear-gradient(to top, #e6f0ff, #ffffff)" };
      case "Thunderstorm":
        return { background: "linear-gradient(to top, #232526, #414345)" };
      case "Drizzle":
        return { background: "linear-gradient(to top, #89f7fe, #66a6ff)" };
      case "Haze":
      case "Mist":
      case "Fog":
        return { background: "linear-gradient(to top, #abbaab, #ffffff)" };
      default:
        return { background: "linear-gradient(to top, #dde1e7, #ffffff)" };
    }
  };

  return (
    <div className="app" style={getBackgroundStyle()}>
      <div className="weather-container">
        <div className="search-box">
          <img
            src={search_icon}
            alt="search"
            onClick={() => search(city)}
            style={{ cursor: "pointer" }}
          />
          <input
            type="text"
            placeholder="Search"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") search(city);
            }}
          />
        </div>

        <div className="locfav">
          <button className="current-favorite" onClick={addToFavorites}>
            ❤️ Add to Favorites
          </button>
        </div>

        <img src={weatherIcon} alt="weather icon" className="weather-icon" />
        <p className="weather-type">{weatherDescription}</p>
        <p className="temperature">
          {temperature !== null ? `${temperature}°C` : "--"}
        </p>
        <p className="location">{locationName}</p>

        <div className="weather-data">
          <div className="col">
            <img src={humidity_icon} alt="humidity" />
            <div>
              <p>{humidity !== null ? `${humidity}%` : "--"}</p>
              <span>Humidity</span>
            </div>
          </div>
          <div className="col">
            <img src={wind_icon} alt="wind" />
            <div>
              <p>{windSpeed !== null ? `${windSpeed} km/h` : "--"}</p>
              <span>Wind Speed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="favorites-container">
        <h3>⭐ Favorite Cities</h3>
        <ul>
          {favorites.map((fav, idx) => (
            <li key={idx}>
              <span onClick={() => search(fav)}>{fav}</span>
              <button onClick={() => removeFavorite(fav)}>❌</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeatherApp;
