document.addEventListener("DOMContentLoaded", async function () {
  const box = document.getElementById("weatherBox");
  if (!box) return;

  const lat = (window.CONFIG && CONFIG.weatherLat) ? CONFIG.weatherLat : 13.143;
  const lon = (window.CONFIG && CONFIG.weatherLon) ? CONFIG.weatherLon : 121.441;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
    const res = await fetch(url);
    const data = await res.json();

    const temp = data?.current?.temperature_2m;
    const hum = data?.current?.relative_humidity_2m;

    box.innerHTML = `
      <strong>Current weather</strong><br>
      Temperature: ${temp ?? "N/A"} °C<br>
      Humidity: ${hum ?? "N/A"} %
    `;
  } catch (err) {
    box.textContent = "Weather unavailable.";
  }
});