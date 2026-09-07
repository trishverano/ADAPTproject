window.CONFIG = {

  municipality:
    "Naujan",

  province:
    "Oriental Mindoro",


  // =========================================================
  // INITIAL MAP VIEW
  // =========================================================

  center: [
    121.30,
    13.32
  ],

  zoom:
    10,


  // =========================================================
  // CURRENT WEATHER
  // =========================================================

  weatherLat:
    13.32,

  weatherLon:
    121.30,

  weather: {

    lat:
      13.32,

    lon:
      121.30,

    label:
      "Naujan, Oriental Mindoro"

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
        "../../shared/data/naujan_mangrove.geojson",

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
        "../../shared/data/naujan_mpa.geojson",

      kind:
        "mpa",

      visible:
        true,

      popupFields: [

        {
          field:
            "MPAName",

          label:
            "MPA Name"
        }

      ]

    },


    {

      id:
        "fishingGrounds",

      label:
        "Fishing Grounds",

      group:
        "Coastal & Marine",

      url:
        "../../shared/data/naujan_fishinggrounds.geojson",

      kind:
        "fishingGrounds",

      visible:
        false

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
        "../../shared/data/naujan_muniwaterLine.geojson",

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
        "../../shared/data/naujan_muniboundary.geojson",

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
        "../../shared/data/naujan_settlements.geojson",

      kind:
        "settlements",

      visible:
        false

    },


    // -------------------------------------------------------
    // DISABILITY TYPES
    // Exact field = Ty_Disabil
    // -------------------------------------------------------

    {

      id:
        "vulnDis",

      label:
        "Disability Types",

      group:
        "Community",

      url:
        "../../shared/data/naujan_vuln.geojson",

      kind:
        "disability",

      categoryField:
        "Ty_Disabil",

      popupFields: [

        {
          field:
            "Ty_Disabil",

          label:
            "Disability Type"
        }

      ],

      visible:
        false,

      exclusiveGroup:
        "naujanVulnerability"

    },


    // -------------------------------------------------------
    // VULNERABILITY TYPES
    // Exact field = Ty_Vul
    // -------------------------------------------------------

    {

      id:
        "vulnType",

      label:
        "Vulnerability Types",

      group:
        "Community",

      url:
        "../../shared/data/naujan_vuln.geojson",

      kind:
        "vulnerability",

      categoryField:
        "Ty_Vul",

      popupFields: [

        {
          field:
            "Ty_Vul",

          label:
            "Vulnerability Type"
        }

      ],

      visible:
        false,

      exclusiveGroup:
        "naujanVulnerability"

    }

  ]

};