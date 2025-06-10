let bluetoothDevice;
let characteristic;
let modeThreshold = 200; // Default mode: Road

function setMode(mode) {
  const alertElement = document.getElementById("alert");

  if (mode === 1) {
    modeThreshold = 200;
    alertElement.innerText = "🌩️ Road Detection Mode. Threshold: 200";
  } else if (mode === 2) {
    modeThreshold = 100;
    alertElement.innerText = "🚿 Water Heater Mode. Threshold: 100";
  } else if (mode === 3) {
    modeThreshold = 50;
    alertElement.innerText = "🔋 9V Battery Test Mode. Threshold: 50";
  } else if (mode === 4) {
    modeThreshold = 60;
    alertElement.innerText = "🔥 Stoker Mode. Threshold: 60";
  }

  alertElement.className = "neutral";
}

async function connectBluetooth() {
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
    });

    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
    characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleData);

    document.getElementById("status").innerText = "✅ Connected!";
  } catch (error) {
    console.error("Connection failed:", error);
    document.getElementById("status").innerText = "❌ Connection Failed";
  }
}

function handleData(event) {
  const value = new TextDecoder().decode(event.target.value);
  const emf = parseInt(value);
  document.getElementById("reading").innerText = emf;

  if (isNaN(emf)) return;

  const alertElement = document.getElementById("alert");

  if (emf > modeThreshold) {
    alertElement.innerText = "⚠️ Danger! Electrified Water Detected!";
    alertElement.className = "alert-danger";
    if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
  } else {
    alertElement.innerText = "✅ Safe";
    alertElement.className = "alert-safe";
  }
}
