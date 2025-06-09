import { useState } from 'react';
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
console.log("Loaded Key:", API_KEY);

function App() {
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [showText, setShowText] = useState(false);

  const handleClick = () => {
    setShowText(!showText); // toggle visibility
  };
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
          date: date,
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
      fetchYouTubeVideos(data.name+"weather");


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
  const fetchYouTubeVideos = async (searchTerm) => {
    const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          searchTerm
        )}&type=video&key=${YOUTUBE_API_KEY}&maxResults=3`
      );
      const data = await res.json();
      setVideos(data.items || []);
    } catch (err) {
      console.error("YouTube fetch error:", err);
    }
  };
  const exportToCSV = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/weather/export/csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = "weather_data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("Could not export CSV");
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
          fetchYouTubeVideos(data.name+"weather");
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
      <h1>🌤️ Weather App by <a href="https://www.linkedin.com/in/hardik-sondhi-867879324/">Hardik [Harry] </a> <a href="https://github.com/HardikVIT?tab=repositories">[GitHub]</a></h1>
      <h2>
        <div>
          <button onClick={handleClick}>pmaccelerator</button>

          {showText && (
            <div style={{ marginTop: '10px', color: 'white' }}>
              <p><i>PMAccelerator – Bridging Tech & Product Mastery
PMAccelerator is a cutting-edge platform focused on equipping aspiring and early-career product managers with the technical acumen, data-driven mindset, and tools of modern product development. Through real-world simulations, mentorship, and industry-aligned projects, PMAccelerator prepares professionals to excel in tech-first product environments.

Beyond tech, the platform fosters holistic growth by strengthening communication, leadership, and strategic thinking, helping PMs drive innovation and impact across cross-functional teams in any industry.</i>
              </p>
            </div>
          )}
        </div>
        <a href="https://www.linkedin.com/school/pmaccelerator/posts/?feedView=all">[LinkedIN]</a>
      </h2>
      

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
        <input
          type="Date"
          placeholder="Enter Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
        <button onClick={getLocationWeather} disabled={loading} style={{ marginTop: '1rem' }}>Use My Location</button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={addCityToDB} disabled={loading || !city.trim()}>
          Add City to Records
        </button>
        <button onClick={fetchRecords} disabled={loading}>
          Show Records
        </button>
        <button onClick={exportToCSV} disabled={loading} style={{ marginTop: '1rem' }}>📄 Export to CSV</button>
      </div>
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
      <br /><br />
      <h1>Maps</h1>
      {city && (
        <iframe
          title="Map"
          width="100%"
          height="300"
          frameBorder="0"
          style={{ marginTop: '1rem', border: 0 }}
          src={`https://www.google.com/maps?q=${encodeURIComponent(city)}&output=embed`}
          allowFullScreen
        ></iframe>
      )}

      <br /><br />
      <h1>Youtube</h1>
      {videos.length > 0 && (
        <div>
          <h3>YouTube Videos about Weather{city}</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {videos.map((video) => (
              <iframe
                key={video.id.videoId}
                width="300"
                height="200"
                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                title={video.snippet.title}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            ))}
          </div>
        </div>
      )}




    </div>
  );
}

export default App;
