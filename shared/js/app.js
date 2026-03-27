document.addEventListener("DOMContentLoaded", function () {
  const center = CONFIG.center || [121.441, 13.143];
  const zoom = CONFIG.zoom || 13;

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
    const clean = String(hex).replace("#", "");
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

    if (value.includes("core")) return "#d7191c";
    if (value.includes("strict")) return "#7b3294";
    if (value.includes("buffer")) return "#2b83ba";
    if (value.includes("multiple")) return "#1a9641";
    if (value.includes("sustainable")) return "#fdae61";
    if (value.includes("seagrass")) return "#1b9e77";
    if (value.includes("mangrove")) return "#66a61e";
    if (value.includes("fish")) return "#00a6ca";
    if (value.includes("sanctuary")) return "#c51b7d";

    return "#808080";
  }

  function getMpaType(feature) {
    return (
      feature.get("buffer_type") ||
      feature.get("zone_type") ||
      feature.get("buffer") ||
      feature.get("zone") ||
      feature.get("mpa_type") ||
      feature.get("type") ||
      "Unknown"
    );
  }

  function zoomToSource(source) {
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
    const center = view.getCenter();

    if (!resolution || !center) return "Scale N/A";

    const mpu = projection.getMetersPerUnit() || 1;
    const pointResolution = ol.proj.getPointResolution(projection, resolution, center);
    const dpi = 96;
    const inchesPerMeter = 39.37;
    const scale = Math.round(pointResolution * mpu * inchesPerMeter * dpi);

    return `Scale 1:${scale.toLocaleString()}`;
  }

  // =========================
  // SOURCES
  // =========================
  const mangroveSource = new ol.source.Vector({
    url: "../../shared/data/pola_mangrove.geojson",
    format: new ol.format.GeoJSON()
  });

  const mpaSource = new ol.source.Vector({
    url: "../../shared/data/pola_mpa.geojson",
    format: new ol.format.GeoJSON()
  });

  const vulnSource = new ol.source.Vector({
    url: "../../shared/data/pola_vuln.geojson",
    format: new ol.format.GeoJSON()
  });

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

  // =========================
  // LAYERS
  // =========================
  const mangroveLayer = new ol.layer.Vector({
    source: mangroveSource,
    style: mangroveStyle,
    visible: true
  });

  const mpaLayer = new ol.layer.Vector({
    source: mpaSource,
    style: mpaStyle,
    visible: true
  });

  const vulnDisLayer = new ol.layer.Vector({
    source: vulnSource,
    style: vulnerabilityDisabilityStyle,
    visible: false
  });

  const vulnTypeLayer = new ol.layer.Vector({
    source: vulnSource,
    style: vulnerabilityTypeStyle,
    visible: false
  });

  // =========================
  // MAP
  // =========================
  const map = new ol.Map({
    target: "map",
    layers: [
      osmLayer,
      cartoLightLayer,
      topoLayer,
      satelliteLayer,
      mangroveLayer,
      mpaLayer,
      vulnDisLayer,
      vulnTypeLayer
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat(center),
      zoom: zoom,
      maxZoom: 19
    })
  });

  // =========================
  // TOGGLES
  // =========================
  document.getElementById("layerMangrove")?.addEventListener("change", function (e) {
    mangroveLayer.setVisible(e.target.checked);
  });

  document.getElementById("layerMPA")?.addEventListener("change", function (e) {
    mpaLayer.setVisible(e.target.checked);
    if (e.target.checked) zoomToSource(mpaSource);
  });

  document.getElementById("layerVulnDis")?.addEventListener("change", function (e) {
    vulnDisLayer.setVisible(e.target.checked);

    if (e.target.checked) {
      vulnTypeLayer.setVisible(false);
      const otherToggle = document.getElementById("layerVulnType");
      if (otherToggle) otherToggle.checked = false;
      zoomToSource(vulnSource);
    }
  });

  document.getElementById("layerVulnType")?.addEventListener("change", function (e) {
    vulnTypeLayer.setVisible(e.target.checked);

    if (e.target.checked) {
      vulnDisLayer.setVisible(false);
      const otherToggle = document.getElementById("layerVulnDis");
      if (otherToggle) otherToggle.checked = false;
      zoomToSource(vulnSource);
    }
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
              matrix = transform
                .slice(7, -1)
                .split(",")
                .map(Number);
            } else {
              matrix = [1, 0, 0, 1, 0, 0];
            }

            mapContext.setTransform(
              matrix[0],
              matrix[1],
              matrix[2],
              matrix[3],
              matrix[4],
              matrix[5]
            );

            const backgroundColor = canvas.parentNode?.style.backgroundColor;
            if (backgroundColor) {
              mapContext.fillStyle = backgroundColor;
              mapContext.fillRect(0, 0, canvas.width, canvas.height);
            }

            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );

      mapContext.setTransform(1, 0, 0, 1, 0, 0);
      mapContext.globalAlpha = 1;

      // white info panel
      const panelX = 18;
      const panelY = 18;
      const panelW = 300;
      const panelH = 190;

      mapContext.fillStyle = "rgba(255,255,255,0.92)";
      mapContext.fillRect(panelX, panelY, panelW, panelH);
      mapContext.strokeStyle = "#666";
      mapContext.lineWidth = 1;
      mapContext.strokeRect(panelX, panelY, panelW, panelH);

      // title
      mapContext.fillStyle = "#123b63";
      mapContext.font = "bold 18px Arial";
      mapContext.fillText("Municipal Coastal GIS Portal", panelX + 14, panelY + 28);

      mapContext.fillStyle = "#222";
      mapContext.font = "14px Arial";
      mapContext.fillText(`${CONFIG.municipality || "Pola"}, Oriental Mindoro`, panelX + 14, panelY + 50);
      mapContext.fillText(`Basemap: ${getActiveBasemapName()}`, panelX + 14, panelY + 70);
      mapContext.fillText(getScaleText(), panelX + 14, panelY + 90);
      mapContext.fillText(`Date: ${new Date().toLocaleDateString()}`, panelX + 14, panelY + 110);

      // legend title
      mapContext.font = "bold 14px Arial";
      mapContext.fillText("Legend", panelX + 14, panelY + 135);

      let ly = panelY + 155;

      function drawLegendItem(color, label, shape = "circle") {
        mapContext.fillStyle = color;
        mapContext.strokeStyle = "#ffffff";
        mapContext.lineWidth = 1;

        if (shape === "diamond") {
          mapContext.save();
          mapContext.translate(panelX + 22, ly - 4);
          mapContext.rotate(Math.PI / 4);
          mapContext.fillRect(-5, -5, 10, 10);
          mapContext.strokeRect(-5, -5, 10, 10);
          mapContext.restore();
        } else {
          mapContext.beginPath();
          mapContext.arc(panelX + 22, ly - 4, 5, 0, 2 * Math.PI);
          mapContext.fill();
          mapContext.stroke();
        }

        mapContext.fillStyle = "#222";
        mapContext.font = "13px Arial";
        mapContext.fillText(label, panelX + 38, ly);
        ly += 20;
      }

      if (mangroveLayer.getVisible()) drawLegendItem("green", "Mangroves", "circle");
      if (mpaLayer.getVisible()) drawLegendItem("#2b83ba", "MPA", "circle");
      if (vulnDisLayer.getVisible()) drawLegendItem("#e41a1c", "Disability Types", "circle");
      if (vulnTypeLayer.getVisible()) drawLegendItem("#d73027", "Vulnerability Types", "diamond");

      // north arrow
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
      mapContext.fillStyle = "#111";
      mapContext.fill();

      // save jpeg
      try {
        const link = document.createElement("a");
        const muni = (CONFIG.municipality || "map").replace(/\s+/g, "_");
        link.download = `${muni}_map_export.jpeg`;
        link.href = mapCanvas.toDataURL("image/jpeg", 0.92);
        link.click();
      } catch (err) {
        alert("Export failed. If Satellite is active, try Light Map or OSM first.");
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

    if (foundLayerName === "Disability Types" || foundLayerName === "Vulnerability Types") {
      html += `
        <div><strong>Local Area / Sitio:</strong> ${props.loc_area || "N/A"}</div>
        <div><strong>Vulnerability Type:</strong> ${props.vuln_type || "N/A"}</div>
        <div><strong>Disability Type:</strong> ${props.dis_type || "N/A"}</div>
      `;
    } else if (foundLayerName === "MPA") {
      html += `
        <div><strong>Zone / Buffer:</strong> ${props.buffer_type || props.zone_type || props.buffer || props.zone || props.mpa_type || props.type || "N/A"}</div>
        <div><strong>Name:</strong> ${props.name || props.mpa_name || "N/A"}</div>
        <div><strong>Area:</strong> ${props.area || props.area_ha || "N/A"}</div>
      `;
    } else if (foundLayerName === "Mangroves") {
      html += `
        <div><strong>Name:</strong> ${props.name || props.site_name || "N/A"}</div>
        <div><strong>Barangay:</strong> ${props.barangay || props.brgy || "N/A"}</div>
      `;
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

      if (layer === vulnDisLayer) foundLayerName = "Disability Types";
      if (layer === vulnTypeLayer) foundLayerName = "Vulnerability Types";
      if (layer === mpaLayer) foundLayerName = "MPA";
      if (layer === mangroveLayer) foundLayerName = "Mangroves";

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
  function updateLegend() {
    const legendBox = document.getElementById("legendBox");
    if (!legendBox) return;

    const disabilityTypes = new Set();
    const vulnTypes = new Set();
    const mpaTypes = new Set();

    let hasUnknownDisability = false;
    let hasUnknownVulnerability = false;
    let hasUnknownMPA = false;

    vulnSource.getFeatures().forEach(function (feature) {
      const disType = feature.get("dis_type");
      const vulnType = feature.get("vuln_type");

      if (disType) {
        disabilityTypes.add(disType);
      } else {
        hasUnknownDisability = true;
      }

      if (vulnType) {
        vulnTypes.add(vulnType);
      } else {
        hasUnknownVulnerability = true;
      }
    });

    mpaSource.getFeatures().forEach(function (feature) {
      const mpaType = getMpaType(feature);
      if (mpaType && mpaType !== "Unknown") {
        mpaTypes.add(mpaType);
      } else {
        hasUnknownMPA = true;
      }
    });

    let html = "";

    html += `<div><strong>Mangroves</strong></div>`;
    html += `<div><span class="legend-swatch" style="background:green;"></span> Mangrove</div>`;

    html += `<br><div><strong>MPA</strong></div>`;
    if (mpaTypes.size === 0 && !hasUnknownMPA) {
      html += `<div>No MPA data loaded yet</div>`;
    } else {
      Array.from(mpaTypes).sort().forEach(function (type) {
        html += `<div><span class="legend-swatch" style="background:${getBufferColor(type)};"></span> ${type}</div>`;
      });
      if (hasUnknownMPA) {
        html += `<div><span class="legend-swatch" style="background:#808080;"></span> Other / Unknown</div>`;
      }
    }

    html += `<br><div><strong>Disability Types</strong></div>`;
    if (disabilityTypes.size === 0 && !hasUnknownDisability) {
      html += `<div>No disability data loaded yet</div>`;
    } else {
      Array.from(disabilityTypes).sort().forEach(function (type) {
        html += `<div><span class="legend-swatch" style="background:${getDisabilityColor(type)};"></span> ${type}</div>`;
      });
      if (hasUnknownDisability) {
        html += `<div><span class="legend-swatch" style="background:#808080;"></span> Other / Unknown</div>`;
      }
    }

    html += `<br><div><strong>Vulnerability Types</strong></div>`;
    if (vulnTypes.size === 0 && !hasUnknownVulnerability) {
      html += `<div>No vulnerability data loaded yet</div>`;
    } else {
      Array.from(vulnTypes).sort().forEach(function (type) {
        html += `<div><span class="legend-swatch" style="background:${getVulnerabilityTypeColor(type)};"></span> ${type}</div>`;
      });
      if (hasUnknownVulnerability) {
        html += `<div><span class="legend-swatch" style="background:#808080;"></span> Other / Unknown</div>`;
      }
    }

    legendBox.innerHTML = html;
  }

  mangroveSource.on("change", function () {
    if (mangroveSource.getState() === "ready") updateLegend();
  });

  mpaSource.on("change", function () {
    if (mpaSource.getState() === "ready") updateLegend();
  });

  vulnSource.on("change", function () {
    if (vulnSource.getState() === "ready") updateLegend();
  });

  setTimeout(function () {
    map.updateSize();
    updateLegend();
  }, 500);
});