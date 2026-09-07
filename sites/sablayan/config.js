window.CONFIG = {

  municipality: "Sablayan",

  province: "Occidental Mindoro",


  // =========================================================
  // INITIAL MAP VIEW
  // =========================================================

  center: [
    120.90,
    12.84
  ],

  zoom: 10,


  // =========================================================
  // CURRENT WEATHER
  // =========================================================

  weatherLat: 12.84,

  weatherLon: 120.90,

  weather: {

    lat: 12.84,

    lon: 120.90,

    label:
      "Sablayan, Occidental Mindoro"

  },


  // =========================================================
  // WEATHER OVERLAY
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
  // MAP LAYERS
  // =========================================================

  layers: [


    // -------------------------------------------------------
    // COASTAL & MARINE
    // -------------------------------------------------------

    {

      id:
        "mpa",

      label:
        "Marine Protected Areas",

      group:
        "Coastal & Marine",

      url:
        "../../shared/data/sablayan_mpa.geojson",

      kind:
        "mpa",

      visible:
        true,

      popupFields: [

        {
          field:
            "mpa_name",

          label:
            "MPA Name"
        }

      ]

    },


    // -------------------------------------------------------
    // BOUNDARIES
    // -------------------------------------------------------

    {

      id:
        "muniWater",

      label:
        "Municipal Water Extent",

      group:
        "Boundaries",

      url:
        "../../shared/data/sablayan_muniwaterLine.geojson",

      kind:
        "muniWater",

      color:
        "#004aad",

      visible:
        true

    },


    {

      id:
        "municipalBoundary",

      label:
        "Municipal Boundary",

      group:
        "Boundaries",

      url:
        "../../shared/data/sablayan_muniboundary.geojson",

      kind:
        "municipalBoundary",

      width:
        1,

      visible:
        true

    },


    {

      id:
        "barangayBoundary",

      label:
        "Barangay Boundaries",

      group:
        "Boundaries",

      url:
        "../../shared/data/sablayan_brgyboundary.geojson",

      kind:
        "barangayBoundary",

      visible:
        false

    },


    // -------------------------------------------------------
    // COMMUNITY
    // -------------------------------------------------------

    {

      id:
        "settlements",

      label:
        "Settlements",

      group:
        "Community",

      url:
        "../../shared/data/sablayan_settlements.geojson",

      kind:
        "settlements",

      visible:
        false

    },


    // -------------------------------------------------------
    // DISABILITY
    // -------------------------------------------------------

    {

      id:
        "vulnDis",

      label:
        "Disability Types",

      group:
        "Community",

      url:
        "../../shared/data/sablayan_vuln.geojson",

      kind:
        "disability",

      categoryField:
        "Type of Di",

      popupFields: [

        {
          field:
            "Type of Di",

          label:
            "Disability Type"
        }

      ],

      excludeValues: [
        "N/A",
        "NA",
        "Not Applicable",
        ""
      ],

      visible:
        false,

      exclusiveGroup:
        "sablayanVulnerability"

    },


    // -------------------------------------------------------
    // VULNERABILITY
    // -------------------------------------------------------

    {

      id:
        "vulnType",

      label:
        "Vulnerability Types",

      group:
        "Community",

      url:
        "../../shared/data/sablayan_vuln.geojson",

      kind:
        "vulnerability",

      categoryField:
        "Type of Vu",

      popupFields: [

        {
          field:
            "Type of Vu",

          label:
            "Vulnerability Type"
        }

      ],

      excludeValues: [
        "N/A",
        "NA",
        "Not Applicable",
        ""
      ],

      visible:
        false,

      exclusiveGroup:
        "sablayanVulnerability"

    }

  ]

};