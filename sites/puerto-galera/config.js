window.CONFIG = {

  municipality:
    "Puerto Galera",

  province:
    "Oriental Mindoro",


  // =========================================================
  // INITIAL MAP VIEW
  // =========================================================

  center: [
    120.95,
    13.50
  ],

  zoom:
    10,


  // =========================================================
  // CURRENT WEATHER
  // =========================================================

  weatherLat:
    13.50,

  weatherLon:
    120.95,

  weather: {

    lat:
      13.50,

    lon:
      120.95,

    label:
      "Puerto Galera, Oriental Mindoro"

  },


  // =========================================================
  // WEATHER OVERLAY
  // =========================================================

  weatherOverlay: {

    default:
      "temperature",

    columns:
      10,

    rows:
      10,

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
        "mangrove",

      label:
        "Mangroves",

      group:
        "Coastal & Marine",

      url:
        "../../shared/data/puertogalera_mangrove.geojson",

      kind:
        "mangrove",

      visible:
        true

    },


    {

      id:
        "marineZones",

      label:
        "Management Zones",

      group:
        "Coastal & Marine",

      url:
        "../../shared/data/puertogalera_marinezones.geojson",

      kind:
        "categorized",

      categoryField:
        "Mgt_Zones",

      popupFields: [

        {
          field:
            "Mgt_Zones",

          label:
            "Management Zone"
        }

      ],

      visible:
        true

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
        "../../shared/data/puertogalera_muniwaterLine.geojson",

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
        "../../shared/data/puertogalera_muniboundary.geojson",

      kind:
        "municipalBoundary",

      width:
        1,

      visible:
        true

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
        "../../shared/data/puertogalera_settlements.geojson",

      kind:
        "settlements",

      popupFields: [

        {
          field:
            "Name",

          label:
            "Settlement Name"
        }

      ],

      visible:
        false

    },


    // -------------------------------------------------------
    // DISABILITY TYPES
    // Exact Puerto Galera field = Type of Di
    // -------------------------------------------------------

    {

      id:
        "vulnDis",

      label:
        "Disability Types",

      group:
        "Community",

      url:
        "../../shared/data/puertogalera_vuln.geojson",

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

      visible:
        false,

      exclusiveGroup:
        "puertoGaleraVulnerability"

    },


    // -------------------------------------------------------
    // VULNERABILITY TYPES
    // Exact Puerto Galera field = Type of Vu
    // -------------------------------------------------------

    {

      id:
        "vulnType",

      label:
        "Vulnerability Types",

      group:
        "Community",

      url:
        "../../shared/data/puertogalera_vuln.geojson",

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

      visible:
        false,

      exclusiveGroup:
        "puertoGaleraVulnerability"

    }

  ]

};