import { useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function App() {

  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);

  /* ---------------- WEATHER FETCH ---------------- */

  const fetchWeather = async () => {

    if (!city.trim()) return;

    setLoading(true);

    try {

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );

      const data = await res.json();

      if (data.cod !== 200) {
        alert(data.message);
        setLoading(false);
        return;
      }

      setWeather(data);

      fetchYouTubeVideos(data.name + " weather");

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );

      const forecastData = await forecastRes.json();

      setForecast(forecastData.list.filter((_, i) => i % 8 === 0));

    } catch (err) {
      console.log(err);
    }

    setLoading(false);

  };

  /* ---------------- LOCATION WEATHER ---------------- */

  const getLocationWeather = () => {

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {

      const { latitude, longitude } = pos.coords;

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const data = await res.json();

      setCity(data.name);
      setWeather(data);

      fetchYouTubeVideos(data.name + " weather");

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const forecastData = await forecastRes.json();

      setForecast(forecastData.list.filter((_, i) => i % 8 === 0));

    });

  };

  /* ---------------- YOUTUBE ---------------- */

  const fetchYouTubeVideos = async (searchTerm) => {

    const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&type=video&key=${YOUTUBE_API_KEY}&maxResults=3`
    );

    const data = await res.json();

    setVideos(data.items || []);

  };

  /* ---------------- DATABASE ---------------- */

  const addCityToDB = async () => {

    const res = await fetch(
      "https://weather-app-backend-ruddy.vercel.app/api/weather/add",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: city,
          temperature: weather.main.temp,
          t1: forecast[0].main.temp,
          t2: forecast[1].main.temp,
          t3: forecast[2].main.temp,
          t4: forecast[3].main.temp,
          t5: forecast[4].main.temp,
          description: weather.weather[0].description,
          date: date
        })
      }
    );

    await res.json();
    alert("City added");

  };

  const fetchRecords = async () => {

    const res = await fetch(
      "https://weather-app-backend-ruddy.vercel.app/api/weather"
    );

    const data = await res.json();

    setRecords(data);

  };

  const deleteCity = async (name) => {

    const res = await fetch(
      `https://weather-app-backend-ruddy.vercel.app/api/weather/${name}`,
      { method: "DELETE" }
    );

    await res.json();

    fetchRecords();

  };

  const exportToCSV = async () => {

    const res = await fetch(
      "https://weather-app-backend-ruddy.vercel.app/api/weather/export/csv"
    );

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "weather_data.csv";

    link.click();

  };

  return (

    <div className="page">

      <div className="dashboard">

        <h1>🌤 Weather Dashboard</h1>

        {/* SEARCH */}

        <div className="search">

          <input
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button onClick={fetchWeather}>
            {loading ? "Loading..." : "Search"}
          </button>

          <button onClick={getLocationWeather}>
            Use My Location
          </button>

        </div>

        {/* ACTIONS */}

        <div className="actions">

          <button onClick={addCityToDB}>Add City</button>
          <button onClick={fetchRecords}>Show Records</button>
          <button onClick={exportToCSV}>Export CSV</button>

        </div>

        {/* WEATHER */}

        {weather && (

          <div className="weatherCard">

            <h2>{weather.name}</h2>

            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            />

            <h3>{weather.main.temp} °C</h3>

            <p>{weather.weather[0].description}</p>

          </div>

        )}

        {/* FORECAST */}

        {forecast.length > 0 && (

          <div className="forecast">

            {forecast.map((item, i) => (

              <div key={i} className="forecastCard">

                <p>{item.dt_txt.split(" ")[0]}</p>

                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                />

                <p>{item.main.temp}°C</p>

              </div>

            ))}

          </div>

        )}

        {/* MAP */}

        {city && (

          <iframe
            src={`https://www.google.com/maps?q=${city}&output=embed`}
          />

        )}

        {/* VIDEOS */}

        {videos.length > 0 && (

          <div className="videos">

            {videos.map((video) => (

              <iframe
                key={video.id.videoId}
                src={`https://www.youtube.com/embed/${video.id.videoId}`}
              />

            ))}

          </div>

        )}

        {/* RECORDS */}

        {records.length > 0 && (

          <table>

            <thead>

              <tr>

                <th>City</th>
                <th>Temp</th>
                <th>Day1</th>
                <th>Day2</th>
                <th>Day3</th>
                <th>Day4</th>
                <th>Day5</th>
                <th>Description</th>
                <th>Date</th>
                <th>Delete</th>

              </tr>

            </thead>

            <tbody>

              {records.map((r) => (

                <tr key={r.name}>

                  <td>{r.name}</td>
                  <td>{r.temperature}</td>
                  <td>{r.t1}</td>
                  <td>{r.t2}</td>
                  <td>{r.t3}</td>
                  <td>{r.t4}</td>
                  <td>{r.t5}</td>
                  <td>{r.description}</td>
                  <td>{r.date}</td>

                  <td>
                    <button onClick={() => deleteCity(r.name)}>
                      Delete
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );
}

export default App;