const COMMAND_GET_VERSION = 0x01;
const COMMAND_VERSION_STRING = 0x81;
const COMMAND_SET_REPORTING = 0x0e;
const COMMAND_CONTROL_TRACK = 0x0d;
const COMMAND_GET_SYS_INFO = 0x02;
const COMMAND_GET_STATUS = 0x07;

const CONTROL_TRACK_PLAY_SOLO = 0x00; // Play track without polyphony, stops all other tracks
const CONTROL_TRACK_PLAY_POLY = 0x01; // Play track polyphonically
const CONTROL_TRACK_PAUSE = 0x02; // Pause track
const CONTROL_TRACK_RESUME = 0x03; // Resume track
const CONTROL_TRACK_STOP = 0x04; // Stop track
const CONTROL_TRACK_LOOP_ON = 0x05; // Set the track loop flag
const CONTROL_TRACK_LOOP_OFF = 0x06; // Clear the track loop flag
const CONTROL_TRACK_LOAD = 0x07; // Load and pause track 

const CONTROL_TRACK_LOCK_FLAG = 0x01; // True (1) prevents the track’s voice from being stolen 

let port = null;
let writer = null;
let reader = null;

function parseMessage(message) {
    if (message[0] !== 0xf0 || message[1] !== 0xaa) {
        return;
    }

    const length = message[2] - 5;
    const code = message[3];

    switch (code) {
        case 0x81:
            const stringStart = 4;
            console.log('version info:', new TextDecoder().decode(message.slice(stringStart, stringStart + length - 3)));
            break;
        default:
            console.log('message:', message);
    }
}

async function readLoop() {
    while (port.readable) {
        const reader = port.readable.getReader();
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                parseMessage(value);
            }
        } catch (error) {
            console.log(error);
        } finally {
            reader.releaseLock();
        }
    }
}


async function write(message) {
    writer = port.writable.getWriter();
    const data = new Uint8Array([0xf0, 0xaa, message.length + 4, ...message, 0x55]);

    await writer.write(data);
    writer.releaseLock();
}

document.getElementById('connect').addEventListener('click', async () => {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 57600 });
    readLoop();
    write([COMMAND_SET_REPORTING, 0x01]);
});

document.getElementById('version').addEventListener('click', async () => {
    write([COMMAND_GET_VERSION]);
});

document.getElementById('track').addEventListener('click', async () => {
    await write([COMMAND_CONTROL_TRACK, CONTROL_TRACK_LOAD, 1, 0, 0]);
    write([COMMAND_CONTROL_TRACK, CONTROL_TRACK_LOOP_ON, 1, 0, 0]);
});

document.getElementById('sysinfo').addEventListener('click', async () => {
    write([COMMAND_GET_SYS_INFO]);
});

document.getElementById('status').addEventListener('click', async () => {
    write([COMMAND_GET_STATUS]);
});