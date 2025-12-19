const net = require('net');
const readline = require('readline');
const err = require('./error_methods');

const HOST = '127.0.0.1';
const PORT = 5000;

const METHODS = {
    '1': 'PARITY',
    '2': 'CRC',
    '3': 'CHECKSUM',
    '4': 'HAMMING'
};

const client = new net.Socket();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Enter message to send (or type EXIT to quit): '
});

let buffer = '';

client.connect(PORT, HOST, () => {
    console.log('Connected to server');
    rl.prompt();
});

client.on('data', (data) => {
    buffer += data.toString();

    while (buffer.includes('\n')) {
        const line = buffer.slice(0, buffer.indexOf('\n'));
        buffer = buffer.slice(buffer.indexOf('\n') + 1);

        if (!line) continue;

        const first = line.indexOf('|');
        const second = line.indexOf('|', first + 1);

        if (first === -1 || second === -1) {
            console.error('Invalid packet:', line);
            continue;
        }

        const msg = line.slice(0, first);
        const method = line.slice(first + 1, second);
        const control = line.slice(second + 1);

        console.log('\nMethod:', method);

        if (method === 'HAMMING') {
            const before = err.hammingDecodeNoCorrection(control);
            console.log('Received Data (before correction):', before);

            const after = err.hammingDecode(control, true);
            console.log('Status:', after.errorDetected ? 'ERROR CORRECTED' : 'NO ERROR');
            console.log('Corrected Data:', after.text);
        } else if (method === 'PARITY') {
            console.log('Received Data:', msg);
            console.log(
                'Status:',
                err.parityVerify(msg, control) ? 'DATA CORRECT' : 'DATA CORRUPTED'
            );
        } else if (method === 'CHECKSUM') {
            console.log('Received Data:', msg);
            console.log(
                'Status:',
                err.checksumVerify(msg, control) ? 'DATA CORRECT' : 'DATA CORRUPTED'
            );
        } else if (method === 'CRC') {
            console.log('Received Data:', msg);
            console.log(
                'Status:',
                err.crc16(msg) === control ? 'DATA CORRECT' : 'DATA CORRUPTED'
            );
        }

        rl.prompt();
    }
});

rl.on('line', (msg) => {
    if (msg.toUpperCase() === 'EXIT') {
        rl.close();
        client.end();
        return;
    }

    console.log('\nSelect method:');
    console.log('1. PARITY');
    console.log('2. CRC');
    console.log('3. CHECKSUM');
    console.log('4. HAMMING (can correct errors)');

    rl.question('> ', (choice) => {
        const method = METHODS[choice];
        if (!method) {
            console.log('Invalid choice');
            rl.prompt();
            return;
        }

        let control = '';
        if (method === 'HAMMING') control = err.hammingEncode(msg);
        else if (method === 'PARITY') control = err.parityGenerate(msg);
        else if (method === 'CHECKSUM') control = err.checksumGenerate(msg);
        else if (method === 'CRC') control = err.crc16(msg);

        const packet = `${msg}|${method}|${control}\n`;
        client.write(packet);

        rl.prompt();
    });
});

client.on('close', () => {
    console.log('\nConnection closed');
    process.exit(0);
});

client.on('error', (e) => {
    console.error('Socket error:', e.message);
});
