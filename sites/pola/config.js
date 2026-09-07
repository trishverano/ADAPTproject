window.CONFIG = {

  // =========================================================
  // MUNICIPALITY
  // =========================================================

  municipality: "Pola",

  province: "Oriental Mindoro",


  // =========================================================
  // INITIAL MAP VIEW
  //
  // Wide enough to show Pola and nearby municipalities.
  // =========================================================

  center: [
    121.36,
    13.18
  ],

  zoom: 10,


  // =========================================================
  // CURRENT WEATHER LOCATION
  //
  // This is the representative location used by the
  // Current Weather panel in the sidebar.
  // =========================================================

  weather: {

    lat: 13.143,

    lon: 121.441,

    label:
      "Pola, Oriental Mindoro"

  },


  // =========================================================
  // WEATHER MAP OVERLAY
  // =========================================================

  weatherOverlay: {

    // Weather layer shown when page first opens
    default:
      "temperature",


    // Model sampling grid used to create the smooth surface
    columns: 10,

    rows: 10,


    // Extra coverage around the current map view
    bufferFactor: 0.25,


    // Allows the overlay to cover a wider surrounding area
    // when users zoom out.
    maxLonSpan: 3.0,

    maxLatSpan: 2.2,


    // Smooth display resolution.
    // This affects appearance only,
    // not the underlying weather-data accuracy.
    rasterWidth: 320

  },


  // =========================================================
  // COASTAL MAP LAYERS
  //
  // IMPORTANT:
  // Future Pola datasets are added HERE.
  //
  // You should no longer need to edit app.js just because
  // another GeoJSON file arrives.
  // =========================================================

  layers: [


    // ---------------------------------------------------------
    // COASTAL & MARINE
    // ---------------------------------------------------------

    {

      id:
        "mangrove",

      label:
        "Mangroves",

      group:
        "Coastal & Marine",

      url:
        "../../shared/data/pola_mangrove.geojson",

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
        "../../shared/data/pola_mpa.geojson",

      kind:
        "mpa",

      categoryField:
        "zone_type",

      visible:
        true

    },


    {

      id:
        "marineResource",

      label:
        "Marine Resources",

      group:
        "Coastal & Marine",

      url:
        "../../shared/data/pola_marineresource.geojson",

      kind:
        "marineResource",

      categoryField:
        "Class_name",

      visible:
        true

    },


    // ---------------------------------------------------------
    // BOUNDARIES
    // ---------------------------------------------------------

    {

      id:
        "muniWater",

      label:
        "Municipal Water Extent",

      group:
        "Boundaries",

      url:
        "../../shared/data/pola_muniwaterLine.geojson",

      kind:
        "muniWater",

      visible:
        true,

      color:
        "#004aad"

    },


    // Municipal Boundary is intentionally NOT included yet.
    // Add it here when the Pola municipal-boundary GeoJSON
    // becomes available.


    // Barangay Boundary is intentionally NOT included yet.
    // Add it here when the Pola barangay-boundary GeoJSON
    // becomes available.


    // ---------------------------------------------------------
    // COMMUNITY
    // ---------------------------------------------------------

    {

      id:
        "settlements",

      label:
        "Settlements",

      group:
        "Community",

      url:
        "../../shared/data/pola_settlements.geojson",

      kind:
        "settlements",

      visible:
        false

    },


    {

      id:
        "vulnDis",

      label:
        "Disability Types",

      group:
        "Community",

      url:
        "../../shared/data/pola_vuln.geojson",

      kind:
        "disability",

      categoryField:
        "dis_type",

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

      group:
        "Community",

      url:
        "../../shared/data/pola_vuln.geojson",

      kind:
        "vulnerability",

      categoryField:
        "vuln_type",

      visible:
        false,

      exclusiveGroup:
        "polaVulnerability"

    }

  ]

};