import { useState } from 'react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
console.log("Loaded Key:", API_KEY);

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const Dates = new Date();

  const addCityToDB = async () => {
    if (!city.trim()) {
      alert("Please enter a city before adding.");
      return;
    }
    try {
      alert(forecast[0].main.temp)
      const res = await fetch('http://localhost:5000/api/weather/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: city.trim(),
          temperature: weather.main.temp,
          t1: forecast[0].main.temp,
          t2: forecast[1].main.temp,
          t3: forecast[2].main.temp,
          t4: forecast[3].main.temp,
          t5: forecast[4].main.temp,
          description: weather.weather[0].description,
          date: Dates,
        }),
        
      });
      const data = await res.json();
      alert("City has been added to the record");
    } catch (err) {
      console.error("Error adding city:", err);
      alert("Failed to add city.");
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/weather');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Error fetching records:", err);
      alert("Failed to fetch stored records.");
    }
  };

  const deleteCity = async (name) => {
    try {
      const res = await fetch(`http://localhost:5000/api/weather/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      alert(data.message);
      fetchRecords(); // Refresh list after deletion
    } catch (err) {
      console.error("Error deleting city:", err);
      alert("Failed to delete city.");
    }
  };

  const fetchWeather = async () => {
    if (!city.trim()) {
      alert("Please enter a city");
      return;
    }
    setLoading(true);
    try {
      console.log("Fetching current weather for:", city);

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`
      );

      const data = await res.json();
      console.log("Current:", data);

      if (data.cod !== 200) {
        alert(`Error: ${data.message}`);
        setLoading(false);
        return;
      }
      setWeather(data);

      console.log("Fetching 5-day forecast for:", city);
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      console.log("Forecasted:", forecastData);

      if (!forecastData.list) {
        alert("Failed to get forecast data.");
        setLoading(false);
        return;
      }

      // Show forecast snapshots every 24 hours (8 * 3-hour intervals)
      setForecast(forecastData.list.filter((_, i) => i % 8 === 0));
    } catch (err) {
      console.error("Error fetching weather:", err);
      alert("Something went wrong while fetching weather data.");
    } finally {
      setLoading(false);
    }
  };

  const getLocationWeather = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("User location:", latitude, longitude);

        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );

          const data = await res.json();
          console.log("Weather by location:", data);

          if (data.cod !== 200) {
            alert(`Error: ${data.message}`);
            setLoading(false);
            return;
          }

          setCity(data.name);
          setWeather(data);

          const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          const forecastData = await forecastRes.json();
          console.log("Forecasted:", forecastData);

          if (!forecastData.list) {
            alert("Failed to get forecast data.");
            setLoading(false);
            return;
          }
          setForecast(forecastData.list.filter((_, i) => i % 8 === 0));
        } catch (err) {
          console.error("Error fetching weather:", err);
          alert("Something went wrong while fetching weather data.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🌤️ Weather App</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchWeather();
        }}
      >
        <input
          type="text"
          placeholder="Enter city or ZIP"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={addCityToDB} disabled={loading || !city.trim()}>
          Add City to Records
        </button>
        <button onClick={fetchRecords} disabled={loading}>
          Show Records
        </button>
      </div>

      <button onClick={getLocationWeather} disabled={loading} style={{ marginTop: '1rem' }}>
        Use My Location
      </button>
      {records.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Stored Weather Records</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {/* List all the keys you want to show as columns */}
                <th>City</th>
                <th>Temperature (°C)</th>
                <th>Next Day</th>
                <th>Day 2</th>
                <th>Day 3</th>
                <th>Day 4</th>
                <th>Day 5</th>
                <th>Description</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.name}>
                  <td>{rec.name}</td>
                  <td>{rec.temperature}</td>
                  <td>{rec.t1}</td>
                  <td>{rec.t2}</td>
                  <td>{rec.t3}</td>
                  <td>{rec.t4}</td>
                  <td>{rec.t5}</td>
                  <td>{rec.description}</td>
                  <td>{rec.date}</td>
                  <td>
                    <button
                      onClick={() => deleteCity(rec.name)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {weather && (
        <div style={{ marginTop: '1rem' }}>
          <h2>{weather.name}</h2>
          <p>{weather.weather?.[0]?.description}</p>
          <p>{weather.main?.temp} °C</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather?.[0]?.icon}@2x.png`}
            alt="weather icon"
          />
        </div>
      )}

      {forecast.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>5-Day Forecast</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {forecast.map((item, index) => (
              <div key={index}>
                <p>{item.dt_txt.split(' ')[0]}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt="forecast"
                />
                <p>{item.main.temp} °C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
