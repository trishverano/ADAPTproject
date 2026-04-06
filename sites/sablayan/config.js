const CONFIG = {
  municipality: "Sablayan",
  province: "Occidental Mindoro",
  center: [120.768, 12.834],
  zoom: 13,

  layers: {
    mangrove: {
      enabled: true,
      url: "../../shared/data/sablayan_mangrove.geojson"
    },
    mpa: {
      enabled: true,
      url: "../../shared/data/sablayan_mpa.geojson"
    },
    marineResource: {
      enabled: false,
      url: ""
    },
    muniWater: {
      enabled: false,
      url: ""
    },
    settlements: {
      enabled: false,
      url: ""
    },
    vuln: {
      enabled: false,
      url: ""
    }
  }
};