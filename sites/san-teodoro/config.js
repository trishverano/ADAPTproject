window.CONFIG = {

  municipality: "San Teodoro",

  province: "Oriental Mindoro",


  // =========================================================
  // INITIAL VIEW
  // =========================================================

  center: [
    121.01,
    13.44
  ],

  zoom: 10,


  // =========================================================
  // CURRENT WEATHER
  // =========================================================

  weatherLat: 13.44,

  weatherLon: 121.01,

  weather: {

    lat: 13.44,

    lon: 121.01,

    label:
      "San Teodoro, Oriental Mindoro"

  },


  // =========================================================
  // WEATHER OVERLAY
  //
  // 6 x 6 is enough because app.js smooths/interpolates it.
  // This is lighter than the previous 10 x 10 request.
  // =========================================================

  weatherOverlay: {

    default:
      "temperature",

    columns:
      6,

    rows:
      6,

    bufferFactor:
      0.25,

    maxLonSpan:
      3.0,

    maxLatSpan:
      2.2,

    rasterWidth:
      320

  },


  // =========================================================
  // GIS LAYERS
  // =========================================================

  layers: [

    {

      id:
        "mangrove",

      label:
        "Mangroves",

      group:
        "Coastal & Marine",

      url:
        "../../shared/data/santeodoro_mangrove.geojson",

      kind:
        "mangrove",

      visible:
        true

    },


    {

      id:
        "mpa",

      label:
        "Marine Protected Areas",

      group:
        "Coastal & Marine",

      url:
        "../../shared/data/santeodoro_mpa.geojson",

      kind:
        "mpa",

      visible:
        true,

      popupFields: [

        {
          field:
            "Name",

          label:
            "MPA Name"
        }

      ]

    },


    {

      id:
        "municipalBoundary",

      label:
        "Municipal Boundary",

      group:
        "Boundaries",

      url:
        "../../shared/data/santeodoro_muniboundary.geojson",

      kind:
        "municipalBoundary",

      color:
        "#111827",

      // Thin boundary
      width:
        1,

      visible:
        true

    },


    {

      id:
        "settlements",

      label:
        "Settlements",

      group:
        "Community",

      url:
        "../../shared/data/santeodoro_settlements.geojson",

      kind:
        "settlements",

      visible:
        false

    }

  ]

};