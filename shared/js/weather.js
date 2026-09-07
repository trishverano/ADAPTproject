// =========================================================
// PATH COASTAL WEATHER SYSTEM
// Primary: Open-Meteo Best Match
// Fallback: Open-Meteo GFS Global
// =========================================================

(function installOpenMeteoFallback() {

  if (window.__PATH_OPEN_METEO_FALLBACK_INSTALLED__) {
    return;
  }

  window.__PATH_OPEN_METEO_FALLBACK_INSTALLED__ = true;

  const nativeFetch = window.fetch.bind(window);


  function isOpenMeteoForecast(url) {

    return (
      typeof url === "string" &&
      url.startsWith(
        "https://api.open-meteo.com/v1/forecast"
      )
    );
  }


  function toGfsUrl(url) {

    return url.replace(
      "https://api.open-meteo.com/v1/forecast",
      "https://api.open-meteo.com/v1/gfs"
    );
  }


  async function fetchAttempt(
    url,
    init,
    timeoutMs
  ) {

    const controller =
      new AbortController();


    const timer =
      setTimeout(
        function () {

          controller.abort();

        },
        timeoutMs
      );


    try {

      const options = {

        ...(init || {}),

        signal:
          controller.signal,

        cache:
          "no-store"

      };


      return await window
        .__nativePathFetch(
          url,
          options
        );


    } finally {

      clearTimeout(
        timer
      );
    }
  }


  window.__nativePathFetch =
    nativeFetch;


  window.fetch =
    async function (
      input,
      init
    ) {

      const url =
        typeof input === "string"
          ? input
          : input?.url;


      if (
        !isOpenMeteoForecast(
          url
        )
      ) {

        return nativeFetch(
          input,
          init
        );
      }


      let primaryResponse =
        null;


      let primaryError =
        null;


      // =====================================================
      // TRY NORMAL OPEN-METEO FORECAST
      // =====================================================

      try {

        primaryResponse =
          await fetchAttempt(
            url,
            init,
            5000
          );


        if (
          primaryResponse.ok
        ) {

          return primaryResponse;
        }


        primaryError =
          new Error(
            `Open-Meteo Best Match HTTP ${primaryResponse.status}`
          );


      } catch (error) {

        primaryError =
          error;
      }


      console.warn(

        "Open-Meteo Best Match unavailable. Trying GFS fallback...",

        primaryError

      );


      // =====================================================
      // FALLBACK TO GLOBAL GFS
      // =====================================================

      const gfsUrl =
        toGfsUrl(
          url
        );


      try {

        const gfsResponse =
          await fetchAttempt(
            gfsUrl,
            init,
            7000
          );


        if (
          gfsResponse.ok
        ) {

          console.info(
            "Weather loaded from Open-Meteo GFS fallback."
          );


          return gfsResponse;
        }


        console.warn(
          `Open-Meteo GFS fallback HTTP ${gfsResponse.status}`
        );


        return gfsResponse;


      } catch (gfsError) {

        console.error(

          "Both Open-Meteo Best Match and GFS fallback failed.",

          gfsError

        );


        if (
          primaryResponse
        ) {

          return primaryResponse;
        }


        throw gfsError;
      }

    };

})();


// =========================================================
// CURRENT WEATHER SIDEBAR
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const CONFIG =
      window.CONFIG || {};


    const weatherBox =
      document.getElementById(
        "weatherBox"
      );


    if (!weatherBox) {
      return;
    }


    // =======================================================
    // LOCATION
    // =======================================================

    const municipality =
      CONFIG.municipality ||
      "Municipality";


    const province =
      CONFIG.province ||
      "";


    const latitude =
      Number(
        CONFIG.weather?.lat ??
        CONFIG.weatherLat
      );


    const longitude =
      Number(
        CONFIG.weather?.lon ??
        CONFIG.weatherLon
      );


    const locationLabel =
      CONFIG.weather?.label ||
      (
        province
          ? `${municipality}, ${province}`
          : municipality
      );


    // =======================================================
    // WEATHER DEFINITIONS
    // =======================================================

    window.WEATHER_OVERLAYS = {


      temperature: {

        label:
          "Temperature",

        subtitle:
          "2 m above ground",

        unit:
          "°C",

        classes: [

          {
            min: -Infinity,
            max: 24,
            label: "<24°C",
            color: "#4169E1"
          },

          {
            min: 24,
            max: 27,
            label: "24–27°C",
            color: "#2FB7D3"
          },

          {
            min: 27,
            max: 30,
            label: "27–30°C",
            color: "#65C96B"
          },

          {
            min: 30,
            max: 33,
            label: "30–33°C",
            color: "#F4E04D"
          },

          {
            min: 33,
            max: 36,
            label: "33–36°C",
            color: "#F39C34"
          },

          {
            min: 36,
            max: Infinity,
            label: ">36°C",
            color: "#D73027"
          }

        ]

      },


      humidity: {

        label:
          "Relative Humidity",

        subtitle:
          "2 m above ground",

        unit:
          "%",

        classes: [

          {
            min: -Infinity,
            max: 30,
            label: "<30%",
            color: "#F2D16B"
          },

          {
            min: 30,
            max: 45,
            label: "30–45%",
            color: "#C8E56B"
          },

          {
            min: 45,
            max: 60,
            label: "45–60%",
            color: "#70D6A5"
          },

          {
            min: 60,
            max: 75,
            label: "60–75%",
            color: "#4DB9D6"
          },

          {
            min: 75,
            max: 85,
            label: "75–85%",
            color: "#5478D1"
          },

          {
            min: 85,
            max: Infinity,
            label: ">85%",
            color: "#6536A5"
          }

        ]

      },


      heatIndex: {

        label:
          "Heat Index",

        subtitle:
          "Calculated from temperature and relative humidity",

        unit:
          "°C",

        classes: [

          {
            min: -Infinity,
            max: 27,
            label: "Normal",
            rangeLabel: "<27°C",
            color: "#4CAF50"
          },

          {
            min: 27,
            max: 33,
            label: "Caution",
            rangeLabel: "27–32°C",
            color: "#F9A825"
          },

          {
            min: 33,
            max: 42,
            label: "Extreme Caution",
            rangeLabel: "33–41°C",
            color: "#EF6C00"
          },

          {
            min: 42,
            max: 52,
            label: "Danger",
            rangeLabel: "42–51°C",
            color: "#D32F2F"
          },

          {
            min: 52,
            max: Infinity,
            label: "Extreme Danger",
            rangeLabel: "≥52°C",
            color: "#7F0000"
          }

        ]

      },


      precipitation: {

        label:
          "Precipitation",

        subtitle:
          "Surface precipitation",

        unit:
          "mm",

        classes: [

          {
            min: -Infinity,
            max: 0.1,
            label: "0",
            color: "#E8F5FF"
          },

          {
            min: 0.1,
            max: 0.5,
            label: "0.1–0.5",
            color: "#B7E4F9"
          },

          {
            min: 0.5,
            max: 2,
            label: "0.5–2",
            color: "#63C5DA"
          },

          {
            min: 2,
            max: 5,
            label: "2–5",
            color: "#3182BD"
          },

          {
            min: 5,
            max: 10,
            label: "5–10",
            color: "#6554C0"
          },

          {
            min: 10,
            max: Infinity,
            label: ">10 mm",
            color: "#7A0177"
          }

        ]

      },


      wind: {

        label:
          "Wind Speed",

        subtitle:
          "10 m above ground",

        unit:
          "km/h",

        classes: [

          {
            min: -Infinity,
            max: 5,
            label: "<5",
            color: "#D7F4E3"
          },

          {
            min: 5,
            max: 15,
            label: "5–15",
            color: "#8DD3C7"
          },

          {
            min: 15,
            max: 25,
            label: "15–25",
            color: "#80B1D3"
          },

          {
            min: 25,
            max: 40,
            label: "25–40",
            color: "#BEBADA"
          },

          {
            min: 40,
            max: 60,
            label: "40–60",
            color: "#FB8072"
          },

          {
            min: 60,
            max: Infinity,
            label: ">60 km/h",
            color: "#B2182B"
          }

        ]

      }

    };


    // =======================================================
    // HEAT INDEX
    // =======================================================

    function calculateHeatIndex(
      tempC,
      humidity
    ) {

      const tempF =
        (
          tempC *
          9 /
          5
        )
        +
        32;


      let hiF =
        0.5 *
        (
          tempF +
          61 +
          (
            (
              tempF -
              68
            )
            *
            1.2
          )
          +
          (
            humidity *
            0.094
          )
        );


      hiF =
        (
          hiF +
          tempF
        )
        /
        2;


      if (
        hiF >=
        80
      ) {

        hiF =
          -42.379

          +
          (
            2.04901523 *
            tempF
          )

          +
          (
            10.14333127 *
            humidity
          )

          -
          (
            0.22475541 *
            tempF *
            humidity
          )

          -
          (
            0.00683783 *
            tempF *
            tempF
          )

          -
          (
            0.05481717 *
            humidity *
            humidity
          )

          +
          (
            0.00122874 *
            tempF *
            tempF *
            humidity
          )

          +
          (
            0.00085282 *
            tempF *
            humidity *
            humidity
          )

          -
          (
            0.00000199 *
            tempF *
            tempF *
            humidity *
            humidity
          );

      }


      return (

        (
          hiF -
          32
        )

        *

        5 /
        9

      );

    }


    function getHeatCategory(
      value
    ) {

      if (
        value <
        27
      ) {

        return {

          label:
            "Normal",

          color:
            "#4CAF50"

        };

      }


      if (
        value <
        33
      ) {

        return {

          label:
            "Caution",

          color:
            "#F9A825"

        };

      }


      if (
        value <
        42
      ) {

        return {

          label:
            "Extreme Caution",

          color:
            "#EF6C00"

        };

      }


      if (
        value <
        52
      ) {

        return {

          label:
            "Danger",

          color:
            "#D32F2F"

        };

      }


      return {

        label:
          "Extreme Danger",

        color:
          "#7F0000"

      };

    }


    function getWindDirection(
      degrees
    ) {

      if (
        !Number.isFinite(
          degrees
        )
      ) {

        return "";

      }


      const directions =
        [

          "N",
          "NE",
          "E",
          "SE",
          "S",
          "SW",
          "W",
          "NW"

        ];


      return directions[

        Math.round(
          degrees /
          45
        )
        %
        8

      ];

    }


    function formatNumber(
      value,
      decimals = 1
    ) {

      const number =
        Number(
          value
        );


      return Number.isFinite(
        number
      )
        ? number.toFixed(
            decimals
          )
        : "—";

    }


    function info(
      message
    ) {

      return `

        <span
          title="${message}"
          style="
            cursor:help;
            font-size:13px;
          "
        >
          ⓘ
        </span>

      `;

    }


    // =======================================================
    // CACHE
    // =======================================================

    const cacheKey =
      "path_weather_"

      +

      municipality
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "_"
        );


    function saveCache(
      current
    ) {

      try {

        localStorage.setItem(

          cacheKey,

          JSON.stringify({

            savedAt:
              Date.now(),

            current:
              current

          })

        );


      } catch (
        error
      ) {

        console.warn(
          "Current weather cache could not be saved."
        );

      }

    }


    function readCache() {

      try {

        const raw =
          localStorage.getItem(
            cacheKey
          );


        if (!raw) {

          return null;

        }


        const cached =
          JSON.parse(
            raw
          );


        if (
          !cached
            ?.current
          ||
          !cached.savedAt
        ) {

          return null;

        }


        const maxAge =
          6
          *
          60
          *
          60
          *
          1000;


        if (
          (
            Date.now()
            -
            cached.savedAt
          )
          >
          maxAge
        ) {

          return null;

        }


        return cached;


      } catch (
        error
      ) {

        return null;

      }

    }


    // =======================================================
    // DISPLAY WEATHER
    // =======================================================

    function displayWeather(
      current,
      cached = false
    ) {

      const temperature =
        Number(
          current
            .temperature_2m
        );


      const humidity =
        Number(
          current
            .relative_humidity_2m
        );


      const precipitation =
        Number(
          current
            .precipitation
        );


      const windSpeed =
        Number(
          current
            .wind_speed_10m
        );


      const windDirection =
        Number(
          current
            .wind_direction_10m
        );


      const windGust =
        Number(
          current
            .wind_gusts_10m
        );


      const heatIndex =
        (
          Number.isFinite(
            temperature
          )
          &&
          Number.isFinite(
            humidity
          )
        )
          ? calculateHeatIndex(

              temperature,
              humidity

            )
          : NaN;


      const heatCategory =
        Number.isFinite(
          heatIndex
        )
          ? getHeatCategory(
              heatIndex
            )
          : null;


      const windCardinal =
        getWindDirection(
          windDirection
        );


      weatherBox.innerHTML = `

        <div
          style="
            font-weight:700;
            margin-bottom:10px;
          "
        >
          ${locationLabel}
        </div>


        <div class="weather-info-row">

          <span>

            Temperature

            ${info(
              "Air temperature approximately 2 metres above ground."
            )}

          </span>

          <strong>
            ${formatNumber(
              temperature
            )} °C
          </strong>

        </div>


        <div class="weather-info-row">

          <span>

            Relative Humidity

            ${info(
              "Relative humidity approximately 2 metres above ground."
            )}

          </span>

          <strong>
            ${formatNumber(
              humidity,
              0
            )} %
          </strong>

        </div>


        <div class="weather-info-row">

          <div>

            <span>

              Heat Index

              ${info(
                "Calculated from temperature and relative humidity."
              )}

            </span>


            ${
              heatCategory
                ? `

                  <div
                    style="
                      color:${heatCategory.color};
                      font-size:12px;
                      font-weight:700;
                      margin-top:3px;
                    "
                  >
                    ${heatCategory.label}
                  </div>

                `
                : ""
            }

          </div>


          <strong>

            ${formatNumber(
              heatIndex
            )} °C

          </strong>

        </div>


        <div class="weather-info-row">

          <span>

            Precipitation

            ${info(
              "Current model-derived surface precipitation."
            )}

          </span>

          <strong>

            ${formatNumber(
              precipitation
            )} mm

          </strong>

        </div>


        <div class="weather-info-row">

          <span>

            Wind

            ${info(
              "Wind approximately 10 metres above ground."
            )}

          </span>

          <strong>

            ${formatNumber(
              windSpeed
            )} km/h

            ${windCardinal}

            ${
              Number.isFinite(
                windDirection
              )
                ? `(${Math.round(
                    windDirection
                  )}°)`
                : ""
            }

          </strong>

        </div>


        <div class="weather-info-row">

          <span>

            Wind Gust

            ${info(
              "Model-derived short-duration maximum wind speed."
            )}

          </span>

          <strong>

            ${formatNumber(
              windGust
            )} km/h

          </strong>

        </div>


        <div
          style="
            margin-top:10px;
            font-size:11px;
            line-height:1.45;
            color:#6b7280;
          "
        >

          ${
            cached
              ? `

                <strong>
                  Last available weather data
                </strong>

                <br>

              `
              : `

                Model-derived weather data

                <br>

              `
          }

          Source: Open-Meteo

          <br>

          Updated:

          ${
            current.time
              ? new Date(
                  current.time
                )
                  .toLocaleString()
              : new Date()
                  .toLocaleString()
          }

        </div>

      `;


      window.CURRENT_WEATHER = {

        municipality:
          municipality,

        province:
          province,

        latitude:
          latitude,

        longitude:
          longitude,

        temperature:
          temperature,

        humidity:
          humidity,

        heatIndex:
          heatIndex,

        precipitation:
          precipitation,

        windSpeed:
          windSpeed,

        windDirection:
          windDirection,

        windGust:
          windGust,

        time:
          current.time ||
          null,

        cached:
          cached

      };


      window.dispatchEvent(

        new CustomEvent(

          "weatherupdate",

          {

            detail:
              window.CURRENT_WEATHER

          }

        )

      );

    }


    // =======================================================
    // COORDINATE CHECK
    // =======================================================

    if (
      !Number.isFinite(
        latitude
      )
      ||
      !Number.isFinite(
        longitude
      )
    ) {

      weatherBox.innerHTML = `

        <strong>
          ${locationLabel}
        </strong>

        <div
          style="
            margin-top:12px;
          "
        >

          Weather coordinates are not configured.

        </div>

      `;


      return;

    }


    // =======================================================
    // SHOW CACHED WEATHER FIRST
    // =======================================================

    const cached =
      readCache();


    if (
      cached
    ) {

      displayWeather(

        cached.current,

        true

      );

    }


    // =======================================================
    // LIVE WEATHER REQUEST
    // =======================================================

    const variables =
      [

        "temperature_2m",

        "relative_humidity_2m",

        "precipitation",

        "wind_speed_10m",

        "wind_direction_10m",

        "wind_gusts_10m"

      ]
        .join(
          ","
        );


    const url =
      "https://api.open-meteo.com/v1/forecast"

      +

      `?latitude=${latitude}`

      +

      `&longitude=${longitude}`

      +

      `&current=${variables}`

      +

      "&timezone=auto";


    async function loadCurrentWeather() {

      const response =
        await fetch(
          url
        );


      if (
        !response.ok
      ) {

        throw new Error(

          `Weather HTTP ${response.status}`

        );

      }


      const data =
        await response.json();


      if (
        !data
          ?.current
      ) {

        throw new Error(
          "No current weather data returned."
        );

      }


      return data.current;

    }


    async function refreshWeather() {

      try {

        const current =
          await loadCurrentWeather();


        saveCache(
          current
        );


        displayWeather(

          current,

          false

        );


      } catch (
        error
      ) {

        console.error(

          "Current weather unavailable:",

          error

        );


        /*
          If cached data is already
          being shown, leave it there.
        */

        if (
          cached
        ) {

          return;

        }


        weatherBox.innerHTML = `

          <strong>

            ${locationLabel}

          </strong>


          <div
            style="
              margin-top:12px;
              line-height:1.5;
            "
          >

            Weather service is temporarily unavailable.

          </div>


          <button
            id="retryWeatherBtn"
            type="button"
            class="action-btn"
            style="
              margin-top:12px;
              width:100%;
            "
          >

            Retry Weather

          </button>

        `;


        document
          .getElementById(
            "retryWeatherBtn"
          )
          ?.addEventListener(

            "click",

            refreshWeather

          );

      }

    }


    await refreshWeather();

  }
);