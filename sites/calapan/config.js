window.CONFIG = {

  // =========================================================
  // MUNICIPALITY
  // =========================================================

  municipality:
    "Calapan City",

  province:
    "Oriental Mindoro",


  // =========================================================
  // INITIAL MAP VIEW
  // Wider view like the other municipalities
  // =========================================================

  center: [
    121.18,
    13.41
  ],

  zoom:
    10,


  // =========================================================
  // CURRENT WEATHER
  // =========================================================

  weatherLat:
    13.41,

  weatherLon:
    121.18,


  weather: {

    lat:
      13.41,

    lon:
      121.18,

    label:
      "Calapan City, Oriental Mindoro"

  },


  // =========================================================
  // SMOOTH WEATHER OVERLAY
  // =========================================================

  weatherOverlay: {

    default:
      "temperature",

    // Slightly lighter request while still appearing smooth
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
  //
  // Calapan does not have project GIS data yet.
  // Leave this empty.
  //
  // Later, when Calapan data arrives, we only add
  // the new GeoJSON layer definitions here.
  // =========================================================

  layers: []

};