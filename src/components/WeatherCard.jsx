import React from "react";
import "../styles/app.css";

const WeatherCard = ({ weather }) => {
  return (
    <div className="weather-card">
      <h2>{weather.city}</h2>
      <p>🌡 Temperature: {weather.temperature}°C</p>
      <p>💧 Humidity: {weather.humidity}%</p>
      <p>🌬 Wind Speed: {weather.windSpeed} km/h</p>
    </div>
  );
};

export default WeatherCard;