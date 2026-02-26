import { useState } from 'react';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]); // NEW: store forecast data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = '09ede6b65d854baebce112633262402';

  const getWeatherEmoji = (condition, isDay = true) => {
    const text = condition.toLowerCase();
    
    if (text.includes('sunny') || text.includes('clear')) return '☀️';
    if (text.includes('cloudy')) return '☁️';
    if (text.includes('rain') || text.includes('drizzle')) return '🌧️';
    if (text.includes('thunder') || text.includes('storm')) return '⛈️';
    if (text.includes('snow') || text.includes('blizzard')) return '❄️';
    if (text.includes('mist') || text.includes('fog')) return '🌫️';
    if (text.includes('wind')) return '💨';
    if (text.includes('night')) return '🌙';
    
    return '☀️';
  };

  // Format date to show day name
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const searchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Fetch both current weather AND forecast in one call
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=no&alerts=no`
      );
      
      if (!response.ok) {
        throw new Error('City not found');
      }
      
      const data = await response.json();
      
      // Set current weather
      setWeather({
        temp: Math.round(data.current.temp_c),
        feelsLike: Math.round(data.current.feelslike_c),
        condition: data.current.condition.text,
        humidity: data.current.humidity,
        wind: data.current.wind_kph,
        emoji: getWeatherEmoji(data.current.condition.text, data.current.is_day),
        cityName: data.location.name,
        country: data.location.country
      });
      
      // Set forecast data
      const forecastData = data.forecast.forecastday.map(day => ({
        date: day.date,
        dayName: getDayName(day.date),
        maxTemp: Math.round(day.day.maxtemp_c),
        minTemp: Math.round(day.day.mintemp_c),
        condition: day.day.condition.text,
        emoji: getWeatherEmoji(day.day.condition.text),
        chanceOfRain: day.day.daily_chance_of_rain
      }));
      
      setForecast(forecastData);
      
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchWeather();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-400 to-purple-500 p-4 
                    flex items-start justify-center">
      <div className="w-full max-w-3xl"> {/* Made wider for forecast */}
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 
                        border border-white/20">
          
          <h1 className="text-3xl font-bold text-center mb-2 
                         bg-linear-to-r from-blue-600 to-purple-600 
                         bg-clip-text text-transparent">
            🌤️ Weather App
          </h1>
          
          <p className="text-center text-gray-500 text-sm mb-6">
            Get real-time weather and 5-day forecast for any city
          </p>
          
          {/* Search Box */}
          <div className="flex gap-2 mb-4 max-w-md mx-auto">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter city name..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-blue-400 
                         focus:border-transparent transition-all
                         bg-white/80"
            />
            <button
              onClick={searchWeather}
              disabled={loading}
              className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 
                         text-white font-medium rounded-xl
                         hover:from-blue-600 hover:to-purple-600 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-lg
                         hover:shadow-xl active:scale-95"
            >
              {loading ? '...' : '🔍'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 
                            rounded-lg text-red-600 text-sm max-w-md mx-auto">
              ❌ {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin text-3xl mb-2">⏳</div>
              <p className="text-gray-500">Fetching weather data...</p>
            </div>
          )}

          {/* Weather Display */}
          {weather && !loading && (
            <div className="space-y-8">
              {/* Current Weather Section */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {weather.cityName}, {weather.country}
                </h2>
                
                <div className="text-8xl mb-2 animate-bounce-slow">
                  {weather.emoji}
                </div>
                <div className="text-5xl font-bold text-gray-800 mb-1">
                  {weather.temp}°C
                </div>
                <div className="text-xl text-gray-600 capitalize mb-2">
                  {weather.condition}
                </div>
                <div className="text-sm text-gray-500">
                  Feels like {weather.feelsLike}°C
                </div>

                {/* Current Weather Details */}
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mt-6">
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 
                                  p-4 rounded-xl text-center
                                  hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-1">💧</div>
                    <div className="text-xs text-gray-500 mb-1">HUMIDITY</div>
                    <div className="font-bold text-lg">{weather.humidity}%</div>
                  </div>
                  
                  <div className="bg-linear-to-br from-purple-50 to-purple-100 
                                  p-4 rounded-xl text-center
                                  hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-1">💨</div>
                    <div className="text-xs text-gray-500 mb-1">WIND</div>
                    <div className="font-bold text-lg">{weather.wind} km/h</div>
                  </div>
                </div>
              </div>

              {/* 5-Day Forecast Section */}
              {forecast.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    5-Day Forecast
                  </h3>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {forecast.map((day, index) => (
                      <div key={index} 
                           className="bg-gray-50 rounded-xl p-3 text-center
                                      hover:shadow-md transition-shadow
                                      border border-gray-100">
                        <div className="font-medium text-gray-700 mb-1">
                          {day.dayName}
                        </div>
                        <div className="text-3xl mb-1">
                          {day.emoji}
                        </div>
                        <div className="text-sm text-gray-600 capitalize truncate" 
                             title={day.condition}>
                          {day.condition}
                        </div>
                        <div className="mt-2">
                          <span className="font-bold text-gray-800">
                            {day.maxTemp}°
                          </span>
                          <span className="text-gray-400 text-sm ml-1">
                            /{day.minTemp}°
                          </span>
                        </div>
                        {day.chanceOfRain > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            🌧️ {day.chanceOfRain}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Welcome Message */}
          {!weather && !loading && !error && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <p>Search for a city to see the weather</p>
              <p className="text-sm mt-2">Try: London, Tokyo, New York...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-4">
          Powered by WeatherAPI.com
        </p>
      </div>

      {/* Custom animation */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;