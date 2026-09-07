document.addEventListener("DOMContentLoaded", function () {

  const CONFIG = window.CONFIG || {};

  const municipality =
    CONFIG.municipality ||
    "Municipality";

  const province =
    CONFIG.province ||
    "";

  const center =
    CONFIG.center ||
    [121.441, 13.143];

  const zoom =
    CONFIG.zoom ??
    10;

  const popup =
    document.getElementById(
      "popup"
    );

  const mapWrap =
    document.querySelector(
      ".map-wrap"
    );


  // =========================================================
  // HELPERS
  // =========================================================

  const normalizeValue =
    value =>
      String(
        value ?? ""
      )
        .toLowerCase()
        .trim();


  function escapeHTML(
    value
  ) {

    return String(
      value ?? ""
    )

      .replaceAll(
        "&",
        "&amp;"
      )

      .replaceAll(
        "<",
        "&lt;"
      )

      .replaceAll(
        ">",
        "&gt;"
      )

      .replaceAll(
        '"',
        "&quot;"
      )

      .replaceAll(
        "'",
        "&#039;"
      );
  }


  // =========================================================
  // CLEAN N/A VALUES
  // =========================================================

  function cleanDisplayValue(
    value
  ) {

    if (
      value === undefined ||
      value === null
    ) {

      return "";
    }


    const original =
      String(
        value
      ).trim();


    if (!original) {

      return "";
    }


    return original

      .split(
        /[;,|]+/
      )

      .map(
        part =>
          part

            .replace(
              /\bnot\s+applicable\b/gi,
              " "
            )

            .replace(
              /\bn\s*\/\s*a\b/gi,
              " "
            )

            .replace(
              /\bna\b/gi,
              " "
            )

            .replace(
              /\s+/g,
              " "
            )

            .trim()
      )

      .filter(
        Boolean
      )

      .join(
        "; "
      );

  }


  // =========================================================
  // COLOR HELPERS
  // =========================================================

  function hexToRgb(
    hex
  ) {

    let clean =
      String(
        hex ||
        "#808080"
      )
        .replace(
          "#",
          ""
        );


    if (
      clean.length ===
      3
    ) {

      clean =
        clean
          .split("")
          .map(
            c =>
              c +
              c
          )
          .join("");
    }


    const value =
      parseInt(
        clean,
        16
      );


    if (
      !Number.isFinite(
        value
      )
    ) {

      return {

        r: 128,
        g: 128,
        b: 128

      };
    }


    return {

      r:
        (
          value >>
          16
        ) &
        255,

      g:
        (
          value >>
          8
        ) &
        255,

      b:
        value &
        255

    };
  }


  function interpolateRgb(
    color1,
    color2,
    amount
  ) {

    const c1 =
      hexToRgb(
        color1
      );

    const c2 =
      hexToRgb(
        color2
      );


    const t =
      Math.max(
        0,
        Math.min(
          1,
          amount
        )
      );


    return {

      r:
        Math.round(
          c1.r +
          (
            c2.r -
            c1.r
          ) *
          t
        ),

      g:
        Math.round(
          c1.g +
          (
            c2.g -
            c1.g
          ) *
          t
        ),

      b:
        Math.round(
          c1.b +
          (
            c2.b -
            c1.b
          ) *
          t
        )

    };
  }


  function colorFromString(
    value
  ) {

    const palette = [

      "#3A86FF",
      "#FF6B6B",
      "#2EC4B6",
      "#8338EC",
      "#FF9F1C",
      "#55A630",
      "#E7298A",
      "#6C757D",
      "#118AB2",
      "#EF476F",
      "#06D6A0",
      "#F4A261"

    ];


    const text =
      String(
        value ??
        "Unknown"
      );


    let hash =
      0;


    for (
      let i = 0;
      i < text.length;
      i++
    ) {

      hash =
        (
          (
            hash <<
            5
          ) -
          hash
        )
        +
        text.charCodeAt(
          i
        );


      hash |=
        0;
    }


    return palette[
      Math.abs(
        hash
      )
      %
      palette.length
    ];
  }


  // =========================================================
  // HEAT INDEX
  // =========================================================

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


      if (
        humidity <
        13
        &&
        tempF >=
        80
        &&
        tempF <=
        112
      ) {

        hiF -=

          (
            (
              13 -
              humidity
            )
            /
            4
          )

          *

          Math.sqrt(

            (
              17 -
              Math.abs(
                tempF -
                95
              )
            )
            /
            17

          );
      }


      if (
        humidity >
        85
        &&
        tempF >=
        80
        &&
        tempF <=
        87
      ) {

        hiF +=

          (
            (
              humidity -
              85
            )
            /
            10
          )

          *

          (
            (
              87 -
              tempF
            )
            /
            5
          );
      }

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


  // =========================================================
  // WEATHER DEFINITIONS
  // =========================================================

  const DEFAULT_WEATHER_OVERLAYS = {


    temperature: {

      label:
        "Temperature",

      subtitle:
        "2 m above ground",

      unit:
        "°C",

      classes: [

        {
          min:
            -Infinity,
          max:
            24,
          label:
            "<24°C",
          color:
            "#4169E1"
        },

        {
          min:
            24,
          max:
            27,
          label:
            "24–27°C",
          color:
            "#2FB7D3"
        },

        {
          min:
            27,
          max:
            30,
          label:
            "27–30°C",
          color:
            "#65C96B"
        },

        {
          min:
            30,
          max:
            33,
          label:
            "30–33°C",
          color:
            "#F4E04D"
        },

        {
          min:
            33,
          max:
            36,
          label:
            "33–36°C",
          color:
            "#F39C34"
        },

        {
          min:
            36,
          max:
            Infinity,
          label:
            ">36°C",
          color:
            "#D73027"
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
          min:
            -Infinity,
          max:
            30,
          label:
            "<30%",
          color:
            "#F2D16B"
        },

        {
          min:
            30,
          max:
            45,
          label:
            "30–45%",
          color:
            "#C8E56B"
        },

        {
          min:
            45,
          max:
            60,
          label:
            "45–60%",
          color:
            "#70D6A5"
        },

        {
          min:
            60,
          max:
            75,
          label:
            "60–75%",
          color:
            "#4DB9D6"
        },

        {
          min:
            75,
          max:
            85,
          label:
            "75–85%",
          color:
            "#5478D1"
        },

        {
          min:
            85,
          max:
            Infinity,
          label:
            ">85%",
          color:
            "#6536A5"
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
          min:
            -Infinity,
          max:
            27,
          label:
            "Normal",
          rangeLabel:
            "<27°C",
          color:
            "#4CAF50"
        },

        {
          min:
            27,
          max:
            33,
          label:
            "Caution",
          rangeLabel:
            "27–32°C",
          color:
            "#F9A825"
        },

        {
          min:
            33,
          max:
            42,
          label:
            "Extreme Caution",
          rangeLabel:
            "33–41°C",
          color:
            "#EF6C00"
        },

        {
          min:
            42,
          max:
            52,
          label:
            "Danger",
          rangeLabel:
            "42–51°C",
          color:
            "#D32F2F"
        },

        {
          min:
            52,
          max:
            Infinity,
          label:
            "Extreme Danger",
          rangeLabel:
            "≥52°C",
          color:
            "#7F0000"
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
          min:
            -Infinity,
          max:
            0.1,
          label:
            "0",
          color:
            "#E8F5FF"
        },

        {
          min:
            0.1,
          max:
            0.5,
          label:
            "0.1–0.5",
          color:
            "#B7E4F9"
        },

        {
          min:
            0.5,
          max:
            2,
          label:
            "0.5–2",
          color:
            "#63C5DA"
        },

        {
          min:
            2,
          max:
            5,
          label:
            "2–5",
          color:
            "#3182BD"
        },

        {
          min:
            5,
          max:
            10,
          label:
            "5–10",
          color:
            "#6554C0"
        },

        {
          min:
            10,
          max:
            Infinity,
          label:
            ">10 mm",
          color:
            "#7A0177"
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
          min:
            -Infinity,
          max:
            5,
          label:
            "<5",
          color:
            "#D7F4E3"
        },

        {
          min:
            5,
          max:
            15,
          label:
            "5–15",
          color:
            "#8DD3C7"
        },

        {
          min:
            15,
          max:
            25,
          label:
            "15–25",
          color:
            "#80B1D3"
        },

        {
          min:
            25,
          max:
            40,
          label:
            "25–40",
          color:
            "#BEBADA"
        },

        {
          min:
            40,
          max:
            60,
          label:
            "40–60",
          color:
            "#FB8072"
        },

        {
          min:
            60,
          max:
            Infinity,
          label:
            ">60 km/h",
          color:
            "#B2182B"
        }

      ]

    }

  };


  if (
    !window.WEATHER_OVERLAYS
  ) {

    window.WEATHER_OVERLAYS =
      DEFAULT_WEATHER_OVERLAYS;

  }


  // =========================================================
  // GIS COLORS
  // =========================================================

  function getDisabilityColor(
    type
  ) {

    const value =
      normalizeValue(
        type
      );


    if (
      value.includes(
        "physical"
      )
    ) {
      return "#e41a1c";
    }


    if (
      value.includes(
        "visual"
      )
    ) {
      return "#377eb8";
    }


    if (
      value.includes(
        "hearing"
      )
      ||
      value.includes(
        "deaf"
      )
    ) {
      return "#4daf4a";
    }


    if (
      value.includes(
        "mental"
      )
      ||
      value.includes(
        "psychosocial"
      )
    ) {
      return "#984ea3";
    }


    if (
      value.includes(
        "intellectual"
      )
    ) {
      return "#ff7f00";
    }


    if (
      value.includes(
        "speech"
      )
    ) {
      return "#d4b000";
    }


    if (
      value.includes(
        "multiple"
      )
    ) {
      return "#a65628";
    }


    if (
      value.includes(
        "learning"
      )
    ) {
      return "#f781bf";
    }


    if (
      value.includes(
        "cancer"
      )
    ) {
      return "#17becf";
    }


    return "#808080";
  }


  function getVulnerabilityColor(
    type
  ) {

    const value =
      normalizeValue(
        type
      );


    if (
      value.includes(
        "pwd"
      )
    ) {
      return "#d73027";
    }


    if (
      value.includes(
        "senior"
      )
    ) {
      return "#4575b4";
    }


    if (
      value.includes(
        "child"
      )
    ) {
      return "#1a9850";
    }


    if (
      value.includes(
        "pregnant"
      )
    ) {
      return "#984ea3";
    }


    if (
      value.includes(
        "breastfeeding"
      )
    ) {
      return "#ff7f00";
    }


    if (
      value.includes(
        "malnourished"
      )
    ) {
      return "#a6761d";
    }


    if (
      value.includes(
        "solo"
      )
    ) {
      return "#e7298a";
    }


    if (
      value.includes(
        "female"
      )
    ) {
      return "#66a61e";
    }


    return "#808080";
  }


  function getMpaColor(
    type
  ) {

    const value =
      normalizeValue(
        type
      );


    if (
      value.includes(
        "no take"
      )
      ||
      value.includes(
        "no-take"
      )
      ||
      value.includes(
        "core"
      )
    ) {
      return "#d7191c";
    }


    if (
      value.includes(
        "buffer"
      )
    ) {
      return "#2b83ba";
    }


    if (
      value.includes(
        "seagrass"
      )
    ) {
      return "#1b9e77";
    }


    if (
      value.includes(
        "sustainable"
      )
    ) {
      return "#fdae61";
    }


    if (
      value.includes(
        "multiple"
      )
    ) {
      return "#1a9641";
    }


    return colorFromString(
      type
    );
  }


  function getMarineResourceColor(
    type
  ) {

    const value =
      normalizeValue(
        type
      );


    if (
      value.includes(
        "coral"
      )
    ) {
      return "#ff6b6b";
    }


    if (
      value.includes(
        "reef"
      )
    ) {
      return "#ff9f1c";
    }


    if (
      value.includes(
        "seagrass"
      )
    ) {
      return "#2ec4b6";
    }


    if (
      value.includes(
        "mangrove"
      )
    ) {
      return "#55a630";
    }


    if (
      value.includes(
        "fish"
      )
    ) {
      return "#3a86ff";
    }


    if (
      value.includes(
        "shell"
      )
    ) {
      return "#8338ec";
    }


    return colorFromString(
      type
    );
  }


  // =========================================================
  // BASEMAPS
  // =========================================================

  const osmLayer =
    new ol.layer.Tile({

      source:
        new ol.source.OSM(),

      visible:
        true

    });


  const topoLayer =
    new ol.layer.Tile({

      source:
        new ol.source.XYZ({

          url:
            "https://tile.opentopomap.org/{z}/{x}/{y}.png",

          maxZoom:
            17,

          crossOrigin:
            "anonymous",

          attributions:
            "© OpenTopoMap contributors"

        }),

      visible:
        false

    });


  const satelliteLayer =
    new ol.layer.Tile({

      source:
        new ol.source.XYZ({

          url:
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

          maxZoom:
            19,

          crossOrigin:
            "anonymous",

          attributions:
            "Tiles © Esri"

        }),

      visible:
        false

    });


  // =========================================================
  // WEATHER MAP VARIABLES
  // =========================================================

  let activeWeatherType =
    "off";

  let weatherGrid =
    null;

  let weatherExtentKey =
    "";

  let weatherRefreshTimer =
    null;

  let weatherRequestSerial =
    0;


  const weatherRasterLayer =
    new ol.layer.Image({

      visible:
        false,

      opacity:
        0.62,

      zIndex:
        20

    });


  const windArrowSource =
    new ol.source.Vector();


  const windArrowLayer =
    new ol.layer.Vector({

      source:
        windArrowSource,

      visible:
        false,

      zIndex:
        30,

      style:
        function (
          feature
        ) {

          const direction =
            Number(
              feature.get(
                "windDirection"
              )
            );


          const speed =
            Number(
              feature.get(
                "windSpeed"
              )
            );


          const movementDirection =
            Number.isFinite(
              direction
            )
              ? (
                  direction +
                  180
                )
                %
                360
              : 0;


          return [

            new ol.style.Style({

              text:
                new ol.style.Text({

                  text:
                    "↑",

                  rotation:
                    movementDirection
                    *
                    Math.PI
                    /
                    180,

                  font:
                    "bold 21px Arial",

                  fill:
                    new ol.style.Fill({
                      color:
                        "#1f2937"
                    }),

                  stroke:
                    new ol.style.Stroke({
                      color:
                        "#ffffff",
                      width:
                        3
                    })

                })

            }),


            new ol.style.Style({

              text:
                new ol.style.Text({

                  text:
                    Number.isFinite(
                      speed
                    )
                      ? `${Math.round(
                          speed
                        )}`
                      : "",

                  offsetY:
                    17,

                  font:
                    "10px Arial",

                  fill:
                    new ol.style.Fill({
                      color:
                        "#111827"
                    }),

                  stroke:
                    new ol.style.Stroke({
                      color:
                        "#ffffff",
                      width:
                        2
                    })

                })

            })

          ];

        }

    });


  // =========================================================
  // MAP
  // =========================================================

  const map =
    new ol.Map({

      target:
        "map",

      layers: [

        osmLayer,
        topoLayer,
        satelliteLayer,
        weatherRasterLayer,
        windArrowLayer

      ],

      view:
        new ol.View({

          center:
            ol.proj.fromLonLat(
              center
            ),

          zoom:
            zoom,

          minZoom:
            7,

          maxZoom:
            19

        })

    });


  // =========================================================
  // POLA FALLBACK
  // =========================================================

  const LEGACY_POLA_LAYERS = [

    {
      id:
        "mangrove",
      label:
        "Mangroves",
      url:
        "../../shared/data/pola_mangrove.geojson",
      kind:
        "mangrove",
      group:
        "Coastal & Marine",
      visible:
        true
    },

    {
      id:
        "mpa",
      label:
        "Marine Protected Areas",
      url:
        "../../shared/data/pola_mpa.geojson",
      kind:
        "mpa",
      group:
        "Coastal & Marine",
      visible:
        true
    },

    {
      id:
        "marineResource",
      label:
        "Marine Resources",
      url:
        "../../shared/data/pola_marineresource.geojson",
      kind:
        "marineResource",
      group:
        "Coastal & Marine",
      visible:
        true
    },

    {
      id:
        "muniWater",
      label:
        "Municipal Water Extent",
      url:
        "../../shared/data/pola_muniwaterLine.geojson",
      kind:
        "muniWater",
      group:
        "Boundaries",
      visible:
        true
    },

    {
      id:
        "settlements",
      label:
        "Settlements",
      url:
        "../../shared/data/pola_settlements.geojson",
      kind:
        "settlements",
      group:
        "Community",
      visible:
        false
    },

    {
      id:
        "vulnDis",
      label:
        "Disability Types",
      url:
        "../../shared/data/pola_vuln.geojson",
      kind:
        "disability",
      group:
        "Community",
      visible:
        false,
      exclusiveGroup:
        "polaVulnerability"
    },

    {
      id:
        "vulnType",
      label:
        "Vulnerability Types",
      url:
        "../../shared/data/pola_vuln.geojson",
      kind:
        "vulnerability",
      group:
        "Community",
      visible:
        false,
      exclusiveGroup:
        "polaVulnerability"
    }

  ];


  function getLayerDefinitions() {

    if (
      Array.isArray(
        CONFIG.layers
      )
    ) {

      return CONFIG.layers.filter(
        item =>
          item &&
          item.enabled !==
          false &&
          item.url
      );

    }


    if (
      normalizeValue(
        municipality
      )
      ===
      "pola"
    ) {

      return LEGACY_POLA_LAYERS;

    }


    return [];

  }


  const vectorSourceCache =
    new Map();


  const coastalLayers =
    [];


  function getSource(
    url
  ) {

    if (!url) {

      return null;

    }


    if (
      !vectorSourceCache.has(
        url
      )
    ) {

      vectorSourceCache.set(

        url,

        new ol.source.Vector({

          url:
            url,

          format:
            new ol.format.GeoJSON()

        })

      );

    }


    return vectorSourceCache.get(
      url
    );

  }


  // =========================================================
  // GIS STYLES
  // =========================================================

  function styleForDefinition(
    definition,
    feature
  ) {

    const kind =
      definition.kind ||
      "generic";


    if (
      kind ===
      "mangrove"
    ) {

      return new ol.style.Style({

        fill:
          new ol.style.Fill({
            color:
              "rgba(0,128,0,0.30)"
          }),

        stroke:
          new ol.style.Stroke({
            color:
              "#008000",
            width:
              2
          }),

        image:
          new ol.style.Circle({

            radius:
              4,

            fill:
              new ol.style.Fill({
                color:
                  "#008000"
              }),

            stroke:
              new ol.style.Stroke({
                color:
                  "#ffffff",
                width:
                  1
              })

          })

      });

    }


    if (
      kind ===
      "mpa"
    ) {

      const field =
        definition.categoryField ||
        "zone_type";


      const category =
        cleanDisplayValue(
          feature.get(
            field
          )
        )
        ||
        cleanDisplayValue(
          feature.get(
            "zone_type"
          )
        )
        ||
        "MPA";


      const color =
        definition
          .categoryColors
          ?.[category]
        ||
        getMpaColor(
          category
        );


      return new ol.style.Style({

        fill:
          new ol.style.Fill({
            color:
              `${color}55`
          }),

        stroke:
          new ol.style.Stroke({
            color:
              color,
            width:
              2
          })

      });

    }


    if (
      kind ===
      "marineResource"
    ) {

      const field =
        definition.categoryField ||
        "Class_name";


      const category =
        cleanDisplayValue(
          feature.get(
            field
          )
        )
        ||
        cleanDisplayValue(
          feature.get(
            "class_name"
          )
        )
        ||
        "Unknown";


      const color =
        definition
          .categoryColors
          ?.[category]
        ||
        getMarineResourceColor(
          category
        );


      return new ol.style.Style({

        fill:
          new ol.style.Fill({
            color:
              `${color}55`
          }),

        stroke:
          new ol.style.Stroke({
            color:
              color,
            width:
              2
          })

      });

    }


    if (
      kind ===
      "muniWater"
    ) {

      return new ol.style.Style({

        stroke:
          new ol.style.Stroke({

            color:
              definition.color ||
              "#004aad",

            width:
              definition.width ||
              3,

            lineDash:
              [
                10,
                6
              ]

          })

      });

    }


    if (
      kind ===
      "municipalBoundary"
    ) {

      return new ol.style.Style({

        fill:
          new ol.style.Fill({
            color:
              "rgba(0,0,0,0)"
          }),

        stroke:
          new ol.style.Stroke({

            color:
              definition.color ||
              "#111827",

            width:
              definition.width ||
              1

          })

      });

    }


    if (
      kind ===
      "barangayBoundary"
    ) {

      return new ol.style.Style({

        fill:
          new ol.style.Fill({
            color:
              "rgba(0,0,0,0)"
          }),

        stroke:
          new ol.style.Stroke({

            color:
              definition.color ||
              "#6b7280",

            width:
              definition.width ||
              1.5,

            lineDash:
              [
                6,
                5
              ]

          })

      });

    }


    if (
      kind ===
      "settlements"
    ) {

      return new ol.style.Style({

        fill:
          new ol.style.Fill({
            color:
              "rgba(107,114,128,0.35)"
          }),

        stroke:
          new ol.style.Stroke({
            color:
              "#666666",
            width:
              1.5
          }),

        image:
          new ol.style.Circle({

            radius:
              4,

            fill:
              new ol.style.Fill({
                color:
                  "#666666"
              }),

            stroke:
              new ol.style.Stroke({
                color:
                  "#ffffff",
                width:
                  1
              })

          })

      });

    }


    if (
      kind ===
      "disability"
    ) {

      const field =
        definition.categoryField ||
        "dis_type";


      const category =
        cleanDisplayValue(
          feature.get(
            field
          )
        );


      if (!category) {

        return null;

      }


      return new ol.style.Style({

        image:
          new ol.style.Circle({

            radius:
              5,

            fill:
              new ol.style.Fill({
                color:
                  getDisabilityColor(
                    category
                  )
              }),

            stroke:
              new ol.style.Stroke({
                color:
                  "#ffffff",
                width:
                  1
              })

          })

      });

    }


    if (
      kind ===
      "vulnerability"
    ) {

      const field =
        definition.categoryField ||
        "vuln_type";


      const category =
        cleanDisplayValue(
          feature.get(
            field
          )
        );


      if (!category) {

        return null;

      }


      return new ol.style.Style({

        image:
          new ol.style.RegularShape({

            points:
              4,

            radius:
              6,

            angle:
              Math.PI /
              4,

            fill:
              new ol.style.Fill({
                color:
                  getVulnerabilityColor(
                    category
                  )
              }),

            stroke:
              new ol.style.Stroke({
                color:
                  "#ffffff",
                width:
                  1
              })

          })

      });

    }


    if (
      kind ===
      "categorized"
    ) {

      const field =
        definition.categoryField ||
        "class";


      const category =
        cleanDisplayValue(
          feature.get(
            field
          )
        );


      if (!category) {

        return null;

      }


      const color =
        definition
          .categoryColors
          ?.[category]
        ||
        colorFromString(
          category
        );


      return new ol.style.Style({

        fill:
          new ol.style.Fill({
            color:
              `${color}55`
          }),

        stroke:
          new ol.style.Stroke({
            color:
              color,
            width:
              2
          })

      });

    }


    if (
      kind ===
      "fishingGrounds"
    ) {

      const color =
        definition.color ||
        "#118ab2";


      return new ol.style.Style({

        fill:
          new ol.style.Fill({
            color:
              `${color}45`
          }),

        stroke:
          new ol.style.Stroke({
            color:
              color,
            width:
              2
          })

      });

    }


    const color =
      definition.color ||
      "#3A86FF";


    return new ol.style.Style({

      fill:
        new ol.style.Fill({
          color:
            `${color}55`
        }),

      stroke:
        new ol.style.Stroke({
          color:
            color,
          width:
            2
        })

    });

  }


  // =========================================================
  // CREATE GIS LAYERS
  // =========================================================

  getLayerDefinitions()
    .forEach(
      function (
        definition,
        index
      ) {

        const source =
          getSource(
            definition.url
          );


        if (!source) {

          return;

        }


        const layer =
          new ol.layer.Vector({

            source:
              source,

            visible:
              definition.visible ===
              true,

            style:
              feature =>
                styleForDefinition(
                  definition,
                  feature
                ),

            zIndex:
              100 +
              index

          });


        layer.set(
          "definition",
          definition
        );


        coastalLayers.push(
          layer
        );


        map.addLayer(
          layer
        );


        source.on(
          "featuresloaderror",
          function () {

            console.error(
              `Could not load layer: ${definition.label}`
            );


            const toggle =
              document.querySelector(
                `[data-layer-id="${definition.id}"]`
              );


            if (
              toggle
            ) {

              toggle.checked =
                false;

              toggle.disabled =
                true;


              const row =
                toggle.closest(
                  ".switch-row"
                );


              if (
                row
              ) {

                row.style.opacity =
                  "0.5";

              }

            }


            updateGISLegend();

          }
        );


        source.on(
          "change",
          function () {

            if (
              source.getState() ===
              "ready"
            ) {

              updateGISLegend();

            }

          }
        );

      }
    );


  // =========================================================
  // LAYER CONTROLS
  // =========================================================

  function getLayerControlsContainer() {

    let container =
      document.getElementById(
        "layerControls"
      );


    if (
      container
    ) {

      return container;

    }


    const oldToggle =
      document.getElementById(
        "layerMangrove"
      );


    const panel =
      oldToggle
        ?.closest(
          ".panel-card"
        )
      ||
      document.querySelector(
        ".sidebar .panel-card"
      );


    if (!panel) {

      return null;

    }


    panel
      .querySelectorAll(
        ".switch-row"
      )
      .forEach(
        row =>
          row.remove()
      );


    container =
      document.createElement(
        "div"
      );


    container.id =
      "layerControls";


    panel.appendChild(
      container
    );


    return container;

  }


  function buildLayerControls() {

    const container =
      getLayerControlsContainer();


    if (!container) {

      return;

    }


    container.innerHTML =
      "";


    if (
      !coastalLayers.length
    ) {

      container.innerHTML = `

        <div class="layer-empty-message">

          No coastal map layers are
          available yet for this municipality.

        </div>

      `;


      return;

    }


    const groups =
      new Map();


    coastalLayers
      .forEach(
        function (
          layer
        ) {

          const definition =
            layer.get(
              "definition"
            );


          const groupName =
            definition.group ||
            "Other";


          if (
            !groups.has(
              groupName
            )
          ) {

            groups.set(
              groupName,
              []
            );

          }


          groups
            .get(
              groupName
            )
            .push({

              layer:
                layer,

              definition:
                definition

            });

        }
      );


    groups.forEach(
      function (
        items,
        groupName
      ) {

        const group =
          document.createElement(
            "div"
          );


        group.className =
          "layer-group";


        const title =
          document.createElement(
            "div"
          );


        title.className =
          "layer-group-title";


        title.textContent =
          groupName;


        group.appendChild(
          title
        );


        items.forEach(
          function ({
            layer,
            definition
          }) {

            const row =
              document.createElement(
                "div"
              );


            row.className =
              "switch-row";


            const label =
              document.createElement(
                "span"
              );


            label.className =
              "switch-row-label";


            label.textContent =
              definition.label ||
              definition.id;


            const switchLabel =
              document.createElement(
                "label"
              );


            switchLabel.className =
              "switch";


            const input =
              document.createElement(
                "input"
              );


            input.type =
              "checkbox";


            input.checked =
              layer.getVisible();


            input.dataset.layerId =
              definition.id;


            const slider =
              document.createElement(
                "span"
              );


            slider.className =
              "slider";


            input.addEventListener(
              "change",
              function () {

                if (
                  definition.exclusiveGroup
                  &&
                  input.checked
                ) {

                  coastalLayers
                    .forEach(
                      function (
                        otherLayer
                      ) {

                        if (
                          otherLayer ===
                          layer
                        ) {

                          return;

                        }


                        const otherDef =
                          otherLayer.get(
                            "definition"
                          );


                        if (
                          otherDef.exclusiveGroup ===
                          definition.exclusiveGroup
                        ) {

                          otherLayer.setVisible(
                            false
                          );


                          const otherToggle =
                            document.querySelector(
                              `[data-layer-id="${otherDef.id}"]`
                            );


                          if (
                            otherToggle
                          ) {

                            otherToggle.checked =
                              false;

                          }

                        }

                      }
                    );

                }


                layer.setVisible(
                  input.checked
                );


                updateGISLegend();

              }
            );


            switchLabel.append(
              input,
              slider
            );


            row.append(
              label,
              switchLabel
            );


            group.appendChild(
              row
            );

          }
        );


        container.appendChild(
          group
        );

      }
    );

  }


  buildLayerControls();


  // =========================================================
  // BASEMAP CONTROL
  // =========================================================

  const basemapSelect =
    document.getElementById(
      "basemapSelect"
    );


  function setBasemap(
    value
  ) {

    const selected =
      value ===
      "light"
        ? "osm"
        : value;


    osmLayer.setVisible(
      selected ===
      "osm"
    );


    topoLayer.setVisible(
      selected ===
      "topo"
    );


    satelliteLayer.setVisible(
      selected ===
      "satellite"
    );

  }


  setBasemap(
    basemapSelect
      ?.value
    ||
    "osm"
  );


  basemapSelect
    ?.addEventListener(
      "change",
      event =>
        setBasemap(
          event.target.value
        )
    );


  // =========================================================
  // WEATHER CONTROLS
  // =========================================================

  function buildWeatherControls() {

    if (
      !mapWrap
      ||
      document.getElementById(
        "weatherOverlayControl"
      )
    ) {

      return;

    }


    const control =
      document.createElement(
        "div"
      );


    control.id =
      "weatherOverlayControl";


    control.className =
      "weather-overlay-control";


    control.innerHTML = `

      <div class="weather-overlay-tabs">

        <button
          type="button"
          class="weather-overlay-btn active"
          data-weather-layer="off"
        >
          Off
        </button>

        <button
          type="button"
          class="weather-overlay-btn"
          data-weather-layer="temperature"
        >
          Temperature
        </button>

        <button
          type="button"
          class="weather-overlay-btn"
          data-weather-layer="humidity"
        >
          Relative Humidity
        </button>

        <button
          type="button"
          class="weather-overlay-btn"
          data-weather-layer="heatIndex"
        >
          Heat Index
        </button>

        <button
          type="button"
          class="weather-overlay-btn"
          data-weather-layer="precipitation"
        >
          Precipitation
        </button>

        <button
          type="button"
          class="weather-overlay-btn"
          data-weather-layer="wind"
        >
          Wind
        </button>

      </div>

    `;


    const legend =
      document.createElement(
        "div"
      );


    legend.id =
      "weatherMapLegend";


    legend.className =
      "weather-map-legend hidden";


    mapWrap.append(
      control,
      legend
    );


    control
      .querySelectorAll(
        ".weather-overlay-btn"
      )
      .forEach(
        function (
          button
        ) {

          button.addEventListener(
            "click",
            function () {

              const type =
                button.dataset
                  .weatherLayer;


              if (
                type
              ) {

                setWeatherOverlay(
                  type
                );

              }

            }
          );

        }
      );

  }


  buildWeatherControls();


  function setActiveWeatherButton(
    type
  ) {

    document
      .querySelectorAll(
        ".weather-overlay-btn"
      )
      .forEach(
        function (
          button
        ) {

          button.classList.toggle(

            "active",

            button.dataset
              .weatherLayer ===
              type

          );

        }
      );

  }


  function getCurrentWeatherValue(
    type
  ) {

    const weather =
      window.CURRENT_WEATHER;


    if (!weather) {

      return null;

    }


    const keyMap = {

      temperature:
        "temperature",

      humidity:
        "humidity",

      heatIndex:
        "heatIndex",

      precipitation:
        "precipitation",

      wind:
        "windSpeed"

    };


    return weather[
      keyMap[
        type
      ]
    ];

  }


  // =========================================================
  // WEATHER LEGEND
  // =========================================================

  function renderWeatherLegend(
    type,
    statusText = ""
  ) {

    const legend =
      document.getElementById(
        "weatherMapLegend"
      );


    const definition =
      (
        window.WEATHER_OVERLAYS
        ||
        DEFAULT_WEATHER_OVERLAYS
      )
      ?.[type];


    if (
      !legend
      ||
      !definition
      ||
      type ===
      "off"
    ) {

      if (
        legend
      ) {

        legend.classList.add(
          "hidden"
        );

      }


      return;

    }


    const rawCurrentValue =
      getCurrentWeatherValue(
        type
      );


    const currentValue =
      (
        rawCurrentValue === null
        ||
        rawCurrentValue === undefined
        ||
        rawCurrentValue === ""
      )
        ? NaN
        : Number(
            rawCurrentValue
          );


    const currentText =
      Number.isFinite(
        currentValue
      )
        ? `${currentValue.toFixed(
            type ===
            "humidity"
              ? 0
              : 1
          )} ${definition.unit}`
        : "";


    const header = `

      <div class="weather-legend-header">

        <div>

          <div class="weather-legend-title">

            ${escapeHTML(
              definition.label
            )}

          </div>

          <div class="weather-legend-subtitle">

            ${escapeHTML(
              definition.subtitle ||
              ""
            )}

          </div>

        </div>


        <div
          style="
            display:flex;
            align-items:center;
            gap:6px;
          "
        >

          ${
            statusText
              ? `
                <span class="weather-legend-subtitle">
                  ${escapeHTML(
                    statusText
                  )}
                </span>
              `
              : ""
          }


          ${
            currentText
              ? `
                <span class="weather-current-indicator">
                  Current:
                  ${escapeHTML(
                    currentText
                  )}
                </span>
              `
              : ""
          }

        </div>

      </div>

    `;


    if (
      type ===
      "heatIndex"
    ) {

      legend.innerHTML = `

        ${header}


        <div class="heat-legend-row">

          ${
            definition.classes
              .map(
                item => `

                  <div
                    class="heat-legend-color"
                    style="
                      background:${item.color};
                    "
                  ></div>

                `
              )
              .join("")
          }

        </div>


        <div class="heat-legend-labels">

          ${
            definition.classes
              .map(
                item => `

                  <div>

                    <strong>
                      ${escapeHTML(
                        item.label
                      )}
                    </strong>

                    ${escapeHTML(
                      item.rangeLabel ||
                      ""
                    )}

                  </div>

                `
              )
              .join("")
          }

        </div>

      `;

    } else {

      const gradient =
        `linear-gradient(
          to right,
          ${
            definition.classes
              .map(
                item =>
                  item.color
              )
              .join(
                ", "
              )
          }
        )`;


      legend.innerHTML = `

        ${header}


        <div
          class="weather-gradient-bar"
          style="
            background:${gradient};
          "
        ></div>


        <div class="weather-gradient-labels">

          ${
            definition.classes
              .map(
                item => `

                  <span>

                    ${escapeHTML(
                      item.label
                    )}

                  </span>

                `
              )
              .join("")
          }

        </div>

      `;

    }


    legend.classList.remove(
      "hidden"
    );

  }


  // =========================================================
  // SMOOTH WEATHER COLORS
  // =========================================================

  function getSmoothWeatherColor(
    type,
    value
  ) {

    const definition =
      (
        window.WEATHER_OVERLAYS
        ||
        DEFAULT_WEATHER_OVERLAYS
      )
      ?.[type];


    if (
      !definition
      ||
      !Number.isFinite(
        value
      )
    ) {

      return {

        r: 128,
        g: 128,
        b: 128

      };

    }


    if (
      type ===
      "heatIndex"
    ) {

      const match =
        definition.classes.find(
          item =>
            value >=
            item.min
            &&
            value <
            item.max
        );


      return hexToRgb(

        match
          ? match.color
          : "#808080"

      );

    }


    const stops =
      [];


    definition.classes
      .forEach(
        function (
          item,
          index
        ) {

          let stopValue;


          if (
            Number.isFinite(
              item.min
            )
          ) {

            stopValue =
              item.min;

          } else {

            const firstMax =
              item.max;


            const next =
              definition.classes[
                index +
                1
              ];


            const gap =
              next
              &&
              Number.isFinite(
                next.max
              )
                ? (
                    next.max -
                    firstMax
                  )
                : 5;


            stopValue =
              firstMax -
              gap;


            if (
              type ===
              "precipitation"
              ||
              type ===
              "wind"
            ) {

              stopValue =
                Math.max(
                  0,
                  stopValue
                );

            }

          }


          stops.push({

            value:
              stopValue,

            color:
              item.color

          });

        }
      );


    if (
      value <=
      stops[0].value
    ) {

      return hexToRgb(
        stops[0].color
      );

    }


    if (
      value >=
      stops[
        stops.length -
        1
      ].value
    ) {

      return hexToRgb(

        stops[
          stops.length -
          1
        ].color

      );

    }


    for (
      let i = 0;
      i <
      stops.length -
      1;
      i++
    ) {

      const a =
        stops[i];


      const b =
        stops[
          i +
          1
        ];


      if (
        value >=
        a.value
        &&
        value <=
        b.value
      ) {

        const span =
          b.value -
          a.value;


        const amount =
          span ===
          0
            ? 0
            : (
                value -
                a.value
              )
              /
              span;


        return interpolateRgb(

          a.color,
          b.color,
          amount

        );

      }

    }


    return hexToRgb(

      stops[
        stops.length -
        1
      ].color

    );

  }


  // =========================================================
  // WEATHER MAP EXTENT
  // =========================================================

  function getWeatherSamplingExtent() {

    const size =
      map.getSize();


    if (
      !size
    ) {

      return null;

    }


    let [
      minLon,
      minLat,
      maxLon,
      maxLat
    ] =
      ol.proj.transformExtent(

        map
          .getView()
          .calculateExtent(
            size
          ),

        "EPSG:3857",

        "EPSG:4326"

      );


    const lonSpan =
      maxLon -
      minLon;


    const latSpan =
      maxLat -
      minLat;


    const bufferFactor =
      CONFIG
        .weatherOverlay
        ?.bufferFactor
      ??
      0.25;


    minLon -=
      lonSpan *
      bufferFactor;


    maxLon +=
      lonSpan *
      bufferFactor;


    minLat -=
      latSpan *
      bufferFactor;


    maxLat +=
      latSpan *
      bufferFactor;


    const maxLonSpan =
      CONFIG
        .weatherOverlay
        ?.maxLonSpan
      ??
      3.0;


    const maxLatSpan =
      CONFIG
        .weatherOverlay
        ?.maxLatSpan
      ??
      2.2;


    const mapCenter =
      map
        .getView()
        .getCenter();


    const [
      centerLon,
      centerLat
    ] =
      mapCenter
        ? ol.proj.toLonLat(
            mapCenter
          )
        : center;


    if (
      maxLon -
      minLon >
      maxLonSpan
    ) {

      minLon =
        centerLon -
        maxLonSpan /
        2;


      maxLon =
        centerLon +
        maxLonSpan /
        2;

    }


    if (
      maxLat -
      minLat >
      maxLatSpan
    ) {

      minLat =
        centerLat -
        maxLatSpan /
        2;


      maxLat =
        centerLat +
        maxLatSpan /
        2;

    }


    return [

      minLon,
      minLat,
      maxLon,
      maxLat

    ];

  }


  function getWeatherExtentKey(
    extent
  ) {

    return (

      extent
        .map(
          value =>
            Number(
              value
            )
              .toFixed(
                2
              )
        )
        .join("|")

      +

      "|3|3"

    );

  }


  // =========================================================
  // WEATHER CACHE
  // =========================================================

  function weatherGridCacheKey(
    key
  ) {

    return (

      "path_weather_grid_"

      +

      municipality
        .replace(
          /\W+/g,
          "_"
        )
        .toLowerCase()

      +

      "_"

      +

      key

    );

  }


  function saveWeatherGridCache(
    key,
    grid
  ) {

    try {

      localStorage.setItem(

        weatherGridCacheKey(
          key
        ),

        JSON.stringify({

          savedAt:
            Date.now(),

          grid:
            grid

        })

      );

    } catch (
      error
    ) {

      console.warn(
        "Weather map cache could not be saved."
      );

    }

  }


  function readWeatherGridCache(
    key
  ) {

    try {

      const raw =
        localStorage.getItem(

          weatherGridCacheKey(
            key
          )

        );


      if (!raw) {

        return null;

      }


      const cached =
        JSON.parse(
          raw
        );


      const maxAge =
        60
        *
        60
        *
        1000;


      if (
        !cached
          ?.grid
        ||
        !cached.savedAt
        ||
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


      return cached.grid;

    } catch (
      error
    ) {

      return null;

    }

  }


  // =========================================================
  // BILINEAR INTERPOLATION
  // =========================================================

  function interpolateGridValue(
    type,
    gx,
    gy
  ) {

    if (
      !weatherGrid
    ) {

      return NaN;

    }


    const {
      columns,
      rows,
      points
    } =
      weatherGrid;


    const x =
      Math.max(
        0,
        Math.min(
          columns -
          1,
          gx
        )
      );


    const y =
      Math.max(
        0,
        Math.min(
          rows -
          1,
          gy
        )
      );


    const x0 =
      Math.floor(
        x
      );


    const y0 =
      Math.floor(
        y
      );


    const x1 =
      Math.min(
        columns -
        1,
        x0 +
        1
      );


    const y1 =
      Math.min(
        rows -
        1,
        y0 +
        1
      );


    const tx =
      x -
      x0;


    const ty =
      y -
      y0;


    function getValue(
      row,
      col
    ) {

      const point =
        points[
          row *
          columns
          +
          col
        ];


      if (!point) {

        return NaN;

      }


      if (
        type ===
        "temperature"
      ) {

        return point.temperature;

      }


      if (
        type ===
        "humidity"
      ) {

        return point.humidity;

      }


      if (
        type ===
        "heatIndex"
      ) {

        return point.heatIndex;

      }


      if (
        type ===
        "precipitation"
      ) {

        return point.precipitation;

      }


      if (
        type ===
        "wind"
      ) {

        return point.windSpeed;

      }


      return NaN;

    }


    const q00 =
      getValue(
        y0,
        x0
      );


    const q10 =
      getValue(
        y0,
        x1
      );


    const q01 =
      getValue(
        y1,
        x0
      );


    const q11 =
      getValue(
        y1,
        x1
      );


    const valid =
      [
        q00,
        q10,
        q01,
        q11
      ]
        .filter(
          Number.isFinite
        );


    if (
      !valid.length
    ) {

      return NaN;

    }


    if (
      ![
        q00,
        q10,
        q01,
        q11
      ]
        .every(
          Number.isFinite
        )
    ) {

      return (

        valid.reduce(
          (
            a,
            b
          ) =>
            a +
            b,
          0
        )

        /

        valid.length

      );

    }


    const bottom =
      q00 *
      (
        1 -
        tx
      )
      +
      q10 *
      tx;


    const top =
      q01 *
      (
        1 -
        tx
      )
      +
      q11 *
      tx;


    return (

      bottom *
      (
        1 -
        ty
      )

      +

      top *
      ty

    );

  }


  // =========================================================
  // DRAW WEATHER RASTER
  // =========================================================

  function renderWeatherRaster() {

    if (
      !weatherGrid
      ||
      activeWeatherType ===
      "off"
    ) {

      weatherRasterLayer
        .setVisible(
          false
        );


      windArrowLayer
        .setVisible(
          false
        );


      return;

    }


    const [
      minLon,
      minLat,
      maxLon,
      maxLat
    ] =
      weatherGrid.extent;


    const rasterWidth =
      CONFIG
        .weatherOverlay
        ?.rasterWidth
      ||
      (
        window.innerWidth <=
        600
          ? 200
          : 320
      );


    const ratio =
      (
        maxLon -
        minLon
      )
      /
      Math.max(

        0.01,

        (
          maxLat -
          minLat
        )

      );


    const rasterHeight =
      Math.max(

        120,

        Math.min(

          360,

          Math.round(

            rasterWidth
            /
            Math.max(
              0.45,
              ratio
            )

          )

        )

      );


    const canvas =
      document.createElement(
        "canvas"
      );


    canvas.width =
      rasterWidth;


    canvas.height =
      rasterHeight;


    const context =
      canvas.getContext(
        "2d"
      );


    if (
      !context
    ) {

      return;

    }


    const image =
      context.createImageData(

        rasterWidth,
        rasterHeight

      );


    const data =
      image.data;


    for (
      let py = 0;
      py < rasterHeight;
      py++
    ) {

      const gy =
        (
          1
          -
          py
          /
          Math.max(
            1,
            rasterHeight -
            1
          )
        )
        *
        (
          weatherGrid.rows -
          1
        );


      for (
        let px = 0;
        px < rasterWidth;
        px++
      ) {

        const gx =
          (
            px
            /
            Math.max(
              1,
              rasterWidth -
              1
            )
          )
          *
          (
            weatherGrid.columns -
            1
          );


        const value =
          interpolateGridValue(

            activeWeatherType,
            gx,
            gy

          );


        const index =
          (
            py *
            rasterWidth
            +
            px
          )
          *
          4;


        if (
          !Number.isFinite(
            value
          )
        ) {

          data[
            index +
            3
          ] =
            0;


          continue;

        }


        const color =
          getSmoothWeatherColor(

            activeWeatherType,
            value

          );


        data[
          index
        ] =
          color.r;


        data[
          index +
          1
        ] =
          color.g;


        data[
          index +
          2
        ] =
          color.b;


        data[
          index +
          3
        ] =
          230;

      }

    }


    context.putImageData(

      image,
      0,
      0

    );


    const imageExtent =
      ol.proj.transformExtent(

        [
          minLon,
          minLat,
          maxLon,
          maxLat
        ],

        "EPSG:4326",

        "EPSG:3857"

      );


    weatherRasterLayer
      .setSource(

        new ol.source.ImageStatic({

          url:
            canvas.toDataURL(
              "image/png"
            ),

          imageExtent:
            imageExtent,

          projection:
            "EPSG:3857",

          interpolate:
            true

        })

      );


    weatherRasterLayer
      .setVisible(
        true
      );


    updateWindArrows();

  }


  // =========================================================
  // WIND ARROWS
  // =========================================================

  function updateWindArrows() {

    windArrowSource.clear();


    if (
      activeWeatherType !==
      "wind"
      ||
      !weatherGrid
    ) {

      windArrowLayer
        .setVisible(
          false
        );


      return;

    }


    weatherGrid.points
      .forEach(
        function (
          point
        ) {

          if (
            !point
            ||
            !Number.isFinite(
              point.windDirection
            )
          ) {

            return;

          }


          windArrowSource
            .addFeature(

              new ol.Feature({

                geometry:
                  new ol.geom.Point(

                    ol.proj.fromLonLat([

                      point.longitude,
                      point.latitude

                    ])

                  ),

                windSpeed:
                  point.windSpeed,

                windDirection:
                  point.windDirection

              })

            );

        }
      );


    windArrowLayer
      .setVisible(
        true
      );

  }


  // =========================================================
  // BUILD 3 X 3 SAMPLE GRID
  // =========================================================

  function buildWeatherPoints(
    extent
  ) {

    const [
      minLon,
      minLat,
      maxLon,
      maxLat
    ] =
      extent;


    const columns =
      3;


    const rows =
      3;


    const lonStep =
      (
        maxLon -
        minLon
      )
      /
      (
        columns -
        1
      );


    const latStep =
      (
        maxLat -
        minLat
      )
      /
      (
        rows -
        1
      );


    const locations =
      [];


    for (
      let row = 0;
      row < rows;
      row++
    ) {

      for (
        let col = 0;
        col < columns;
        col++
      ) {

        locations.push({

          longitude:
            minLon +
            col *
            lonStep,

          latitude:
            minLat +
            row *
            latStep

        });

      }

    }


    return {

      columns:
        columns,

      rows:
        rows,

      locations:
        locations

    };

  }


  // =========================================================
  // OPEN-METEO VARIABLES
  // =========================================================

  const weatherVariables =
    [

      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "wind_speed_10m",
      "wind_direction_10m"

    ]
      .join(
        ","
      );


  // =========================================================
  // FETCH WITH TIMEOUT
  // Prevents permanent "Loading map..."
  // =========================================================

  async function fetchWithTimeout(
    url,
    timeoutMs = 8000
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

      const response =
        await fetch(

          url,

          {

            cache:
              "no-store",

            signal:
              controller.signal

          }

        );


      if (
        !response.ok
      ) {

        throw new Error(
          `HTTP ${response.status}`
        );

      }


      return await response.json();


    } finally {

      clearTimeout(
        timer
      );

    }

  }


  function currentToPoint(
    location,
    current
  ) {

    const temperature =
      Number(
        current
          ?.temperature_2m
      );


    const humidity =
      Number(
        current
          ?.relative_humidity_2m
      );


    const precipitation =
      Number(
        current
          ?.precipitation
      );


    const windSpeed =
      Number(
        current
          ?.wind_speed_10m
      );


    const windDirection =
      Number(
        current
          ?.wind_direction_10m
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


    return {

      longitude:
        location.longitude,

      latitude:
        location.latitude,

      temperature:
        temperature,

      humidity:
        humidity,

      precipitation:
        precipitation,

      windSpeed:
        windSpeed,

      windDirection:
        windDirection,

      heatIndex:
        heatIndex

    };

  }


  // =========================================================
  // BATCH WEATHER GRID
  // =========================================================

  async function fetchBatchGrid(
    locations
  ) {

    const latitudes =
      locations
        .map(
          point =>
            point.latitude
              .toFixed(
                5
              )
        )
        .join(
          ","
        );


    const longitudes =
      locations
        .map(
          point =>
            point.longitude
              .toFixed(
                5
              )
        )
        .join(
          ","
        );


    const url =
      "https://api.open-meteo.com/v1/forecast"

      +

      `?latitude=${latitudes}`

      +

      `&longitude=${longitudes}`

      +

      `&current=${weatherVariables}`

      +

      "&timezone=auto";


    const json =
      await fetchWithTimeout(
        url,
        8000
      );


    const results =
      Array.isArray(
        json
      )
        ? json
        : [
            json
          ];


    if (
      results.length !==
      locations.length
    ) {

      throw new Error(
        "Unexpected batch weather response."
      );

    }


    return locations.map(
      function (
        location,
        index
      ) {

        return currentToPoint(

          location,

          results[
            index
          ]
            ?.current
          ||
          {}

        );

      }
    );

  }


  // =========================================================
  // SINGLE WEATHER POINT
  // Same style of request that works for Current Weather
  // =========================================================

  async function fetchSinglePoint(
    location
  ) {

    const url =
      "https://api.open-meteo.com/v1/forecast"

      +

      `?latitude=${location.latitude.toFixed(5)}`

      +

      `&longitude=${location.longitude.toFixed(5)}`

      +

      `&current=${weatherVariables}`

      +

      "&timezone=auto";


    const json =
      await fetchWithTimeout(
        url,
        7000
      );


    return currentToPoint(

      location,

      json
        ?.current
      ||
      {}

    );

  }


  // =========================================================
  // FALLBACK: NINE SINGLE-POINT REQUESTS
  // =========================================================

  async function fetchIndividualGrid(
    locations
  ) {

    const settled =
      await Promise.allSettled(

        locations.map(
          function (
            location
          ) {

            return fetchSinglePoint(
              location
            );

          }
        )

      );


    return settled.map(
      function (
        result,
        index
      ) {

        if (
          result.status ===
          "fulfilled"
        ) {

          return result.value;

        }


        console.warn(

          "Weather point failed:",

          locations[
            index
          ],

          result.reason

        );


        return {

          longitude:
            locations[
              index
            ].longitude,

          latitude:
            locations[
              index
            ].latitude,

          temperature:
            NaN,

          humidity:
            NaN,

          precipitation:
            NaN,

          windSpeed:
            NaN,

          windDirection:
            NaN,

          heatIndex:
            NaN

        };

      }
    );

  }


  // =========================================================
  // LOAD WEATHER GRID
  // =========================================================

  async function loadWeatherGrid(
    force = false
  ) {

    const extent =
      getWeatherSamplingExtent();


    if (
      !extent
    ) {

      return false;

    }


    const key =
      getWeatherExtentKey(
        extent
      );


    if (
      !force
      &&
      key ===
      weatherExtentKey
      &&
      weatherGrid
    ) {

      renderWeatherRaster();


      return true;

    }


    const cached =
      readWeatherGridCache(
        key
      );


    if (
      cached
      &&
      !force
    ) {

      weatherGrid =
        cached;


      weatherExtentKey =
        key;


      renderWeatherRaster();


      renderWeatherLegend(

        activeWeatherType,

        "Last available map"

      );

    }


    const requestSerial =
      ++weatherRequestSerial;


    const {
      columns,
      rows,
      locations
    } =
      buildWeatherPoints(
        extent
      );


    renderWeatherLegend(

      activeWeatherType,

      cached
        ? "Updating map…"
        : "Loading map…"

    );


    let points =
      null;


    // -------------------------------------------------------
    // TRY 1: MULTI-COORDINATE REQUEST
    // -------------------------------------------------------

    try {

      points =
        await fetchBatchGrid(
          locations
        );


    } catch (
      batchError
    ) {

      console.warn(

        "Batch weather grid failed. Trying individual points.",

        batchError

      );


      renderWeatherLegend(

        activeWeatherType,

        "Retrying map…"

      );


      // -----------------------------------------------------
      // TRY 2: NINE SINGLE-LOCATION REQUESTS
      // -----------------------------------------------------

      try {

        points =
          await fetchIndividualGrid(
            locations
          );


      } catch (
        individualError
      ) {

        console.error(

          "Individual weather grid failed.",

          individualError

        );

      }

    }


    if (
      requestSerial !==
      weatherRequestSerial
    ) {

      return false;

    }


    const validCount =
      (
        points ||
        []
      )
        .filter(
          point =>
            Number.isFinite(
              point.temperature
            )
        )
        .length;


    /*
      Four valid points are enough
      to create a smooth surface.
    */

    if (
      !points
      ||
      validCount <
      4
    ) {

      if (
        cached
      ) {

        weatherGrid =
          cached;


        weatherExtentKey =
          key;


        renderWeatherRaster();


        renderWeatherLegend(

          activeWeatherType,

          "Last available map"

        );


        return true;

      }


      weatherRasterLayer
        .setVisible(
          false
        );


      windArrowLayer
        .setVisible(
          false
        );


      renderWeatherLegend(

        activeWeatherType,

        "Overlay unavailable"

      );


      return false;

    }


    weatherGrid = {

      extent:
        extent,

      columns:
        columns,

      rows:
        rows,

      points:
        points

    };


    weatherExtentKey =
      key;


    saveWeatherGridCache(

      key,
      weatherGrid

    );


    renderWeatherRaster();


    renderWeatherLegend(
      activeWeatherType
    );


    return true;

  }


  // =========================================================
  // WEATHER ON / OFF
  // =========================================================

  async function setWeatherOverlay(
    type
  ) {

    activeWeatherType =
      type;


    setActiveWeatherButton(
      type
    );


    if (
      type ===
      "off"
    ) {

      weatherRasterLayer
        .setVisible(
          false
        );


      windArrowLayer
        .setVisible(
          false
        );


      renderWeatherLegend(
        "off"
      );


      return;

    }


    renderWeatherLegend(

      type,

      weatherGrid
        ? ""
        : "Loading map…"

    );


    if (
      weatherGrid
    ) {

      renderWeatherRaster();


      renderWeatherLegend(
        type
      );

    }


    await loadWeatherGrid(
      false
    );

  }


  // =========================================================
  // REFRESH AFTER PAN / ZOOM
  // =========================================================

  function scheduleWeatherRefresh() {

    if (
      activeWeatherType ===
      "off"
    ) {

      return;

    }


    clearTimeout(
      weatherRefreshTimer
    );


    weatherRefreshTimer =
      setTimeout(

        function () {

          loadWeatherGrid(
            false
          );

        },

        2000

      );

  }


  map.on(

    "moveend",

    scheduleWeatherRefresh

  );


  // =========================================================
  // START DEFAULT WEATHER OVERLAY
  // Independent from weather.js sidebar
  // =========================================================

  const defaultWeatherOverlay =
    CONFIG
      .weatherOverlay
      ?.default
    ||
    "temperature";


  setTimeout(

    function () {

      setWeatherOverlay(
        defaultWeatherOverlay
      );

    },

    900

  );


  window.addEventListener(

    "weatherupdate",

    function () {

      if (
        activeWeatherType !==
        "off"
      ) {

        renderWeatherLegend(
          activeWeatherType
        );

      }

    }

  );


  // =========================================================
  // GIS LEGEND
  // =========================================================

  function buildLegendSwatch(
    color,
    label,
    shape = "circle"
  ) {

    if (
      shape ===
      "line"
    ) {

      return `

        <div>

          <span
            class="legend-swatch"
            style="
              background:${color};
              width:18px;
              height:4px;
              border-radius:2px;
              margin-top:5px;
            "
          ></span>

          ${escapeHTML(
            label
          )}

        </div>

      `;

    }


    if (
      shape ===
      "diamond"
    ) {

      return `

        <div>

          <span
            class="legend-swatch"
            style="
              background:${color};
              border-radius:2px;
              transform:rotate(45deg);
              width:11px;
              height:11px;
              margin-left:2px;
              margin-right:11px;
            "
          ></span>

          ${escapeHTML(
            label
          )}

        </div>

      `;

    }


    return `

      <div>

        <span
          class="legend-swatch"
          style="
            background:${color};
          "
        ></span>

        ${escapeHTML(
          label
        )}

      </div>

    `;

  }


  function getUniqueValues(
    source,
    field
  ) {

    const values =
      new Set();


    source
      ?.getFeatures()
      .forEach(
        function (
          feature
        ) {

          const value =
            cleanDisplayValue(

              feature.get(
                field
              )

            );


          if (
            value
          ) {

            values.add(
              value
            );

          }

        }
      );


    return Array
      .from(
        values
      )
      .sort(
        function (
          a,
          b
        ) {

          return a.localeCompare(
            b
          );

        }
      );

  }


  function updateGISLegend() {

    const legendBox =
      document.getElementById(
        "legendBox"
      );


    if (
      !legendBox
    ) {

      return;

    }


    let html =
      "";


    coastalLayers

      .filter(
        layer =>
          layer.getVisible()
      )

      .forEach(
        function (
          layer
        ) {

          const definition =
            layer.get(
              "definition"
            );


          const source =
            layer.getSource();


          const kind =
            definition.kind ||
            "generic";


          html += `

            <div>

              <strong>

                ${escapeHTML(
                  definition.label ||
                  definition.id
                )}

              </strong>

            </div>

          `;


          if (
            kind ===
            "muniWater"
          ) {

            html +=
              buildLegendSwatch(

                definition.color ||
                "#004aad",

                definition.label ||
                "Municipal Water Extent",

                "line"

              );


          } else if (
            kind ===
            "municipalBoundary"
          ) {

            html +=
              buildLegendSwatch(

                definition.color ||
                "#111827",

                "Municipal Boundary",

                "line"

              );


          } else if (
            kind ===
            "barangayBoundary"
          ) {

            html +=
              buildLegendSwatch(

                definition.color ||
                "#6b7280",

                "Barangay Boundary",

                "line"

              );


          } else if (
            kind ===
            "mangrove"
          ) {

            html +=
              buildLegendSwatch(

                "#008000",

                "Mangrove"

              );


          } else if (
            kind ===
            "settlements"
          ) {

            html +=
              buildLegendSwatch(

                "#666666",

                "Settlements"

              );


          } else if (
            kind ===
            "disability"
          ) {

            const field =
              definition.categoryField ||
              "dis_type";


            const values =
              getUniqueValues(

                source,
                field

              );


            html +=
              values.length

                ? values
                    .map(
                      value =>
                        buildLegendSwatch(

                          getDisabilityColor(
                            value
                          ),

                          value

                        )
                    )
                    .join("")

                : "<div>No data loaded yet</div>";


          } else if (
            kind ===
            "vulnerability"
          ) {

            const field =
              definition.categoryField ||
              "vuln_type";


            const values =
              getUniqueValues(

                source,
                field

              );


            html +=
              values.length

                ? values
                    .map(
                      value =>
                        buildLegendSwatch(

                          getVulnerabilityColor(
                            value
                          ),

                          value,

                          "diamond"

                        )
                    )
                    .join("")

                : "<div>No data loaded yet</div>";


          } else if (
            kind ===
            "mpa"
          ) {

            const field =
              definition.categoryField ||
              "zone_type";


            const values =
              getUniqueValues(

                source,
                field

              );


            html +=
              values.length

                ? values
                    .map(
                      value =>
                        buildLegendSwatch(

                          definition
                            .categoryColors
                            ?.[value]
                          ||
                          getMpaColor(
                            value
                          ),

                          value

                        )
                    )
                    .join("")

                : buildLegendSwatch(

                    "#2b83ba",

                    "MPA"

                  );


          } else if (
            kind ===
            "marineResource"
          ) {

            const field =
              definition.categoryField ||
              "Class_name";


            const values =
              getUniqueValues(

                source,
                field

              );


            html +=
              values.length

                ? values
                    .map(
                      value =>
                        buildLegendSwatch(

                          definition
                            .categoryColors
                            ?.[value]
                          ||
                          getMarineResourceColor(
                            value
                          ),

                          value

                        )
                    )
                    .join("")

                : buildLegendSwatch(

                    "#ff6b6b",

                    "Marine Resource"

                  );


          } else if (
            kind ===
            "categorized"
          ) {

            const field =
              definition.categoryField ||
              "class";


            const values =
              getUniqueValues(

                source,
                field

              );


            html +=
              values.length

                ? values
                    .map(
                      value =>
                        buildLegendSwatch(

                          definition
                            .categoryColors
                            ?.[value]
                          ||
                          colorFromString(
                            value
                          ),

                          value

                        )
                    )
                    .join("")

                : "<div>No data loaded yet</div>";


          } else if (
            kind ===
            "fishingGrounds"
          ) {

            html +=
              buildLegendSwatch(

                definition.color ||
                "#118ab2",

                definition.label ||
                "Fishing Grounds"

              );


          } else {

            html +=
              buildLegendSwatch(

                definition.color ||
                "#3A86FF",

                definition.label ||
                "Layer"

              );

          }


          html +=
            "<br>";

        }
      );


    legendBox.innerHTML =
      html.trim()
        ? html
        : `

          <div>

            Turn on a coastal map layer
            to view its legend.

          </div>

        `;

  }


  updateGISLegend();


  // =========================================================
  // POPUPS
  // =========================================================

  function addPopupField(
    html,
    label,
    value
  ) {

    const displayValue =
      cleanDisplayValue(
        value
      );


    if (
      !displayValue
    ) {

      return html;

    }


    return html + `

      <div>

        <strong>

          ${escapeHTML(
            label
          )}:

        </strong>

        ${escapeHTML(
          displayValue
        )}

      </div>

    `;

  }


  function renderPopup(
    feature,
    definition
  ) {

    if (
      !popup
      ||
      !feature
      ||
      !definition
    ) {

      return;

    }


    const props =
      feature.getProperties();


    const kind =
      definition.kind ||
      "generic";


    let html = `

      <h4>

        ${escapeHTML(
          definition.label ||
          "Feature"
        )}

      </h4>

    `;


    if (
      Array.isArray(
        definition.popupFields
      )
      &&
      definition.popupFields.length
    ) {

      definition
        .popupFields
        .forEach(
          function (
            item
          ) {

            const field =
              typeof item ===
              "string"
                ? item
                : item.field;


            const label =
              typeof item ===
              "string"
                ? item
                : (
                    item.label ||
                    item.field
                  );


            html =
              addPopupField(

                html,

                label,

                props[
                  field
                ]

              );

          }
        );


    } else if (
      kind ===
      "disability"
    ) {

      html =
        addPopupField(

          html,

          "Disability Type",

          props[
            definition.categoryField ||
            "dis_type"
          ]

        );


    } else if (
      kind ===
      "vulnerability"
    ) {

      html =
        addPopupField(

          html,

          "Vulnerability Type",

          props[
            definition.categoryField ||
            "vuln_type"
          ]

        );


    } else if (
      kind ===
      "mpa"
    ) {

      html =
        addPopupField(

          html,

          "MPA Name",

          props.mpa_name
          ||
          props.MPAName
          ||
          props.Name
          ||
          props.name

        );


      html =
        addPopupField(

          html,

          "Zone Type",

          props[
            definition.categoryField ||
            "zone_type"
          ]
          ||
          props.zone_type

        );


    } else if (
      kind ===
      "marineResource"
    ) {

      html =
        addPopupField(

          html,

          "Feature",

          props[
            definition.categoryField ||
            "Class_name"
          ]
          ||
          props.Class_name
          ||
          props.class_name

        );


    } else if (
      kind ===
      "muniWater"
    ) {

      html += `

        <div>

          This is the Municipal Water Extent.

        </div>

      `;


    } else if (
      kind ===
      "mangrove"
    ) {

      html += `

        <div>

          Mangrove area

        </div>

      `;


    } else {

      Object.keys(
        props
      )

        .filter(
          key =>
            key !==
            "geometry"
            &&
            cleanDisplayValue(
              props[
                key
              ]
            )
        )

        .slice(
          0,
          5
        )

        .forEach(
          function (
            key
          ) {

            html =
              addPopupField(

                html,

                key,

                props[
                  key
                ]

              );

          }
        );

    }


    popup.innerHTML =
      html;


    popup.style.display =
      "block";

  }


  map.on(

    "pointermove",

    function (
      event
    ) {

      if (
        event.dragging
      ) {

        return;

      }


      let foundFeature =
        null;


      let foundDefinition =
        null;


      map.forEachFeatureAtPixel(

        event.pixel,

        function (
          feature,
          layer
        ) {

          if (
            layer ===
            windArrowLayer
          ) {

            return false;

          }


          const definition =
            layer
              ?.get
              ?.(
                "definition"
              );


          if (
            !definition
          ) {

            return false;

          }


          foundFeature =
            feature;


          foundDefinition =
            definition;


          return true;

        }

      );


      if (
        foundFeature
        &&
        foundDefinition
      ) {

        renderPopup(

          foundFeature,

          foundDefinition

        );


        map
          .getTargetElement()
          .style.cursor =
            "pointer";


      } else {

        if (
          popup
        ) {

          popup.style.display =
            "none";

        }


        map
          .getTargetElement()
          .style.cursor =
            "";

      }

    }

  );


  // =========================================================
  // MOBILE SIDEBAR
  // =========================================================

  function setupMobileSidebar() {

    const sidebar =
      document.querySelector(
        ".sidebar"
      );


    const menuButton =
      document.getElementById(
        "menuBtn"
      );


    const page =
      document.querySelector(
        ".page"
      );


    if (
      !sidebar
      ||
      !page
    ) {

      return;

    }


    let closeButton =
      sidebar.querySelector(
        ".sidebar-close-btn"
      );


    if (
      !closeButton
    ) {

      closeButton =
        document.createElement(
          "button"
        );


      closeButton.type =
        "button";


      closeButton.className =
        "sidebar-close-btn";


      closeButton.textContent =
        "✕ Close Map Tools";


      sidebar.prepend(
        closeButton
      );

    }


    let backdrop =
      page.querySelector(
        ".sidebar-backdrop"
      );


    if (
      !backdrop
    ) {

      backdrop =
        document.createElement(
          "div"
        );


      backdrop.className =
        "sidebar-backdrop";


      page.appendChild(
        backdrop
      );

    }


    const openSidebar =
      function () {

        sidebar.classList.add(
          "active"
        );


        backdrop.classList.add(
          "active"
        );

      };


    const closeSidebar =
      function () {

        sidebar.classList.remove(
          "active"
        );


        backdrop.classList.remove(
          "active"
        );

      };


    if (
      menuButton
    ) {

      const replacement =
        menuButton.cloneNode(
          true
        );


      menuButton.parentNode
        .replaceChild(

          replacement,

          menuButton

        );


      replacement
        .addEventListener(

          "click",

          openSidebar

        );

    }


    closeButton
      .addEventListener(

        "click",

        closeSidebar

      );


    backdrop
      .addEventListener(

        "click",

        closeSidebar

      );


    window.addEventListener(

      "resize",

      function () {

        if (
          window.innerWidth >
          900
        ) {

          closeSidebar();

        }


        map.updateSize();

      }

    );

  }


  setupMobileSidebar();


  // =========================================================
  // COLLAPSIBLE SIDEBAR
  // =========================================================

  function setupCollapsiblePanels() {

    document
      .querySelectorAll(
        ".sidebar .panel-card"
      )
      .forEach(
        function (
          card
        ) {

          if (
            card.dataset
              .collapsibleReady ===
            "true"
          ) {

            return;

          }


          const heading =
            card.querySelector(
              ":scope > h3"
            );


          if (
            !heading
          ) {

            return;

          }


          const content =
            document.createElement(
              "div"
            );


          content.className =
            "panel-content";


          Array
            .from(
              card.children
            )
            .forEach(
              function (
                child
              ) {

                if (
                  child !==
                  heading
                ) {

                  content.appendChild(
                    child
                  );

                }

              }
            );


          const button =
            document.createElement(
              "button"
            );


          button.type =
            "button";


          button.className =
            "panel-header";


          button.innerHTML = `

            <span>

              ${escapeHTML(
                heading.textContent
              )}

            </span>

            <span class="panel-header-arrow">

              ▼

            </span>

          `;


          heading.replaceWith(
            button
          );


          card.appendChild(
            content
          );


          card.dataset
            .collapsibleReady =
              "true";


          button.addEventListener(

            "click",

            function () {

              card.classList.toggle(
                "collapsed"
              );

            }

          );

        }
      );

  }


  setupCollapsiblePanels();


  // =========================================================
  // EXPORT MAP
  // =========================================================

  function getActiveBasemapName() {

    if (
      satelliteLayer.getVisible()
    ) {

      return "Satellite";

    }


    if (
      topoLayer.getVisible()
    ) {

      return "Topographic";

    }


    return "OpenStreetMap";

  }


  document
    .getElementById(
      "exportMapBtn"
    )
    ?.addEventListener(

      "click",

      function () {

        map.once(

          "rendercomplete",

          function () {

            try {

              const size =
                map.getSize();


              if (
                !size
              ) {

                throw new Error(
                  "Map size unavailable"
                );

              }


              const mapCanvas =
                document.createElement(
                  "canvas"
                );


              mapCanvas.width =
                size[
                  0
                ];


              mapCanvas.height =
                size[
                  1
                ];


              const context =
                mapCanvas.getContext(
                  "2d"
                );


              document
                .querySelectorAll(
                  ".ol-layer canvas, canvas.ol-layer"
                )
                .forEach(
                  function (
                    canvas
                  ) {

                    if (
                      canvas.width <=
                      0
                    ) {

                      return;

                    }


                    const opacity =
                      canvas
                        .parentNode
                        ?.style
                        ?.opacity
                        ? Number(
                            canvas
                              .parentNode
                              .style
                              .opacity
                          )
                        : 1;


                    context.globalAlpha =
                      Number.isFinite(
                        opacity
                      )
                        ? opacity
                        : 1;


                    let matrix =
                      [
                        1,
                        0,
                        0,
                        1,
                        0,
                        0
                      ];


                    if (
                      canvas.style
                        .transform
                        ?.startsWith(
                          "matrix("
                        )
                    ) {

                      matrix =
                        canvas.style
                          .transform
                          .slice(
                            7,
                            -1
                          )
                          .split(",")
                          .map(
                            Number
                          );

                    }


                    context.setTransform(
                      ...matrix
                    );


                    context.drawImage(

                      canvas,

                      0,
                      0

                    );

                  }
                );


              context.setTransform(

                1,
                0,
                0,
                1,
                0,
                0

              );


              context.globalAlpha =
                1;


              context.fillStyle =
                "rgba(255,255,255,0.92)";


              context.fillRect(

                18,
                18,
                370,
                120

              );


              context.fillStyle =
                "#123b63";


              context.font =
                "bold 17px Arial";


              context.fillText(

                "Coastal Weather & Heat Information Portal",

                30,
                45

              );


              context.fillStyle =
                "#1f2937";


              context.font =
                "13px Arial";


              context.fillText(

                `${municipality}${
                  province
                    ? ", " +
                      province
                    : ""
                }`,

                30,
                68

              );


              context.fillText(

                `Basemap: ${
                  getActiveBasemapName()
                }`,

                30,
                89

              );


              if (
                activeWeatherType !==
                "off"
              ) {

                const definition =
                  (
                    window.WEATHER_OVERLAYS
                    ||
                    DEFAULT_WEATHER_OVERLAYS
                  )
                  ?.[
                    activeWeatherType
                  ];


                if (
                  definition
                ) {

                  context.fillText(

                    `Weather overlay: ${definition.label}`,

                    30,
                    110

                  );

                }

              }


              const link =
                document.createElement(
                  "a"
                );


              link.download =
                `${municipality.replace(
                  /\s+/g,
                  "_"
                )}_coastal_weather_map.jpeg`;


              link.href =
                mapCanvas.toDataURL(

                  "image/jpeg",

                  0.92

                );


              link.click();


            } catch (
              error
            ) {

              console.error(

                "Export error:",

                error

              );


              alert(

                "Map export failed. Try OpenStreetMap if another basemap is active."

              );

            }

          }

        );


        map.renderSync();

      }

    );


  // =========================================================
  // INITIALIZE
  // =========================================================

  setTimeout(

    function () {

      map.updateSize();


      updateGISLegend();

    },

    500

  );

});