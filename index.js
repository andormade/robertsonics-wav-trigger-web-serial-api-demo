const COMMAND_GET_VERSION = 0x01;
const COMMAND_VERSION_STRING = 0x81;

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


async function write() {
    writer = port.writable.getWriter();
    const data = new Uint8Array([0xf0, 0xaa, 0x05, COMMAND_GET_VERSION, 0x55]);
    await writer.write(data);
    writer.releaseLock();
}

document.getElementById('connect').addEventListener('click', async () => {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 57600 });
    readLoop();
});

document.getElementById('write').addEventListener('click', async () => {
    write();
});