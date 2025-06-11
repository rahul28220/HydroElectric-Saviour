let bluetoothDevice;
let characteristic;
let modeThreshold = 200; // Default threshold

// Set EMF detection mode + send command to Arduino
function setMode(mode) {
  const alertElement = document.getElementById("alert");
  let modeCommand = "";

  switch (mode) {
    case 1:
      modeThreshold = 200;
      alertElement.innerText = "🌩️ Road Detection Mode. Threshold: 200";
      modeCommand = "ROAD";
      break;
    case 2:
      modeThreshold = 100;
      alertElement.innerText = "🚿 Water Heater Mode. Threshold: 100";
      modeCommand = "HEATER";
      break;
    case 3:
      modeThreshold = 50;
      alertElement.innerText = "🔋 9V Battery Test Mode. Threshold: 50";
      modeCommand = "BATTERY";
      break;
    case 4:
      modeThreshold = 60;
      alertElement.innerText = "🔥 Socket Mode. Threshold: 60";
      modeCommand = "SOCKET";
      break;
    default:
      alertElement.innerText = "❓ Unknown Mode";
      return;
  }

  alertElement.className = "neutral";

  // Send command to Arduino via HM-10
  if (characteristic && modeCommand !== "") {
    const encoder = new TextEncoder();
    characteristic.writeValue(encoder.encode(modeCommand + "\n"))
      .then(() => {
        console.log("Mode command sent:", modeCommand);
      })
      .catch(error => {
        console.error("Failed to send mode command:", error);
      });
  }
}

// Connect to HM-10 via Web Bluetooth API
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

// Handle incoming data from Arduino (EMF reading)
function handleData(event) {
  const value = new TextDecoder().decode(event.target.value);
  const emf = parseInt(value);
  document.getElementById("reading").innerText = emf;

  const alertElement = document.getElementById("alert");
  if (isNaN(emf)) return;

  if (emf > modeThreshold) {
    alertElement.innerText = "⚠️ Danger! Electrified Water Detected!";
    alertElement.className = "alert-danger";
    if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
  } else {
    alertElement.innerText = "✅ Safe";
    alertElement.className = "alert-safe";
  }
}

// Send command manually via button
function sendCommand(command) {
  if (!characteristic) {
    alert("Bluetooth device not connected.");
    return;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(command + "\n");

  characteristic.writeValue(data)
    .then(() => {
      console.log("✅ Command sent:", command);
    })
    .catch(error => {
      console.error("❌ Failed to send command:", error);
    });
}
function setMode(mode) {
  const alertElement = document.getElementById("alert");

  let modeCommand = "";

  if (mode === 1) {
    modeThreshold = 200;
    alertElement.innerText = "🌩️ Road Detection Mode. Threshold: 200";
    modeCommand = "ROAD";
  } else if (mode === 2) {
    modeThreshold = 100;
    alertElement.innerText = "🚿 Water Heater Mode. Threshold: 100";
    modeCommand = "HEATER";
  } else if (mode === 3) {
    modeThreshold = 50;
    alertElement.innerText = "🔋 9V Battery Test Mode. Threshold: 50";
    modeCommand = "BATTERY";
  } else if (mode === 4) {
    modeThreshold = 60;
    alertElement.innerText = "🔥 Stoker Mode. Threshold: 60";
    modeCommand = "STOKER";
  }

  alertElement.className = "neutral";

  // Send command to Arduino via HM-10
  if (characteristic && modeCommand !== "") {
    const encoder = new TextEncoder();
    characteristic.writeValue(encoder.encode(modeCommand + "\n"));
  }
}
