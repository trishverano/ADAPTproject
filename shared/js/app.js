document.addEventListener("DOMContentLoaded", function () {
  const center = CONFIG.center || [121.441, 13.143];
  const zoom = CONFIG.zoom || 13;
  const province = CONFIG.province || "";
  const layerConfig = CONFIG.layers || {};

  // =========================
  // BASEMAPS
  // =========================
  const osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
    visible: false
  });

  const cartoLightLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      maxZoom: 20,
      crossOrigin: "anonymous"
    }),
    visible: true
  });

  const topoLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
      maxZoom: 17,
      crossOrigin: "anonymous"
    }),
    visible: false
  });

  const satelliteLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maxZoom: 19,
      crossOrigin: "anonymous"
    }),
    visible: false
  });

  // =========================
  // HELPERS
  // =========================
  function hexToRgba(hex, alpha) {
    const clean = String(hex || "#808080").replace("#", "");
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function normalizeValue(value) {
    return String(value || "").toLowerCase().trim();
  }

  function getDisabilityColor(type) {
    const value = normalizeValue(type);

    if (value.includes("physical")) return "#e41a1c";
    if (value.includes("visual")) return "#377eb8";
    if (value.includes("hearing") || value.includes("deaf")) return "#4daf4a";
    if (value.includes("mental") || value.includes("psychosocial")) return "#984ea3";
    if (value.includes("intellectual")) return "#ff7f00";
    if (value.includes("speech")) return "#ffff33";
    if (value.includes("multiple")) return "#a65628";
    if (value.includes("learning")) return "#f781bf";
    if (value.includes("cancer")) return "#17becf";

    return "#808080";
  }

  function getVulnerabilityTypeColor(type) {
    const value = normalizeValue(type);

    if (value.includes("pwd")) return "#d73027";
    if (value.includes("senior")) return "#4575b4";
    if (value.includes("child")) return "#1a9850";
    if (value.includes("pregnant")) return "#984ea3";
    if (value.includes("breastfeeding")) return "#ff7f00";
    if (value.includes("malnourished")) return "#a6761d";
    if (value.includes("solo")) return "#e7298a";
    if (value.includes("female")) return "#66a61e";

    return "#808080";
  }

  function getBufferColor(type) {
    const value = normalizeValue(type);

    if (value.includes("no take")) return "#d7191c";
    if (value.includes("core")) return "#d7191c";
    if (value.includes("buffer")) return "#2b83ba";
    if (value.includes("seagrass")) return "#1b9e77";
    if (value.includes("multiple")) return "#1a9641";
    if (value.includes("sustainable")) return "#fdae61";

    return "#808080";
  }

  function getMarineResourceColor(type) {
    const value = normalizeValue(type);

    if (value.includes("coral")) return "#ff6b6b";
    if (value.includes("reef")) return "#ff9f1c";
    if (value.includes("seagrass")) return "#2ec4b6";
    if (value.includes("mangrove")) return "#55a630";
    if (value.includes("fish")) return "#3a86ff";
    if (value.includes("shell")) return "#8338ec";

    return "#808080";
  }

  function getMpaType(feature) {
    return feature.get("zone_type") || "Unknown";
  }

  function getMarineResourceType(feature) {
    return feature.get("Class_name") || feature.get("class_name") || "Unknown";
  }

  function zoomToSource(source) {
    if (!source) return;

    setTimeout(() => {
      const features = source.getFeatures();
      if (features.length > 0) {
        const extent = source.getExtent();
        if (extent && !ol.extent.isEmpty(extent)) {
          map.getView().fit(extent, {
            padding: [40, 40, 40, 40],
            maxZoom: 16,
            duration: 800
          });
        }
      }
    }, 400);
  }

  function getActiveBasemapName() {
    if (satelliteLayer.getVisible()) return "Satellite";
    if (topoLayer.getVisible()) return "Topographic";
    if (osmLayer.getVisible()) return "OpenStreetMap";
    return "Light Map";
  }

  function getScaleText() {
    const view = map.getView();
    const projection = view.getProjection();
    const resolution = view.getResolution();
    const centerCoord = view.getCenter();

    if (!resolution || !centerCoord) return "Scale N/A";

    const pointResolution = ol.proj.getPointResolution(projection, resolution, centerCoord);
    const inchesPerMeter = 39.37;
    const dpi = 96;
    const scale = Math.round(pointResolution * inchesPerMeter * dpi);

    return `Scale 1:${scale.toLocaleString()}`;
  }

  function setToggleAvailability(id, enabled) {
    const input = document.getElementById(id);
    if (!input) return;

    if (!enabled) {
      input.checked = false;
      input.disabled = true;
      const row = input.closest(".switch-row");
      if (row) row.style.opacity = "0.5";
    }
  }

  function createVectorSource(url) {
    if (!url) return null;
    return new ol.source.Vector({
      url: url,
      format: new ol.format.GeoJSON()
    });
  }

  function safeFeatures(source) {
    return source ? source.getFeatures() : [];
  }

  // =========================
  // SOURCES
  // =========================
  const mangroveSource = layerConfig.mangrove?.enabled
    ? createVectorSource(layerConfig.mangrove.url)
    : null;

  const mpaSource = layerConfig.mpa?.enabled
    ? createVectorSource(layerConfig.mpa.url)
    : null;

  const marineResourceSource = layerConfig.marineResource?.enabled
    ? createVectorSource(layerConfig.marineResource.url)
    : null;

  const muniWaterSource = layerConfig.muniWater?.enabled
    ? createVectorSource(layerConfig.muniWater.url)
    : null;

  const settlementsSource = layerConfig.settlements?.enabled
    ? createVectorSource(layerConfig.settlements.url)
    : null;

  const vulnSource = layerConfig.vuln?.enabled
    ? createVectorSource(layerConfig.vuln.url)
    : null;

  // =========================
  // STYLES
  // =========================
  function mangroveStyle() {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(0,128,0,0.30)"
      }),
      stroke: new ol.style.Stroke({
        color: "green",
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 4,
        fill: new ol.style.Fill({ color: "green" }),
        stroke: new ol.style.Stroke({ color: "white", width: 1 })
      })
    });
  }

  function mpaStyle(feature) {
    const color = getBufferColor(getMpaType(feature));
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: hexToRgba(color, 0.30)
      }),
      stroke: new ol.style.Stroke({
        color: color,
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 4,
        fill: new ol.style.Fill({ color: color }),
        stroke: new ol.style.Stroke({ color: "white", width: 1 })
      })
    });
  }

  function vulnerabilityDisabilityStyle(feature) {
    const color = getDisabilityColor(feature.get("dis_type"));
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: color }),
        stroke: new ol.style.Stroke({
          color: "white",
          width: 1
        })
      })
    });
  }

  function vulnerabilityTypeStyle(feature) {
    const color = getVulnerabilityTypeColor(feature.get("vuln_type"));
    return new ol.style.Style({
      image: new ol.style.RegularShape({
        points: 4,
        radius: 6,
        angle: Math.PI / 4,
        fill: new ol.style.Fill({ color: color }),
        stroke: new ol.style.Stroke({
          color: "white",
          width: 1
        })
      })
    });
  }

  function muniWaterStyle() {
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "#004aad",
        width: 3,
        lineDash: [10, 6]
      })
    });
  }

  function settlementsStyle() {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(128,128,128,0.35)"
      }),
      stroke: new ol.style.Stroke({
        color: "#666666",
        width: 1.5
      })
    });
  }

  function marineResourceStyle(feature) {
    const color = getMarineResourceColor(getMarineResourceType(feature));
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: hexToRgba(color, 0.30)
      }),
      stroke: new ol.style.Stroke({
        color: color,
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: color }),
        stroke: new ol.style.Stroke({ color: "white", width: 1 })
      })
    });
  }

  // =========================
  // LAYERS
  // =========================
  const mapLayers = [osmLayer, cartoLightLayer, topoLayer, satelliteLayer];

  const mangroveLayer = mangroveSource
    ? new ol.layer.Vector({
        source: mangroveSource,
        style: mangroveStyle,
        visible: true
      })
    : null;

  const mpaLayer = mpaSource
    ? new ol.layer.Vector({
        source: mpaSource,
        style: mpaStyle,
        visible: true
      })
    : null;

  const marineResourceLayer = marineResourceSource
    ? new ol.layer.Vector({
        source: marineResourceSource,
        style: marineResourceStyle,
        visible: true
      })
    : null;

  const muniWaterLayer = muniWaterSource
    ? new ol.layer.Vector({
        source: muniWaterSource,
        style: muniWaterStyle,
        visible: true
      })
    : null;

  const settlementsLayer = settlementsSource
    ? new ol.layer.Vector({
        source: settlementsSource,
        style: settlementsStyle,
        visible: false
      })
    : null;

  const vulnDisLayer = vulnSource
    ? new ol.layer.Vector({
        source: vulnSource,
        style: vulnerabilityDisabilityStyle,
        visible: false
      })
    : null;

  const vulnTypeLayer = vulnSource
    ? new ol.layer.Vector({
        source: vulnSource,
        style: vulnerabilityTypeStyle,
        visible: false
      })
    : null;

  [
    muniWaterLayer,
    mangroveLayer,
    mpaLayer,
    marineResourceLayer,
    settlementsLayer,
    vulnDisLayer,
    vulnTypeLayer
  ].forEach(function (layer) {
    if (layer) mapLayers.push(layer);
  });

  // =========================
  // MAP
  // =========================
  const map = new ol.Map({
    target: "map",
    layers: mapLayers,
    view: new ol.View({
      center: ol.proj.fromLonLat(center),
      zoom: zoom,
      maxZoom: 19
    })
  });

  // =========================
  // DISABLE MISSING TOGGLES
  // =========================
  setToggleAvailability("layerMangrove", !!mangroveLayer);
  setToggleAvailability("layerMPA", !!mpaLayer);
  setToggleAvailability("layerMarineResource", !!marineResourceLayer);
  setToggleAvailability("layerMuniWater", !!muniWaterLayer);
  setToggleAvailability("layerSettlements", !!settlementsLayer);
  setToggleAvailability("layerVulnDis", !!vulnDisLayer);
  setToggleAvailability("layerVulnType", !!vulnTypeLayer);

  // =========================
  // TOGGLES
  // =========================
  document.getElementById("layerMangrove")?.addEventListener("change", function (e) {
    if (mangroveLayer) mangroveLayer.setVisible(e.target.checked);
    updateLegend();
  });

  document.getElementById("layerMPA")?.addEventListener("change", function (e) {
    if (mpaLayer) mpaLayer.setVisible(e.target.checked);
    updateLegend();
  });

  document.getElementById("layerMarineResource")?.addEventListener("change", function (e) {
    if (marineResourceLayer) marineResourceLayer.setVisible(e.target.checked);
    updateLegend();
  });

  document.getElementById("layerMuniWater")?.addEventListener("change", function (e) {
    if (muniWaterLayer) muniWaterLayer.setVisible(e.target.checked);
    updateLegend();
  });

  document.getElementById("layerSettlements")?.addEventListener("change", function (e) {
    if (settlementsLayer) settlementsLayer.setVisible(e.target.checked);
    updateLegend();
  });

  document.getElementById("layerVulnDis")?.addEventListener("change", function (e) {
    if (vulnDisLayer) vulnDisLayer.setVisible(e.target.checked);

    if (e.target.checked && vulnTypeLayer) {
      vulnTypeLayer.setVisible(false);
      const otherToggle = document.getElementById("layerVulnType");
      if (otherToggle) otherToggle.checked = false;
      zoomToSource(vulnSource);
    }

    updateLegend();
  });

  document.getElementById("layerVulnType")?.addEventListener("change", function (e) {
    if (vulnTypeLayer) vulnTypeLayer.setVisible(e.target.checked);

    if (e.target.checked && vulnDisLayer) {
      vulnDisLayer.setVisible(false);
      const otherToggle = document.getElementById("layerVulnDis");
      if (otherToggle) otherToggle.checked = false;
      zoomToSource(vulnSource);
    }

    updateLegend();
  });

  // =========================
  // BASEMAP SWITCHER
  // =========================
  document.getElementById("basemapSelect")?.addEventListener("change", function (e) {
    const val = e.target.value;
    osmLayer.setVisible(val === "osm");
    cartoLightLayer.setVisible(val === "light");
    topoLayer.setVisible(val === "topo");
    satelliteLayer.setVisible(val === "satellite");
  });

  // =========================
  // EXPORT JPEG
  // =========================
  document.getElementById("exportMapBtn")?.addEventListener("click", function () {
    map.once("rendercomplete", function () {
      const mapCanvas = document.createElement("canvas");
      const size = map.getSize();

      mapCanvas.width = size[0];
      mapCanvas.height = size[1];

      const mapContext = mapCanvas.getContext("2d");
      if (!mapContext) return;

      Array.prototype.forEach.call(
        document.querySelectorAll(".ol-layer canvas, canvas.ol-layer"),
        function (canvas) {
          if (canvas.width > 0) {
            const opacity =
              canvas.parentNode && canvas.parentNode.style.opacity
                ? Number(canvas.parentNode.style.opacity)
                : 1;

            mapContext.globalAlpha = opacity;

            let matrix;
            const transform = canvas.style.transform;

            if (transform && transform.startsWith("matrix(")) {
              matrix = transform.slice(7, -1).split(",").map(Number);
            } else {
              matrix = [1, 0, 0, 1, 0, 0];
            }

            mapContext.setTransform(
              matrix[0], matrix[1], matrix[2],
              matrix[3], matrix[4], matrix[5]
            );

            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );

      mapContext.setTransform(1, 0, 0, 1, 0, 0);
      mapContext.globalAlpha = 1;

      const panelX = 18;
      const panelY = 18;
      const panelW = 330;
      const panelH = 240;

      mapContext.fillStyle = "rgba(255,255,255,0.92)";
      mapContext.fillRect(panelX, panelY, panelW, panelH);
      mapContext.strokeStyle = "#666";
      mapContext.lineWidth = 1;
      mapContext.strokeRect(panelX, panelY, panelW, panelH);

      mapContext.fillStyle = "#123b63";
      mapContext.font = "bold 18px Arial";
      mapContext.fillText("Municipal Coastal GIS Portal", panelX + 14, panelY + 28);

      mapContext.fillStyle = "#222";
      mapContext.font = "14px Arial";
      mapContext.fillText(`${CONFIG.municipality || ""}, ${province}`, panelX + 14, panelY + 50);
      mapContext.fillText(`Basemap: ${getActiveBasemapName()}`, panelX + 14, panelY + 70);
      mapContext.fillText(getScaleText(), panelX + 14, panelY + 90);
      mapContext.fillText(`Date: ${new Date().toLocaleDateString()}`, panelX + 14, panelY + 110);

      mapContext.font = "bold 14px Arial";
      mapContext.fillText("Legend", panelX + 14, panelY + 135);

      let ly = panelY + 155;

      function drawLegendItem(color, label) {
        mapContext.fillStyle = color;
        mapContext.strokeStyle = "#ffffff";
        mapContext.lineWidth = 1;

        mapContext.beginPath();
        mapContext.arc(panelX + 22, ly - 4, 5, 0, 2 * Math.PI);
        mapContext.fill();
        mapContext.stroke();

        mapContext.fillStyle = "#222";
        mapContext.font = "13px Arial";
        mapContext.fillText(label, panelX + 38, ly);
        ly += 20;
      }

      if (mangroveLayer && mangroveLayer.getVisible()) drawLegendItem("green", "Mangroves");
      if (mpaLayer && mpaLayer.getVisible()) drawLegendItem("#2b83ba", "MPA");

      const nx = size[0] - 60;
      const ny = 40;
      mapContext.fillStyle = "#111";
      mapContext.font = "bold 18px Arial";
      mapContext.fillText("N", nx - 6, ny - 8);

      mapContext.beginPath();
      mapContext.moveTo(nx, ny);
      mapContext.lineTo(nx - 10, ny + 24);
      mapContext.lineTo(nx + 10, ny + 24);
      mapContext.closePath();
      mapContext.fill();

      try {
        const link = document.createElement("a");
        const muni = (CONFIG.municipality || "map").replace(/\s+/g, "_");
        link.download = `${muni}_map_export.jpeg`;
        link.href = mapCanvas.toDataURL("image/jpeg", 0.92);
        link.click();
      } catch (err) {
        alert("Export failed. If Satellite is active, try Light Map first.");
      }
    });

    map.renderSync();
  });

  // =========================
  // HOVER POPUP
  // =========================
  const popup = document.getElementById("popup");

  function renderPopup(foundFeature, foundLayerName) {
    if (!popup || !foundFeature) return;

    const props = foundFeature.getProperties();
    let html = `<h4>${foundLayerName || "Feature"}</h4>`;

    if (foundLayerName === "MPA") {
      html += `
        <div><strong>MPA Name:</strong> ${props.mpa_name || "N/A"}</div>
        <div><strong>Zone Type:</strong> ${props.zone_type || "N/A"}</div>
      `;
    } else if (foundLayerName === "Mangroves") {
      html += `
        <div><strong>Info:</strong> Mangrove area</div>
      `;
    } else {
      popup.style.display = "none";
      return;
    }

    popup.innerHTML = html;
    popup.style.display = "block";
  }

  map.on("pointermove", function (evt) {
    if (evt.dragging) return;

    let foundFeature = null;
    let foundLayerName = null;

    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
      foundFeature = feature;

      if (layer === mangroveLayer) foundLayerName = "Mangroves";
      if (layer === mpaLayer) foundLayerName = "MPA";

      return true;
    });

    if (foundFeature) {
      renderPopup(foundFeature, foundLayerName);
      map.getTargetElement().style.cursor = "pointer";
    } else {
      if (popup) popup.style.display = "none";
      map.getTargetElement().style.cursor = "";
    }
  });

  // =========================
  // LEGEND
  // =========================
  function buildLegendItem(color, label) {
    return `<div><span class="legend-swatch" style="background:${color};"></span> ${label}</div>`;
  }

  function updateLegend() {
    const legendBox = document.getElementById("legendBox");
    if (!legendBox) return;

    const mpaTypes = new Set();
    safeFeatures(mpaSource).forEach(function (feature) {
      const mpaType = getMpaType(feature);
      if (mpaType) mpaTypes.add(mpaType);
    });

    let html = "";

    if (mangroveLayer && mangroveLayer.getVisible()) {
      html += `<div><strong>Mangroves</strong></div>`;
      html += buildLegendItem("green", "Mangrove");
      html += `<br>`;
    }

    if (mpaLayer && mpaLayer.getVisible()) {
      html += `<div><strong>MPA</strong></div>`;
      if (mpaTypes.size === 0) {
        html += `<div>No MPA data loaded yet</div>`;
      } else {
        Array.from(mpaTypes).sort().forEach(function (type) {
          html += buildLegendItem(getBufferColor(type), type);
        });
      }
      html += `<br>`;
    }

    if (!html.trim()) {
      html = `<div>Turn on a layer to view its legend.</div>`;
    }

    legendBox.innerHTML = html;
  }

  // =========================
  // SOURCE EVENTS
  // =========================
  if (mangroveSource) {
    mangroveSource.on("change", function () {
      if (mangroveSource.getState() === "ready") updateLegend();
    });
  }

  if (mpaSource) {
    mpaSource.on("change", function () {
      if (mpaSource.getState() === "ready") updateLegend();
    });
  }

  setTimeout(function () {
    map.updateSize();
    updateLegend();

    if (mangroveSource) {
      zoomToSource(mangroveSource);
    } else if (mpaSource) {
      zoomToSource(mpaSource);
    }
  }, 700);
});