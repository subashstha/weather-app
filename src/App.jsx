import { useEffect, useState } from "react";
import { BsCloudRainHeavy } from "react-icons/bs";
import { IoIosCloudOutline } from "react-icons/io";
import { LuWind } from "react-icons/lu";
import { CiSearch } from "react-icons/ci";
import Bg from "./assets/bg.jpg";
import "./App.css";

function App() {
  const [input, setInput] = useState("Kathmandu");
  const [searchText, setSearchText] = useState("kathmandu");
  const [data, setData] = useState(null);
  const [localTime, setLocalTime] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchText(input.trim());
  };

  const tempConverter = (temperature) => {
    return (temperature - 273.15).toFixed(2);
  };

  const timeConverter = (timezone) => {
    const nowUTC = Math.floor(Date.now() / 1000);
    const localTimestamp = nowUTC + timezone;
    const localDate = new Date(localTimestamp * 1000);

    let hours = localDate.getUTCHours();
    const minutes = localDate.getUTCMinutes().toString().padStart(2, "0");
    const seconds = localDate.getUTCSeconds().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;

    return `${hours}:${minutes}:${seconds} ${ampm}`;
  };

  const dateConverter = (dt, timezone) => {
    const localTimestamp = dt + timezone;
    const localDate = new Date(localTimestamp * 1000);

    const year = localDate.getUTCFullYear().toString();
    const day = localDate.getUTCDate().toString().padStart(2, "0");
    const shortMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = shortMonths[localDate.getUTCMonth()];

    return ` ${day} ${month} ${year}`;
  };

  useEffect(() => {
    if (!data?.timezone) return;

    const updateTime = () => {
      setLocalTime(timeConverter(data.timezone));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [data?.timezone]);

  useEffect(() => {
    if (!searchText) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${searchText}&appid=${
          import.meta.env.VITE_WEATHER_API_KEY
        }`;
        const res = await fetch(url);
        const json = await res.json();

        if (res.ok) {
          setData(json);
        } else {
          setError(json.message || "Error fetching data");
          setData(null);
        }
      } catch (err) {
        setError("Network error");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchText]);

  return (
    <div className="wrapper relative overflow-hidden min-h-screen font-primary">
      <div className="bg absolute -z-1 h-full w-full">
        <img
          src={Bg}
          alt="Background Image"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="inner relative p-3 md:p-6 text-white">
        <div className="w-full flex-grow-0">
          <form onSubmit={handleSubmit} className="w-full md:w-1/2 xl:w-1/4">
            <label
              htmlFor="search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-white text-xl z-1">
                <CiSearch />
              </div>
              <input
                type="search"
                id="search"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                className="block w-full p-4 ps-10 pe-20 text-sm focus:outline-0 rounded-xl shadow-sm bg-white/10 backdrop-blur-sm border border-white/30 text-white"
                placeholder="Search"
                required
              />
              <button
                type="submit"
                className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="text-center mt-10 md:mt-40 font-semibold text-3xl capitalize">
            Loading...
          </div>
        )}

        {error && (
          <div className="text-center mt-10 md:mt-40 font-semibold text-3xl capitalize">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="md:flex md:flex-wrap min-h-[calc(100vh_-_130px)] pt-8 md:pt-15">
              <div className="col md:flex md:flex-col mditems-start md:w-1/2">
                <div className="greeting flex-grow-1 mb-3 md:mb-0">
                  <h1 className="title text-5xl md:text-7xl lg:text-[120px] font-feb mb-3 leading-[1]">
                    {data.name}
                  </h1>
                  <p>
                    Weather : {data.weather?.[0]?.main ?? "N/A"} -{" "}
                    {data.weather?.[0]?.description ?? "N/A"}
                  </p>
                </div>
              </div>
              <div className="col flex flex-col md:items-end md:w-1/2 md:text-right min-h-[60vh]">
                <div className="temp flex-grow-1">
                  <h2 className="temp-number text-5xl md:text-7xl lg:text-[120px] font-feb mb-3 leading-[1]">
                    {tempConverter(data.main?.temp ?? 0)}°C
                  </h2>
                  <div className="city mb-1">
                    {localTime} - {dateConverter(data.dt, data.timezone)}
                  </div>
                </div>
                <div className="card bg-white text-black flex flex-wrap items-center rounded-full my-6 p-2 pe-6 md:my-0 md:absolute md:left-3 md:bottom-3  lg:left-6 lg:bottom-6 text-start">
                  <div className="icons bg-primary text-white flex items-center justify-center w-[60px] h-[60px] rounded-full text-3xl">
                    <LuWind />
                  </div>
                  <div className="card-content pl-3">
                    <div className="status text-sm">
                      Speed: {data.wind?.speed ?? "N/A"}
                    </div>
                    <div className="status-update font-medium">
                      Humidity: {data.main?.humidity ?? "N/A"}
                    </div>
                  </div>
                </div>
                <div className="week w-full  md:w-[320px] p-4 md:p-6 rounded-2xl shadow-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white">
                  <ul className="w-full">
                    <li className="flex flex-wrap w-full justify-between align-center pb-2 border-b-1 mb-2">
                      <span className="day font-medium text-md md:text-xl">
                        Clouds
                      </span>
                      <span className="day-temp">
                        {data.clouds?.all ?? "N/A"}
                      </span>
                      <span className="day-icon text-2xl">
                        <IoIosCloudOutline />
                      </span>
                    </li>
                    <li className="flex flex-wrap w-full justify-between align-center">
                      <span className="day font-medium text-md md:text-xl">
                        Rain
                      </span>
                      <span className="day-temp">
                        {data.rain?.["1h"] ?? "N/A"}
                      </span>
                      <span className="day-icon text-2xl">
                        <BsCloudRainHeavy />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && !data && (
          <div className="text-center mt-8 text-xl">Data not found</div>
        )}
      </div>
    </div>
  );
}

export default App;
