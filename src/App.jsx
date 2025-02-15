import { useState } from "react";
import axios from "axios";
import WeatherCard from "./components/WeatherCard";
import Loader from "./components/Loader";
import "./styles/app.css";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [apiResponse, setApiResponse] = useState(null); // Stores full API response
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError("");
    setWeather(null);
    setApiResponse(null);

    try {
      // Step 1: Convert City Name to Coordinates
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&format=json`
      );


      if (!geoRes.data.results) {
        setError("City not found. Please enter a valid city name.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = geoRes.data.results[0];

      // Step 2: Fetch Weather Data using Coordinates
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
      );

      console.log("Weather API Response:", weatherRes.data);

      // Step 3: Extract the Current Temperature
      const timestamps = weatherRes.data.hourly.time;
      const temperatures = weatherRes.data.hourly.temperature_2m;
      const humidities = weatherRes.data.hourly.relative_humidity_2m;
      const windSpeeds = weatherRes.data.hourly.wind_speed_10m;

      // Get the closest available time to NOW
      const now = new Date();
      const nowISO = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
      let closestIndex = 0;
      let minDiff = Infinity;

      for (let i = 0; i < timestamps.length; i++) {
        const timeDiff = Math.abs(new Date(timestamps[i]) - now);
        if (timeDiff < minDiff) {
          minDiff = timeDiff;
          closestIndex = i;
        }
      }

      if (closestIndex === -1) {
        setError("Weather data unavailable for the current hour.");
        setLoading(false);
        return;
      }

      setWeather({
        city: city,
        temperature: temperatures[closestIndex], //  Latest temperature
        humidity: humidities[closestIndex], // Latest humidity
        windSpeed: windSpeeds[closestIndex], // Latest wind speed
      });

      // Store full API response for debugging
      setApiResponse({
        geocoding: geoRes.data,
        weather: weatherRes.data,
      });

    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Weather App 🌤</h1>
      <div>
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Get Weather</button>
      </div>

      <div>
        {loading && <Loader />}
        {error && <p className="error">{error}</p>}
        {weather && <WeatherCard weather={weather} />}
      </div>
    </div>
  );
};

export default App;