let bluetoothDevice;
let characteristic;
let modeThreshold = 200;

function setMode(mode) {
  if (mode === 1) modeThreshold = 200;
  else if (mode === 2) modeThreshold = 100;
  else if (mode === 3) modeThreshold = 20;

  document.getElementById("mode-info").innerText = modeThreshold;
  document.getElementById("alert").innerText = "🔧 Mode set";
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

    characteristic.startNotifications().then(() => {
      characteristic.addEventListener('characteristicvaluechanged', handleData);
      document.getElementById("status").innerText = "✅ Connected";
    });

    bluetoothDevice.addEventListener('gattserverdisconnected', () => {
      document.getElementById("status").innerText = "🔌 Disconnected";
    });

  } catch (error) {
    console.error(error);
    document.getElementById("status").innerText = "❌ Connection Failed";
  }
}

function handleData(event) {
  const value = new TextDecoder().decode(event.target.value).trim();
  const emf = parseInt(value);
  if (isNaN(emf)) return;

  document.getElementById("reading").innerText = emf;

  if (emf > modeThreshold) {
    document.getElementById("alert").innerHTML = "⚠️ <span class='danger'>Danger! Electrified Water Detected!</span>";

    // Mobile vibration alert
    if ("vibrate" in navigator) {
      navigator.vibrate(500); // vibrate for 500ms
    }

  } else {
    document.getElementById("alert").innerHTML = "✅ <span class='safe'>Safe</span>";
  }
}
