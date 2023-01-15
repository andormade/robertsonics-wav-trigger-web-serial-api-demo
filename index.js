navigator.serial.addEventListener('connect', (e) => {
    console.log('connect', e);
});

navigator.serial.addEventListener('disconnect', (e) => {
    console.log('disconnect', e);
});

navigator.serial.getPorts().then((ports) => {
    console.log('ports', ports);
});

let port = null;

document.getElementById('connect').addEventListener('click', async () => {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
});

document.getElementById('write').addEventListener('click', async () => {
    if (!port || !port.writable) {
        return;
    }

    const writer = port.writable.getWriter();
    const data = new Uint8Array([69, 420]);
    await writer.write(data);
    writer.releaseLock();
});