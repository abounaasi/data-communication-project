
function toBinary(str) {
    return str.split('')
        .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');
}

function fromBinary(bin) {
    let out = '';
    for (let i = 0; i < bin.length; i += 8) {
        out += String.fromCharCode(parseInt(bin.slice(i, i + 8), 2));
    }
    return out;
}

// ---------- PARITY ----------
function parityGenerate(msg) {
    const bits = toBinary(msg);
    const ones = bits.split('').filter(b => b === '1').length;
    return (ones % 2).toString();
}

function parityVerify(msg, control) {
    return parityGenerate(msg) === control;
}

// ---------- CHECKSUM ----------
function checksumGenerate(msg) {
    let sum = 0;
    for (let c of msg) sum += c.charCodeAt(0);
    return (sum & 0xFFFF).toString(16);
}

function checksumVerify(msg, control) {
    return checksumGenerate(msg) === control;
}

// ---------- CRC-16 ----------
function crc16(msg) {
    let crc = 0xFFFF;
    for (let c of msg) {
        crc ^= c.charCodeAt(0) << 8;
        for (let i = 0; i < 8; i++)
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    return (crc & 0xFFFF).toString(16);
}

// ---------- HAMMING (12,8) ----------
function hammingEncode(data) {
    const bin = toBinary(data);
    let out = '';

    for (let i = 0; i < bin.length; i += 8) {
        let d = bin.slice(i, i + 8).split('').map(Number);
        let p1 = d[0]^d[1]^d[3]^d[4]^d[6];
        let p2 = d[0]^d[2]^d[3]^d[5]^d[6];
        let p4 = d[1]^d[2]^d[3]^d[7];
        let p8 = d[4]^d[5]^d[6]^d[7];

        out += `${p1}${p2}${d[0]}${p4}${d[1]}${d[2]}${d[3]}${p8}${d[4]}${d[5]}${d[6]}${d[7]}`;
    }
    return out;
}

function hammingDecode(bits, correct=true) {
    let data = '';
    let errorDetected = false;

    for (let i = 0; i < bits.length; i += 12) {
        let b = bits.slice(i, i + 12).split('').map(Number);

        let s1 = b[0]^b[2]^b[4]^b[6]^b[8]^b[10];
        let s2 = b[1]^b[2]^b[5]^b[6]^b[9]^b[10];
        let s4 = b[3]^b[4]^b[5]^b[6]^b[11];
        let s8 = b[7]^b[8]^b[9]^b[10]^b[11];

        let err = s1 + (s2<<1) + (s4<<2) + (s8<<3);
        if (err && correct) {
            b[err-1] ^= 1;
            errorDetected = true;
        }

        data += ''+[b[2],b[4],b[5],b[6],b[8],b[9],b[10],b[11]].join('');
    }
    return { text: fromBinary(data), errorDetected };
}

function hammingDecodeNoCorrection(bits) {
    let decoded = '';

    for (let i = 0; i < bits.length; i += 12) {
        const b = bits.slice(i, i + 12).split('').map(Number);
        const dataBits = [b[2], b[4], b[5], b[6], b[8], b[9], b[10], b[11]];
        decoded += dataBits.join('');
    }

    let text = '';
    for (let i = 0; i < decoded.length; i += 8) {
        text += String.fromCharCode(parseInt(decoded.slice(i, i + 8), 2));
    }

    return text;
}

module.exports = {
    parityGenerate, parityVerify,
    checksumGenerate, checksumVerify,
    crc16,
    hammingEncode, hammingDecode,hammingDecodeNoCorrection
};
``
