let bluetoothDevice;
let characteristic;
let modeThreshold = 200; // Default threshold

function setMode(mode) {
  const alertElement = document.getElementById("alert");

  if (mode === 1) {
    modeThreshold = 200;
    sendMode("ROAD");
    alertElement.innerText = "🌩 Road Detection Mode – Threshold: 200";
  } else if (mode === 2) {
    modeThreshold = 100;
    sendMode("HEATER");
    alertElement.innerText = "🚿 Water Heater Mode – Threshold: 100";
  } else if (mode === 3) {
    modeThreshold = 50;
    sendMode("BATTERY");
    alertElement.innerText = "🔋 9V Battery Test Mode – Threshold: 50";
  } else if (mode === 4) {
    modeThreshold = 60;
    sendMode("STOKER");
    alertElement.innerText = "🔥 Socket Mode – Threshold: 60";
  }

  alertElement.className = "neutral";
}

// Connect to HM-10 via Web Bluetooth
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

    document.getElementById("status").innerText = "✅ Connected to Device";
  } catch (error) {
    console.error("Bluetooth connection failed:", error);
    document.getElementById("status").innerText = "❌ Connection Failed";
  }
}

// Send selected mode to Arduino
function sendMode(modeName) {
  if (characteristic && bluetoothDevice.gatt.connected) {
    const encoder = new TextEncoder();
    characteristic.writeValue(encoder.encode(modeName + "\n"));
  }
}

// Handle incoming data from Arduino
function handleData(event) {
  const value = new TextDecoder().decode(event.target.value).trim();
  const emf = parseInt(value);

  const readingSpan = document.getElementById("reading");
  const alertElement = document.getElementById("alert");

  if (!isNaN(emf)) {
    readingSpan.innerText = emf;

    if (emf >= modeThreshold) {
      alertElement.innerText = "⚠ DANGER! Electrified Water Detected!";
      alertElement.className = "alert-danger";
      if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    } else {
      alertElement.innerText = "✅ Safe: No EMF Hazard";
      alertElement.className = "alert-safe";
    }
  }
}
